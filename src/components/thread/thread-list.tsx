'use client';

import { useThreads, useDeleteThread } from '@/hooks';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, ChevronRight, ChevronDown, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Thread } from '@/db/schema';

export function ThreadList() {
  const { data: threads, isLoading } = useThreads();

  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!threads?.length) {
    return (
      <p className="px-2 py-8 text-center text-sm text-muted-foreground">
        No threads yet. Start a new one!
      </p>
    );
  }

  return (
    <div className="space-y-1 py-2">
      {threads.map((thread) => (
        <ThreadItem key={thread.id} thread={thread} depth={0} />
      ))}
    </div>
  );
}

interface ThreadItemProps {
  thread: Thread;
  depth: number;
}

function ThreadItem({ thread, depth }: ThreadItemProps) {
  const { activeThreadId, setActiveThread, expandedThreads, toggleThreadExpanded } =
    useAppStore();
  const deleteThread = useDeleteThread();
  
  const isActive = activeThreadId === thread.id;
  const isExpanded = expandedThreads.has(thread.id);
  // TODO: Load child threads when we have the full hierarchy
  const hasChildren = false;

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
          depth > 0 && 'ml-4'
        )}
        onClick={handleClick}
      >
        {/* Expand/Collapse Toggle */}
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0"
            onClick={handleToggle}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        ) : (
          <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}

        {/* Title */}
        <span className="flex-1 truncate">{thread.title}</span>

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleDelete}
          disabled={deleteThread.isPending}
        >
          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
        </Button>
      </div>

      {/* Child threads (when implemented) */}
      {hasChildren && isExpanded && (
        <div className="ml-2">
          {/* Child threads would go here */}
        </div>
      )}
    </div>
  );
}
