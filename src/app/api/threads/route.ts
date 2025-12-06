import { db, threads } from '@/db';
import { eq, desc, isNull, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { ensureUser } from '@/lib/ensure-user';

// GET /api/threads - Get user's threads
export async function GET(req: Request) {
  const user = await ensureUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const includeSubthreads = searchParams.get('includeSubthreads') === 'true';

  if (includeSubthreads) {
    // Return all threads for hierarchy
    const allThreads = await db
      .select()
      .from(threads)
      .where(eq(threads.userId, user.id))
      .orderBy(desc(threads.updatedAt));

    return NextResponse.json({ threads: allThreads });
  }

  // Return only root threads
  const userThreads = await db
    .select()
    .from(threads)
    .where(and(eq(threads.userId, user.id), isNull(threads.parentThreadId)))
    .orderBy(desc(threads.updatedAt));

  return NextResponse.json({ threads: userThreads });
}

// POST /api/threads - Create a new thread
export async function POST(req: Request) {
  const user = await ensureUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title, parentThreadId, anchorMessageId, anchorStart, anchorEnd } = body;

  const [newThread] = await db
    .insert(threads)
    .values({
      userId: user.id,
      title: title || 'New Thread',
      parentThreadId: parentThreadId || null,
      anchorMessageId: anchorMessageId || null,
      anchorStart: anchorStart ?? null,
      anchorEnd: anchorEnd ?? null,
    })
    .returning();

  return NextResponse.json({ thread: newThread });
}

