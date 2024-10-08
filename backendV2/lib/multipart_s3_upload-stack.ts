import * as cdk from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam"
import { BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as ops from 'aws-cdk-lib/aws-opensearchserverless';
import * as url from 'url';

export class MultipartS3UploadStack extends cdk.Stack {
  public readonly searchDomain: string;
  
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const env = cdk.Stack.of(this).node.tryGetContext('env');
    const expires = cdk.Stack.of(this).node.tryGetContext('urlExpiry') ?? '43200';
    const timeout = Number(cdk.Stack.of(this).node.tryGetContext('functionTimeout') ?? '60');

    const s3Bucket = new s3.Bucket(this, "document-upload-bucket-new", {
      bucketName: `document-client-upload-${env}`,
      lifecycleRules: [{
        expiration: cdk.Duration.days(10),
        abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),
        // transitions: [{
        //   storageClass: s3.StorageClass.DEEP_ARCHIVE,
        //   transitionAfter: cdk.Duration.days(1), // Transition to Glacier after 1 day
        // }],    
      }],
      blockPublicAccess: {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true,
      },
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      transferAcceleration: true,
      cors: [{
        allowedOrigins: ["*"],
        allowedHeaders: ["*"],
        allowedMethods: [
          s3.HttpMethods.GET,
          s3.HttpMethods.PUT,
          s3.HttpMethods.POST,
        ],
        exposedHeaders: ['ETag'],
      }],
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // need to check this whitelisting
    const whitelistedIps = [cdk.Stack.of(this).node.tryGetContext('whitelistip')]

    const apiResourcePolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: ['execute-api:Invoke'],
          principals: [new iam.AnyPrincipal()],
          resources: ['execute-api:/*/*/*'],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.DENY,
          principals: [new iam.AnyPrincipal()],
          actions: ['execute-api:Invoke'],
          resources: ['execute-api:/*/*/*'],
          conditions: {
            'NotIpAddress': {
              "aws:SourceIp": whitelistedIps
            }
          }
        })
      ]
    })

    const apiGateway = new apigw.RestApi(this, 'multi-part-upload-api', {
      description: 'API for multipart s3 upload',
      restApiName: 'multi-part-upload-api',
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,                
      },
      policy: apiResourcePolicy,
    });

    const commonNodeJsProps = {
      bundling: {
        externalModules: [
          '@aws-sdk/client-s3',
          '@aws-sdk/s3-request-presigner',
        ],
      },
      runtime: Runtime.NODEJS_18_X,
    };

    const initializeLambda = new NodejsFunction(this, 'initializeHandler', {
      ...commonNodeJsProps,
      entry: join(__dirname, '../lambda/initialize.js'),
      environment: {
        BUCKET_NAME: s3Bucket.bucketName
      },
      functionName: `multipart-upload-initialize-${env}`
    });

    const getPreSignedUrlsLambda = new NodejsFunction(this, 'getPreSignedUrlsHandler', {
      ...commonNodeJsProps,
      entry: join(__dirname, '../lambda/getPreSignedUrls.js'),
      environment: {
        BUCKET_NAME: s3Bucket.bucketName,
        URL_EXPIRES: expires
      },
      functionName: `multipart-upload-getPreSignedUrls-${env}`,
      timeout: cdk.Duration.seconds(timeout)
    });
    const getPreSignedTAUrlsLambda = new NodejsFunction(this, 'getPreSignedTAUrlsHandler', {
      ...commonNodeJsProps,
      entry: join(__dirname, '../lambda/getPreSignedTAUrls.js'),
      environment: {
        BUCKET_NAME: s3Bucket.bucketName,
        URL_EXPIRES: expires
      },
      functionName: `multipart-upload-getPreSignedTAUrls-${env}`,
      timeout: cdk.Duration.seconds(timeout)
    });
    const finalizeLambda = new NodejsFunction(this, 'finalizeHandler', {
      ...commonNodeJsProps,
      entry: join(__dirname, '../lambda/finalize.js'),
      environment: {
        BUCKET_NAME: s3Bucket.bucketName
      },
      functionName: `multipart-upload-finalize-${env}`
    });

    s3Bucket.grantReadWrite(initializeLambda);
    s3Bucket.grantReadWrite(getPreSignedUrlsLambda);
    s3Bucket.grantReadWrite(getPreSignedTAUrlsLambda);
    s3Bucket.grantReadWrite(finalizeLambda);

    apiGateway.root.addResource('initialize').addMethod('POST', new apigw.LambdaIntegration(initializeLambda));
    apiGateway.root.addResource('getPreSignedUrls').addMethod('POST', new apigw.LambdaIntegration(getPreSignedUrlsLambda));
    apiGateway.root.addResource('getPreSignedTAUrls').addMethod('POST', new apigw.LambdaIntegration(getPreSignedTAUrlsLambda));
    apiGateway.root.addResource('finalize').addMethod('POST', new apigw.LambdaIntegration(finalizeLambda));

    apiGateway.addUsagePlan('usage-plan', {
      name: 'consumerA-multi-part-upload-plan',
      description: 'usage plan for consumerA',
      apiStages: [{
        api: apiGateway,
        stage: apiGateway.deploymentStage,
      }],
      throttle: {
        rateLimit: 100,
        burstLimit: 200
      },
    });
    

    const s3OutBucket = new s3.Bucket(this, "document-clipping-thumbnail-bucket", {
      bucketName: `document-ecs-clipping-thumbnail-upload-${env}`,
      lifecycleRules: [{
        expiration: cdk.Duration.days(10),
        abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),
      }],
      blockPublicAccess: {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true,
      },
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      cors: [{
        allowedOrigins: ["*"],
        allowedHeaders: ["*"],
        allowedMethods: [
          s3.HttpMethods.GET,
          s3.HttpMethods.PUT,
          s3.HttpMethods.POST,
        ],
      }],
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // Create a VPC for the ECS Cluster
    // const vpc = new ec2.Vpc(this, 'Vpc', {
    //   maxAzs: 2 // Default is all AZs in the region
    // });
    const vpc = new ec2.Vpc(this, 'MyVpc', {
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        }
      ],
      natGateways: 0
    });
    
    // TODO: Need to add cluster in private subnet
    // Create an ECS Cluster
    const cluster = new ecs.Cluster(this, 'EcsCluster', {
      vpc,
    });

    const taskRole = new iam.Role(this, 'EcsTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com')
    });

    s3Bucket.grantReadWrite(taskRole);
    s3OutBucket.grantReadWrite(taskRole);

    // Define Fargate Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
      taskRole: taskRole // Assign the task role to the Fargate task
    });

    // Add container to the task definition
    const container = taskDefinition.addContainer('MyContainer', {
      image: ecs.ContainerImage.fromRegistry('nikhildocker7/ffmpegprocesing:latest'),
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'ecs'
      }),
    });

    // Expose a port (optional)
    container.addPortMappings({
      containerPort: 80,
    });

    const commonNodeJSLambdaProps = {
      bundling: {
        externalModules: [
          '@aws-sdk'        ],
      },
      runtime: Runtime.NODEJS_18_X,
    };
    
    // Create a Lambda function to trigger the ECS task
    const lambdaFunction = new NodejsFunction(this, 'EcsTriggerLambda', {
      ...commonNodeJSLambdaProps,
      entry: join(__dirname, '../lambda/ecsTrigger.js'),
      environment: {
        CLUSTER_NAME: cluster.clusterName,
        TASK_DEFINITION_ARN: taskDefinition.taskDefinitionArn,
        // VPC_SUBNETS: JSON.stringify(vpc.selectSubnets({ subnetType: ec2.SubnetType.PUBLIC }).subnetIds),
        VPC_SUBNETS: JSON.stringify(vpc.selectSubnets({ subnetType: ec2.SubnetType.PUBLIC }).subnetIds),
        S3_OUT_BUCKET: s3OutBucket.bucketName,
      },
      functionName: `ecs-trigger-${env}`,
      timeout: cdk.Duration.seconds(timeout),
    });

    // Grant Lambda permissions to run ECS tasks
    lambdaFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ecs:RunTask', 'ecs:DescribeTasks', 'iam:PassRole'],
      resources: [taskDefinition.taskDefinitionArn, taskRole.roleArn],
    }));
    
    // // Grant Lambda permissions to pass task role
    lambdaFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['iam:PassRole'],
      resources: ['*'],
      conditions: {
        StringLike: {
          'iam:PassedToService': 'ecs-tasks.amazonaws.com'
        }
      }
    }));

    // Add an S3 event notification to trigger Lambda on object creation
    s3Bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(lambdaFunction)); 

    // Define the Lambda function
    const myClaudeLambda = new lambda.Function(this, 'MyClaudeLambda', {
      runtime: Runtime.PYTHON_3_10,  // Runtime version
      code: lambda.Code.fromAsset('lambda'),  // directory containing 'app.py' and any other dependencies
      handler: 'getMetadataFromBedrockClaude.lambda_handler',  // file is 'app.py' and function is 'handler'
      functionName: `bedrock-claude-call-${env}`,
    });

    myClaudeLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ["bedrock:*"],  // Adjust based on the specific Bedrock actions required
      resources: ["*"],
    }));

    s3OutBucket.grantReadWrite(myClaudeLambda);


    // Create an OpenSearch Service domain
    // See https://docs.aws.amazon.com/opensearch-service/latest/developerguide/serverless-manage.html
    const collection = new ops.CfnCollection(this, 'ProductSearchCollection', {
      name: 'product-collection',
      type: 'SEARCH',
      description: "This collections will store the metadata of admin upload vidoes for zoo ",
    });

    // Encryption policy is needed in order for the collection to be created
    const encPolicy = new ops.CfnSecurityPolicy(this, 'ProductSecurityPolicy', {
      name: 'product-collection-policy',
      policy: '{"Rules":[{"ResourceType":"collection","Resource":["collection/product-collection"]}],"AWSOwnedKey":true}',
      type: 'encryption'
    });
    collection.addDependency(encPolicy);

    // Network policy is required so that the dashboard can be viewed!
    const netPolicy = new ops.CfnSecurityPolicy(this, 'ProductNetworkPolicy', {
      name: 'product-network-policy',
      policy: '[{"Rules":[{"ResourceType":"collection","Resource":["collection/product-collection"]}, {"ResourceType":"dashboard","Resource":["collection/product-collection"]}],"AllowFromPublic":true}]',
      type: 'network'
    });
    collection.addDependency(netPolicy);

    const parsedDomainUrl = new url.URL(collection.attrCollectionEndpoint);
    const domainHostname = parsedDomainUrl.hostname;
    
    new cdk.CfnOutput(this, 'DashboardEndpoint', {
      value: collection.attrDashboardEndpoint,
    });

    new cdk.CfnOutput(this, 'DashboardHost', {
      value: domainHostname,
    });

    // Define the Lambda function
    const myOpenSearchEntryCreationLambda = new lambda.Function(this, 'MyOpenSearchEntryCreationLambda', {
      runtime: Runtime.PYTHON_3_10,  // Runtime version
      handler: 'opensearchCollectionEntry.lambda_handler',  // file is 'app.py' and function is 'handler'
      functionName: `opensearch-entry-creation-${env}`,
      code: lambda.Code.fromDockerBuild("lambda/opensearchLambda"),
      environment: {
        COLLECTION_ENDPOINT : domainHostname,
        INDEX_NAME : 'product-collection-index',
      },
      timeout: cdk.Duration.minutes(2),
    });
    
    myOpenSearchEntryCreationLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['aoss:*'],
      resources: ['*']
    }));

    new ops.CfnAccessPolicy(this, 'ProductDataPolicy', {
      name: 'product-data-policy',
      policy: `[{"Description": "Access from lambda role to push", "Rules":[{"ResourceType":"index","Resource":["index/product-collection/*"],"Permission":["aoss:*"]}, {"ResourceType":"collection","Resource":["collection/product-collection"],"Permission":["aoss:*"]}], "Principal":["${myOpenSearchEntryCreationLambda.role?.roleArn}"]}]`,
      type: 'data'
    });
  }
}
