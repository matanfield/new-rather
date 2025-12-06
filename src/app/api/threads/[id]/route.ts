import { db, threads, messages } from '@/db';
import { eq, and, asc } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { ensureUser } from '@/lib/ensure-user';

// GET /api/threads/[id] - Get thread with messages
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await ensureUser();
  const { id } = await params;
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [thread] = await db
    .select()
    .from(threads)
    .where(and(eq(threads.id, id), eq(threads.userId, user.id)));

  if (!thread) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  }

  const threadMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.threadId, id))
    .orderBy(asc(messages.position));

  // Get subthreads
  const subthreads = await db
    .select()
    .from(threads)
    .where(eq(threads.parentThreadId, id));

  // Build breadcrumb path
  const breadcrumb = await buildBreadcrumb(thread, user.id);

  return NextResponse.json({
    thread,
    messages: threadMessages,
    subthreads,
    breadcrumb,
  });
}

// PATCH /api/threads/[id] - Update thread
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await ensureUser();
  const { id } = await params;
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title } = body;

  const [updated] = await db
    .update(threads)
    .set({ title, updatedAt: new Date() })
    .where(and(eq(threads.id, id), eq(threads.userId, user.id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  }

  return NextResponse.json({ thread: updated });
}

// DELETE /api/threads/[id] - Delete thread and descendants
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await ensureUser();
  const { id } = await params;
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get all descendant thread IDs recursively
  const toDelete = await getDescendantIds(id, user.id);
  toDelete.push(id);

  // Delete all threads (messages cascade due to FK)
  for (const threadId of toDelete) {
    await db
      .delete(threads)
      .where(and(eq(threads.id, threadId), eq(threads.userId, user.id)));
  }

  return NextResponse.json({ deleted: toDelete });
}

// Helper to build breadcrumb path
async function buildBreadcrumb(
  thread: typeof threads.$inferSelect,
  userId: string
): Promise<Array<{ id: string; title: string }>> {
  const path: Array<{ id: string; title: string }> = [];
  let current: typeof threads.$inferSelect | null = thread;

  while (current) {
    path.unshift({ id: current.id, title: current.title });
    
    if (current.parentThreadId) {
      const [parent] = await db
        .select()
        .from(threads)
        .where(and(eq(threads.id, current.parentThreadId), eq(threads.userId, userId)));
      current = parent || null;
    } else {
      current = null;
    }
  }

  return path;
}

// Helper to get all descendant thread IDs
async function getDescendantIds(threadId: string, userId: string): Promise<string[]> {
  const children = await db
    .select({ id: threads.id })
    .from(threads)
    .where(and(eq(threads.parentThreadId, threadId), eq(threads.userId, userId)));

  const descendantIds: string[] = [];
  for (const child of children) {
    descendantIds.push(child.id);
    const grandchildren = await getDescendantIds(child.id, userId);
    descendantIds.push(...grandchildren);
  }

  return descendantIds;
}

