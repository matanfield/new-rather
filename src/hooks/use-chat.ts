'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Message } from '@/db/schema';

interface UseChatOptions {
  threadId: string;
  onFinish?: () => void;
}

interface OptimisticMessage {
  userMessage: Message | null;
  assistantContent: string;
}

export function useChat({ threadId, onFinish }: UseChatOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [optimistic, setOptimistic] = useState<OptimisticMessage>({
    userMessage: null,
    assistantContent: '',
  });
  const queryClient = useQueryClient();

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setIsLoading(true);
      
      // Optimistically add user message
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        threadId,
        role: 'user',
        content: content.trim(),
        position: -1, // Will be replaced
        createdAt: new Date(),
      };
      
      setOptimistic({
        userMessage: tempUserMessage,
        assistantContent: '',
      });

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
          setOptimistic(prev => ({
            ...prev,
            assistantContent: accumulated,
          }));
        }

        // Clear optimistic state BEFORE invalidating to prevent duplicates
        setOptimistic({ userMessage: null, assistantContent: '' });
        
        // Now refresh with server data
        await queryClient.invalidateQueries({ queryKey: ['threads', threadId] });
        await queryClient.invalidateQueries({ queryKey: ['threads'] });
        
        onFinish?.();
      } catch (error) {
        console.error('Failed to send message:', error);
        // Clear optimistic state on error too
        setOptimistic({ userMessage: null, assistantContent: '' });
      } finally {
        setIsLoading(false);
      }
    },
    [threadId, isLoading, queryClient, onFinish]
  );

  return {
    sendMessage,
    isLoading,
    optimisticUserMessage: optimistic.userMessage,
    streamingContent: optimistic.assistantContent,
  };
}
