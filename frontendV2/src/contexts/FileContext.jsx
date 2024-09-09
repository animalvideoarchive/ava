// FileContext.js
import React, { createContext, useState, useContext } from 'react';

const FileContext = createContext();

export const useFileContext = () => useContext(FileContext);

export const FileProvider = ({ children }) => {
  const [files, setFiles] = useState([]);

  return (
    <FileContext.Provider value={{ files, setFiles }}>
      {children}
    </FileContext.Provider>
  );
};
