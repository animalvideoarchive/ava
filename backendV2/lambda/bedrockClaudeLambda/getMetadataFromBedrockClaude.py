import boto3
import json
import base64
import os
region = os.getenv('AWS_REGION')

def lambda_handler(event, context):
    s3_client = boto3.client('s3')
    
    s3_file_name = event['s3FileName']
    bucket_name = os.getenv('OUTPUT_BUCKET')
    base_name, extension = os.path.splitext(s3_file_name)
    
    # Construct new paths
    image_keys = [f"thumbnails/{base_name}_start_thumbnail.png", f"thumbnails/{base_name}_end_thumbnail.png"]
    clipped_video_path = f"clips/{base_name}_clipped{extension}"

    print("Bucket, Thumbnail Paths, Clipped video path :", bucket_name, image_keys, clipped_video_path)

    # Load images from S3
    images = []
    for key in image_keys:
        response = s3_client.get_object(Bucket=bucket_name, Key=key)
        image_content = response['Body'].read()
        # Assuming the model needs base64 encoded images
        image_base64 = base64.b64encode(image_content).decode('utf-8')
        images.append(image_base64)

    # Variables for Bedrock API
    modelId = 'anthropic.claude-3-5-sonnet-20240620-v1:0'
    contentType = 'application/json'
    accept = 'application/json'
    maxtokens = 300
    prompt = "Extract the date in Format MM-DD-YYYY and start time from first image and end time from second image. Provide the result in JSON format with only these keys 'video_date', 'start_time', 'end_time' and extracted date, start time and end time as values. In case of no values found still return in json format witth values as 'None'"
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
            region_name=region,
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

    response_text = response_body['content'][0]['text']
    print("Response value:", response_text)

    # Extracting JSON string from the response
    try:
        # Find the opening and closing braces
        json_start = response_text.index('{')
        json_end = response_text.rindex('}') + 1

        # Extract the JSON string
        json_string = response_text[json_start:json_end]

        # Load the JSON string into a dictionary
        data = json.loads(json_string)
        print("Extracted JSON:", data)
        
        print("Clipper video path : ", clipped_video_path)

        metadate_response = s3_client.head_object(Bucket=bucket_name, Key=clipped_video_path)
        print("Metada response ", metadate_response)
        existing_metadata = metadate_response.get('Metadata', {})
        print("Existing metdata : ", existing_metadata)
        existing_metadata['thumbnailStartPath'] = f"s3://{bucket_name}/{image_keys[0]}" 
        existing_metadata['thumbnailEndPath'] = f"s3://{bucket_name}/{image_keys[1]}" 
        existing_metadata['videoDate'] = data['video_date']
        existing_metadata['startTime'] = data['start_time']
        existing_metadata['endTime'] = data['end_time']

        copy_metadata_responese = s3_client.copy_object(
            Bucket=bucket_name, 
            Key=clipped_video_path, 
            CopySource=f'{bucket_name}/{clipped_video_path}',
            Metadata=existing_metadata, 
            MetadataDirective='REPLACE')

        print("Copy Metadata response : ", copy_metadata_responese)
        print("video_metadata : ", existing_metadata)
        return json.dumps({"video_metadata": existing_metadata})

    except ValueError as e:
        print("Error parsing JSON:", e) 