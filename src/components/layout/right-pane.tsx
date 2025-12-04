'use client';

import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const RIGHT_PANE_WIDTH = 350;

export function RightPane() {
  const { rightPaneOpen, setRightPaneOpen } = useAppStore();

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
        <span className="text-sm font-medium">Subthreads</span>
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
          {/* Placeholder for subthread cards */}
          <p className="py-8 text-center text-sm text-muted-foreground">
            No subthreads
          </p>
        </div>
      </ScrollArea>
    </aside>
  );
}
