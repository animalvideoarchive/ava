import React from 'react';
import "../styles/VideoSubmitPopup.css";

const VideoSubmitPopup = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Ready to upload the video?</h2>
                <p>All the entered tags will be applied to all the videos uploaded in this set - 20</p>
                <div className="modal-actions">
                    <button onClick={onClose} className="modal-button back">Go back to edit</button>
                    <button onClick={onConfirm} className="modal-button confirm">Confirm, upload video</button>
                </div>
            </div>
        </div>
    );
};

export default VideoSubmitPopup;
