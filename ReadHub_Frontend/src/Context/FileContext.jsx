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
  const [highlights, setHighlights] = useState(() => {
    const saved = localStorage.getItem("appHighlights");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    try {
      localStorage.setItem("appHighlights", JSON.stringify(highlights));
    } catch (error) {
      console.error("Failed to save highlights to localStorage:", error);
    }
  }, [highlights]);

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

  const addHighlight = useCallback((fileId, highlight) => {
    setHighlights((prev) => {
      const fileHighlights = prev[fileId] || [];
      // Check if this exact highlight already exists (to avoid duplicates)
      const exists = fileHighlights.some(
        h => h.text === highlight.text && h.page === highlight.page
      );
      
      if (exists) {
        return prev;
      }
      
      return {
        ...prev,
        [fileId]: [...fileHighlights, { ...highlight, id: Date.now() }],
      };
    });
  }, []);

  const getHighlights = useCallback((fileId) => {
    return highlights[fileId] || [];
  }, [highlights]);

  const removeHighlight = useCallback((fileId, highlightId) => {
    setHighlights((prev) => ({
      ...prev,
      [fileId]: (prev[fileId] || []).filter((h) => h.id !== highlightId),
    }));
  }, []);

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
        addHighlight,
        getHighlights,
        removeHighlight,
        highlights,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}

export function useFiles() {
  return useContext(FileContext);
}
