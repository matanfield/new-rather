import { pgTable, pgEnum, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';

// Enums for work units
export const workUnitTypeEnum = pgEnum('work_unit_type', ['fix', 'feature']);
export const workUnitStatusEnum = pgEnum('work_unit_status', ['todo', 'doing', 'done']);

// Work Units table - project management for development tasks
export const workUnits = pgTable('work_units', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  specification: text('specification'),
  type: workUnitTypeEnum('type').notNull(),
  status: workUnitStatusEnum('status').default('todo').notNull(),
  files: text('files').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Users table - synced from Clerk
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull(),
  name: text('name'),
  themePreference: text('theme_preference').default('system'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Threads table - supports fractal hierarchy
export const threads = pgTable('threads', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id).notNull(),
  parentThreadId: uuid('parent_thread_id'), // Self-reference handled via SQL
  anchorMessageId: uuid('anchor_message_id'),
  anchorStart: integer('anchor_start'),
  anchorEnd: integer('anchor_end'),
  title: text('title').notNull(),
  summary: text('summary'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Messages table
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  threadId: uuid('thread_id').references(() => threads.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  position: integer('position').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Types for use in the app
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Thread = typeof threads.$inferSelect;
export type NewThread = typeof threads.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type WorkUnit = typeof workUnits.$inferSelect;
export type NewWorkUnit = typeof workUnits.$inferInsert;

