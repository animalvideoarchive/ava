import React from 'react';
import useFormContext from "../hooks/useFormContext";  // Ensure useFormContext is properly handling form state
import '../styles/RequiredTags2.css';

const RequiredTags2 = () => {
    const { data, handleChange } = useFormContext();

    return (
        <div className="form-container">
            {/* <h3>Required Tags 2</h3> */}
            <div className="form-section">

                <div className="form-column">
                    <label>
                        Is this video from an indoor or outdoor area?*
                        <div className="options">
                            <label><input type="radio" name="videoLocation" value="Indoor" checked={data.videoLocation === 'Indoor'} onChange={handleChange} /> Indoor</label>
                            <label><input type="radio" name="videoLocation" value="Outdoor" checked={data.videoLocation === 'Outdoor'} onChange={handleChange} /> Outdoor</label>
                        </div>
                    </label>
                    <label>
                        Are the animals publicly viewable or behind-the-scenes?*
                        <div className="options">
                            <label><input type="radio" name="animalVisibility" value="Publicly viewable" checked={data.animalVisibility === 'Publicly viewable'} onChange={handleChange} /> Publicly viewable</label>
                            <label><input type="radio" name="animalVisibility" value="Behind-the-scenes" checked={data.animalVisibility === 'Behind-the-scenes'} onChange={handleChange} /> Behind-the-scenes</label>
                        </div>
                    </label>
                    <label>
                        This video was collected during (check all that apply)*
                        <div className="options">
                            <label><input type="checkbox" name="videoContext" value="Normal circumstances" checked={Array.isArray(data.videoContext) && data.videoContext.includes('Normal circumstances')} onChange={handleChange} /> Normal circumstances</label>
                            <label><input type="checkbox" name="videoContext" value="An experimental manipulation of the subject or its environment" checked={Array.isArray(data.videoContext) && data.videoContext.includes('An experimental manipulation of the subject or its environment')} onChange={handleChange} /> An experimental manipulation of the subject or its environment</label>
                            <label><input type="checkbox" name="videoContext" value="Rare/unusual life events" checked={Array.isArray(data.videoContext) && data.videoContext.includes('Rare/unusual life events')} onChange={handleChange} /> Rare/unusual life events</label>
                        </div>
                    </label>
                </div>
                <div className="form-column">
                    <label>
                        Data collection ongoing?*
                        <div className="options">
                            <label><input type="radio" name="dataCollectionStatus" value="Yes" checked={data.dataCollectionStatus === 'Yes'} onChange={handleChange} /> Yes</label>
                            <label><input type="radio" name="dataCollectionStatus" value="No" checked={data.dataCollectionStatus === 'No'} onChange={handleChange} /> No</label>
                        </div>
                    </label>
                    <label>
                        What was the original video format?*
                        <div className="options">
                            <label><input type="radio" name="videoFormat" value="DVD" checked={data.videoFormat === 'DVD'} onChange={handleChange} /> DVD</label>
                            <label><input type="radio" name="videoFormat" value="VHS" checked={data.videoFormat === 'VHS'} onChange={handleChange} /> VHS</label>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default RequiredTags2;
