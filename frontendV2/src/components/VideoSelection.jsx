/// need to move the file storage logic to FormContext.

import React, { useState } from 'react';
import useFormContext from "../hooks/useFormContext";  
import { Grid, Box, Typography, LinearProgress, IconButton, Tooltip } from '@mui/material';
import MovieIcon from '@mui/icons-material/Movie';
import CloseIcon from '@mui/icons-material/Close';

function VideoSelection() {
  const { files, setFiles, setNumFiles} = useFormContext();

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
          <Grid container spacing={2}>
            {files.map((file, index) => (
              <Grid item xs={3} key={index}>
                <Box sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  p: 1,
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  bgcolor: 'background.paper'
                }}>
                  <IconButton
                    onClick={() => removeFile(index)}
                    sx={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      p: 0.5,
                      fontSize: '1rem',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    <CloseIcon fontSize="1rem" />
                  </IconButton>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <IconButton sx={{ color: '#4CAF50', mr: 1 }}>
                      <MovieIcon sx= {{color: '#f8a228'}} />
                    </IconButton>
                    <Tooltip title={file.name} placement="top">
                      <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name}
                      </Typography>
                    </Tooltip>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <>
            <p>Drag and drop files here or <label htmlFor="fileInput" className="browse-link">browse</label> to upload</p>
          </>
        )}
      </div>
      {files.length > 0 && files.length < 20 &&(
        <label htmlFor="fileInput" className="add-button">+ Add More Files</label>
      )}
      {files.length === 20  &&(
        <div className="limit-warning">Limit exceeded! You can only upload 20 videos in a batch. Remove above selected file to add different files</div>
      )}
      {files.length > 20  &&(
        <div className="limit-warning">First 20 queued! rest-excluded due to 20-item limit. Remove selected file to add differnt files</div>
      )}
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="fileInput"
      />
      <div className={files.length === 0 ? "text-display" : "not-text-dispaly" } >

      </div>
    </div>
  );
}

export default VideoSelection;
