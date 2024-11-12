# St. Louis Zoo Video Archiving System

## Project Overview
The St. Louis Zoo Video Archive Project is a comprehensive cloud-native solution designed to preserve, catalog, and make accessible decades of valuable animal behavior footage. This system enables efficient large video ingestion, manual and intelligent metadata video tagging, and sophisticated search capabilities for both researchers and the public.


## Key Features

- Large video upload feature  with required and optional metadata
- Automated video processing (clipping, thumbnail generation)
- AI-powered metadata extraction (date, timestamps, species identification)
- Advanced search functionality with multiple filters
- Preview clip generation for quick content assessment
- Request steps for full video access

<!-- ## Project Goals
- **Ingest and Catalogue Video Footage**: Allow Admin to ingest large video files into the system and catalogue them with appropriate metadata, including tags and timestamps.
- **Enable Smart Search**: Implement a smart search functionality that allows users to easily find videos based on specific behaviors, timestamps, or animal species.
- **Video Previews**: Generate short previews for each video to provide quick glimpses into the content, helping users decide which full videos to retrieve from cold storage. -->

## System Architecture
Refer to the provided diagram for a detailed view of the system architecture, which outlines both the Admin and User Flows. This setup integrates various AWS services to handle video uploads, metadata tagging, storage, and retrieval processes efficiently.

![Architecture Diagram](Architecture.png)

## Prerequisites
Before running the AWS CDK stack, ensure the following are installed and configured:

1. **AWS Bedrock Access**: Ensure your AWS account has access to the Claude 3.5 model in Amazon Bedrock.
   - Request access through the AWS console if not already enabled

