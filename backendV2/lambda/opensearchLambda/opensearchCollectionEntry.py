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

# create index in opensearch if not yet created (Will run one only time when user upload first video)
def index_creation():
    # Create the index with mappings
    client.indices.create(
        index=INDEX_NAME,
        body={
            "mappings": {
                "properties": {
                "ageofindividuals": {
                    "type": "text",
                    "fields": {
                    "keyword": {
                        "type": "keyword",
                        "ignore_above": 256
                    }
                    }
                },
                "animalids": {
                    "type": "text",
                    "fields": {
                    "keyword": {
                        "type": "keyword",
                        "ignore_above": 256
                    }
                    }
                },
                "animalvisibility": {
                    "type": "text",
                    "fields": {
                    "keyword": {
                        "type": "keyword",
                        "ignore_above": 256
                    }
                    }
                },
                "behavioraleffects": {
                    "type": "text",
                    "fields": {
                    "keyword": {
                        "type": "keyword",
                        "ignore_above": 256
                    }
                    }
                },
                "briefvideodescription": {
                    "type": "text",
                    "fields": {
                    "keyword": {
                        "type": "keyword",
                        "ignore_above": 256
                    }
                    }
                },
                "clippedvideopath": {
                    "type": "text",
                    "fields": {
                    "keyword": {
                        "type": "keyword",
                        "ignore_above": 256
                    }
                    }
                },
                "commonname": {
                    "type": "text",
                    "fields": {
                    "keyword": {
                        "type": "keyword",
                        "ignore_above": 256
                    }
                    }
                },
                "contactemail": {
                    "type": "text",
                    "fields": {
                    "keyword": {
                        "type": "keyword",
                        "ignore_above": 256
                    }
                    }
                },
                "contactfirstname": {
                    "type": "text",
                    "fields": {
                    "keyword": {
                        "type": "keyword",
                        "ignore_above": 256
                    }
                    }
                },
                "contactlastname": {
                    "type": "text",
                    "fields": {
                    "keyword": {
                        "type": "keyword",
                        "ignore_above": 256
                    }
                    }
                },
                "covariatedata": {
                    "type": "text",
                    "fields": {
                    "keyword": {
                        "type": "keyword",
                        "ignore_above": 256
                    }
                    }
                },
                "datacollectionstatus": {
                    "type": "text",
                    "fields": {
                    "keyword": {
                        "type": "keyword",
                        "ignore_above": 256
                    }
                    }
                },
                "duration": {
                    "type": "float"
                },
                "endtime": {
                    "type": "date",
                    "format": "HH:mm:ss||epoch_millis"
                },
                "groupsize": {
                    "type": "text",
                    "fields": {
                    "keyword": {
                        "type": "keyword",
                        "ignore_above": 256
                    }
                    }
                },
                "id": {
                    "type": "text",
                    "fields": {
                    "keyword": {
                        "type": "keyword",
                        "ignore_above": 256
                    }
                    }
                },
                "otherdatadetails": {
                    "type": "text",
                    "fields": {
                    "keyword": {
                        "type": "keyword",
                        "ignore_above": 256
                    }
                    }
                },
                "researchapproval": {
                    "type": "text",
                    "fields": {
                    "keyword": {
                        "type": "keyword",
                        "ignore_above": 256
                    }
                    }
                },
                "scientificname": {
                    "type": "text",
                    "fields": {
                    "keyword": {
                        "type": "keyword",
                        "ignore_above": 256
                    }
                    }
                },
                "sexofanimals": {
                    "type": "text",
                    "fields": {
                    "keyword": {
                        "type": "keyword",
                        "ignore_above": 256
                    }
                    }
                },
                "starttime": {
                    "type": "date",
                    "format": "HH:mm:ss||epoch_millis"
                },
                "thumbnailendpath": {
                    "type": "text",
                    "fields": {
                    "keyword": {
                        "type": "keyword",
                        "ignore_above": 256
                    }
                    }
                },
                "thumbnailstartpath": {
                    "type": "text",
                    "fields": {
                    "keyword": {
                        "type": "keyword",
                        "ignore_above": 256
                    }
                    }
                },
                "videocontext": {
                    "type": "text",
                    "fields": {
                    "keyword": {
                        "type": "keyword",
                        "ignore_above": 256
                    }
                    }
                },
                "videodate": {
                    "type": "date",
                    "format": "MM-dd-yyyy"
                },
                "videoformat": {
                    "type": "text",
                    "fields": {
                    "keyword": {
                        "type": "keyword",
                        "ignore_above": 256
                    }
                    }
                },
                "videolocation": {
                    "type": "text",
                    "fields": {
                    "keyword": {
                        "type": "keyword",
                        "ignore_above": 256
                    }
                    }
                }
                }
            }
        }
    )

    print(f"Index {INDEX_NAME} created successfully")

def lambda_handler(event, context):
    try:
        print("event ", event)

        # Extract the video metadata from the event
        video_metadata = event['video_metadata']
        print("Video_Metdata ", video_metadata)
        
        # Generate a unique document ID
        doc_id = generate_unique_id()

        # create index in opensearch if not yet created (Will run one only time when user upload first video)
        if not client.indices.exists(index=INDEX_NAME):
            index_creation()
        
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