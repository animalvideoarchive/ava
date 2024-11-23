# Backend Setup 

The backend codebase facilitates large video uploads and handles video processing tasks such as clipping and thumbnail generation. It leverages AI to extract time and date metadata, storing all results in OpenSearch for efficient and quick data retrieval. Additionally, it contains the infrastructure as code (IaC).


## Setup Guide

1. **Go the code directory**
   - Move to directory contains the required code and run "npm install" to install all dependencies
        ```
     cd backendV2

     npm install
     ```

2. **Set Up Your Environment**:
   - Configure AWS CLI with your AWS account credentials:
     ```
     aws configure
     ```

3. **Set Up CDK Environment**:
   - Bootstrap your AWS environment for CDK (run only once per AWS account/region):
     ```
     cdk bootstrap
     ```

<!-- 4. **Initialize CDK**:
   - Ensure your environment is initialized:
     ```
     cdk init app --language typescript
     ``` -->

4. **Deploy the CDK Stack**:
   - To deploy this stack to AWS, you need to specify both the email address and the deployment environment. The email address will be used by the application to send emails to end users or researchers once they request a video, while the environment parameter can help you manage different stages of deployment (e.g., development, staging, production).
   - Run the following command in your terminal, replacing `your-email@example.com` with the actual email address you intend to use, and `devenv` with your deployment environment (e.g., `dev`, `prod`):
     ```
     cdk deploy --context senderEmailAddress="your-email@example.com" --context env="devenv"
     ```

5. **Once deployment is completed make sure to record the following values. These will be required to configure the frontend application correctly**:
    - UserPoolId
    - UserPoolClientId
    - Admin Flow API Gateway endpoint URL 
    - UserFlow API Gateway endpoint URL
