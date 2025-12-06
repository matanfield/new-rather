'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Thread, Message } from '@/db/schema';

interface SubthreadCardProps {
  subthread: Thread;
  messages?: Message[];
  optimisticUserMessage?: Message | null;
  streamingContent?: string;
  isHighlighted?: boolean;
  isNew?: boolean; // Auto-expand new subthreads
  onEnter: () => void;
  onHighlight?: () => void;
}

export function SubthreadCard({
  subthread,
  messages = [],
  optimisticUserMessage,
  streamingContent,
  isHighlighted,
  isNew,
  onEnter,
  onHighlight,
}: SubthreadCardProps) {
  // Auto-expand when new or streaming - compute initial state
  const shouldAutoExpand = isNew || !!streamingContent;
  const [isExpanded, setIsExpanded] = useState(shouldAutoExpand);
  
  // Keep expanded while streaming (derived, not effect-based)
  const effectiveExpanded = isExpanded || shouldAutoExpand;

  const handleClick = () => {
    onHighlight?.();
    setIsExpanded(!effectiveExpanded);
  };

  // Combine real messages with optimistic
  const allMessages = optimisticUserMessage 
    ? [...messages, optimisticUserMessage]
    : messages;
  
  const firstMessage = allMessages[0];
  const previewMessages = allMessages.slice(0, 3);
  const isStreaming = !!streamingContent;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all',
        isHighlighted && 'ring-2 ring-primary',
        isNew && 'border-primary'
      )}
      onClick={handleClick}
    >
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {effectiveExpanded ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className="font-medium text-sm truncate">{subthread.title}</span>
            {isStreaming && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onEnter();
            }}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>

      {!effectiveExpanded && firstMessage && (
        <CardContent className="p-3 pt-0">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {firstMessage.content}
          </p>
        </CardContent>
      )}

      {effectiveExpanded && (
        <CardContent className="p-3 pt-0 space-y-2 max-h-[300px] overflow-y-auto">
          {previewMessages.length > 0 ? (
            previewMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'text-xs p-2 rounded',
                  msg.role === 'user'
                    ? 'bg-primary/10 ml-4'
                    : 'bg-muted mr-4'
                )}
              >
                <span className="font-medium">
                  {msg.role === 'user' ? 'You: ' : 'AI: '}
                </span>
                <span className="line-clamp-3">{msg.content}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground italic">No messages yet</p>
          )}

          {/* Streaming AI response */}
          {streamingContent && (
            <div className="text-xs p-2 rounded bg-muted mr-4">
              <span className="font-medium">AI: </span>
              <span>{streamingContent}</span>
              <span className="inline-block w-1 h-3 ml-0.5 bg-foreground animate-pulse" />
            </div>
          )}
          
          {allMessages.length > 3 && !streamingContent && (
            <p className="text-xs text-muted-foreground text-center">
              +{allMessages.length - 3} more messages
            </p>
          )}

          <Button
            size="sm"
            className="w-full mt-2"
            onClick={(e) => {
              e.stopPropagation();
              onEnter();
            }}
          >
            Open Subthread
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

