import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Thread, Message } from '@/db/schema';

interface ThreadWithDetails {
  thread: Thread;
  messages: Message[];
  subthreads: Thread[];
  breadcrumb: Array<{ id: string; title: string }>;
}

// Fetch all root threads
export function useThreads() {
  return useQuery({
    queryKey: ['threads'],
    queryFn: async () => {
      const res = await fetch('/api/threads');
      if (!res.ok) throw new Error('Failed to fetch threads');
      const data = await res.json();
      return data.threads as Thread[];
    },
  });
}

// Fetch a single thread with messages
export function useThread(threadId: string | null) {
  return useQuery({
    queryKey: ['threads', threadId],
    queryFn: async () => {
      if (!threadId) return null;
      const res = await fetch(`/api/threads/${threadId}`);
      if (!res.ok) throw new Error('Failed to fetch thread');
      return res.json() as Promise<ThreadWithDetails>;
    },
    enabled: !!threadId,
  });
}

// Create a new thread
export function useCreateThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title?: string;
      parentThreadId?: string;
      anchorMessageId?: string;
      anchorStart?: number;
      anchorEnd?: number;
    }) => {
      const res = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create thread');
      const result = await res.json();
      return result.thread as Thread;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });
}

// Update a thread
export function useUpdateThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const res = await fetch(`/api/threads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error('Failed to update thread');
      const result = await res.json();
      return result.thread as Thread;
    },
    onSuccess: (thread) => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      queryClient.invalidateQueries({ queryKey: ['threads', thread.id] });
    },
  });
}

// Delete a thread
export function useDeleteThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/threads/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete thread');
      const result = await res.json();
      return result.deleted as string[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });
}

