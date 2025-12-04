'use client';

import { useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { Message } from '@/db/schema';
import { User, Bot } from 'lucide-react';

interface Anchor {
  start: number;
  end: number;
  subthreadId: string;
}

interface MessageBubbleProps {
  message: Message;
  anchors?: Anchor[];
  isStreaming?: boolean;
  onTextSelect?: (messageId: string, element: HTMLElement) => void;
  onAnchorClick?: (subthreadId: string) => void;
}

export function MessageBubble({ 
  message, 
  anchors = [],
  isStreaming,
  onTextSelect,
  onAnchorClick,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const contentRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = useCallback(() => {
    if (isUser || !onTextSelect || !contentRef.current) return;
    
    // Small delay to let selection finalize
    setTimeout(() => {
      if (contentRef.current) {
        onTextSelect(message.id, contentRef.current);
      }
    }, 10);
  }, [isUser, message.id, onTextSelect]);

  // Render content with anchor highlights
  const renderContent = () => {
    if (anchors.length === 0) {
      return message.content;
    }

    // Sort anchors by start position
    const sortedAnchors = [...anchors].sort((a, b) => a.start - b.start);
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedAnchors.forEach((anchor, i) => {
      // Text before anchor
      if (anchor.start > lastIndex) {
        parts.push(message.content.slice(lastIndex, anchor.start));
      }

      // Anchored text
      const anchorText = message.content.slice(anchor.start, anchor.end);
      parts.push(
        <span
          key={`anchor-${i}`}
          className="bg-[hsl(var(--anchor-bg))] hover:bg-[hsl(var(--anchor-bg-hover))] cursor-pointer rounded px-0.5 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onAnchorClick?.(anchor.subthreadId);
          }}
        >
          {anchorText}
        </span>
      );

      lastIndex = anchor.end;
    });

    // Remaining text after last anchor
    if (lastIndex < message.content.length) {
      parts.push(message.content.slice(lastIndex));
    }

    return parts;
  };

  return (
    <div
      className={cn(
        'flex gap-3 py-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          'flex-1 space-y-2 overflow-hidden',
          isUser ? 'text-right' : 'text-left'
        )}
      >
        <div
          ref={contentRef}
          data-message-content
          data-message-id={message.id}
          onMouseUp={handleMouseUp}
          className={cn(
            'inline-block rounded-lg px-4 py-2 text-sm',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground',
            isStreaming && 'animate-pulse',
            !isUser && 'select-text cursor-text'
          )}
        >
          <div className="whitespace-pre-wrap break-words">
            {renderContent()}
            {isStreaming && (
              <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-current" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Streaming message component for in-progress responses
interface StreamingMessageProps {
  content: string;
}

export function StreamingMessage({ content }: StreamingMessageProps) {
  if (!content) return null;

  return (
    <div className="flex gap-3 py-4">
      {/* Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <Bot className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="inline-block rounded-lg px-4 py-2 text-sm bg-muted text-foreground">
          <div className="whitespace-pre-wrap break-words">
            {content}
            <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-current" />
          </div>
        </div>
      </div>
    </div>
  );
}
