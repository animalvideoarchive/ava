// need to upadate this code according to my requoriedment for valiation of reuqied files
// Also need to add the logic of file upload in the FormContext

import { createContext, useState, useEffect } from "react"
import { baseUrl, partSize, numUploads, transferAcceleration } from "../constants/constants"
import { Uploader } from "../utils/upload"

const FormContext = createContext({})

export const FormProvider = ({ children }) => {

    const title = {
        0: 'Select Video',
        1: 'Required Tags 1',
        2: 'Required Tags 2',
        3: 'Optional Tags 1',
        4: 'Optional Tags 2',
        5: 'Uploaded Video'
    }

    const [files, setFiles] = useState([])
    
    const [numFiles, setNumFiles] = useState(0)

    const [page, setPage] = useState(0)

    const [pgvalues, setPgvalues] = useState({})
    
    const [perfs, setPerfs] = useState({})
    
    const [errors, setErrors] = useState({});

    const [data, setData] = useState({
        contactEmail: "",
        commonName: "",
        contactFirstName: "",
        contactLastName: "",
        briefVideoDescription: "",
        videoLocation: "",
        animalVisibility: "",
        videoContext: [],
        dataCollectionStatus: "",
        videoFormat: "",
        researchApproval: "",
        animalIDs: "",
        otherDataDetails: "",
        scientificName: "",
        covariateData: "",
        behavioralEffects: "",
        groupSize: "",
        sexOfAnimals: "",
        ageOfIndividuals: "",
        publications: ""
    })
      
    const handleChange = e => {
        // const type = e.target.type

        // const name = e.target.name

        // const value = type === "checkbox"
        //     ? e.target.checked
        //     : e.target.value

        // setData(prevData => ({
        //     ...prevData,
        //     [name]: value
        // }))

        const { name, value, type, checked } = e.target;

        if (type === "checkbox") {
          if (checked) {
            // Add to array if checked
            setData(prev => ({
              ...prev,
              [name]: [...prev[name], value]
            }));
          } else {
            // Remove from array if unchecked
            setData(prev => ({
              ...prev,
              [name]: prev[name].filter(item => item !== value)
            }));
          }
        } else {
          // Handle other inputs like radio buttons
          setData(prev => ({
            ...prev,
            [name]: value
          }));
        }  
    }
  
    const handleFileUpload = async () => {
        console.log("Metadata", data)
        for (const file of files) {

            const uploaderOptions = {
                file: file,
                baseURL: baseUrl,
                chunkSize: partSize,
                threadsQuantity: numUploads,
                useTransferAcceleration: transferAcceleration 
            }

            const uploader = new Uploader(uploaderOptions)
            const tBegin = performance.now()      

            uploader.onProgress(({ percentage }) => {
                setPgvalues(prev => ({...prev, [file.name]: percentage}))
                if (percentage === 100) {
                    setPerfs(prev => ({...prev, [file.name]: (performance.now() - tBegin)/1000}))
                  }        
            }).onError((error) => {
                console.error(`Error uploading ${file.name}:`, error)
                setErrors(prev => ({ ...prev, [file.name]: error.message }));
                setPgvalues(prev => ({...prev, [file.name]: 0}))
            });

            try {
                console.log("Starting try upload for", file.name)
                await uploader.start();
            } catch (error) {
                console.error(`File uploading failed in catch for await ${file.name}:`, error)
            }
            console.log("Finished uploading", file.name)
        }
        console.log(pgvalues)
        console.log(perfs)
    };

    const disablePrev = page === 0

    const prevHide = page === 0 && "a-remove-button"

    const nextHide = page === 0 && "a-remove-button"

    return (
        <FormContext.Provider value={{files, title, page, setPage, data, setData, handleChange, disablePrev, prevHide, nextHide, numFiles, setNumFiles, setFiles, handleFileUpload, pgvalues, perfs,  errors}}>
            {children}
        </FormContext.Provider>
    )
}

export default FormContext 