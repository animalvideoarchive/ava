import "./App.css"
import Form from "./components/Form";
import { FormProvider } from './contexts/FormContext';
import { Amplify } from 'aws-amplify';
import { withAuthenticator, Button, Heading } from '@aws-amplify/ui-react';
import awsconfig from './custom-aws-config';

Amplify.configure(awsconfig);

function App({ signOut }) {

  return (
    <FormProvider>
      <Form signOut={signOut} />
    </FormProvider>
  )
  
}

export default withAuthenticator(App)
