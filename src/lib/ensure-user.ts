import { auth, currentUser } from '@clerk/nextjs/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';

/**
 * Ensures the current user exists in our database.
 * Call this before any operation that requires a user record.
 */
export async function ensureUser() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  // Check if user exists
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));

  if (existing) {
    return existing;
  }

  // User doesn't exist, create them
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return null;
  }

  const [newUser] = await db
    .insert(users)
    .values({
      id: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null,
    })
    .returning();

  return newUser;
}
