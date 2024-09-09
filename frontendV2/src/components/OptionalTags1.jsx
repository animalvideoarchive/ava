import React from 'react';
import useFormContext from "../hooks/useFormContext";  // Make sure this hook is properly defined to manage form state
import '../styles/OptionalTags1.css';
const OptionalTags = () => {
    const { data, handleChange } = useFormContext();

    const handleRadioChange = (event) => {
        const { name, value } = event.target;
        // Convert "Yes" and "No" to boolean for easier handling of the conditional textarea
        handleChange({ target: { name, value: value === "Yes" } });
    };

    return (
        <div className="form-container">
            <h3>Optional Tags (1/2)</h3>   
            <div className="form-section">
                <div className="form-column">
                    <label>
                        Research approval process
                        <input type="text" name="researchApproval" value={data.researchApproval || ''} onChange={handleChange} placeholder="Paste link here" />
                    </label>
                    <label>
                        Individual animal IDs
                        <input type="text" name="animalIDs" value={data.animalIDs || ''} onChange={handleChange} />
                    </label>
                    <label>
                        Are there any other data relevant to the video that could be shared?
                        <div>
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
                <div className="form-column">
                    <label>
                        Scientific Name
                        <input type="text" name="scientificName" value={data.scientificName || ''} onChange={handleChange} />
                    </label>
                    <label>
                        Any other relevant covariate data for this clip?
                        <input type="text" name="covariateData" value={data.covariateData || ''} onChange={handleChange} />
                    </label>
                    <label>
                        Is anything else going on during this video that might affect the behavior of the animals?
                        <textarea name="behavioralEffects" onChange={handleChange} value={data.behavioralEffects || ''}></textarea>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default OptionalTags;
