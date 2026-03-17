import React, { useEffect, useState } from "react";
import ContCard from "../Components/ContCard";
import { Document, Page, pdfjs } from "react-pdf";
import ViewPdf from "../Features/ViewPdf";
import { useNavigate } from "react-router-dom";

import { useFiles } from "../Context/FileContext";
import Epub from "epubjs";

import { extractPdfCover, extractEpubCover } from "../Utils/coverExtractor";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Library = () => {
  const {
    selectFile,
    addFile,
    files,
    getProgress,
    uploadBook,
    fetchBooks,
    setSelectedFile,
    currentPage,
    updateCurrentPage,
    deleteBook,
    loading,
  } = useFiles();
  const navigate = useNavigate();

  const [fileType, setFileType] = useState(null);
  const [fileName, setFileName] = useState("");

  const [activeFilter, setActiveFilter] = useState("All books");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  //Refresh books on mount
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleFileSElect = async (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    setIsUploading(true);
    setFileName(selectedFile.name);
    setUploadProgress(0);

    if (
      selectedFile.type === "application/pdf" ||
      selectedFile.name.endsWith(".pdf")
    ) {
      await handlePdf(selectedFile);
    } else if (
      selectedFile.type === "application/epub" ||
      selectedFile.name.toLowerCase().endsWith(".epub")
    ) {
      await handleEpub(selectedFile);
    } else {
      alert("Unsupported file type. Please upload .pdf or .epub files.");
      setIsUploading(false);
    }
  };

  //pdf handle

  const handlePdf = async (file) => {
    setFileType("pdf");

    try {
      setUploadProgress(10);

      // ✅ Read file as ArrayBuffer (not base64)
      const arrayBuffer = await file.arrayBuffer();

      const pdf = await pdfjs.getDocument({
        data: arrayBuffer,
        disableAutoFetch: true,
        disableStream: true,
      }).promise;

      // ✅ Extract cover from buffer (you'll adjust your function)
      const coverImage = await extractPdfCover(pdf);

      await pdf.destroy();
      setUploadProgress(60);

      // give iOS a breather
      await new Promise((r) => setTimeout(r, 0));

      const uploadedBook = await uploadBook(file, {
        title: file.name.replace(".pdf", ""),
        author: "Unknown",
        totalPages: pdf.numPages,
        coverImage: coverImage,
      });

      setUploadProgress(100);
      await fetchBooks();
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error("PDF upload failed:", error);
      alert("Failed to upload pdf file");
      setIsUploading(false);
    }
  };

  //epub handle

  const handleEpub = (file) => {
    setFileType("epub");

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fileDataUrl = event.target.result;

        // Extract cover
        const coverImage = await extractEpubCover(fileDataUrl);

        // Extract metadata

        try {
          //convert to blob

          const base64String = fileDataUrl.split(",")[1];
          const binaryString = atob(base64String);
          const bytes = new Uint8Array(binaryString.length);

          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const blob = new Blob([bytes], { type: "application/epub+zip" });

          //load book temporarily to get metadata

          const book = Epub(blob);
          await book.ready;

          //Get metadata

          const metadata = await book.loaded.metadata;

          //generate locations for total pages

          let totalPages = 0;
          try {
            const locations = await book.locations.generate(1024);
            totalPages = locations.length || 0;
          } catch (err) {}

          book.destroy();

          const fileData = {
            id: Date.now().toString(),
            name: file.name,
            type: "epub",
            fileData: event.target.result, //base64
            coverImage: coverImage, // Store cover
            currentPage: 0,
            uploadedAt: new Date().toISOString(),
            //Epub-Specific metadata
            metadata: {
              title: metadata.title || file.name,
              author: metadata.creator || "Unknown",
              publisher: metadata.publisher || "",
              language: metadata.language || "",

              totalPages: totalPages,
            },
          };

          addFile(fileData);
          await fetchBooks();
          setIsUploading(false);
        } catch (metadataError) {
          // Fallback: save without metadata
          const fileData = {
            id: Date.now().toString(),
            name: file.name,
            type: "epub",
            fileData: fileDataUrl,
            coverImage: coverImage, //  Store cover
            currentPage: 0,
            uploadedAt: new Date().toISOString(),
            metadata: {
              title: file.name,
              author: "Unknown",
              totalPages: 0,
            },
          };
          addFile(fileData);
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert("Failed to read epub file");
    }
  };

  const openPdf = (file) => {
    setSelectedFile(file);
    navigate(`/viewpdf/${file._id}`);
  };

  const openEpub = (file) => {
    selectFile(file);
    navigate(`/viewepub/${file.id}`);
  };

  const filters = ["All books", "Reading", "Completed"];

  function filterBooks(books, filter) {
    let filtered = books;

    // Filter by status
    if (filter === "reading") {
      filtered = books.filter((b) => {
        const page = currentPage[b._id] ?? b.lastPageRead ?? 0;
        return page > 0 && page < b.pages;
      });
    } else if (filter === "completed") {
      filtered = books.filter((b) => {
        const page = currentPage[b._id] ?? b.lastPageRead ?? 0;
        return page >= b.pages;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (book) =>
          book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  }

  const filtered = filterBooks(files, activeFilter.toLowerCase());

  const handleDelete = async (bookId) => {
    const confirm = window.confirm("Delete this book ?");
    if (!confirm) return;
    await deleteBook(bookId);
  };

  return (
    <div className="px-[16px] pt-[40px] overflow-hidden pb-15">
      {isUploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col justify-center items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700 text-[16px]">Uploading book...</p>
            {/* Progress Bar */}
            <div className="w-25 bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 text-center mt-1">
              {uploadProgress}%
            </p>
          </div>
        </div>
      )}
      <div className="flex justify-between mb-8 items-center">
        <p className="text-black text-tittle_Large">Library</p>

        <label
          htmlFor="fileselect2"
          className="flex w-[40px] h-[40px] rounded-[8.04] bg-white justify-center items-center"
        >
          <input
            type="file"
            accept=".pdf,.epub"
            id="fileselect2"
            onChange={handleFileSElect}
            className="hidden"
          />{" "}
          <svg
            className="w-[24px] h-[24px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path>
          </svg>
        </label>
      </div>

      <div className="bg-white h-[46px] w-full flex rounded-[11px] mb-4">
        <img src="/Variant3.svg" alt="search" className="w-[24px] mx-4" />
        <input
          type="text"
          placeholder="Search books..."
          style={{ backgroundColor: "white", border: "0px" }}
        />
      </div>

      <div className="flex justify-between text-body_Small font-medium mb-4">
        <label
          htmlFor="fileselect"
          className="h-[38px] xsm:w-[160px] w-[171px] border-1 rounded-[33px]  border-[#4b6481] flex justify-center items-center active:bg-black/10"
        >
          <input
            type="file"
            accept=".pdf,.epub"
            id="fileselect"
            onChange={handleFileSElect}
            className="hidden"
          />
          <img src="/Variant3c.svg" alt="icon" className="w-[24px]" />
          <p>Upload book</p>
        </label>
        <div className="h-[38px] w-[171px] xsm:w-[160px] border-1 rounded-[33px] border-[#4b6481] flex justify-center items-center">
          <img src="/Variant3b.svg" alt="icon" className="w-[24px]" />
          <p>Scan Cover</p>
        </div>
      </div>

      <div>
        {files.length > 0 ? (
          <div>
            <div className="text-body_Small flex gap-4 w-full mb-8 overflow-scroll">
              <div className="flex justify-between w-200 gap-4">
                {filters.map((f, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setActiveFilter(f);
                    }}
                    className={`bg-white w-[91px] h-[38px] rounded-[33px] flex justify-center items-center ${activeFilter !== f ? "text-[#4B6481]" : "text-black]"}`}
                  >
                    {`${f}(${filterBooks(files, f.toLocaleLowerCase()).length})`}
                  </div>
                ))}
              </div>
            </div>
            {!loading ? (
              filtered?.map((book) => {
                const page = currentPage[book._id] ?? book.lastPageRead ?? 0;

                return (
                  <ContCard
                    key={book._id}
                    fileName={book.title}
                    page={page}
                    totalPage={book.pages}
                    progress={getProgress(page, book.pages)}
                    onOpen={() => {
                      book.fileUrl.endsWith(".pdf")
                        ? openPdf(book)
                        : openEpub(book);
                    }}
                    progPercent={getProgress(page, book.pages) + "%"}
                    continueRead={
                      page < 1 ? "Start Reading" : "Continue Reading"
                    }
                    file={book}
                    coverImage={book.coverImageUrl}
                    onDelete={() => handleDelete(book._id)}
                    showDelete={true}
                  />
                );
              })
            ) : (
              <div className="w-full h-50 flex justify-center items-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-100 flex justify-center items-center">
            Let's upload some pdf files
          </div>
        )}
      </div>
    </div>
  );
};
export default Library;