2. **Download Node.js**: Go to [nodejs.org](https://nodejs.org/) and download the latest LTS (Long-Term Support) version of Node.js for your operating system. This version is recommended because it is more stable and well-tested across multiple platforms.

3. **Install Node.js**: Run the downloaded installer. Follow the installation prompts ensuring that npm is selected to be installed alongside Node.js.

4. **Verify Installation**: After installation, you can verify that Node.js and npm are installed correctly by running the following commands in your terminal:
   ```bash
   node --version
   npm --version
   ```

5. **AWS CLI**: To interact with AWS services and set up credentials.
   - Install and configure [AWS CLI](https://aws.amazon.com/cli/)

6. **AWS CDK**: For defining cloud infrastructure in code.
   - Install and bootstrap [AWS CDK](https://aws.amazon.com/cdk/)

7. **Docker**: Required to build and run Docker images for the ECS tasks.
   - Install Docker

8. **AWS Account Permissions**: Ensure your AWS account has the necessary permissions to create and manage the required resources (S3, Lambda, Step Functions, ECS, ECR, CloudWatch, Cognito, Opensearch Serverless, Amplify, SES, etc.)


## Directory Structure

```
├── backendV2 (Backend CDK code for AWS infrastructure and code that handles data processing and storage)
├── frontendV2 (UI React application for the administrative interface to upload and tag videos.)
└── userFlowFrontend (UI React application that allows end users to search and view video previews.)
```

## Setup and Deployment

Clone the project
```
git clone https://github.com/ASUCICREPO/St-Louis-Zoo.git
```
## Backend (backendV2)

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
   - Deploy the stack to AWS:
     ```
     cdk deploy
     ```

5. **Once deployment is completed make sure to record the following values. These will be required to configure the frontend application correctly**:
    - API Gateway endpoint URL
    - UserPoolId
    - UserPoolClientId


## Admin Frontend Application (frontendV2)
The frontend is built using React, providing a user-friendly interface for multi-part very large video upload and metatada associated with the videos.

1. **Install Dependencies**
   - Move to directory contains the required code and run "npm install" to install all dependencies
        ```
     cd frontendV2

     npm install
     ```
   - This will install all required packages, including AWS Amplify for authentication and API interaction.


3. **Configure API Endpoints and Congito Authentication**:
   - Navigate to `frontendV2/src/constants/constants.js` file. Here, update the following fields with the values obtained after deploying your backend infrastructure.

     ```
     export const baseUrl = "https://4rbg4has2a.execute-api.us-east-1.amazonaws.com/prod/"; // add the obtained API Gateway endpoint URL

     export const userPoolId = "us-east-1_xO356OagKq"; // add the obtained UserPoolId

     export const userPoolWebClientId = "7f3w7cnsadikvwerrcbl65l20m"; // add the obtained UserPoolClientId

     export const region = "us-east-1"  // add the AWS region used for backend deployment
     ```

   - This step ensures that your frontend application can communicate effectively with the backend services and handle user authentication seamlessly.

3. **Run the Frontend**
   - To start the application locally, use the following command:
        ```
        npm start
     ```
   - This will launch the frontend on http://localhost:3000, where you can upload video file and add metadata with vidoes.

## ☁️ Deploying to AWS Amplify
Deploying the frontend to AWS Amplify is a great choice for scaling your application and making it accessible online with minimal setup.

1. **Create an Amplify App**:

   - Access the [AWS Management Console](https://aws.amazon.com/console/) and sign in with your credentials.

   - In the AWS Management Console's search bar at the top, type `Amplify`.
   - Select **Amazon Amplify** from the dropdown menu.
   - Choose **Create new App** 
   - Connect your GitHub repository (or another version control system).
   - Select the repository branch (e.g. main)
   - Select **My app is a monorepo** and enter the folder name **frontendV2**
   - Configure Build Settings: Amplify will automatically detect your build settings for a React app. If needed, you can customize the amplify.yml file:

      ```bash
      version: 1
      frontend:
      phases:
         preBuild:
            commands:
            - npm install
         build:
            commands:
            - npm run build
      artifacts:
         baseDirectory: /build
         files:
            - '**/*'
      cache:
         paths:
            - node_modules/**/*
      ```

2. **Deploy**:

- After setting up, Amplify will automatically build and deploy your application.
- You will be provided with a live URL to access the frontend.

<!-- ## Getting Started
1. **Setting Up the Backend**:
   Follow the setup instructions to configure AWS services and deploy the backend components.
2. **Running the Frontend**:
   Instructions for installing dependencies and running the React application locally. -->

# Adding an Admin to AWS Cognito User Pool

### 1. Log in to AWS Management Console
Access the [AWS Management Console](https://aws.amazon.com/console/) and sign in with your credentials.

### 2. Access Cognito
- In the AWS Management Console's search bar at the top, type `Cognito`.
- Select **Amazon Cognito** from the dropdown menu to open the Cognito dashboard.

### 3. Select Your User Pool
- On the Amazon Cognito dashboard, you will see two options: **User Pools** and **Identity Pools**.
- Click on **User Pools**.
- Choose the user pool **ZooAdminUserPool**

### 4. Manage Users
- To add a new user, click **Create user**.
  - Ensure that for field "Alias attributes used to sign in"
  **Email** is selected
  - Fill in the required fields such as username, email (as required by your user pool settings), and password.
  - Ensure to set the **Mark email as verified** if email is a required attribute and similarly for the phone number.
  - Click **Create user**.

### 5. Using the Admin Credentials
- With the admin user successfully created, you can now use these credentials to log in to the St. Louis Zoo Admin flow.
- Navigate to the login page of the St. Louis Zoo Admin portal and enter the admin username and password you set up.
- Upon successful authentication, you will have access to admin functionalities.

## Usage
- **Admin Flow**: Admins can upload large videos with metadata information, which are then processed to extract previews and metadata before being archived.
- **User Flow**: Users can search the video catalog using the smart search feature, view video previews, and retrieve metadata.

<!-- ## Future Enhancements
- Enhancing the video processing capabilities to include AI-based tagging for more precise metadata generation.
- Implementing more granular access controls for different user roles within the system. -->

## 📝 Pro Tip:

Make sure to deploy the backend before working on the frontend! 🛠️ This ensures that all the API endpoints , Lambda functions and all required Services are live and ready for your frontend to interact with.


## Contributing

Contributions to this project are welcome. Please fork the repository and submit a pull request with your changes