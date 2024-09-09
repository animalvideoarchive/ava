import React from 'react';
import useFormContext from "../hooks/useFormContext";  // Assuming useFormContext handles form state
import '../styles/OptionalTags2.css';

const AdditionalDetails = () => {
    const { data, handleChange } = useFormContext();

    return (
        <div className="form-container">
            <div className="form-section">
                <div className="form-column">
                    <h3>Group Size</h3>
                    <label>
                        <input type="radio" name="groupSize" value="One Animal" checked={data.groupSize === 'One Animal'} onChange={handleChange} />
                        One Animal (singly housed)
                    </label>
                    <label>
                        <input type="radio" name="groupSize" value="Two Animals" checked={data.groupSize === 'Two Animals'} onChange={handleChange} />
                        Two Animals (pair housed)
                    </label>
                    <label>
                        <input type="radio" name="groupSize" value="Three or more Animals" checked={data.groupSize === 'Three or more Animals'} onChange={handleChange} />
                        Three or more Animals (group housed)
                    </label>

                    <h3>Sex(es) of animals</h3>
                    <label>
                        <input type="radio" name="sexOfAnimals" value="Only Males" checked={data.sexOfAnimals === 'Only Males'} onChange={handleChange} />
                        Only Males
                    </label>
                    <label>
                        <input type="radio" name="sexOfAnimals" value="Only Females" checked={data.sexOfAnimals === 'Only Females'} onChange={handleChange} />
                        Only Females
                    </label>
                    <label>
                        <input type="radio" name="sexOfAnimals" value="All/Any" checked={data.sexOfAnimals === 'All/Any'} onChange={handleChange} />
                        All/Any
                    </label>

                    <h3>Age of individual or age range of individuals</h3>
                    <label>
                        <input type="radio" name="ageOfIndividuals" value="Adult" checked={data.ageOfIndividuals === 'Adult'} onChange={handleChange} />
                        Adult
                    </label>
                    <label>
                        <input type="radio" name="ageOfIndividuals" value="Juveniles" checked={data.ageOfIndividuals === 'Juveniles'} onChange={handleChange} />
                        Juveniles
                    </label>
                    <label>
                        <input type="radio" name="ageOfIndividuals" value="Unknown" checked={data.ageOfIndividuals === 'Unknown'} onChange={handleChange} />
                        Unknown
                    </label>
                </div>

                <div className="form-column">
                    <h3>Publications & published abstracts using these data</h3>
                    <label>
                        <input type="text" name="publications" value={data.publications || ''} onChange={handleChange} placeholder="Paste link here" />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default AdditionalDetails;
