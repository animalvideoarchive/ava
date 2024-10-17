import {region, userPoolId, userPoolWebClientId } from "./constants/constants"

const awsconfig = {
    "aws_project_region": region,
    "aws_cognito_region": region,
    "aws_user_pools_id": userPoolId, // Your Cognito User Pool ID
    "aws_user_pools_web_client_id": userPoolWebClientId,  // Your App Client ID
    "oauth": {},
    "aws_cognito_username_attributes": [
        "EMAIL"
    ],
    "aws_cognito_social_providers": [],
    "aws_cognito_signup_attributes": [ ],
    "aws_cognito_mfa_configuration": "OFF",
    "aws_cognito_mfa_types": [
        "SMS"
    ],
    "aws_cognito_password_protection_settings": {
        "passwordPolicyMinLength": 8,
        "passwordPolicyCharacters": []
    },
    "aws_cognito_verification_mechanisms": [
        "EMAIL"
    ]
};

export default awsconfig;
