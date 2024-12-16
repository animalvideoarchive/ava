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
3. **Start Docker**
   - To use AWS CDK for building and deploying Docker images, Docker must be running on your system
   - Open the Docker Desktop application from your Start Menu or Applications folder
   - Wait until the Docker app indicates that it's running (look for a green "Docker is running" status).

4. **Set Up CDK Environment**:
   - Bootstrap your AWS environment for CDK (run only once per AWS account/region):
     ```
     cdk bootstrap
     ```

<!-- 4. **Initialize CDK**:
   - Ensure your environment is initialized:
     ```
     cdk init app --language typescript
     ``` -->

5. **Deploy the CDK Stack**

- To deploy this stack to AWS, you need to specify **sender email address**, **admin email address** and the **deployment environment**.
   - The **sender email address** will be used by the application to send emails (e.g., notifications to the admin when a video is requested).
   - The **admin email address** is the recipient of user requests triggered by the application.
   - The **deployment environment** parameter helps manage deployment stages such as `development`, `staging`, or `production`.

   Run the following command in your terminal, replacing the placeholders with your actual values:
   ```
   cdk deploy --context senderEmailAddress="your-email@example.com" --context adminEmail="admin-email@example.com" --context env="devenv"
   ```
   - Replace your-email@example.com with the sender email address for sending notifications.
   - Replace admin-email@example.com with the admin email address where user requests will be received.
   - Replace **devenv** with your deployment environment **(dev, staging, or prod)**.
     
   **Note:** Ensure the **senderEmailAddress** and **adminEmail** values are **different** to prevent conflicts.

6. **Once deployment is completed make sure to record the following values. These will be required to configure the frontend application correctly**:
    - UserPoolId
    - UserPoolClientId
    - Admin Flow API Gateway endpoint URL
    - UserFlow API Gateway endpoint URL

7. **An email will be sent to the provided email address. Please click on the link in this email to verify the address. This is a crucial step as AWS SES requires that email addresses are verified before they can be used to send emails. Once verified, this email address will be utilized by the application to send notifications to admin.**
