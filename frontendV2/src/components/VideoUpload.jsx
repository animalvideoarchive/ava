import React, { useEffect, useState } from 'react';
import { Uploader } from "../utils/upload"
import useFormContext from "../hooks/useFormContext"; 
import { baseUrl, partSize, numUploads, transferAcceleration } from "../constants/constants"
import '../styles/VideoUpload.css';

function VideoUpload() {
    const { files, startUpload } = useFormContext();
    const [progress, setProgress] = useState({});   
    const [errors, setErrors] = useState({});

    const handleFileUpload = async () => {
        for (const file of files) {
            const uploader = new Uploader({
                file: file,
                baseURL: baseUrl,
                chunkSize: partSize,
                threadsQuantity: numUploads,
                useTransferAcceleration: transferAcceleration 
            });

            uploader.onProgress(({ percentage }) => {
                setProgress(prev => ({ ...prev, [file.name]: percentage }));
            }).onError((error) => {
                setErrors(prev => ({ ...prev, [file.name]: error.message }));
            });

            try {
                await uploader.start();
            } catch (error) {
                console.error(`Error starting upload for ${file.name}:`, error);
            }
        }
    };

    // Trigger the upload process when files are set
    useEffect(() => {
        handleFileUpload();
    }, [startUpload]);

    return (
        <div className="video-upload-summary">
            <h1>Video Upload Summary</h1>
            <p>Total no. of videos in this batch: {files.length}</p>
            <div className="upload-stats">
                <span className="upload-success">Successful: {Object.values(progress).filter(p => p === 100).length}</span>
                <span className="upload-failed">Failed: {Object.keys(errors).length}</span>
            </div>
            {files.map((file, index) => (
                <div key={index} className="upload-entry">
                    <span className="file-name">{file.name}</span>
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${progress[file.name] || 0}%`, backgroundColor: progress[file.name] === 100 ? '#4CAF50' : errors[file.name] ? '#f44336' : '#FFEB3B' }}></div>
                        <span className="progress-percent">{progress[file.name] || 0}%</span>
                    </div>
                    <span className="file-status-icon">
                        {errors[file.name] ? '✖' : '✔'}
                    </span>
                </div>
            ))}
            <button className="back-home-button" onClick={() => window.location.href = '/'}>Back to Home</button>
        </div>
    );
}

export default VideoUpload;
