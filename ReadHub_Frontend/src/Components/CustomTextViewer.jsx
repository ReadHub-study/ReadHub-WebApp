import React, { useState, useEffect, use, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import { extractTextWithLayout } from "../Utils/pdfUtils";
import { useFiles } from "../Context/FileContext";
import { renderTextWithHighlights } from "./HighlightRenderer";

const CustomTextViewer = ({ fileData, file, theme, scale, onTextSelect }) => {
  const [pages, setpages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [minChars, setMinChars] = useState(200);

  const { updateCurrentPage, getHighlights } = useFiles();

  const isInitialLoad = useRef(true);
  const hasLoadedSavedPage = useRef(false);
  const lastSavedPage = useRef(null);

  useEffect(() => {
    if (fileData) {
      extractText();
    }
  }, [fileData]);

  useEffect(() => {
    if (file?.currentPage && !hasLoadedSavedPage.current) {
      setCurrentPage(file.currentPage - 1);
      hasLoadedSavedPage.current = true;
      isInitialLoad.current = false;
      console.log("Text View - Loaded saved page:", file.currentPage);
    }
  }, [file?.id, file?.currentPage]);

  useEffect(() => {
    if (isInitialLoad.current || !hasLoadedSavedPage.current) {
      isInitialLoad.current = false;
      return;
    }

    if (
      file?.id &&
      currentPage !== undefined &&
      currentPage !== lastSavedPage.current
    ) {
      updateCurrentPage(file.id, currentPage + 1);
      const timeoutId = setTimeout(() => {
        lastSavedPage.current = currentPage;
        console.log("Text View - Saving page :", currentPage + 1);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [currentPage, file?.id, updateCurrentPage]);

  const goToNextPage = () => {
    setCurrentPage((p) => Math.min(pages.length - 1, p + 1));
  };
  const goToPreviousPage = () => {
    setCurrentPage((p) => Math.max(0, p - 1));
  };

  const extractText = async () => {
    setLoading(true);
    setError(null);

    try {
      const extractedPages = await extractTextWithLayout(fileData);
      setpages(extractedPages);
      setLoading(false);
    } catch (err) {
      console.error("Error extracting text:", err);
      setError("Failed to extract text from PDF.");
      setLoading(false);
    }
  };

  const formatIntoParagraphs = (textItems) => {
    const allText = textItems.map((item) => item.text).join(" ");

    const paragraphs = [];
    let currentParagraph = "";
    let charCount = 0;

    const words = allText.split(" ");

    for (let word of words) {
      currentParagraph += word + " ";
      charCount += word.length + 1;

      if (
        (word.endsWith(".") || word.endsWith("!") || word.endsWith("?")) &&
        charCount >= minChars
      ) {
        paragraphs.push(currentParagraph.trim());
        currentParagraph = "";
        charCount = 0;
      }
    }
    if (currentParagraph.trim()) {
      paragraphs.push(currentParagraph.trim());
    }
    return paragraphs;
  };

  const handleTextSelectionWithFallback = (event) => {
    // Handle both mouse and touch selection
    if (onTextSelect) {
      onTextSelect(event);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => goToNextPage(),
    onSwipedRight: () => goToPreviousPage(),
    preventScrollOnSwipe: false,
    trackMouse: true,
  });

  // Get highlights for current file
  const currentHighlights = file?.id ? getHighlights(file.id) : [];

  if (loading) {
    return <div>Extracting text from PDF...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="min-h-screen">
      {
        <div className="max-w-4xl mx-auto">
          {/* Page Content */}
          <div className="px-4" onMouseUpCapture={handleTextSelectionWithFallback} onTouchEnd={handleTextSelectionWithFallback}>
            <div className="max-w-none">
              <div {...swipeHandlers}>
                {formatIntoParagraphs(pages[currentPage].textItems).map(
                  (paragraph, index) => (
                    <div key={index}>
                      <p
                        style={{ fontSize: `${scale}px` }}
                        className={`font-medium leading-[185%] tracking-[-0.4px] mb-4 ${theme ? "text-[#ECF0F8]" : "text-[#1A1A1A]"}`}
                      >
                        {renderTextWithHighlights(paragraph, currentHighlights, currentPage + 1)}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  );
};

export default CustomTextViewer;
