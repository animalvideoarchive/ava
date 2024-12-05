import json
import boto3
from datetime import datetime
from opensearchpy import OpenSearch, RequestsHttpConnection, AWSV4SignerAuth
import logging
import os

logger = logging.getLogger()
logger.setLevel(logging.INFO)

index_name = os.getenv('INDEX_NAME')
region = os.getenv('AWS_REGION')
OPENSEARCH_COLLECTION_ENDPOINT = os.getenv('COLLECTION_ENDPOINT')
host = OPENSEARCH_COLLECTION_ENDPOINT.split('//')[1]  # Gets the part after 'https://'
host = host.split('/')[0]  

print("Host : ",host)

service = 'aoss'
credentials = boto3.Session().get_credentials()
auth = AWSV4SignerAuth(credentials, region, service)

opensearch_client = OpenSearch(
    hosts=[{'host': host, 'port': 443}],
    http_auth=auth,
    use_ssl=True,
    verify_certs=True,
    connection_class=RequestsHttpConnection,
    timeout=30 
)

s3_client = boto3.client('s3')

def lambda_handler(event, context):
    print("Event : ", event)
    body = json.loads(event["body"])
    if 'filters' not in body:
        return {
            'statusCode': 400,
            'body': json.dumps('Missing required parameter: filters')
        }

    filters = body['filters']
    print("Filters : ", filters)

    search_results = search_animals(filters)  # Call the search function with filters
    print("Search Results ", search_results)

    # Check if search_results is None or empty and return dummy data if necessary
    if not search_results:
        search_results = []
    else:
        for result in search_results:
            # Create presigned URLs for each result
            result['_source']['presigned_thumbnailstartpath'] = create_presigned_url(result['_source']['thumbnailstartpath'])
            result['_source']['presigned_thumbnailendpath'] = create_presigned_url(result['_source']['thumbnailendpath'])
            result['_source']['presigned_clippedvideopath'] = create_presigned_url(result['_source']['clippedvideopath'])
    print("Final Search Result : ", search_results)

    response = {
        "statusCode": 200,
        "body": json.dumps({
            "statusCode": 200,  # Including statusCode inside the body if required
            "body": search_results
        }),
        "headers": {
            "Access-Control-Allow-Origin": "*"
        }
    }
    return response

