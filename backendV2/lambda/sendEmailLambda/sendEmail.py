import json
import boto3
from botocore.exceptions import ClientError
import os
# Initialize AWS SES client
ses_client = boto3.client('ses')

# Sender's email address
# SENDER_EMAIL = "amanda34@asu.edu"  # Replace with actual sender email
SENDER_EMAIL = os.getenv('SENDER_EMAIL')
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL')

def lambda_handler(event, context):
    try:
        # Parse the event body
        body = json.loads(event['body']) if 'body' in event else event

        # Extract user details and requested video information
        requestor_name = body['requestername']
        faculty = body['faculty']
        title = body['title']
        email = body['email']  # This is the email address from the event
        phone = body['phone']
        reason = body['reason']
        requested_videos = body['requestedVideos']

        # Construct email subject and body
        subject = f"Video Download Request from {requestor_name}"
        video_details = ""

        for video in requested_videos:
            video_details += f"""
            Video ID: {video['id']}
            Video Title: {video['briefvideodescription']}
            Duration: {video['duration']} seconds
            Video Date: {video['videodate']}
            Scientific Name: {video['scientificname']}
            Common Name: {video['commonname']}
            Video Location: {video['videolocation']}
            Video Context: {video['videocontext']}
            Contact Person: {video['contactfirstname']} {video['contactlastname']} ({video['contactemail']})
            ----------------------------------------
            """

        # Construct the full email body
        email_body = f"""
        You have received a new video download request from the web portal.

        Requestor Information:
        ----------------------
        Name: {requestor_name}
        Faculty: {faculty}
        Title: {title}
        Email: {email}
        Phone: {phone}

        Reason for Request:
        -------------------
        {reason}

        Requested Videos:
        -----------------
        {video_details}

        Please review and approve the request.
        """

        # Send the email via AWS SES
        response = ses_client.send_email(
            Source=SENDER_EMAIL,
            Destination={
                'ToAddresses': [ADMIN_EMAIL]  # Send to the email from the event
            },
            Message={
                'Subject': {
                    'Data': subject,
                    'Charset': 'UTF-8'
                },
                'Body': {
                    'Text': {
                        'Data': email_body,
                        'Charset': 'UTF-8'
                    }
                }
            }
        )

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Email sent successfully!',
                'response': response
            })
        }

    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Failed to send email',
                'error': str(e)
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'An error occurred',
                'error': str(e)
            })
        }