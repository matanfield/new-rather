'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Send, ExternalLink } from 'lucide-react';
import type { TextSelection } from '@/hooks/use-text-selection';

interface SelectionPopupProps {
  selection: TextSelection;
  onSend: (message: string) => void;        // Option A: Stay in parent, show in right pane
  onSendAndEnter: (message: string) => void; // Option B: Navigate into subthread
  onClose: () => void;
  isLoading?: boolean;
}

export function SelectionPopup({ selection, onSend, onSendAndEnter, onClose, isLoading }: SelectionPopupProps) {
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

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
    }
  };

  const handleSendAndEnter = () => {
    if (message.trim() && !isLoading) {
      onSendAndEnter(message.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(); // Default to "Send" (stay in parent)
    }
    if (e.key === 'Enter' && e.shiftKey && e.metaKey) {
      e.preventDefault();
      handleSendAndEnter(); // Cmd+Shift+Enter to send and enter
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <TooltipProvider>
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
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Your question or comment..."
          className="min-h-[60px] max-h-[120px] resize-none text-sm mb-2"
          rows={2}
          disabled={isLoading}
        />

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSend}
                  disabled={!message.trim() || isLoading}
                >
                  <Send className="h-3 w-3 mr-1" />
                  Send
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create subthread and stay here (Enter)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={handleSendAndEnter}
                  disabled={!message.trim() || isLoading}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Send & Enter
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create and navigate into subthread</p>
              </TooltipContent>
            </Tooltip>
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
    </TooltipProvider>
  );
}
