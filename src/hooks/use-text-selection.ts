'use client';

import { useState, useCallback, useEffect } from 'react';

export interface TextSelection {
  text: string;
  messageId: string;
  start: number;
  end: number;
  rect: DOMRect;
}

export function useTextSelection() {
  const [selection, setSelection] = useState<TextSelection | null>(null);

  const handleSelection = useCallback((messageId: string, contentElement: HTMLElement) => {
    const windowSelection = window.getSelection();
    
    if (!windowSelection || windowSelection.isCollapsed || !windowSelection.toString().trim()) {
      return;
    }

    const selectedText = windowSelection.toString().trim();
    if (selectedText.length < 3) return; // Minimum selection length

    // Check if selection is within this message
    const range = windowSelection.getRangeAt(0);
    if (!contentElement.contains(range.commonAncestorContainer)) {
      return;
    }

    // Get positions within the element
    const rangeStart = getTextOffset(contentElement, range.startContainer, range.startOffset);
    const rangeEnd = getTextOffset(contentElement, range.endContainer, range.endOffset);

    // Get position for popup
    const rect = range.getBoundingClientRect();

    setSelection({
      text: selectedText,
      messageId,
      start: rangeStart,
      end: rangeEnd,
      rect,
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  // Clear selection when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-selection-popup]') && !target.closest('[data-message-content]')) {
        clearSelection();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [clearSelection]);

  return {
    selection,
    handleSelection,
    clearSelection,
  };
}

// Helper to get text offset within an element
function getTextOffset(root: Node, node: Node, offset: number): number {
  let totalOffset = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  
  let currentNode = walker.nextNode();
  while (currentNode) {
    if (currentNode === node) {
      return totalOffset + offset;
    }
    totalOffset += currentNode.textContent?.length || 0;
    currentNode = walker.nextNode();
  }
  
  return totalOffset + offset;
}

