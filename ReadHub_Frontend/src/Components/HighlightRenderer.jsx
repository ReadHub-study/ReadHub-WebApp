import React from "react";

/**
 * Renders text with highlighted portions
 * Handles highlights that may span multiple lines/elements
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
  const sortedHighlights = currentPageHighlights
    .filter(h => h.text && text.includes(h.text))
    .sort((a, b) => text.indexOf(a.text) - text.indexOf(b.text));

  sortedHighlights.forEach((highlight, idx) => {
    const startIndex = text.indexOf(highlight.text, lastIndex);
    
    if (startIndex !== -1) {
      // Add text before highlight
      if (startIndex > lastIndex) {
        result.push(text.substring(lastIndex, startIndex));
      }
      
      // Add highlighted text
      result.push(
        <mark key={`highlight-${idx}`} className="bg-yellow-300 rounded px-0.5">
          {highlight.text}
        </mark>
      );
      
      lastIndex = startIndex + highlight.text.length;
    }
  });

  // Add remaining text
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }

  return result.length > 0 ? result : text;
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
    const textLayer = document.querySelector(containerSelector);
    if (!textLayer) {
      console.warn(`Container with selector "${containerSelector}" not found`);
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
