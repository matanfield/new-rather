import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Thread, Message } from '@/db/schema';

interface CreateSubthreadParams {
  parentThreadId: string;
  anchorMessageId: string;
  anchorStart: number;
  anchorEnd: number;
  anchorText: string;
  firstMessage: string;
}

interface CreateSubthreadResult {
  thread: Thread;
  userMessage: Message;
}

// Create subthread and return immediately (don't wait for AI response)
export function useCreateSubthread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateSubthreadParams): Promise<CreateSubthreadResult> => {
      // Create the subthread
      const threadRes = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: params.anchorText.slice(0, 50) + (params.anchorText.length > 50 ? '...' : ''),
          parentThreadId: params.parentThreadId,
          anchorMessageId: params.anchorMessageId,
          anchorStart: params.anchorStart,
          anchorEnd: params.anchorEnd,
        }),
      });

      if (!threadRes.ok) throw new Error('Failed to create subthread');
      const { thread } = await threadRes.json();

      // Create optimistic user message
      const userMessage: Message = {
        id: `temp-user-${Date.now()}`,
        threadId: thread.id,
        role: 'user',
        content: params.firstMessage,
        position: 0,
        createdAt: new Date(),
      };

      return { thread, userMessage };
    },
    onSuccess: (_, variables) => {
      // Refresh parent thread to show new subthread anchor
      queryClient.invalidateQueries({ queryKey: ['threads', variables.parentThreadId] });
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });
}

// Helper to stream a message to a subthread (used by MainContent)
export async function streamSubthreadMessage(
  threadId: string,
  message: string,
  onChunk: (content: string) => void,
  onComplete: () => void,
) {
  try {
    const res = await fetch(`/api/threads/${threadId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    });

    if (!res.ok) throw new Error('Failed to send message');
    if (!res.body) throw new Error('No response body');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      accumulated += chunk;
      onChunk(accumulated);
    }

    onComplete();
  } catch (error) {
    console.error('Stream error:', error);
    onComplete();
  }
}

