'use client';

import { useAppStore } from '@/stores/app-store';
import { useThread, useChat, useCreateThread, useTextSelection, useCreateSubthread } from '@/hooks';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageList, MessageInput } from '@/components/message';
import { SelectionPopup } from '@/components/subthread';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';

export function MainContent() {
  const { activeThreadId, setActiveThread, setRightPaneOpen, setHighlightedSubthread } = useAppStore();
  const { data, isLoading } = useThread(activeThreadId);
  const createThread = useCreateThread();
  const createSubthread = useCreateSubthread();
  const { selection, handleSelection, clearSelection } = useTextSelection();
  
  const { sendMessage, isLoading: isSending, streamingContent, optimisticUserMessage } = useChat({
    threadId: activeThreadId || '',
  });

  const handleNewThread = async () => {
    const thread = await createThread.mutateAsync({ title: 'New Thread' });
    setActiveThread(thread.id);
  };

  const handleCreateSubthread = async (message: string) => {
    if (!selection || !activeThreadId) return;

    await createSubthread.mutateAsync({
      parentThreadId: activeThreadId,
      anchorMessageId: selection.messageId,
      anchorStart: selection.start,
      anchorEnd: selection.end,
      anchorText: selection.text,
      firstMessage: message,
    });

    clearSelection();
    setRightPaneOpen(true);
  };

  const handleAnchorClick = (subthreadId: string) => {
    setHighlightedSubthread(subthreadId);
    setRightPaneOpen(true);
  };

  // No thread selected - show welcome
  if (!activeThreadId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-2">Welcome to Rather</h2>
          <p className="text-muted-foreground mb-6">
            A fractal AI chat for extended missions. Start a conversation and branch into subthreads to explore topics in depth.
          </p>
          <Button onClick={handleNewThread} disabled={createThread.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Start New Thread
          </Button>
        </div>
      </div>
    );
  }

  // Loading thread
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <Skeleton className="h-20 flex-1 rounded-lg" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  const messages = data?.messages || [];
  const subthreads = data?.subthreads || [];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Messages Area */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {messages.length === 0 && !streamingContent && !optimisticUserMessage ? (
            <div className="py-20 text-center text-muted-foreground">
              <p>Start the conversation by typing a message below.</p>
            </div>
          ) : (
            <MessageList 
              messages={messages}
              subthreads={subthreads}
              optimisticUserMessage={optimisticUserMessage}
              streamingContent={streamingContent}
              onTextSelect={handleSelection}
              onAnchorClick={handleAnchorClick}
            />
          )}
        </div>
      </ScrollArea>

      {/* Selection Popup */}
      {selection && (
        <SelectionPopup
          selection={selection}
          onSubmit={handleCreateSubthread}
          onClose={clearSelection}
        />
      )}

      {/* Input Area */}
      <div className="border-t bg-background p-4">
        <div className="mx-auto max-w-3xl">
          <MessageInput
            onSend={sendMessage}
            disabled={isSending || createSubthread.isPending}
            placeholder={isSending ? 'AI is responding...' : 'Type your message...'}
          />
        </div>
      </div>
    </div>
  );
}
