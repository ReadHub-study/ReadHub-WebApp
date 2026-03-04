import React, { useState } from "react";
import ContCard from "../Components/ContCard";
import { Document, Page, pdfjs } from "react-pdf";
import ViewPdf from "../Features/ViewPdf";
import { useNavigate } from "react-router-dom";

import { useFiles } from "../Context/FileContext";
import Epub from "epubjs";

import { extractPdfCover, extractEpubCover } from "../Utils/coverExtractor";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Library = () => {
  const { selectFile, addFile, files, getProgress } = useFiles();
  const navigate = useNavigate();

  const [fileType, setFileType] = useState(null);
  const [fileName, setFileName] = useState("");

  const [isUploading, setIsUploading] = useState(false);

  const handleFileSElect = async (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    setIsUploading(true);
    setFileName(selectedFile.name);

    if (
      selectedFile.type === "application/pdf" ||
      selectedFile.name.endsWith(".pdf")
    ) {
      handlePdf(selectedFile);
    } else if (
      selectedFile.type === "application/epub" ||
      selectedFile.name.toLowerCase().endsWith(".epub")
    ) {
      handleEpub(selectedFile);
    } else {
      alert("Unsupported file type. Please upload .pdf or .epub files.");
    }
  };

  //pdf handle

  const handlePdf = async (file) => {
    setFileType("pdf");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileDataUrl = e.target.result;

        const coverImage = await extractPdfCover(fileDataUrl);
        const fileData = {
          id: Date.now().toString(),
          name: file.name,
          type: "pdf",
          file: e.target.result,
          numPages: pdf.numPages,
          currentPage: 0,
          coverImage: coverImage, //storing Cover
          uploadedAt: new Date().toISOString(),
        };

        addFile(fileData);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Failed to read pdf file");
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
          } catch (err) {
            console.warn("Could not generate locations: ", err);
          }

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
          console.log(fileData);
          addFile(fileData);
          setIsUploading(false);
        } catch (metadataError) {
          console.error("Error extracting Epub metadata: ", metadataError);

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
      console.error("Error reading file: ", error);
      alert("Failed to read epub file");
    }
  };

  const openPdf = (file) => {
    selectFile(file);
    navigate(`/viewpdf/${file.id}`);
  };

  const openEpub = (file) => {
    selectFile(file);
    navigate(`/viewepub/${file.id}`);
  };

  const filters = ["All books", "Reading", "Completed"];

  function filterBooks(books, filter) {
    if (filter === "reading")
      return books.filter(
        (b) => b.currentPage > 0 && b.currentPage < b.numPages,
      );
    if (filter === "completed")
      return books.filter((b) => b.currentPage === b.numPages);
    return books;
  }

  const [activeFilter, setActiveFilter] = useState("All books");
  const filtered = filterBooks(files, activeFilter.toLowerCase());

  return (
    <div className="px-[16px] pt-[40px] overflow-hidden pb-15">
      {isUploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700">Processing book...</p>
          </div>
        </div>
      )}
      <div className="flex justify-between mb-8 items-center">
        <p className="text-black text-tittle_Large">Library</p>
        <span className="flex w-[40px] h-[40px] rounded-[8.04] bg-white opacity-0"></span>
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
          <p>Upload file</p>
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
                {filters.map((f) => (
                  <div
                    key={f}
                    onClick={() => {
                      setActiveFilter(f);
                    }}
                    className={`bg-white w-[91px] h-[38px] rounded-[33px] flex justify-center items-center ${activeFilter !== f ? "text-[#4B6481]" : "text-black]"}`}
                  >
                    {`${f}(${filterBooks(files, f.toLocaleLowerCase()).length})`}

                    {console.log(filterBooks(files, f.toLocaleLowerCase()))}
                  </div>
                ))}
              </div>
            </div>
            {filtered.map((file) => (
              <ContCard
                key={file.id}
                fileName={file.name}
                page={file.currentPage || 0}
                totalPage={
                  file.type === "pdf"
                    ? file.numPages || 0
                    : file.metadata?.totalPages
                }
                progress={getProgress(file)}
                onOpen={() => {
                  file.type === "pdf" ? openPdf(file) : openEpub(file);
                }}
                progPercent={getProgress(file) + "%"}
                continueRead={
                  file.currentPage < 1 ? "Start Reading" : "Continue Reading"
                }
                file={file}
                coverImage={file.coverImage}
              />
            ))}
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
