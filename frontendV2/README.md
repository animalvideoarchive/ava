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

2. **Configure API Endpoints and Congito Authentication**:

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

- Create a build of the app.
  ```
     npm run build
  ```
- Open build folder on File explorer or Finder.
- Select **all contents** in the build folder to create a compressed folder.
- _Make sure to compress the contents of the build folder and not the build folder_

**While deploying for the first time -**

- Go to Amplify
- Click on "Create new app"
- Then click on "Deploy without GIT"
- Click "Next"
- Add app name, for example "slz_user"
- Add branch name, for example "prod"
- Upload the compressed folder to Amplify to deploy the application.
- Click on "Save and deploy"
- Click on "Visit Deloyed Url" to access the application

**In subsequent deployments -**

- Go to Amplify
- Click on existing app
- Then click on "Deploy updates"
- Upload the compressed folder to Amplify to deploy the application
- Click on "Save and deploy"
- Click on "Visit Deloyed Url" to access the application
