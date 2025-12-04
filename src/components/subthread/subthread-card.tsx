'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Thread, Message } from '@/db/schema';

interface SubthreadCardProps {
  subthread: Thread;
  messages?: Message[];
  isHighlighted?: boolean;
  onEnter: () => void;
  onHighlight?: () => void;
}

export function SubthreadCard({
  subthread,
  messages = [],
  isHighlighted,
  onEnter,
  onHighlight,
}: SubthreadCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    onHighlight?.();
    setIsExpanded(!isExpanded);
  };

  const firstMessage = messages[0];
  const previewMessages = messages.slice(0, 3);

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all',
        isHighlighted && 'ring-2 ring-primary'
      )}
      onClick={handleClick}
    >
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className="font-medium text-sm truncate">{subthread.title}</span>
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

      {!isExpanded && firstMessage && (
        <CardContent className="p-3 pt-0">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {firstMessage.content}
          </p>
        </CardContent>
      )}

      {isExpanded && (
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
          
          {messages.length > 3 && (
            <p className="text-xs text-muted-foreground text-center">
              +{messages.length - 3} more messages
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
