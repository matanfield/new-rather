'use client';

import { Sidebar, Header, RightPane, MainContent } from '@/components/layout';

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - full height */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header - spans from sidebar edge to screen edge */}
        <Header />

        {/* Main Content + Right Pane */}
        <div className="flex flex-1 overflow-hidden">
          {/* Center Content */}
          <MainContent />

          {/* Right Pane */}
          <RightPane />
        </div>
      </div>
    </div>
  );
}

