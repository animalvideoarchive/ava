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
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as stepfunctions from 'aws-cdk-lib/aws-stepfunctions';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import * as path from 'path';
import * as ses from 'aws-cdk-lib/aws-ses';

export class MultipartS3UploadStack extends cdk.Stack {
  public readonly domainHost: string;
  
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const env = cdk.Stack.of(this).node.tryGetContext('env');
    const expires = cdk.Stack.of(this).node.tryGetContext('urlExpiry') ?? '43200';
    const timeout = Number(cdk.Stack.of(this).node.tryGetContext('functionTimeout') ?? '300'); // lambda timeout in seconds
    const senderEmailAddress = cdk.Stack.of(this).node.tryGetContext('senderEmailAddress');

    const s3Bucket = new s3.Bucket(this, "document-upload-bucket-new", {
      bucketName: `document-client-upload-${env}`,
      lifecycleRules: [{
        abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),
        transitions: [{
          // Transition to Glacier Deep Archive () after 2 days
          storageClass: s3.StorageClass.DEEP_ARCHIVE, 
          transitionAfter: cdk.Duration.days(2), // Transition to Glacier after 2 days
        }],    
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

    // // need to check this whitelisting
    // const whitelistedIps = [cdk.Stack.of(this).node.tryGetContext('whitelistip')]

    const apiResourcePolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: ['execute-api:Invoke'],
          principals: [new iam.AnyPrincipal()],
          resources: ['execute-api:/*/*/*'],
        }),
        // new iam.PolicyStatement({
        //   effect: iam.Effect.DENY,
        //   principals: [new iam.AnyPrincipal()],
        //   actions: ['execute-api:Invoke'],
        //   resources: ['execute-api:/*/*/*'],
        //   // conditions: {
        //   //   'NotIpAddress': {
        //   //     "aws:SourceIp": whitelistedIps
        //   //   }
        //   // }
        // })
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
      functionName: `multipart-upload-initialize-${env}`,
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
    
    // Bucket to store clipping and thumbnails
    const s3OutBucket = new s3.Bucket(this, "document-clipping-thumbnail-bucket", {
      bucketName: `document-ecs-clipping-thumbnail-upload-${env}`,
      lifecycleRules: [{
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

    const commonNodeJSLambdaProps = {
      bundling: {
        externalModules: [
          '@aws-sdk'],
      },
      runtime: Runtime.NODEJS_18_X,
    };

    // Lambda function to trigger the ECS task
    const stepTriggerLambda = new NodejsFunction(this, 'stepFuncTriggerLambda', {
      ...commonNodeJSLambdaProps,
      entry: join(__dirname, '../lambda/stepFuncTrigger.js'),
      functionName: `step-func-trigger-${env}`,
      timeout: cdk.Duration.seconds(timeout),
    });

    // S3 event notification to trigger Lambda on video upload
    s3Bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(stepTriggerLambda)); 

    // Lambda function for calling Bedrock Claude
    const myClaudeLambda = new lambda.Function(this, 'MyClaudeLambda', {
      runtime: Runtime.PYTHON_3_10,  // Runtime version
      code: lambda.Code.fromAsset('lambda/bedrockClaudeLambda'),  // directory containing 'app.py' and any other dependencies
      handler: 'getMetadataFromBedrockClaude.lambda_handler',  // file is 'app.py' and function is 'handler'
      functionName: `bedrock-claude-call-${env}`,
      environment: {
        OUTPUT_BUCKET: s3OutBucket.bucketName
      },
      timeout: cdk.Duration.seconds(timeout),
    });

    myClaudeLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ["bedrock:*"],  // Adjust based on the specific Bedrock actions required
      resources: ["*"],
    }));

    s3OutBucket.grantReadWrite(myClaudeLambda);

    // Create an OpenSearch Serverless Collection
    // See https://docs.aws.amazon.com/opensearch-service/latest/developerguide/serverless-manage.html
    const collection = new ops.CfnCollection(this, 'ZooVideoMetadataSearchCollection', {
      name: 'zoo-metadata-collection',
      type: 'SEARCH',
      description: "This collections will store the metadata of admin upload vidoes for zoo ",
    });

    // Encryption policy is needed in order for the collection to be created
    const encPolicy = new ops.CfnSecurityPolicy(this, 'ProductSecurityPolicy', {
      name: 'zoo-metadata-collection-policy',
      policy: '{"Rules":[{"ResourceType":"collection","Resource":["collection/zoo-metadata-collection"]}],"AWSOwnedKey":true}',
      type: 'encryption'
    });
    collection.addDependency(encPolicy);

    // Network policy is required so that the dashboard can be viewed!
    const netPolicy = new ops.CfnSecurityPolicy(this, 'ProductNetworkPolicy', {
      name: 'product-network-policy',
      policy: '[{"Rules":[{"ResourceType":"collection","Resource":["collection/zoo-metadata-collection"]}, {"ResourceType":"dashboard","Resource":["collection/zoo-metadata-collection"]}],"AllowFromPublic":true}]',
      type: 'network'
    });
    collection.addDependency(netPolicy);
    
    // new cdk.CfnOutput(this, 'DashboardEndpoint', {
    //   value: collection.attrDashboardEndpoint,
    // });

    // openseach data injection lambda function
    const myOpenSearchEntryCreationLambda = new lambda.Function(this, 'MyOpenSearchEntryCreationLambda', {
      runtime: Runtime.PYTHON_3_10,  // Runtime version
      handler: 'opensearchCollectionEntry.lambda_handler',  // file is 'app.py' and function is 'handler'
      functionName: `opensearch-entry-creation-${env}`,
      code: lambda.Code.fromDockerBuild("lambda/opensearchLambda"),
      environment: {
        COLLECTION_ENDPOINT : collection.attrDashboardEndpoint,
        INDEX_NAME : 'zoo-metadata-collection-index',
      },
      timeout: cdk.Duration.seconds(timeout),
    });
    
    myOpenSearchEntryCreationLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['aoss:*'],
      resources: ['*']
    }));

    // new ops.CfnAccessPolicy(this, 'ZooVideoMetadataDataPolicy', {
    //   name: 'zoo-metadata-data-policy',
    //   policy: `[{"Description": "Access from lambda role to push", "Rules":[{"ResourceType":"index","Resource":["index/zoo-metadata-collection/*"],"Permission":["aoss:*"]}, {"ResourceType":"collection","Resource":["collection/zoo-metadata-collection"],"Permission":["aoss:*"]}], "Principal":["${myOpenSearchEntryCreationLambda.role?.roleArn}"]}]`,
    //   type: 'data'
    // });

    
    const dockerImage = new DockerImageAsset(this, 'ffmpegVideoProcesingImage', {
      directory: path.join(__dirname, '../ecs'),
      platform: cdk.aws_ecr_assets.Platform.LINUX_AMD64,
    });

    // new cdk.CfnOutput(this, 'ImageUri', {
    //   value: dockerImage.imageUri,
    //   description: 'The URI of the built Docker image'
    // });

    // Create a VPC for the ECS Cluster
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

    taskRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'ecr:GetAuthorizationToken',
        'ecr:BatchCheckLayerAvailability',
        'ecr:GetDownloadUrlForLayer',
        'ecr:BatchGetImage'
      ],
      resources: ['*']
    }));

    // Define Fargate Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
      taskRole: taskRole, // Assign the task role to the Fargate task

    });

    // Add container to the task definition
    const container = taskDefinition.addContainer('MyContainer', {
      image: ecs.ContainerImage.fromDockerImageAsset(dockerImage),
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'ecs'
      }),
      
    });

    // Expose a port (optional)
    container.addPortMappings({
      containerPort: 80,
    });

    const runEcsTask = new tasks.EcsRunTask(this, 'Run Video Processing', {
      integrationPattern: stepfunctions.IntegrationPattern.RUN_JOB,
      cluster,
      taskDefinition,
      launchTarget: new tasks.EcsFargateLaunchTarget(),
      assignPublicIp: true,
      containerOverrides: [
        {
          containerDefinition: taskDefinition.defaultContainer!,
          environment: [
            { name: 'S3_INPUT_BUCKET', value: stepfunctions.JsonPath.stringAt('$.s3Bucket') },
            { name: 'S3_VIDEO_FILE_NAME', value: stepfunctions.JsonPath.stringAt('$.s3FileName') },
            { name: 'S3_OUT_BUCKET', value: s3OutBucket.bucketName },
          ],
        },
      ],  
      resultPath: '$.ecsResult',
    });


    const invokeClaudeLambdaTask = new tasks.LambdaInvoke(this, 'Process Video Metadata', {
      lambdaFunction: myClaudeLambda,
      inputPath: '$',
      outputPath: '$.Payload'
    });

    const invokeOpensearchLambdaTask = new tasks.LambdaInvoke(this, 'Final Processing', {
      lambdaFunction: myOpenSearchEntryCreationLambda,
      inputPath: '$',
      outputPath: '$.Payload'
    });

    const definition = runEcsTask
    .next(invokeClaudeLambdaTask)
    .next(invokeOpensearchLambdaTask);

    const stateMachine = new stepfunctions.StateMachine(this, 'VideoProcessingStateMachine', {
      definition,
      timeout: cdk.Duration.minutes(30),
    });

    // Grant necessary permissions
    stateMachine.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ecs:RunTask', 'ecs:StopTask', 'ecs:DescribeTasks', 'iam:PassRole', 'logs:GetLogEvents',"logs:PutLogEvents", "logs:CreateLogStream",
        "logs:DescribeLogStreams",
        "logs:PutRetentionPolicy",
        "logs:CreateLogGroup"
      ],  
      resources: ['*'],
    }));

    
    // // Grant Lambda permissions to pass task role
    stateMachine.addToRolePolicy(new iam.PolicyStatement({
      actions: ['iam:PassRole'],
      resources: ['*'],
      conditions: {
        StringLike: {
          'iam:PassedToService': 'ecs-tasks.amazonaws.com'
        }
      }
    }));

    s3OutBucket.grantReadWrite(taskDefinition.taskRole);
    s3Bucket.grantRead(taskDefinition.taskRole);

    stepTriggerLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['states:StartExecution'],
      resources: [stateMachine.stateMachineArn],
    }));

        
    stepTriggerLambda.addEnvironment('STATE_MACHINE_ARN', stateMachine.stateMachineArn);

    // new cdk.CfnOutput(this, 'StateMachineArn', {
    //   value: stateMachine.stateMachineArn,
    //   description: 'State Machine ARN',
    // });

    // Create a Cognito User Pool
    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'ZooAdminUserPool',
      selfSignUpEnabled: false, // Disable sign-ups
      signInAliases: {
        username: true,
        email: true,
      },
      signInCaseSensitive: false, // Make sign-in case insensitive for username and email
      autoVerify: {
        email: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY, // Account recovery via email only
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For testing purposes, removes the user pool when the stack is destroyed
    });

    // Output the User Pool ID
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
    });

    // Create an App Client for Amplify Integration
    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
      generateSecret: false, // No client secret for Amplify integration
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      preventUserExistenceErrors: true, // Prevents user existence errors from revealing information
    });

    // Output the App Client ID
    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
    });

    // User Flow CDK code

    const userApiGateway = new apigw.RestApi(this, 'user-flow-api', {
      description: 'API for user flow',
      restApiName: 'user-flow-api',
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,                
      },
      policy: apiResourcePolicy,
      endpointConfiguration: {
        types: [apigw.EndpointType.REGIONAL]
      }    
    });

    // lambda function  to get the search results from opensearch
    const getSearchResultsLambda = new lambda.Function(this, 'MyGetSearchResultsLambda', {
      runtime: Runtime.PYTHON_3_10,  // Runtime version
      handler: 'getSearchResults.lambda_handler',  // file is 'app.py' and function is 'handler'
      functionName: `get-search-results-from-opensearch-${env}`,
      code: lambda.Code.fromDockerBuild("lambda/getSearchResultsLambda"),
      environment: {
        COLLECTION_ENDPOINT : collection.attrDashboardEndpoint,
        INDEX_NAME : 'zoo-metadata-collection-index',
      },
      timeout: cdk.Duration.seconds(timeout),
    });

    getSearchResultsLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['aoss:*'],
      resources: ['*']
    }));

    new ops.CfnAccessPolicy(this, 'ZooVideoMetadataDataPolicy', {
      name: 'zoo-metadata-data-policy',
      policy: `[{"Description": "Access from lambda role to push", "Rules":[{"ResourceType":"index","Resource":["index/zoo-metadata-collection/*"],"Permission":["aoss:*"]}, {"ResourceType":"collection","Resource":["collection/zoo-metadata-collection"],"Permission":["aoss:*"]}], "Principal":["${myOpenSearchEntryCreationLambda.role?.roleArn}", "${getSearchResultsLambda.role?.roleArn}"]}]`,
      type: 'data'
    });
    
    s3OutBucket.grantReadWrite(getSearchResultsLambda);


    // lambda function to send email
    const sendEmailLambda = new lambda.Function(this, 'MySendEmailLambda', {
      runtime: Runtime.PYTHON_3_10,  // Runtime version
      code: lambda.Code.fromAsset('lambda/sendEmailLambda'),  // directory containing 'app.py' and any other dependencies
      handler: 'sendEmail.lambda_handler',  // file is 'app.py' and function is 'handler'
      functionName: `send-email-${env}`,
      environment: {
        SENDER_EMAIL: senderEmailAddress
      },
      timeout: cdk.Duration.seconds(timeout),
    });

     // SES Configuration Set
    const configSet = new ses.ConfigurationSet(this, 'EmailConfigSet', {
      reputationMetrics: true,
      sendingEnabled: true,
    });

    // SES Email Identity
    const emailIdentity = new ses.EmailIdentity(this, 'EmailIdentity', {
      identity: ses.Identity.email(senderEmailAddress),
      configurationSet: configSet,
    });
    
    sendEmailLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'ses:SendEmail',
        'ses:SendRawEmail',
        'ses:SendTemplatedEmail'
      ],
      resources: ['*']     // All SES resources
    }));

    userApiGateway.root.addResource('GetSearchResults').addMethod('POST', new apigw.LambdaIntegration(getSearchResultsLambda));
    userApiGateway.root.addResource('SendEmail').addMethod('POST', new apigw.LambdaIntegration(sendEmailLambda));
  }
}
