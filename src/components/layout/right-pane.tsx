'use client';

import { useAppStore } from '@/stores/app-store';
import { useThread } from '@/hooks';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SubthreadCard } from '@/components/subthread';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const RIGHT_PANE_WIDTH = 350;

export function RightPane() {
  const { 
    rightPaneOpen, 
    setRightPaneOpen, 
    activeThreadId, 
    setActiveThread,
    highlightedSubthreadId,
    setHighlightedSubthread,
  } = useAppStore();
  
  const { data } = useThread(activeThreadId);
  const subthreads = data?.subthreads || [];

  // Sort subthreads by anchor position
  const sortedSubthreads = [...subthreads].sort((a, b) => {
    const aStart = a.anchorStart ?? Infinity;
    const bStart = b.anchorStart ?? Infinity;
    return aStart - bStart;
  });

  const handleEnterSubthread = (subthreadId: string) => {
    setActiveThread(subthreadId);
    setHighlightedSubthread(null);
  };

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-l bg-background transition-all duration-300 ease-in-out',
        rightPaneOpen ? 'w-[350px]' : 'w-0 overflow-hidden border-l-0'
      )}
      style={{ minWidth: rightPaneOpen ? RIGHT_PANE_WIDTH : 0 }}
    >
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b px-4">
        <span className="text-sm font-medium">
          Subthreads {subthreads.length > 0 && `(${subthreads.length})`}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setRightPaneOpen(false)}
          className="h-6 w-6"
          aria-label="Close subthreads pane"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Subthread Cards */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {sortedSubthreads.length > 0 ? (
            sortedSubthreads.map((subthread) => (
              <SubthreadCard
                key={subthread.id}
                subthread={subthread}
                isHighlighted={highlightedSubthreadId === subthread.id}
                onEnter={() => handleEnterSubthread(subthread.id)}
                onHighlight={() => setHighlightedSubthread(subthread.id)}
              />
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                No subthreads yet
              </p>
              <p className="text-xs text-muted-foreground">
                Select text in an AI message to create one
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
