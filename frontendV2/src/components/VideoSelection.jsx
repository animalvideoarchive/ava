/// need to move the file storage logic to FormContext.

import React, { useState } from 'react';
import '../styles/VideoSelection.css';

function VideoSelection() {
  const [files, setFiles] = useState([]);

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    const totalFiles = files.concat(newFiles).slice(0, 20); // Combine new files with existing, slice to keep only up to 20
    setFiles(totalFiles);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles].slice(0, 20));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="uploader-container">
      <div className={files.length > 0 ? "file-display" : "drop-zone"} 
           onDrop={handleDrop} 
           onDragOver={handleDragOver}>
        {files.length > 0 ? (
          files.map((file, index) => (
            <div key={index} className="video-item">
              <span className="file-icon">&#128253;</span> {/* Camera icon */}
              <span className="file-name">{file.name}</span>
              <button onClick={() => removeFile(index)} className="remove-button">X</button>
            </div>
          ))
        ) : (
          <>
            <p>Drag and drop files here</p>
            <p>or <label htmlFor="fileInput" className="browse-link">browse</label> to upload</p>
          </>
        )}
      </div>
      {files.length > 0 && (
        <label htmlFor="fileInput" className="add-button">+ Add More Files</label>
      )}
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="fileInput"
      />
      {/* <div className="button-group">
        <button className="back-button">Back</button>
        <button className="next-button" disabled={!files.length}>Next</button>
      </div> */}
    </div>
  );
}

export default VideoSelection;
