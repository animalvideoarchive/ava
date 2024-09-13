import "./App.css"
import Form from "./components/Form";
import { FormProvider } from './contexts/FormContext';

function App() {

  return (
    <FormProvider>
      <Form />
    </FormProvider>
  )
  
}

export default App
