import React from 'react';
import useFormContext from "../hooks/useFormContext";  // Make sure this hook is properly defined to manage form state
import "../index.css";

const AssocaiateTagsWithVideosPopUp = ({ isOpen, onClose, onConfirm }) => {
    const { numFiles } = useFormContext();
    if (!isOpen) return null;


    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>×</button>
                <h2>You are about to fill tags -</h2>
                <p>These tags will be applied to all uploaded videos - {numFiles}</p>
                <div className="modal-actions">
                    <button onClick={onClose} className="modal-button back"> Go back</button>
                    <button onClick={onConfirm} className="modal-button confirm">Okay, Proceed</button>
                </div>
            </div>
        </div>
    );
};

export default AssocaiateTagsWithVideosPopUp;
