import React, { useEffect } from 'react';
import FormInputs from './FormInputs'
import useFormContext from "../hooks/useFormContext"
import Header from './Header'
import '../styles/Form.css'
import VideoSubmitPopup from './VideoSubmitPopup'; // Importing the modal component
import AssocaiateTagsWithVideosPopUp from './AssocaiateTagsWithVideosPopUp'; // Importing the modal component
import ProgressBar from './ProgressBar'; // Importing the progress bar component

const Form = () => {

    const {
        files,
        page,
        setPage,
        data,
        title,
        canSubmit,
        disablePrev,
        disableNext,
        prevHide,
        nextHide,
        submitHide,
        numFiles,
        setNumFiles,
        setStartUpload
    } = useFormContext()
    console.log("Title: ", title)
    console.log(page)
    const handlePrev = () => setPage(prev => prev - 1)

    useEffect(() => {
        console.log("Files: ", files)
        setNumFiles(files.length)
    }, [files])

    const [isModalTagsOpen, setModalTagsOpen] = React.useState(false);
   
    const [isVideoSubmitPopupOpen, setVideoSubmitPopupOpen] = React.useState(false);

    const handleNext = () => {
        if (page === 0) {
            setModalTagsOpen(true);
        }
        else if (page === 4) {
            // Trigger some special action, like opening a modal for video upload confirmation
            setVideoSubmitPopupOpen(true);
        }
        else{
            setPage(prev => prev + 1)
        }
    }

    const handleTagFillSelection = () => {
        console.log('Selection confirmed');
        console.log(JSON.stringify(data));
        // Perform upload logic here
        setModalTagsOpen(false);
        // handleFileUpload();
        setPage(prev => prev + 1)
    };

    const handleConfirmFileUpload = () => {
        console.log('Upload confirmed');
        console.log(JSON.stringify(data));
        // Perform upload logic here
        setVideoSubmitPopupOpen(false);
        // handleFileUpload();
        setPage(prev => prev + 1)
        setStartUpload(true)
    };

    const handleSubmit = e => {
        e.preventDefault()
        console.log(JSON.stringify(data))
    }


    const content = (
        // <form className="form flex-col" onSubmit={handleSubmit}>
        <div>
            <Header /> 

            <ProgressBar/>

            <FormInputs />

            <div className="button-container">

                <button type="button" className={`button ${prevHide}`} onClick={handlePrev} disabled={disablePrev}>Prev</button>

                <button type="button" className={`button ${nextHide}`} onClick={handleNext} disabled={disableNext}>Next</button>
                
                {/* <button type="submit" className={`button ${submitHide}`} disabled={!canSubmit}>Submit</button> */}
            </div>

            {isModalTagsOpen && (
            <AssocaiateTagsWithVideosPopUp 
                isOpen={isModalTagsOpen}
                onClose={() => setModalTagsOpen(false)}
                onConfirm={handleTagFillSelection}
            />
            )}  

            {isVideoSubmitPopupOpen && (
            <VideoSubmitPopup 
                isOpen={isVideoSubmitPopupOpen}
                onClose={() => setVideoSubmitPopupOpen(false)}
                onConfirm={handleConfirmFileUpload}
            />
            )}
        </div>
    )

    return content
}
export default Form