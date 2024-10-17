import React from 'react';
import useFormContext from "../hooks/useFormContext";  // Make sure this hook is properly defined to manage form state

const OptionalTags = () => {
    const { data, handleChange } = useFormContext();

    const handleRadioChange = (event) => {
        const { name, value } = event.target;
        // Convert "Yes" and "No" to boolean for easier handling of the conditional textarea
        handleChange({ target: { name, value: value === "Yes" } });
    };

    return (
        <div className="form-container">
            <div className="form-section">
                <div className="form-column">
                    <div className="flex-col">
                        <label>
                            Research approval process
                        </label>

                        <input type="text" className="textField" name="researchApproval" value={data.researchApproval || ''} onChange={handleChange} placeholder="Paste link here" />
                    </div>
                    <div className="flex-col">
                        <label>
                            Individual animal IDs
                        </label>

                        <input type="text" className='textField' name="animalIDs" value={data.animalIDs || ''} onChange={handleChange} />
                    </div>
                    <div className="flex-col">
                        <label>
                            Are there any other data relevant to the video that could be shared?
                            <div className='options'>
                                <label>
                                    <input type="radio" name="otherData" value="Yes" checked={data.otherData === true} onChange={handleRadioChange} /> Yes
                                </label>
                                <label>
                                    <input type="radio" name="otherData" value="No" checked={data.otherData === false} onChange={handleRadioChange} /> No
                                </label>
                                {data.otherData && <textarea name="otherDataDetails" onChange={handleChange} value={data.otherDataDetails || ''} placeholder="If yes, provide information here..."></textarea>}
                            </div>
                        </label>
                    </div>
                </div>
                <div className="form-column">
                    <div className="flex-col">

                        <label>
                            Scientific Name
                        </label>

                        <input type="text" className="textField" name="scientificName" value={data.scientificName || ''} onChange={handleChange} />
                    </div>
                    <div className="flex-col">
                        <label>
                            Any other relevant covariate data for this clip?
                            <input type="text" className="textField" name="covariateData" value={data.covariateData || ''} onChange={handleChange} />
                        </label>
                    </div>
                    <div className="flex-col">
                        <label>
                            Is anything else going on during this video that might affect the behavior of the animals?
                            <textarea className="textField" name="behavioralEffects" onChange={handleChange} value={data.behavioralEffects || ''}></textarea>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OptionalTags;
