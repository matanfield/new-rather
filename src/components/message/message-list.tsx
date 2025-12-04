'use client';

import { useEffect, useRef } from 'react';
import { MessageBubble, StreamingMessage } from './message-bubble';
import type { Message } from '@/db/schema';

interface MessageListProps {
  messages: Message[];
  streamingContent?: string;
}

export function MessageList({ messages, streamingContent }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  return (
    <div className="space-y-2">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {streamingContent && <StreamingMessage content={streamingContent} />}
      <div ref={bottomRef} />
    </div>
  );
}
