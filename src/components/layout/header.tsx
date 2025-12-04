'use client';

import { useAppStore } from '@/stores/app-store';
import { useThread } from '@/hooks';
import { Button } from '@/components/ui/button';
import { ChevronLeft, PanelLeft, PanelRightClose, PanelRightOpen, ChevronRight } from 'lucide-react';

export function Header() {
  const {
    sidebarOpen,
    toggleSidebar,
    rightPaneOpen,
    toggleRightPane,
    canGoBack,
    goBack,
    activeThreadId,
    setActiveThread,
  } = useAppStore();

  const { data } = useThread(activeThreadId);
  const breadcrumb = data?.breadcrumb || [];
  const hasSubthreads = (data?.subthreads?.length || 0) > 0;

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

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm overflow-hidden">
          {breadcrumb.length > 0 ? (
            breadcrumb.map((item, index) => (
              <span key={item.id} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground shrink-0" />
                )}
                <button
                  onClick={() => setActiveThread(item.id)}
                  className={
                    index === breadcrumb.length - 1
                      ? 'font-medium text-foreground truncate max-w-[200px]'
                      : 'text-muted-foreground hover:text-foreground truncate max-w-[150px]'
                  }
                >
                  {item.title}
                </button>
              </span>
            ))
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
          className="h-8 w-8 relative"
          aria-label={rightPaneOpen ? 'Close subthreads pane' : 'Open subthreads pane'}
        >
          {rightPaneOpen ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRightOpen className="h-4 w-4" />
          )}
          {/* Indicator dot when subthreads exist */}
          {hasSubthreads && !rightPaneOpen && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </div>
    </header>
  );
}
