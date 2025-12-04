'use client';

import { useAppStore } from '@/stores/app-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

export function MainContent() {
  const { activeThreadId } = useAppStore();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Messages Area */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {activeThreadId ? (
            <div className="space-y-4">
              {/* Placeholder for messages */}
              <p className="py-20 text-center text-muted-foreground">
                Messages will appear here
              </p>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center py-20">
              <div className="text-center">
                <h2 className="text-2xl font-semibold">Welcome to Rather</h2>
                <p className="mt-2 text-muted-foreground">
                  Start a new thread or select an existing one
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-background p-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message..."
              className="min-h-[44px] max-h-[200px] resize-none"
              rows={1}
            />
            <Button size="icon" className="h-11 w-11 shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
