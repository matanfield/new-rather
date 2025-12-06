'use client';

import { useEffect, useRef, useMemo } from 'react';
import { MessageBubble, StreamingMessage } from './message-bubble';
import type { Message, Thread } from '@/db/schema';

interface Anchor {
  start: number;
  end: number;
  subthreadId: string;
}

interface MessageListProps {
  messages: Message[];
  subthreads?: Thread[];
  optimisticUserMessage?: Message | null;
  streamingContent?: string;
  onTextSelect?: (messageId: string, element: HTMLElement) => void;
  onAnchorClick?: (subthreadId: string) => void;
}

export function MessageList({ 
  messages, 
  subthreads = [],
  optimisticUserMessage, 
  streamingContent,
  onTextSelect,
  onAnchorClick,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Build anchors map from subthreads
  const anchorsMap = useMemo(() => {
    const map = new Map<string, Anchor[]>();
    
    subthreads.forEach(sub => {
      if (sub.anchorMessageId && sub.anchorStart !== null && sub.anchorEnd !== null) {
        const existing = map.get(sub.anchorMessageId) || [];
        existing.push({
          start: sub.anchorStart,
          end: sub.anchorEnd,
          subthreadId: sub.id,
        });
        map.set(sub.anchorMessageId, existing);
      }
    });
    
    return map;
  }, [subthreads]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, optimisticUserMessage, streamingContent]);

  return (
    <div className="space-y-2">
      {messages.map((message) => (
        <MessageBubble 
          key={message.id} 
          message={message}
          anchors={anchorsMap.get(message.id)}
          onTextSelect={onTextSelect}
          onAnchorClick={onAnchorClick}
        />
      ))}
      {/* Show optimistic user message while waiting for server */}
      {optimisticUserMessage && (
        <MessageBubble key={optimisticUserMessage.id} message={optimisticUserMessage} />
      )}
      {/* Show streaming AI response */}
      {streamingContent && <StreamingMessage content={streamingContent} />}
      <div ref={bottomRef} />
    </div>
  );
}

