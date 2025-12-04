'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, X } from 'lucide-react';
import type { TextSelection } from '@/hooks/use-text-selection';

interface SelectionPopupProps {
  selection: TextSelection;
  onSubmit: (message: string) => void;
  onClose: () => void;
}

export function SelectionPopup({ selection, onSubmit, onClose }: SelectionPopupProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Calculate position from selection rect (memo to avoid recalc)
  const position = useMemo(() => {
    if (!selection.rect) return { top: 0, left: 0 };
    
    const { top, left, width } = selection.rect;
    const popupWidth = 320;
    
    return {
      top: top + window.scrollY - 10,
      left: Math.max(10, left + width / 2 - popupWidth / 2),
    };
  }, [selection.rect]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (message.trim()) {
      onSubmit(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      ref={popupRef}
      data-selection-popup
      className="fixed z-50 w-80 rounded-lg border bg-popover p-3 shadow-lg"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateY(-100%)',
      }}
    >
      {/* Selected text preview */}
      <div className="mb-2 text-xs text-muted-foreground">
        Creating subthread from:
      </div>
      <div className="mb-3 rounded bg-muted px-2 py-1 text-sm line-clamp-2">
        &ldquo;{selection.text}&rdquo;
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Your question or comment..."
          className="min-h-[60px] max-h-[120px] resize-none text-sm"
          rows={2}
        />
        <div className="flex flex-col gap-1">
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!message.trim()}
            className="h-8 w-8"
          >
            <Send className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Arrow pointing down */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-0 h-0 
          border-l-8 border-r-8 border-t-8 
          border-l-transparent border-r-transparent border-t-popover"
        style={{ bottom: '-8px' }}
      />
    </div>
  );
}
