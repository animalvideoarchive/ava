import "./App.css"
import React, { useState, useRef } from "react";
import Form from "./components/Form";
import { FormProvider } from './contexts/FormContext';
import { signOut } from "aws-amplify/auth"; // AWS Amplify for authentication
import { Amplify } from 'aws-amplify';
import awsconfig from './custom-aws-config';
import Login from "./components/LoginPage";

Amplify.configure(awsconfig);

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  // Handle user login
  const handleLogin = () => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(); // AWS Cognito sign out
      localStorage.removeItem("isLoggedIn");
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <div>
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} /> // Render login page when not logged in
      ) : (
        <FormProvider>
          <Form signOut={handleLogout} />
        </FormProvider>
      )}
    </div>
  );

}

export default App;
