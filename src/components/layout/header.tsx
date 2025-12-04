'use client';

import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { ChevronLeft, PanelLeft, PanelRightClose, PanelRightOpen } from 'lucide-react';

export function Header() {
  const {
    sidebarOpen,
    toggleSidebar,
    rightPaneOpen,
    toggleRightPane,
    canGoBack,
    goBack,
    activeThreadId,
  } = useAppStore();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        {/* Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8"
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <PanelLeft className="h-4 w-4" />
        </Button>

        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          disabled={!canGoBack()}
          className="h-8 w-8"
          aria-label="Go back"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Breadcrumb - placeholder for now */}
        <nav className="flex items-center gap-1 text-sm">
          {activeThreadId ? (
            <span className="text-foreground">Thread Title</span>
          ) : (
            <span className="text-muted-foreground">Select a thread</span>
          )}
        </nav>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Right Pane Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleRightPane}
          className="h-8 w-8"
          aria-label={rightPaneOpen ? 'Close subthreads pane' : 'Open subthreads pane'}
        >
          {rightPaneOpen ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRightOpen className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  );
}
