// need to upadate this code according to my requoriedment for valiation of reuqied files
// Also need to add the logic of file upload in the FormContext

import { createContext, useState, useEffect } from "react"

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

    const [startUpload, setStartUpload] = useState(false)

    const [page, setPage] = useState(0)

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
        scientificName: "",
        animalIDs: "",
        covariateData: "",
        otherData: "",
        otherDataDetails: "",
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

    const {
        billAddress2,
        sameAsBilling,
        shipAddress2,
        optInNews,
        ...requiredInputs } = data

    const canSubmit = [...Object.values(requiredInputs)].every(Boolean) && page === Object.keys(title).length - 1

    const canNextPage1 = Object.keys(data)
        .filter(key => key.startsWith('bill') && key !== 'billAddress2')
        .map(key => data[key])
        .every(Boolean)

    const canNextPage2 = Object.keys(data)
        .filter(key => key.startsWith('ship') && key !== 'shipAddress2')
        .map(key => data[key])
        .every(Boolean)

    const disablePrev = page === 0

    const disableNext =
        (page === Object.keys(title).length - 1)
        || (page === 0 && !canNextPage1)
        || (page === 1 && !canNextPage2)

    const prevHide = page === 0 && "remove-button"

    const nextHide = page === Object.keys(title).length - 1 && "remove-button"

    const submitHide = page !== Object.keys(title).length - 1 && "remove-button"

    return (
        <FormContext.Provider value={{files, title, page, setPage, data, setData, canSubmit, handleChange, disablePrev, disableNext, prevHide, nextHide, submitHide, numFiles, setNumFiles, setFiles, startUpload, setStartUpload}}>
            {children}
        </FormContext.Provider>
    )
}

export default FormContext 