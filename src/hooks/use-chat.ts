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

      let finalAssistantContent = '';

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

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          finalAssistantContent += chunk;
          setOptimistic(prev => ({
            ...prev,
            assistantContent: finalAssistantContent,
          }));
        }

        // Update cache directly with the new messages to avoid flash
        queryClient.setQueryData(['threads', threadId], (oldData: { messages: Message[] } | undefined) => {
          if (!oldData) return oldData;
          
          const newUserMessage: Message = {
            id: `user-${Date.now()}`,
            threadId,
            role: 'user',
            content: content.trim(),
            position: oldData.messages.length,
            createdAt: new Date(),
          };
          
          const newAssistantMessage: Message = {
            id: `assistant-${Date.now()}`,
            threadId,
            role: 'assistant',
            content: finalAssistantContent,
            position: oldData.messages.length + 1,
            createdAt: new Date(),
          };
          
          return {
            ...oldData,
            messages: [...oldData.messages, newUserMessage, newAssistantMessage],
          };
        });

        // Clear optimistic state - cache now has the messages
        setOptimistic({ userMessage: null, assistantContent: '' });
        
        // Background refresh to get real IDs and sync with server
        // Use refetch instead of invalidate to not clear the cache
        queryClient.refetchQueries({ queryKey: ['threads', threadId] });
        queryClient.invalidateQueries({ queryKey: ['threads'] });
        
        onFinish?.();
      } catch (error) {
        console.error('Failed to send message:', error);
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
