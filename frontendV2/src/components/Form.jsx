import React, { useEffect } from 'react';
import FormInputs from './FormInputs'
import useFormContext from "../hooks/useFormContext"
import Header from './Header'
import VideoSubmitPopup from './VideoSubmitPopup'; // Importing the modal component
import AssocaiateTagsWithVideosPopUp from './AssocaiateTagsWithVideosPopUp'; // Importing the modal component
import ProgressBar from './ProgressBar'; // Importing the progress bar component

const Form = () => {

    const {
        files,
        page,
        setPage,
        data,
        disablePrev,
        disableNext,
        prevHide,
        nextHide,
        numFiles,
        setNumFiles,
        handleFileUpload
    } = useFormContext()

    const handlePrev = () => setPage(prev => prev - 1)

    useEffect(() => {
        console.log("Files: ", files)
        setNumFiles(files.length)
    }, [files])

    const [isModalTagsOpen, setModalTagsOpen] = React.useState(false);
   
    const [isButtonDisply, setButtonDisply] = React.useState(true);

    const [isVideoSubmitPopupOpen, setVideoSubmitPopupOpen] = React.useState(false);

    const handleNext = () => {
        if (page === 0) {
            if (files.length === 0) {
                alert('Please select a file to upload');
                return;
            }
            else{
                setModalTagsOpen(true);
            }
        }
        else if (page === 1) {
            if (data.contactEmail === '' || data.commonName === '' || data.contactFirstName === '' || data.contactLastName === '' || data.briefVideoDescription === '') {
                alert('Please fill in all required fields');
            }
            else{
                setPage(prev => prev + 1)
            }
        }
        else if (page === 2) {
            if (data.videoLocation === '' || data.animalVisibility === '' || data.videoContext.length === 0 || data.dataCollectionStatus === '' || data.videoFormat === '') {
                alert('Please fill in all required fields');
            }
            else{
                setPage(prev => prev + 1)
            }
        }
        else if (page === 4) {
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
        setButtonDisply(false)
        handleFileUpload();
        setPage(prev => prev + 1)        
    };


    const content = (
        <div>
            <Header /> 

            <ProgressBar/>

            <FormInputs />

            {isButtonDisply && (
            <div className="button-container">

                <button type="button" className={`button ${prevHide}`} onClick={handlePrev} disabled={disablePrev}>Prev</button>

                <button type="button" className={`button ${nextHide}`} onClick={handleNext} disabled={disableNext}>Next</button>
            </div>
            )}

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