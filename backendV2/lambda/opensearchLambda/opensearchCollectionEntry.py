import os
import json
import boto3
import uuid
from datetime import datetime
from opensearchpy import OpenSearch, RequestsHttpConnection, AWSV4SignerAuth

# Get the OpenSearch domain name from environment variable
OPENSEARCH_COLLECTION_ENDPOINT = os.getenv('COLLECTION_ENDPOINT')
INDEX_NAME = os.getenv('INDEX_NAME')
domain = OPENSEARCH_COLLECTION_ENDPOINT.split('//')[1]  # Gets the part after 'https://'

# Now split by '/' to isolate the domain from paths
domain = domain.split('/')[0]  

print("Domain : ",domain)


# default lambda region
region = os.getenv('AWS_REGION')

# Initialize AWS clients
service = 'aoss'
credentials = boto3.Session().get_credentials()
auth = AWSV4SignerAuth(credentials, region, service)

# create an opensearch client and use the request-signer
client = OpenSearch(
    hosts=[{'host': domain, 'port': 443}],
    http_auth=auth,
    use_ssl=True,
    verify_certs=True,
    connection_class=RequestsHttpConnection,
    timeout=30 
)

def generate_unique_id():
    """Generate a unique ID using timestamp and UUID"""
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S%f')
    unique_id = f"{timestamp}-{str(uuid.uuid4())}"
    return unique_id

def lambda_handler(event, context):
    try:
        print("event ", event)

        # Extract the video metadata from the event
        video_metadata = event['video_metadata']
        print("Video_Metdata ", video_metadata)
        
        # Generate a unique document ID
        doc_id = generate_unique_id()

        # Generate a unique document ID
        doc_id = generate_unique_id()
        
        # Prepare the document for indexing
        document = {
            "id": doc_id,
            **video_metadata
        }
        
        response = client.index(
            index = INDEX_NAME,
            body = document,
            id = doc_id
        )

        if response['result'] == 'created':
            print(f"Document indexed successfully: {doc_id}")
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Document successfully indexed in OpenSearch',
                    'document_id': doc_id
                })
            }
        else:
            print(f"Document indexing failed: {response}")
            return {
                'statusCode': response['ResponseMetadata']['HTTPStatusCode'],
                'body': json.dumps(f'Error indexing document: {response}')
            }
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error: {str(e)}')
        }