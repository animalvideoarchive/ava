import boto3
import json
import base64

def create_s3_client():
    # Explicitly setting credentials
    # Creating an S3 client with explicit credentials
    s3 = boto3.client('s3')
    return s3


def lambda_handler(event, context):
    # s3 = boto3.client('s3')
    s3 = create_s3_client()

    # Fetch image paths from event
    # bucket_name = event['bucket']
    # image_keys = [event['image1'], event['image2']]
    
    bucket_name = ''
    image_keys = ['', '']

    # Load images from S3
    images = []
    for key in image_keys:
        response = s3.get_object(Bucket=bucket_name, Key=key)
        image_content = response['Body'].read()
        # Assuming the model needs base64 encoded images
        image_base64 = base64.b64encode(image_content).decode('utf-8')
        images.append(image_base64)

    # Variables for Bedrock API
    modelId = 'anthropic.claude-3-5-sonnet-20240620-v1:0'
    contentType = 'application/json'
    accept = 'application/json'
    maxtokens = 300
    # prompt = "Extract the start date in Format MM-DD-YYYY, start time from the first image and the end time from the second image. Provide the results in JSON format with keys 'start_time' and 'end_time'"
    prompt = "Extract the date in Format MM-DD-YYYY and start time from first image and end time from second image. Provide the result in JSON format with key 'video_date', 'start_time', 'end_time' and extracted date, start time and end time as values."
    temperature = 0.1

    payload = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": maxtokens,
        "temperature": temperature,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": images[0]
                        }
                    },
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": images[1]
                        }
                    },
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            }
        ]
    }
    

    bedrock_runtime = boto3.client(
            service_name="bedrock-runtime",
            region_name="us-east-1",
    )

    response = bedrock_runtime.invoke_model(
        body=json.dumps(payload),
        contentType=contentType,
        accept=accept,
        modelId=modelId
    )
    
    print("Response: ", response)
    response_body = json.loads(response['body'].read())
    print("Response body:", response_body)
    # extracted_times = json.loads(response_body['content'][0]['text'])    

    # # Extract video start and end times
    # video_start_time = extracted_times['start_time']
    # video_end_time = extracted_times['end_time']

    # print("Video start time:", video_start_time)
    # print("Video end time:", video_end_time)
    
    # Return the video start and end times
    # return {
    #     'statusCode': 200,
    #     'body': json.dumps({
    #         'video_start_time': video_start_time,
    #         'video_end_time': video_end_time
    #     })
    # }


lambda_handler()