import React, { useEffect } from "react";
import { createContext, useState, useContext, useCallback } from "react";

const FileContext = createContext();

export function FileProvider({ children }) {
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem("appFiles");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    try {
      localStorage.setItem("appFiles", JSON.stringify(files));
    } catch (error) {
      console.error("Failed to save files to localStorage:", error);
    }
  }, [files]);

  const [selectedFile2, setSelectedFile] = useState(null);

  const addFile = (file) => {
    setFiles((prev) => [...prev, file]);
  };

  const selectFile = (file) => {
    setSelectedFile(file);
  };

  const deleteFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (selectedFile2?.id === fileId) {
      setSelectedFile(null);
    }
  };

  const updateCurrentPage = useCallback(
    (fileId, pageNumber, source = "unknown") => {
      setFiles((prev) =>
        prev.map((file) =>
          file.id === fileId ? { ...file, currentPage: pageNumber } : file,
        ),
      );
      setSelectedFile((prev) =>
        prev?.id === fileId ? { ...prev, currentPage: pageNumber } : prev,
      );
    },
    [],
  );

  const getProgress = (file) => {
    if (!file.numPages || !file.currentPage) return 0;
    return Math.round((file.currentPage / file.numPages) * 100);
  };

  return (
    <FileContext.Provider
      value={{
        files,
        selectedFile2,
        addFile,
        deleteFile,
        selectFile,
        updateCurrentPage,
        getProgress,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}

export function useFiles() {
  return useContext(FileContext);
}
