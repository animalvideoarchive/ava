import React from 'react';
import FormInputs from './FormInputs'
import useFormContext from "../hooks/useFormContext"
import Header from './Header'
import '../styles/Form.css'
import VideoSubmitPopup from './VideoSubmitPopup'; // Importing the modal component

const Form = () => {

    const {
        page,
        setPage,
        data,
        title,
        canSubmit,
        disablePrev,
        disableNext,
        prevHide,
        nextHide,
        submitHide
    } = useFormContext()
    console.log("Title: ", title)
    console.log(page)
    const handlePrev = () => setPage(prev => prev - 1)

    const handleNext = () => {
        if (page === 4) {
            // Trigger some special action, like opening a modal for video upload confirmation
            setModalOpen(true);
        }
        else{
            setPage(prev => prev + 1)
        }
    }

    const [isModalOpen, setModalOpen] = React.useState(false);

    const handleConfirmUpload = () => {
        console.log('Upload confirmed');
        console.log(JSON.stringify(data));
        // Perform upload logic here
        setModalOpen(false);
        // handleFileUpload();
        setPage(prev => prev + 1)

    };

    const handleSubmit = e => {
        e.preventDefault()
        console.log(JSON.stringify(data))
    }


    const content = (
        <form className="form flex-col" onSubmit={handleSubmit}>

            <Header />  {/* The header component is included at the top */}

            <h2>{title[page]}</h2>

            {/* Need to show the header bar */}
            <FormInputs />

            {/* <header className="form-header"> */}

                <div className="button-container">

                    <button type="button" className={`button ${prevHide}`} onClick={handlePrev} disabled={disablePrev}>Prev</button>

                    <button type="button" className={`button ${nextHide}`} onClick={handleNext} disabled={disableNext}>Next</button>
                    
                    {/* <button type="submit" className={`button ${submitHide}`} disabled={!canSubmit}>Submit</button> */}
                </div>

                {isModalOpen && (
                <VideoSubmitPopup 
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    onConfirm={handleConfirmUpload}
                />
                )}

            {/* </header> */}

        </form>
    )

    return content
}
export default Form