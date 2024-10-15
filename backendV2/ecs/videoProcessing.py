import os
import boto3
import subprocess
import tempfile
import shlex
import json
import io

# Configuration
input_bucket = os.environ.get('S3_INPUT_BUCKET')  # S3 bucket with the original video
output_bucket = os.environ.get('S3_OUT_BUCKET')  # S3 bucket to store the processed video and thumbnails
video_file_name = os.environ.get('S3_VIDEO_FILE_NAME')  # The key (path) to the video file in the input bucket
region = os.getenv('AWS_REGION')
print("Input bucket:", input_bucket)
print("Output bucket:", output_bucket)
print("Video file name:", video_file_name)
print("Region:", region)

SIGNED_URL_TIMEOUT = 1200

def create_s3_client():
    s3 = boto3.client(
        's3',
        region_name=region
    )
    return s3

def get_extension(key):
    key, file_extension = os.path.splitext(key)
    return key, file_extension.lower()

s3_client = create_s3_client()

s3_source_signed_url = s3_client.generate_presigned_url('get_object',
    Params={'Bucket': input_bucket, 'Key': video_file_name},
    ExpiresIn=SIGNED_URL_TIMEOUT)

key, file_extension = get_extension(video_file_name)
file_extension_for_command = file_extension[1:] if file_extension.startswith('.') else file_extension

print("Key:", key)
print("File extension:", file_extension)
print("File extension for command:", file_extension_for_command)
output_video_clip = f"{key}_clipped{file_extension}"
start_thumbnail = f"{key}_start_thumbnail.png"
end_thumbnail = f"{key}_end_thumbnail.png"


def get_video_duration(input_file_path):

    # Use ffprobe to get the video duration
    result = subprocess.run([
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "json", input_file_path
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    duration = json.loads(result.stdout)["format"]["duration"]
    print("Video duration:", duration)
    return float(duration)
    
def process_and_upload(command, output_s3_key, flag):

    # Run FFmpeg command
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    try:
        # Read all stdout data
        stdout_data, stderr_data = process.communicate()

        # Check if FFmpeg encountered any errors
        if process.returncode != 0:
            print(f"FFmpeg error: {stderr_data.decode()}")
            return

        # Create a buffer and write stdout data to it
        buffer = io.BytesIO(stdout_data)

        if flag == 0:
            response = s3_client.head_object(Bucket=input_bucket, Key=video_file_name)
            existing_metadata = response.get('Metadata', {})
            print("old existing_metadata", existing_metadata)
            video_duration_c = get_video_duration(s3_source_signed_url)
            existing_metadata['duration'] = str(video_duration_c) # Add the video duration to the metadata
            existing_metadata['clippedVideoPath'] = f"s3://{output_bucket}/clips/{output_video_clip}"  
            print("updated metadata", existing_metadata)
            # Upload to S3
            s3_client.upload_fileobj(buffer, output_bucket, output_s3_key, ExtraArgs={'Metadata': existing_metadata})
            print(f"Video uploaded successfully to {output_bucket}/{output_s3_key}")
        elif flag == 1:
            s3_client.put_object(Body=buffer, Bucket=output_bucket, Key=output_s3_key, ContentType='image/png')
            print(f"Uploaded {output_s3_key} to S3 successfully")
        
    except Exception as e:
        print(f"An error occurred: {str(e)}")

def clip_video():
    print("Clipping video 1...")

    # Clipped the video 
    command = [
        "ffmpeg", "-ss", "00:00:00", 
        "-i", s3_source_signed_url,
        "-t", "10", 
        "-c", "copy",
        "-map_metadata", "0",  # Copy global metadata
        "-f", file_extension_for_command,
        "-movflags", "frag_keyframe+empty_moov",
        "pipe:1"
    ]

    process_and_upload(command, f"clips/{output_video_clip}",0)

def extract_thumbnails():
    print("Extracting thumbnails 2 ...")

    # Extract start thumbnail
    start_command = [
        "ffmpeg", "-ss", "00:00:01", 
        "-i", s3_source_signed_url,
        "-vframes", "1", 
        "-f", "image2pipe", 
        "-vcodec", "png", 
        "pipe:1"
    ]

    process_and_upload(start_command, f"thumbnails/{start_thumbnail}",1 )

    video_duration = get_video_duration(s3_source_signed_url)
    print("video_duration", video_duration)

    # Calculate the timestamp for the last 1 second
    last_second_timestamp = max(0, video_duration - 1)
    print("last_second_timestamp", last_second_timestamp)
    # Use ffmpeg to extract the thumbnail from the last second
    end_command = [
        "ffmpeg", "-ss", str(last_second_timestamp),
        "-i", s3_source_signed_url,
        "-frames:v", "1", 
        "-f", "image2pipe", 
        "-vcodec", "png", 
        "pipe:1"
    ]
    
    process_and_upload(end_command, f"thumbnails/{end_thumbnail}",1)

def process_video():
    clip_video()
    extract_thumbnails()
   

if __name__ == "__main__":
    process_video()
    print(json.dumps({
        "thumbnailStartPath": f"thumbnails/{start_thumbnail}",
        "thumbnailEndPath": f"thumbnails/{end_thumbnail}",
        "outputBucket": output_bucket,
        "clippedVideoPath": f"clips/{output_video_clip}"
    }))
