import React from 'react';
import '../index.css';
import { useFileContext } from '../contexts/FileContext';
// import Button from './Button';

const Button = ({ icon, text, onClick }) => {
    return (
      <div className="button" onClick={onClick}>
        <i className={`icon-${icon}`}></i>
        <span>{text}</span>
      </div>
    );
  };
  
const HomePage = () => {
    const { files, setFiles } = useFileContext();
  
    const handleFileChange = (event) => {
      const uploadedFiles = Array.from(event.target.files);
      setFiles(uploadedFiles);
    };
  
    const handleUploadClick = () => {
      document.getElementById('fileInput').click();
    };
  
    return (
      <div className="home-page">
        <h1>Welcome Admin!</h1>
        <div className="buttons">

            <div className="button">
                <i className={`icon-tag`}></i>
                <span>Edit Master Tags</span>
            </div>

            <div className="divider"></div>

            {/* <div className="button"> */}
                <Button icon="upload" text="Upload Video" onClick={handleUploadClick} />
                {/* <button onClick={handleUploadClick}>Upload Video</button> */}
                {/* <input
                    id="fileInput"
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                /> */}
                {/* <span>Select Videos</span> */}
            {/* </div> */}
        </div>
      </div>
    );
  };
  
  export default HomePage;
  