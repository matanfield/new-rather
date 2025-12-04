'use client';

import { useAppStore } from '@/stores/app-store';
import { useDeleteThread } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronRight, ChevronDown, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Thread } from '@/db/schema';

interface ThreadItemProps {
  thread: Thread;
  childThreads?: Thread[];
  depth?: number;
}

export function ThreadItem({ thread, childThreads = [], depth = 0 }: ThreadItemProps) {
  const { activeThreadId, setActiveThread, expandedThreads, toggleThreadExpanded } =
    useAppStore();
  const deleteThread = useDeleteThread();
  
  const isActive = activeThreadId === thread.id;
  const isExpanded = expandedThreads.has(thread.id);
  const hasChildren = childThreads.length > 0;

  const handleClick = () => {
    setActiveThread(thread.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this thread and all its subthreads?')) {
      deleteThread.mutate(thread.id);
      if (isActive) {
        setActiveThread(null);
      }
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleThreadExpanded(thread.id);
  };

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors',
          isActive
            ? 'bg-accent text-accent-foreground'
            : 'hover:bg-accent/50 text-foreground/80',
        )}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
        onClick={handleClick}
      >
        {/* Expand/Collapse Toggle */}
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0 p-0"
            onClick={handleToggle}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        ) : (
          <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground ml-0.5" />
        )}

        {/* Title */}
        <span className="flex-1 truncate ml-1">{thread.title}</span>

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0"
          onClick={handleDelete}
          disabled={deleteThread.isPending}
        >
          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
        </Button>
      </div>

      {/* Child threads */}
      {hasChildren && isExpanded && (
        <div>
          {childThreads.map((child) => (
            <ThreadItem
              key={child.id}
              thread={child}
              childThreads={[]} // TODO: Support deeper nesting if needed
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
