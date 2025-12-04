'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface UseChatOptions {
  threadId: string;
  onFinish?: () => void;
}

export function useChat({ threadId, onFinish }: UseChatOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const queryClient = useQueryClient();

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setIsLoading(true);
      setStreamingContent('');

      try {
        const res = await fetch(`/api/threads/${threadId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
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
          setStreamingContent(accumulated);
        }

        // Refresh thread data
        await queryClient.invalidateQueries({ queryKey: ['threads', threadId] });
        await queryClient.invalidateQueries({ queryKey: ['threads'] });
        
        onFinish?.();
      } catch (error) {
        console.error('Failed to send message:', error);
      } finally {
        setIsLoading(false);
        setStreamingContent('');
      }
    },
    [threadId, isLoading, queryClient, onFinish]
  );

  return {
    sendMessage,
    isLoading,
    streamingContent,
  };
}
