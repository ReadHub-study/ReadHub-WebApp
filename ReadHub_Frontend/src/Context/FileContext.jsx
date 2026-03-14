import React, { useEffect } from "react";
import { createContext, useState, useContext, useCallback } from "react";
import { backendApi } from "../services/api";
import { extractEpubCover, extractPdfCover } from "../Utils/coverExtractor";
import {
  uploadCoverToCloudinary,
  uploadToCloudinary,
} from "../Utils/CloudinaryUpload";

const FileContext = createContext();

const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export function FileProvider({ children }) {
  const [files, setFiles] = useState([]);
  const [selectedFile2, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState({});

  const debouncedSave = useCallback(
    debounce(async (fileId, page) => {
      await backendApi.updateProgress(fileId, page);
    }, 1000),
    [],
  );

  const updateCurrentPage = (fileId, page) => {
    setCurrentPage((prev) => ({
      ...prev,
      [fileId]: page,
    }));
    debouncedSave(fileId, page);
  };

  //fetch books from backend
  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const books = await backendApi.getBooks();

      const savedPages = {};
      books.forEach((book) => {
        if (book.currentPage) {
          savedPages[book._id] = book.currentPage;
        }
      });
      setFiles(books);
      setCurrentPage((prev) => ({ ...prev, ...savedPages }));
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, []);

  //Upload book to cloudinary and save book details to backend
  const uploadBook = useCallback(async (file, metadata = {}) => {
    try {
      //Extract cover

      const fileURL = URL.createObjectURL(file);
      const fileType = file.name.endsWith(".epub") ? "epub" : "pdf";

      let coverImage = null;
      if (fileType === "epub") {
        coverImage = await extractEpubCover(fileURL);
      } else {
        coverImage = await extractPdfCover(fileURL);
      }

      //Upload book file to Cloudinary

      const bookUpload = await uploadToCloudinary(file, "books", "raw");

      //Upload cover to Cloudinary(if exists)
      let coverUpload = null;
      if (coverImage) {
        coverUpload = await uploadCoverToCloudinary(coverImage, "covers");
      }

      //Save metadata to backend

      const bookData = {
        title: metadata.title || file.name,
        coverImageUrl: coverUpload?.url || null,
        fileUrl: bookUpload.url,
        pages: metadata.totalPages || 0,
      };

      const savedBook = await backendApi.saveBook(bookData);

      //Update local state
      setFiles((prev) => [...prev, savedBook]);

      return savedBook;
    } catch (error) {
      throw error;
    }
  }, []);

  //Delete book
  const deleteBook = useCallback(
    async (bookId) => {
      try {
        await backendApi.deleteBook(bookId);
        setFiles((prev) => prev.filter((book) => book._id !== bookId));
        setCurrentPage((prev) => {
          const updated = { ...prev };
          delete updated[bookId];
          return updated;
        });
      } catch (error) {
        throw error;
      }
    },
    [selectedFile2],
  );

  //Update reading progress
  const updateProgress = useCallback(async (bookId, currentPage) => {
    try {
      await backendApi.updateProgress(bookId, { currentPage });

      setFiles((prev) =>
        prev.map((book) =>
          book._id === bookId ? { ...book, currentPage } : book,
        ),
      );
    } catch (error) {}
  }, []);

  const addFile = (file) => {
    setFiles((prev) => [...prev, file]);
  };

  const selectFile = (file) => {
    setSelectedFile(file);
  };

  const getProgress = (currentPage, totalpages) => {
    if (!totalpages || !currentPage) return 0;
    return Math.round((currentPage / totalpages) * 100);
  };

  return (
    <FileContext.Provider
      value={{
        files,
        selectedFile2,
        addFile,
        selectFile,
        updateCurrentPage,
        getProgress,
        setSelectedFile,

        loading,

        currentPage,
        setCurrentPage,

        debouncedSave,

        uploadBook,
        fetchBooks,
        deleteBook,
        updateProgress,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}

export function useFiles() {
  return useContext(FileContext);
}
