import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Thread } from '@/db/schema';

interface CreateSubthreadParams {
  parentThreadId: string;
  anchorMessageId: string;
  anchorStart: number;
  anchorEnd: number;
  anchorText: string;
  firstMessage: string;
}

export function useCreateSubthread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateSubthreadParams) => {
      // First create the subthread
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

      // Then send the first message to get AI response
      const messageRes = await fetch(`/api/threads/${thread.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: params.firstMessage }),
      });

      if (!messageRes.ok) throw new Error('Failed to send message');

      // Consume the stream (we don't need to display it here)
      const reader = messageRes.body?.getReader();
      if (reader) {
        while (true) {
          const { done } = await reader.read();
          if (done) break;
        }
      }

      return thread as Thread;
    },
    onSuccess: (_, variables) => {
      // Refresh parent thread to show new subthread
      queryClient.invalidateQueries({ queryKey: ['threads', variables.parentThreadId] });
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });
}
