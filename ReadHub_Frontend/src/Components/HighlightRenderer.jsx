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
 * Highlights text segments within a DOM element
 * Used for DOM-based highlighting
 */
export const highlightTextInElement = (element, highlights = [], pageNumber) => {
  if (!element || !highlights || highlights.length === 0) return;

  const currentPageHighlights = highlights.filter(h => h.page === pageNumber);
  if (currentPageHighlights.length === 0) return;

  // Recursively walk through text nodes
  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.textContent;
      currentPageHighlights.forEach(highlight => {
        if (text.includes(highlight.text)) {
          const regex = new RegExp(`(${highlight.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
          text = text.replace(regex, '<mark class="bg-yellow-300 rounded px-0.5">$1</mark>');
        }
      });
      
      if (text !== node.textContent) {
        const span = document.createElement('span');
        span.innerHTML = text;
        node.parentNode.replaceChild(span, node);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
      Array.from(node.childNodes).forEach(walk);
    }
  };

  walk(element);
};

export default { renderTextWithHighlights, highlightTextInElement };
