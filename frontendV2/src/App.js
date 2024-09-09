import "./App.css"
import { Uploader } from "./utils/upload"
import { useEffect, useState } from "react"
import Form from "./components/Form";
import { FormProvider } from './contexts/FormContext';

// import HorizontalLinearAlternativeLabelStepper from "./Components/UserHeader";
function App() {
  const [files, setFiles] = useState([])
  const [pgvalues, setPgvalues] = useState({})
  const [perfs, setPerfs] = useState({})
  const [baseUrl, setBaseUrl] = useState(undefined)
  const [partsize, setPartsize] = useState(undefined)
  const [numuploads, setNumuploads] = useState(undefined)
  const [ta, setTa] = useState(undefined)

  async function handleFileUpload(files) {
    for (const file of files) {
      const uploaderOptions = {
        file: file,
        baseURL: baseUrl,
        chunkSize: partsize,
        threadsQuantity: numuploads,
        useTransferAcceleration: ta 
      }

      const uploader = new Uploader(uploaderOptions)
      const tBegin = performance.now()

      uploader
        .onProgress(({ percentage }) => {
          setPgvalues(prev => ({...prev, [file.name]: percentage}))
          if (percentage === 100) {
            setPerfs(prev => ({...prev, [file.name]: (performance.now() - tBegin)/1000}))
          }
        })
        .onError((error) => {
          console.error(`Error uploading ${file.name}:`, error)
          setFiles(prev => prev.filter(f => f !== file))
        })
      try {
        console.log("Starting upload for", file.name)
        await uploader.start()  // Waits for the current file to be uploaded
      } catch (error) {
        console.error(`Error starting upload for ${file.name}:`, error)
      }
    }
  };
  

  // useEffect(() => {
  //     handleFileUpload(files)
  //       // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [files])

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length > 20) {
      alert("You can select a maximum of 20 files.")
      return
    }
    setFiles(selectedFiles)
    setPgvalues({})
    setPerfs({})
  }

  return (
    <FormProvider>
      <Form />
    </FormProvider>

    // <div >
    //   {/* <Header />
    //   <FileProvider>
    //   <HomePage />
    // </FileProvider> */}

    //   <div style={{ backgroundColor: "#e2e2e2", padding: "20px", margin: "10px"}}>    
    //     <strong style={{display: "block"}}>Step 1 - Enter API URL</strong><br/>
    //     <input type="text" id="urlinput" style={{width: "50%"}} placeholder="https://example.execute-api.example.amazonaws.com/example/" 
    //            onChange={(e) => {
    //             setBaseUrl(e.target?.value)
    //            }}
    //     />
    //   </div>  
    //   <div style={{ backgroundColor: "#e2e2e2", padding: "20px", margin: "10px"}}>
    //     <strong style={{display: "block"}}>Step 2 - Choose part size (MB)</strong><br/>
    //     <input type="number" id="pu" min="5" max="500"
    //            onChange={(e) => {
    //             setPartsize(e.target?.value)
    //            }}
    //     />
    //   </div>      
    //   <div style={{ backgroundColor: "#e2e2e2", padding: "20px", margin: "10px"}}>
    //     <strong style={{display: "block"}}>Step 3 - Choose number of parallel uploads</strong><br/>
    //     <input type="number" id="pu" min="5" max="10"
    //            onChange={(e) => {
    //             setNumuploads(e.target?.value)
    //            }}
    //     />
    //   </div> 
    //   <div style={{ backgroundColor: "#e2e2e2", padding: "20px", margin: "10px"}}>
    //     <strong style={{display: "block"}}>Step 4 - Use Transfer Acceleration</strong><br/>
    //     <input type="checkbox" id="ta"
    //            onChange={(e) => {
    //             setTa(e.target?.checked)
    //            }}
    //     />
    //   </div>                 
    //   <div style={{ backgroundColor: "#e2e2e2", padding: "20px", margin: "10px"}}>
    //     <strong style={{display: "block"}}>Step 5 - Choose files (max 20)</strong><br/>
    //     <input type="file" id="fileinput" multiple
    //            onChange={handleFileChange}
    //     />
    //   </div>
    //   <div style={{ backgroundColor: "#e2e2e2", padding: "20px", margin: "10px"}}>
    //     <strong style={{display: "block"}}>Step 6 - Monitor</strong><br/>
    //     {files.map(file => (
    //       <div key={file.name}>
    //         {file.name}: {pgvalues[file.name] || 0}% ({perfs[file.name] || '-'} sec)
    //       </div>
    //     ))}
    //   </div>
    // </div>
  )
}

export default App