def search_animals(filters):
    query = {
        "query": {
            "bool": {
                "must": [],
                "filter": []
            }
        }
    }
    # Duration mapping in seconds
    duration_mapping = {
        "5 - 10 Min": (300,600),
        "10 - 30 Min": (600, 1800),
        "30 - 60 Min": (1800, 3600),
        "1 - 3 Hr": (3600, 10800),
        "3 - 5 Hr": (10800, 18000),
        "> 5 Hr": (18000, 99999999)  # Assuming this is effectively the upper limit
    }
    if 'duration' in filters and filters['duration'] is not None:
    # Get the duration range based on the filter value
        duration_range = duration_mapping.get(filters['duration'])
    
        if duration_range:
            lower_bound, upper_bound = duration_range
            
            # Convert string duration to numeric seconds and apply range filter
            query['query']['bool']['filter'].append({
                "range": {
                    "duration": {
                        "gte": lower_bound,  # Convert lower bound to string (if needed)
                        "lte": upper_bound   # Convert upper bound to string (if needed)
                    }
                }
            })
            print(query)

    # Adding other filters
    if 'keyword' in filters:
        query['query']['bool']['must'].append({
            "multi_match": {
                "query": filters['keyword'],
                "fields": [
                    "contactemail",
                    "commonname",
                    "briefvideodescription",
                    "videolocation",
                    "covariatedata",
                    "behavioraleffects", 
                    "otherdatadetails"
                ],
                "fuzziness": "AUTO",
                "operator": "and"
            }
        })
    if 'zoooraquarium' in filters:
        query['query']['bool']['filter'].append({
            "term": {
                "zoooraquarium": filters['zoooraquarium']
            }
        })
    if 'commonname' in filters:
        query['query']['bool']['filter'].append({
            "match_phrase": {
                "commonname": filters['commonname']
            }
        })
    if 'scientificname' in filters:
        query['query']['bool']['filter'].append({
            "match_phrase": {
                "scientificname": filters['scientificname']
            }
        })
    if 'groupsize' in filters:
        query['query']['bool']['filter'].append({
            "match_phrase": {
                "groupsize": filters['groupsize']
            }
        })
    if 'sexofanimals' in filters:
        if filters['sexofanimals'] == 'Only Males':
            query['query']['bool']['filter'].append({
                "match_phrase": {
                    "sexofanimals": 'Male'
                }
            })
        elif filters['sexofanimals'] == 'Only Females':
            query['query']['bool']['filter'].append({
                "match_phrase": {
                    "sexofanimals": 'Female'
                }
            })
        elif filters['sexofanimals'] == 'Any/All':
            query['query']['bool']['filter'].append({
                "bool": {
                    "should": [
                        {"match_phrase": {"sexofanimals": 'Mixed'}},
                        {"match_phrase": {"sexofanimals": 'Male'}},
                        {"match_phrase": {"sexofanimals": 'Female'}}
                    ]
                }
            })
    if 'ageofindividuals' in filters:
        query['query']['bool']['filter'].append({
            "match_phrase": {
                "ageofindividuals": filters['ageofindividuals']
            }
        })
    if 'videocontext' in filters:
        query['query']['bool']['filter'].append({
            "match_phrase": {
                "videocontext": filters['videocontext']
            }
        })
    if 'datacollection' in filters:
        query['query']['bool']['filter'].append({
            "match_phrase": {
                "datacollectionstatus": filters['datacollection']
            }
        })
    if 'animalvisibility' in filters:
        if filters['animalvisibility'] == 'publicly viewable':
            query['query']['bool']['filter'].append({
                "match_phrase": {
                    "animalvisibility": 'Publicly viewable'
                }
            })
        elif filters['animalvisibility'] == 'behind-the-scenes':
            query['query']['bool']['filter'].append({
                "match_phrase": {
                    "animalvisibility": 'Behind-the-scenes'
                }
            })
    if 'videodate' in filters:
        
        start_date = datetime.strptime(filters['videodate'][0], '%m-%d-%Y').strftime('%m-%d-%Y')
        end_date = datetime.strptime(filters['videodate'][1], '%m-%d-%Y').strftime('%m-%d-%Y')
        
        query['query']['bool']['filter'].append({
                "range": {
                    "videodate": {
                        "gte": start_date,
                        "lte": end_date
                    }
                }
            })
    if 'starttime' in filters and filters['starttime']:
        start_time = filters['starttime'][0].strip()  # e.g., "13:00:00"
        end_time = filters['starttime'][1].strip()      # e.g., "19:00:00"

        print(f"Start time: {start_time}, End time: {end_time}")  # Debugging line

        # Adding the range filter for starttime
        query['query']['bool']['filter'].append({
            "range": {
                "starttime": {
                    "gte": start_time,
                    "lte": end_time
                }
            }
        })


    logger.info(f"Constructed Query: {json.dumps(query)}")  # Log the query for debugging

    try:
        response = opensearch_client.search(
            index=index_name,
            body=query,
            size=10  # Adjust size as needed
        )
        return response['hits']['hits']  # Returns only the hits (matching documents)
    except Exception as e:
        logger.error(f"Error searching for animals: {str(e)}", exc_info=True)
        return []  # Returning an empty list to indicate an error occurred

def create_presigned_url(s3_path, expiration=3600):
    """Generate a presigned URL for a given S3 path"""
    if not s3_path.startswith("s3://"):
        logger.error(f"Invalid S3 path: {s3_path}")
        return None

    try:
        # Parse the S3 bucket and key from the S3 path
        s3_parts = s3_path.replace("s3://", "").split("/", 1)
        bucket_name = s3_parts[0]
        object_key = s3_parts[1]

        # Generate the presigned URL
        response = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': object_key},
            ExpiresIn=expiration
        )
        return response
    except Exception as e:
        logger.error(f"Error generating presigned URL for {s3_path}: {str(e)}", exc_info=True)
        return None
