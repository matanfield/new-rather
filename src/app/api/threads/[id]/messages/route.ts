import { db, threads, messages } from '@/db';
import { eq, and, count } from 'drizzle-orm';
import { streamText, generateText } from 'ai';
import { z } from 'zod';
import { chatModel, utilityModel } from '@/lib/ai';
import { ensureUser } from '@/lib/ensure-user';

// POST /api/threads/[id]/messages - Send message and get AI response
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await ensureUser();
  const { id: threadId } = await params;
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Verify thread ownership
  const [thread] = await db
    .select()
    .from(threads)
    .where(and(eq(threads.id, threadId), eq(threads.userId, user.id)));

  if (!thread) {
    return new Response('Thread not found', { status: 404 });
  }

  const { content } = await req.json();

  // Get current message count for position
  const [{ value: messageCount }] = await db
    .select({ value: count() })
    .from(messages)
    .where(eq(messages.threadId, threadId));

  // Save user message
  await db.insert(messages).values({
    threadId,
    role: 'user',
    content,
    position: messageCount,
  });

  // Get all messages for context
  const allMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.threadId, threadId))
    .orderBy(messages.position);

  // Build context for subthreads
  let systemPrompt = `You are a helpful AI assistant in a fractal chat application called "Rather". 
Users can create subthreads to explore topics in depth without losing the main conversation flow.

You have a tool called "create_subthread" that you can use to create a subthread when:
- A topic deserves deeper exploration but would distract from the main narrative
- The user asks about something tangential that you want to address separately
- You want to provide detailed information that would make the main response too long

When you use create_subthread, the subthread will appear in the right sidebar for the user to explore.
Use this sparingly - only when the content truly warrants a separate thread.

Guidelines:
- Be helpful, concise, and accurate
- Use markdown formatting for better readability
- Maintain focus on the current thread's topic`;

  if (thread.parentThreadId) {
    // This is a subthread, add context
    const [parentThread] = await db
      .select()
      .from(threads)
      .where(eq(threads.id, thread.parentThreadId));
    
    if (parentThread) {
      systemPrompt += `\n\nThis is a subthread exploring a specific topic from the parent conversation.
Parent thread: "${parentThread.title}"
${parentThread.summary ? `Parent summary: ${parentThread.summary}` : ''}
Please stay focused on this specific subtopic. Avoid creating nested subthreads unless truly necessary.`;
    }
  }

  // Track created subthreads to report back
  const createdSubthreads: Array<{ id: string; title: string; anchorText: string }> = [];

  // Stream the response
  const result = streamText({
    model: chatModel,
    system: systemPrompt,
    messages: allMessages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    tools: {
      create_subthread: {
        description: 'Create a subthread to explore a topic in depth without disrupting the main conversation flow.',
        inputSchema: z.object({
          anchorText: z.string().describe('A short phrase (3-10 words) that will be highlighted in your message as the anchor for this subthread'),
          title: z.string().describe('A brief title for the subthread (3-8 words)'),
          content: z.string().describe('The detailed content to put in the subthread. This should be comprehensive.'),
        }),
        execute: async ({ anchorText, title, content: subthreadContent }: { anchorText: string; title: string; content: string }) => {
          // Create the subthread
          const [newSubthread] = await db
            .insert(threads)
            .values({
              userId: user.id,
              parentThreadId: threadId,
              title,
              // We'll set anchor position after we have the message
            })
            .returning();

          // Add the AI's content as the first message
          await db.insert(messages).values({
            threadId: newSubthread.id,
            role: 'assistant',
            content: subthreadContent,
            position: 0,
          });

          createdSubthreads.push({
            id: newSubthread.id,
            title,
            anchorText,
          });

          return { success: true, subthreadId: newSubthread.id, title };
        },
      },
    },
    onFinish: async ({ text }) => {
      // Save assistant message
      const [assistantMessage] = await db
        .insert(messages)
        .values({
          threadId,
          role: 'assistant',
          content: text,
          position: messageCount + 1,
        })
        .returning();

      // Update anchor positions for any created subthreads
      for (const sub of createdSubthreads) {
        const anchorStart = text.indexOf(sub.anchorText);
        if (anchorStart !== -1) {
          await db
            .update(threads)
            .set({
              anchorMessageId: assistantMessage.id,
              anchorStart,
              anchorEnd: anchorStart + sub.anchorText.length,
            })
            .where(eq(threads.id, sub.id));
        }
      }

      // Update thread timestamp
      await db
        .update(threads)
        .set({ updatedAt: new Date() })
        .where(eq(threads.id, threadId));

      // Generate title if this is the first exchange
      if (messageCount === 0) {
        await generateThreadTitle(threadId, content);
      }
    },
  });

  return result.toTextStreamResponse();
}

// Generate a title for the thread based on the first message
async function generateThreadTitle(threadId: string, firstMessage: string) {
  try {
    const { text } = await generateText({
      model: utilityModel,
      system: 'Generate a very short title (3-6 words) for this conversation. Return only the title, no quotes or punctuation.',
      prompt: firstMessage,
    });

    const title = text.trim().slice(0, 100); // Limit length
    
    await db
      .update(threads)
      .set({ title })
      .where(eq(threads.id, threadId));
  } catch (error) {
    console.error('Failed to generate title:', error);
  }
}
