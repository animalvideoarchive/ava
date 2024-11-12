# Admin Frontend Setup

The frontend provides a user-friendly interface for large video uploads and selecting associated metadata. Built using React, it connects with the backend via API calls to manage video processing tasks efficiently.

## Setup Guide

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
