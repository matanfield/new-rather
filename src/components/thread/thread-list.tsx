'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { ThreadItem } from './thread-item';
import type { Thread } from '@/db/schema';

// Fetch all threads with hierarchy
function useAllThreads() {
  return useQuery({
    queryKey: ['threads', 'all'],
    queryFn: async () => {
      const res = await fetch('/api/threads?includeSubthreads=true');
      if (!res.ok) throw new Error('Failed to fetch threads');
      const data = await res.json();
      return data.threads as Thread[];
    },
  });
}

export function ThreadList() {
  const { data: allThreads, isLoading } = useAllThreads();

  // Build thread hierarchy
  const { rootThreads, childrenMap } = useMemo(() => {
    if (!allThreads) return { rootThreads: [], childrenMap: new Map() };

    const roots: Thread[] = [];
    const children = new Map<string, Thread[]>();

    // Sort all threads by updatedAt descending
    const sorted = [...allThreads].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    for (const thread of sorted) {
      if (!thread.parentThreadId) {
        roots.push(thread);
      } else {
        const existing = children.get(thread.parentThreadId) || [];
        existing.push(thread);
        children.set(thread.parentThreadId, existing);
      }
    }

    return { rootThreads: roots, childrenMap: children };
  }, [allThreads]);

  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  if (!rootThreads.length) {
    return (
      <p className="px-2 py-8 text-center text-sm text-muted-foreground">
        No threads yet. Start a new one!
      </p>
    );
  }

  return (
    <div className="space-y-0.5 py-2">
      {rootThreads.map((thread) => (
        <ThreadItem
          key={thread.id}
          thread={thread}
          childThreads={childrenMap.get(thread.id) || []}
          depth={0}
        />
      ))}
    </div>
  );
}

