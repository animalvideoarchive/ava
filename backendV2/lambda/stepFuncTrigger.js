import { ECSClient, RunTaskCommand} from "@aws-sdk/client-ecs";
import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";

const STATE_MACHINE_ARN = process.env['STATE_MACHINE_ARN'];
const sfnClient = new SFNClient();

exports.handler = async (event) => {
  console.log("S3 Event Received:", JSON.stringify(event, null, 2));
  console.log("S3 Event Received 2:", event);

  const s3Bucket = event.Records[0].s3.bucket.name; // Extract bucket name from the event
  let s3FileName = event.Records[0].s3.object.key;     // Extract file name/key from the event
  
  console.log("Bucket: ",s3Bucket);
  console.log("File name: ",s3FileName);
  s3FileName = decodeURIComponent(s3FileName.replace(/\+/g, ' '));
  console.log("Updated File name: ",s3FileName);

  const params = {
    stateMachineArn: STATE_MACHINE_ARN,
    input: JSON.stringify({ s3Bucket: s3Bucket, s3FileName: s3FileName}),
  };


  try {
    const command = new StartExecutionCommand(params);
    const result = await sfnClient.send(command);
    console.log('Step Function execution started:', result.executionArn);
    return { statusCode: 200, body: 'Processing started' };
  } catch (error) {
    console.error('Error starting Step Function execution:', error);
    return { statusCode: 500, body: 'Error starting processing' };
  }

  
};


