import { ECSClient, RunTaskCommand} from "@aws-sdk/client-ecs";

const ecs = new ECSClient({region: "us-east-1" });
const CLUSTER_NAME = process.env['CLUSTER_NAME'];
const TASK_DEFINITION_ARN = process.env['TASK_DEFINITION_ARN'];
const VPC_SUBNETS = process.env['VPC_SUBNETS'];

exports.handler = async (event) => {
  console.log("S3 Event Received:", JSON.stringify(event, null, 2));

  const s3Bucket = event.Records[0].s3.bucket.name; // Extract bucket name from the event
  const s3FileName = event.Records[0].s3.object.key;     // Extract file name/key from the event

  const s3OutBucket = S3_OUT_BUCKET ; 
  const cluster = CLUSTER_NAME;
  const taskDefinition = TASK_DEFINITION_ARN;
  const vpcSubnets = JSON.parse(VPC_SUBNETS);
  console.log("Cluster Name:", typeof(cluster));
  console.log("Task Definition ARN:", typeof(taskDefinition));
  console.log("VPC Subnets:", typeof(vpcSubnets));
  
  const params = {
    cluster: cluster,
    taskDefinition: taskDefinition,
    launchType: "FARGATE",
    overrides: {
      containerOverrides: [{
        name: "MyContainer",
        environment: [
          { name: "S3_INPUT_BUCKET", value: s3Bucket },
          { name: "S3_FILE_NAME", value: s3FileName },
          {name: "S3_OUT_BUCKET", value: s3OutBucket}
        ]
      }]
    },
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: vpcSubnets,
        assignPublicIp: "ENABLED",
      }
    }
  };
  try {
    const command = new RunTaskCommand(params);
    const response = await ecs.send(command);
    console.log("Task started:", response.tasks?.[0]?.taskArn);
    console.log("ECS Task started:", JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("Error starting task:", error);
  }

  
};