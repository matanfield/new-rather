'use client';

import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserButton } from '@clerk/nextjs';

const SIDEBAR_WIDTH = 280;

export function Sidebar() {
  const { sidebarOpen } = useAppStore();

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r bg-sidebar transition-all duration-300 ease-in-out',
        sidebarOpen ? 'w-[280px]' : 'w-0 overflow-hidden border-r-0'
      )}
      style={{ minWidth: sidebarOpen ? SIDEBAR_WIDTH : 0 }}
    >
      {/* Sidebar Header */}
      <div className="flex h-14 items-center justify-between px-4">
        <span className="text-lg font-semibold text-sidebar-foreground">Rather</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-3 pb-2">
        <Button variant="outline" className="flex-1 justify-start gap-2" size="sm">
          <Plus className="h-4 w-4" />
          New Thread
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      {/* Thread List */}
      <ScrollArea className="flex-1 px-2">
        <div className="py-2">
          {/* Placeholder for thread list */}
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">
            No threads yet
          </p>
        </div>
      </ScrollArea>

      <Separator />

      {/* User Section */}
      <div className="flex items-center gap-3 p-4">
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'h-8 w-8',
            },
          }}
        />
        <span className="text-sm text-sidebar-foreground">Account</span>
      </div>
    </aside>
  );
}
