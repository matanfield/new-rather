# Rather - Development Plan

## Overview

This document outlines the development phases for Rather, a fractal AI chat application. Each phase builds upon the previous, with clear deliverables.

---

## Phase 1: Foundation

### Project Setup
- [x] Next.js 16 with App Router
- [x] TypeScript configuration
- [x] Tailwind CSS 4
- [ ] Shadcn/UI installation and configuration
- [ ] Base component library setup

### Database & Auth
- [ ] Neon PostgreSQL setup
- [ ] Drizzle ORM configuration
- [ ] Database schema (users, threads, messages)
- [ ] Clerk authentication integration
- [ ] User sync webhook
- [ ] Protected routes middleware

### Layout Shell
- [ ] App layout with sidebar + main area structure
- [ ] Sidebar component (full height, collapsible)
- [ ] Main header (spans from sidebar edge to screen edge)
- [ ] Sidebar toggle button in header
- [ ] Right pane placeholder (closed by default)
- [ ] Responsive breakpoints

### Theme System
- [ ] CSS variables for light/dark themes
- [ ] Theme provider with system detection
- [ ] Theme toggle in settings
- [ ] LocalStorage persistence

---

## Phase 2: Core Chat

### Thread Management
- [ ] Create new root thread
- [ ] Thread list in sidebar
- [ ] Thread ordering by lastUpdate
- [ ] Delete thread (basic, no cascade yet)
- [ ] Active thread state

### Message System
- [ ] Message display (user/assistant bubbles)
- [ ] Message input with auto-expand
- [ ] Send message functionality
- [ ] Markdown rendering for AI responses

### LLM Integration
- [ ] Vercel AI SDK setup
- [ ] Claude integration (primary model)
- [ ] Streaming responses
- [ ] Auto-generate thread title after first user message

### State Management
- [ ] Zustand store for UI state
- [ ] TanStack Query for server state
- [ ] Navigation history tracking

---

## Phase 3: Subthread System

### User Subthread Creation
- [ ] Text selection detection in AI messages
- [ ] Selection popup component
- [ ] Create subthread from selection
- [ ] Anchor position storage

### Anchor System
- [ ] Anchor highlighting in messages
- [ ] `[[syntax]]` parsing in user input
- [ ] Subthread creation from inline anchors
- [ ] Click anchor → open right pane + highlight card

### Right Pane
- [ ] Subthread cards (collapsed/expanded states)
- [ ] Card ordering by anchor position
- [ ] Enter subthread navigation
- [ ] Right pane toggle button

### AI Subthread Creation
- [ ] Tool definition for create_subthread
- [ ] Process tool calls in streaming response
- [ ] Create subthread with AI's initial content
- [ ] Real-time UI update for new subthreads

---

## Phase 4: Navigation & Context

### Navigation
- [ ] Breadcrumb component
- [ ] Clickable breadcrumb segments
- [ ] Back button (history-based)
- [ ] Thread navigation from sidebar

### Nested Threads
- [ ] Expandable thread hierarchy in sidebar
- [ ] Indented subthread display
- [ ] Expand/collapse toggle

### Context Inheritance
- [ ] Build context from parent thread
- [ ] Include parent summary
- [ ] Include anchor text
- [ ] System prompt with subthread guidelines

### Thread Editing
- [ ] Inline title editing in header
- [ ] Inline title editing in sidebar
- [ ] Thread summary generation (background)

---

## Phase 5: Polish & Mobile

### Mobile Layout
- [ ] Responsive sidebar (overlay mode)
- [ ] Mobile header adjustments
- [ ] Touch-friendly interactions
- [ ] Simplified subthread navigation (no preview)

### Delete & Cascade
- [ ] Delete confirmation dialog
- [ ] Cascade delete all descendants
- [ ] UI update after deletion

### UX Polish
- [ ] Loading skeletons
- [ ] Streaming indicators
- [ ] Error states and messages
- [ ] Empty states

### Keyboard Shortcuts
- [ ] Cmd/Ctrl + N: New thread
- [ ] Cmd/Ctrl + B: Toggle sidebar
- [ ] Cmd/Ctrl + \: Toggle right pane
- [ ] Enter: Send message
- [ ] Shift + Enter: New line
- [ ] Escape: Close popups

---

## Future Phases

### Enhanced Search
- [ ] Embeddings generation (OpenAI)
- [ ] pgvector setup
- [ ] Semantic search API
- [ ] Search UI in sidebar

### Real-time Features
- [ ] Pusher integration
- [ ] Live updates across tabs
- [ ] Optimistic UI updates

### Multi-model Support
- [ ] Model selector UI
- [ ] OpenAI GPT-4 integration
- [ ] Google Gemini integration
- [ ] Per-thread model preference

### Advanced Features
- [ ] Hover preview on anchors
- [ ] Message editing
- [ ] Message deletion
- [ ] File attachments
- [ ] Export (Markdown, PDF)

---

## Tech Stack Reference

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Components | Shadcn/ui |
| State (Client) | Zustand |
| State (Server) | TanStack Query |
| Database | PostgreSQL (Neon) |
| ORM | Drizzle |
| Auth | Clerk |
| AI SDK | Vercel AI SDK |
| LLM | Claude (Anthropic) |

---

## Notes

- Mobile: Clicking anchor text navigates directly to subthread (no preview pane)
- Right pane: Closed by default, opens on toggle or anchor click
- Thread titles: Generated after first user message is sent
- `[[syntax]]` preview: Future enhancement (not in MVP)
