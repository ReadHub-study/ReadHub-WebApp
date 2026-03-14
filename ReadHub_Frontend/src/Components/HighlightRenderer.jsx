import React from "react";

/**
 * Renders text with highlighted portions
 * Handles highlights that may span multiple lines/elements
 * Returns proper JSX that React can render
 */
export const renderTextWithHighlights = (text, highlights = [], pageNumber) => {
  if (!highlights || highlights.length === 0) {
    return text;
  }

  // Filter highlights for current page
  const currentPageHighlights = highlights.filter(h => h.page === pageNumber);
  
  if (currentPageHighlights.length === 0) {
    return text;
  }

  let result = [];
  let lastIndex = 0;
  
  // Find all highlight matches and their positions
  const highlightMatches = [];
  
  currentPageHighlights.forEach((highlight) => {
    if (!highlight.text) return;
    
    // Find all occurrences of this highlight in the text
    let searchIndex = 0;
    while (searchIndex < text.length) {
      const foundIndex = text.indexOf(highlight.text, searchIndex);
      if (foundIndex === -1) break;
      
      highlightMatches.push({
        startIndex: foundIndex,
        endIndex: foundIndex + highlight.text.length,
        text: highlight.text,
        highlightId: highlight.id,
      });
      
      searchIndex = foundIndex + 1;
    }
  });

  // Sort by start index
  highlightMatches.sort((a, b) => a.startIndex - b.startIndex);

  // Remove overlapping highlights (keep the first one)
  const nonOverlapping = [];
  highlightMatches.forEach((match) => {
    const overlaps = nonOverlapping.some(
      (existing) =>
        (match.startIndex >= existing.startIndex && match.startIndex < existing.endIndex) ||
        (match.endIndex > existing.startIndex && match.endIndex <= existing.endIndex)
    );
    if (!overlaps) {
      nonOverlapping.push(match);
    }
  });

  // Build the result
  nonOverlapping.forEach((match, idx) => {
    // Add text before highlight
    if (match.startIndex > lastIndex) {
      result.push(text.substring(lastIndex, match.startIndex));
    }
    
    // Add highlighted text
    result.push(
      <mark 
        key={`highlight-${match.highlightId}-${idx}`} 
        className="bg-yellow-300 rounded px-0.5"
        style={{ backgroundColor: '#ffff00', padding: '0 2px', margin: '0 -2px' }}
      >
        {match.text}
      </mark>
    );
    
    lastIndex = match.endIndex;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }

  // Return wrapped in fragment to ensure proper rendering
  return result.length > 0 ? <>{result}</> : text;
};

/**
 * Highlights text segments within a PDF text layer
 * More robust approach using mutation observer and direct element styling
 */
export const highlightTextInPDF = (containerSelector, highlights = [], pageNumber) => {
  if (!highlights || highlights.length === 0) return;

  const currentPageHighlights = highlights.filter(h => h.page === pageNumber);
  if (currentPageHighlights.length === 0) return;

  try {
    // Try multiple possible selectors for PDF text layer
    let textLayer = document.querySelector(containerSelector);
    
    // If the provided selector doesn't work, try common alternatives
    if (!textLayer) {
      const selectors = [
        ".textLayer", 
        ".react-pdf__Page__textLayer",
        ".pdfViewer .page .textLayer",
        "[role='presentation'] .textLayer"
      ];
      
      for (const selector of selectors) {
        textLayer = document.querySelector(selector);
        if (textLayer) {
          console.log(`Found text layer with selector: ${selector}`);
          break;
        }
      }
    }
    
    if (!textLayer) {
      console.warn(`No text layer found. Tried selectors: ${containerSelector}, .textLayer, .react-pdf__Page__textLayer, .pdfViewer .page .textLayer, [role='presentation'] .textLayer`);
      return;
    }

    // Clear existing highlights
    const existingMarks = textLayer.querySelectorAll("mark");
    existingMarks.forEach(mark => {
      const parent = mark.parentNode;
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
    });

    // Find and highlight text nodes
    const walker = document.createTreeWalker(
      textLayer,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const nodesToReplace = [];
    let node;
    while (node = walker.nextNode()) {
      nodesToReplace.push(node);
    }

    nodesToReplace.forEach(textNode => {
      let content = textNode.textContent;
      let hasHighlight = false;

      currentPageHighlights.forEach(highlight => {
        if (content.includes(highlight.text)) {
          hasHighlight = true;
          // Create a regex to match the text
          const escapedText = highlight.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(${escapedText})`, 'g');
          content = content.replace(
            regex,
            '<mark class="bg-yellow-300 rounded px-0.5">$1</mark>'
          );
        }
      });

      if (hasHighlight) {
        const span = document.createElement('span');
        span.innerHTML = content;
        textNode.parentNode.replaceChild(span, textNode);
      }
    });
  } catch (error) {
    console.warn("Error highlighting text in PDF:", error);
  }
};

export default { renderTextWithHighlights, highlightTextInPDF };
