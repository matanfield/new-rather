# Rather
## Fractal AI Chat Application - Technical Specification

**Version 1.0 | December 2024**

---

# Table of Contents

1. [Product Overview](#1-product-overview)
2. [User Personas](#2-user-personas)
3. [Information Architecture](#3-information-architecture)
4. [User Flows](#4-user-flows)
5. [Screen Specifications](#5-screen-specifications)
6. [UI Component Library](#6-ui-component-library)
7. [Theming System](#7-theming-system)
8. [Database Schema](#8-database-schema)
9. [API Endpoints](#9-api-endpoints)
10. [State Management](#10-state-management)
11. [LLM Integration](#11-llm-integration)
12. [Context Management](#12-context-management)
13. [AI Subthread Creation](#13-ai-subthread-creation)
14. [Search Implementation](#14-search-implementation)
15. [Real-time Sync](#15-real-time-sync)
16. [Authentication](#16-authentication)
17. [Error Handling](#17-error-handling)
18. [Performance Considerations](#18-performance-considerations)
19. [Tech Stack Summary](#19-tech-stack-summary)
20. [MVP Scope & Phasing](#20-mvp-scope--phasing)
21. [Future Ideas](#21-future-ideas)

---

# 1. Product Overview

## 1.1 Vision Statement

Rather is a fractal AI chat application designed for extended missions such as learning, research, design, and specification work. The core innovation is the ability to branch conversations into focused sub-threads while maintaining a coherent narrative in each thread.

## 1.2 Core Design Principle

> **Every thread must maintain a coherent storyline.**

When a conversation touches on a subtopic that warrants deeper exploration but would distract from the main narrative, that subtopic should be spun off into a subthread. This keeps each thread focused and linear while allowing unlimited depth of exploration.

## 1.3 Key Differentiators

| Feature | Description |
|---------|-------------|
| **Fractal conversation structure** | Threads can spawn subthreads infinitely deep |
| **Bidirectional subthread creation** | Both user and AI can create subthreads |
| **AI-initiated branching** | AI has tools to create subthreads when appropriate |
| **Context inheritance** | Subthreads inherit relevant context from parent |
| **Anchor-based navigation** | Subthreads are anchored to specific text in parent |

## 1.4 Target Use Cases

- **Research projects**: Explore multiple branches of inquiry without losing the main thread
- **Learning journeys**: Dive deep into prerequisites or tangential concepts
- **Design specifications**: Detail individual components without cluttering the overview
- **Complex problem solving**: Break down problems into manageable sub-investigations
- **Writing projects**: Develop characters, plot points, or research separately

---

# 2. User Personas

## 2.1 The Researcher

| Attribute | Description |
|-----------|-------------|
| **Profile** | Academic or professional researcher conducting literature reviews, exploring hypotheses |
| **Pain Point** | Long AI conversations become unwieldy; loses track of interesting tangents |
| **Value** | Can pursue tangential research questions without losing primary thread |

## 2.2 The Student

| Attribute | Description |
|-----------|-------------|
| **Profile** | Learner studying complex topics with many prerequisite concepts |
| **Pain Point** | Needs to understand foundational concepts but doesn't want to derail main lesson |
| **Value** | Can create quick "what is X?" subthreads while staying focused on main topic |

## 2.3 The Product Designer

| Attribute | Description |
|-----------|-------------|
| **Profile** | Designer/PM developing specifications for complex products |
| **Pain Point** | Specs become long and hard to navigate; details get mixed with high-level design |
| **Value** | Can maintain clean high-level thread with detailed component specs as subthreads |

## 2.4 The Creative Writer

| Attribute | Description |
|-----------|-------------|
| **Profile** | Author developing complex narratives with AI assistance |
| **Pain Point** | Character development, world-building, and plot discussions all mixed together |
| **Value** | Separate threads for characters, locations, plot arcs while maintaining main narrative |

---

# 3. Information Architecture

## 3.1 Core Concepts

### 3.1.1 Thread

A thread is a linear conversation between user and AI. It has:

- A unique identifier
- An auto-generated title (editable by user)
- An ordered sequence of messages
- Optional parent thread reference
- Optional anchor information (if subthread)
- Zero or more child subthreads

### 3.1.2 Root Thread

A thread with no parent. Root threads appear in the main sidebar list.

### 3.1.3 Subthread

A thread that has a parent thread. Subthreads are:

- Anchored to specific text in the parent thread
- Initialized with context from the parent
- Shown in the right pane when viewing parent

### 3.1.4 Message

A single message in a thread. Contains:

- Content (text, potentially with anchor markers)
- Role (user or assistant)
- Timestamp
- Optional anchor points that spawn subthreads

### 3.1.5 Anchor

A marked segment of text in a message that serves as the spawn point for a subthread. An anchor has:

- Start and end character positions within the message
- Reference to the subthread it spawned
- Visual highlighting in the UI

## 3.2 Hierarchy Visualization

```
Root Thread A
├── Subthread A.1
│   ├── Subthread A.1.1
│   └── Subthread A.1.2
├── Subthread A.2
└── Subthread A.3
    └── Subthread A.3.1

Root Thread B
└── Subthread B.1
```

The thread hierarchy is visualized in the sidebar. Root threads show at the top level, with expandable toggles for threads that have subthreads.

## 3.3 Navigation Model

| Concept | Behavior |
|---------|----------|
| **Active Thread** | Only one thread is "active" (displayed in center pane) at a time |
| **Thread Replacement** | Navigating to a new thread replaces the current one (no tabs) |
| **Breadcrumb Trail** | Header shows path from root to current thread |
| **Back Button** | Returns to previously viewed thread (history-based, not parent-based) |
| **Right Pane Preview** | Shows subthreads of active thread for quick peek without navigation |

---

# 4. User Flows

## 4.1 Creating a New Root Thread

```
1. User clicks "New Thread" button in sidebar header
2. Empty thread opens in center pane with input focused
3. User types first message and presses Enter or clicks Send
4. Message appears in thread; AI begins streaming response
5. Thread title auto-generates based on first message
6. Thread appears in sidebar list
```

## 4.2 Creating Subthread from User's Own Message (Inline Syntax)

```
1. While composing a message, user types [[text to anchor]]
2. The bracketed text renders as highlighted anchor
3. Message sends; anchor appears highlighted
4. New subthread is created automatically, anchored to that text
5. Right pane opens showing the new subthread card
6. User can click into subthread to continue the branched conversation
```

**Example input:**
```
I think we should use React for the frontend [[but we should also 
consider Vue as an alternative]]. The component model is very intuitive.
```

## 4.3 Creating Subthread from AI's Message

```
1. User selects (highlights) text in AI's message
2. Popup appears near selection with text input field
3. User types their comment/question about the selected text
4. User presses Enter or clicks Send in popup
5. New subthread is created, anchored to the selected text
6. Selected text becomes highlighted anchor in parent message
7. User's comment becomes first message in subthread
8. Right pane opens with new subthread highlighted
9. AI begins responding in the subthread
```

## 4.4 AI Creating Subthread from Its Own Message

```
1. AI is generating a response and identifies a subtopic worth exploring
2. AI uses the create_subthread tool with anchor text and initial content
3. The anchor text appears highlighted in AI's message
4. New subthread is created with AI's expanded content as first message
5. Right pane shows new subthread card (collapsed by default)
```

## 4.5 AI Creating Subthread from User's Message

```
1. AI reads user's message and identifies a point worth expanding separately
2. AI uses the create_subthread tool, targeting text in user's message
3. That portion of user's message becomes highlighted anchor
4. New subthread is created with AI's response to that specific point
5. AI continues main response in parent thread (if applicable)
```

## 4.6 Navigating to a Subthread

### Method A: Via Anchor
```
1. User clicks highlighted anchor text in a message
2. Right pane opens (if not already open)
3. Corresponding subthread card is highlighted/expanded
4. User clicks expand button on card to make subthread the active thread
```

### Method B: Via Right Pane
```
1. User clicks right pane toggle button in header
2. Right pane opens showing all subthreads as cards
3. User clicks a card to expand/preview
4. User clicks expand button to make it active thread
```

### Method C: Via Sidebar
```
1. User expands parent thread in sidebar (clicks toggle)
2. Subthreads appear indented below parent
3. User clicks subthread title to make it active
```

## 4.7 Navigating Back

```
1. User clicks Back button in header
2. Previously viewed thread becomes active
3. Breadcrumb updates accordingly
```

> **Note:** Back is history-based (last viewed thread), not strictly parent-based

## 4.8 Editing Thread Title

```
1. User double-clicks thread title (in header or sidebar)
2. Title becomes editable inline input
3. User types new title
4. User presses Enter or clicks outside to save
5. Title updates in all locations (header, sidebar, breadcrumb)
```

## 4.9 Deleting a Thread

```
1. User hovers over thread title in sidebar
2. Delete icon appears on the right
3. User clicks delete icon
4. Confirmation dialog appears warning that all subthreads will also be deleted
5. User confirms
6. Thread and all descendants are deleted; navigation updates
```

## 4.10 Searching Threads

```
1. User clicks search icon in sidebar header
2. Search input appears
3. User types search query
4. Results appear showing matching threads (semantic search via embeddings)
5. Results show thread title, snippet of matching content, and hierarchy path
6. User clicks result to navigate to that thread
```

## 4.11 Hover Preview on Anchor (Desktop)

```
1. User hovers over highlighted anchor text
2. After 500ms delay, tooltip/preview appears
3. Preview shows subthread title and first message snippet
4. User moves mouse away, preview dismisses
```

---

# 5. Screen Specifications

## 5.1 Application Layout (Desktop)

### Layout Component Hierarchy

The layout follows a clear hierarchical structure:

1. **Screen** → Sidebar + Main Area
2. **Main Area** → Header + Main Content
3. **Main Content** → Thread (Center Pane) + Right Pane (when open)

This means:
- The **Sidebar** stretches the full height of the screen (top to bottom)
- The **Header** spans from the sidebar's right edge to the screen's right edge
- The **Right Pane** sits below the header, alongside the center pane

```
┌──────────────┬──────────────────────────────────────────────────────┐
│              │                    HEADER                            │
│              │  [←] Root > Parent > Current Title          [⊞]     │
│   SIDEBAR    ├────────────────────────────────┬─────────────────────┤
│   (280px)    │                                │                     │
│              │       CENTER PANE              │    RIGHT PANE       │
│  ┌────────┐  │      (flexible, max 800px)     │     (350px)         │
│  │  Logo  │  │                                │                     │
│  ├────────┤  │  ┌──────────────────────────┐  │  ┌───────────────┐  │
│  │+ Thread│  │  │                          │  │  │ Subthread 1   │  │
│  │ Search │  │  │     MESSAGE LIST         │  │  │   (card)      │  │
│  ├────────┤  │  │     (scrollable)         │  │  ├───────────────┤  │
│  │Thread 1│  │  │                          │  │  │ Subthread 2   │  │
│  │ └Sub1.1│  │  │                          │  │  │   (card)      │  │
│  │ └Sub1.2│  │  │                          │  │  ├───────────────┤  │
│  │Thread 2│  │  │                          │  │  │ Subthread 3   │  │
│  │Thread 3│  │  │                          │  │  │   (card)      │  │
│  ├────────┤  │  ├──────────────────────────┤  │  └───────────────┘  │
│  │  User  │  │  │      INPUT AREA          │  │                     │
│  │Settings│  │  │  [________________] [⏎]  │  │                     │
└──────────────┴────────────────────────────────┴─────────────────────┘
```

### 5.1.1 Left Sidebar (280px)

- **Full height of screen** (top to bottom, independent of header)
- Header section with app logo, "New Thread" button, search icon
- Scrollable thread list in middle
- Footer with user avatar, settings link
- **Collapse behavior**: Sidebar slides in/out with smooth animation
  - When collapsed, main area expands to fill the vacated space
  - Toggle button lives in the main header's left side
  - Toggle button remains visible and accessible when sidebar is hidden
- On mobile: Opens as overlay from left, tap outside to dismiss

### 5.1.2 Main Area Header

- Spans from sidebar's right edge to screen's right edge
- Contains: Back button, Breadcrumb, Thread title, Right pane toggle
- Fixed at top of main area (not full screen width)

### 5.1.3 Center Pane (Flexible Width)

- Message list (scrollable)
- Input area at bottom (fixed position within pane)
- Maximum content width: 800px, centered

### 5.1.4 Right Pane (350px)

- Sits below the header, alongside center pane
- Shows subthreads of active thread
- **Closed by default** - user must explicitly open via toggle or anchor click
- Toggleable (open/closed) via button in main header
- Subthreads displayed as cards
- Has its own header: "Subthreads" title, close button

## 5.2 Sidebar Thread List

### Thread Item Component

```
┌─────────────────────────────────────────┐
│ ▶ Thread Title Here...            [🗑]  │  ← Root level
├─────────────────────────────────────────┤
│   ▼ Another Thread                [🗑]  │  ← Expanded
│     └ Subthread One               [🗑]  │  ← Indent 16px
│     └ Subthread Two               [🗑]  │
│       └ Sub-subthread             [🗑]  │  ← Indent 32px
└─────────────────────────────────────────┘
```

**Properties:**
- Expand/collapse toggle (only if thread has subthreads)
- Thread title (truncated with ellipsis if too long)
- Delete icon (appears on hover)
- Indentation based on nesting level (16px per level)
- Active state styling (background highlight)
- Hover state styling

**Ordering:**
- Root threads ordered by `lastUpdate` (descending)
- `lastUpdate` includes updates to any descendant threads
- Subthreads within a parent also ordered by `lastUpdate`

## 5.3 Chat Header

```
┌─────────────────────────────────────────────────────────────────┐
│  [←]  Root > Parent > Current Thread Title          [⊞]        │
└─────────────────────────────────────────────────────────────────┘
```

| Element | Behavior |
|---------|----------|
| **Back Button** | Left arrow icon, navigates to previous thread in history |
| **Breadcrumb** | Shows: Root > Parent > ... > Current. Each segment clickable |
| **Thread Title** | Double-click to edit inline |
| **Right Pane Toggle** | Opens/closes right pane; shows indicator if subthreads exist |

## 5.4 Message Component

### User Message
```
┌─────────────────────────────────────────────────────────┐
│                                          ┌────────────┐ │
│                                          │ User msg   │ │
│                                          │ content... │ │
│                                          └────────────┘ │
│                                              12:34 PM   │
└─────────────────────────────────────────────────────────┘
```

- Right-aligned (or distinct background)
- User avatar (optional)
- Message content with potential anchor highlights
- Timestamp (on hover or always visible)

### AI Message
```
┌─────────────────────────────────────────────────────────┐
│ ┌────────────────────────────────┐                      │
│ │ 🤖 AI response content here... │                      │
│ │ This part is [highlighted as   │ ← anchor            │
│ │ an anchor] and continues...    │                      │
│ └────────────────────────────────┘                      │
│   12:35 PM                                    [📋]      │
└─────────────────────────────────────────────────────────┘
```

- Left-aligned (or distinct background)
- AI avatar/icon
- Message content (streamed during generation)
- Anchor highlights for spawned subthreads
- Markdown rendering (code blocks, lists, etc.)
- Copy button (appears on hover)

### Anchor Highlight Styling

```css
.anchor {
  background-color: var(--anchor-bg);
  cursor: pointer;
  border-radius: 2px;
  padding: 0 2px;
}

.anchor:hover {
  background-color: var(--anchor-bg-hover);
}
```

## 5.5 Selection Popup

```
         ┌─────────────────────────────────┐
         │ ┌─────────────────────────┐ [⏎] │
         │ │ Start a subthread...    │     │
         │ └─────────────────────────┘     │
         └─────────────────────────────────┘
                      ▼
    "This is the selected text in the message"
```

**Behavior:**
- Appears when user selects text in an AI message
- Positioned near selection (above or below depending on space)
- Contains text input field (placeholder: "Start a subthread...")
- Send button (or Enter to submit)
- Dismisses on click outside or Escape key

## 5.6 Right Pane Subthread Cards

### Collapsed State
```
┌─────────────────────────────────────────┐
│ Subthread Title                    [↗]  │
│ "Anchor text preview here..."           │
└─────────────────────────────────────────┘
```
- Fixed height (~80px)
- Shows subthread title
- Shows anchor text preview (first line, truncated)
- Expand/enter icon on the right

### Expanded State
```
┌─────────────────────────────────────────┐
│ Subthread Title                    [↗]  │
├─────────────────────────────────────────┤
│ 👤 First user message in subthread...   │
│ 🤖 First AI response preview...         │
│ 👤 Second user message...               │
│         (scrollable within card)        │
└─────────────────────────────────────────┘
```
- Variable height (max ~400px)
- Shows first few messages (scrollable within card)
- "Enter" button to make it active thread
- Click card header to collapse

### Card Ordering
Cards ordered by anchor position in parent thread (top to bottom in parent = top to bottom in right pane)

## 5.7 Input Area

```
┌─────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────┐ [⏎] │
│ │ Type your message...                            │     │
│ │ You can use [[anchor syntax]] for subthreads    │     │
│ └─────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

**Properties:**
- Multi-line text input (auto-expands to max 6 lines, then scrolls)
- Send button (enabled when input has content)
- Keyboard shortcut: Enter to send, Shift+Enter for newline
- Supports `[[anchor syntax]]` highlighting as user types
- Disabled during AI response generation

## 5.8 Mobile Layouts

### Mobile Thread View
```
┌─────────────────────┐
│ [≡] Root > Cur... ⊞│
├─────────────────────┤
│                     │
│   MESSAGE LIST      │
│   (full screen)     │
│                     │
├─────────────────────┤
│ [_______________] ⏎ │
└─────────────────────┘
```

- Full-screen message list
- Header: Hamburger menu, breadcrumb (truncated), subthreads button
- Input fixed at bottom

### Mobile Sidebar
- Opens as overlay from left
- Tap outside to dismiss
- Same content as desktop sidebar

### Mobile Subthreads
- Clicking anchor or subthreads button navigates to subthread directly
- **No preview/peeking** — subthread always takes over
- Back button to return to parent

---

# 6. UI Component Library

## 6.1 Core Components (Shadcn/ui)

| Component | Usage |
|-----------|-------|
| `Button` | Primary actions, icon buttons |
| `Input` | Text fields, search |
| `Textarea` | Message input |
| `ScrollArea` | Message list, sidebar |
| `Tooltip` | Hover hints, anchor previews |
| `Popover` | Selection popup |
| `Dialog` | Confirmations, settings |
| `Sheet` | Mobile sidebar overlay |
| `Collapsible` | Sidebar thread expansion |
| `Card` | Subthread cards |
| `Skeleton` | Loading states |
| `Avatar` | User and AI avatars |
| `DropdownMenu` | Settings, model selection |

## 6.2 Custom Components

### ThreadItem
Sidebar thread row with expand toggle

```typescript
interface ThreadItemProps {
  thread: Thread;
  depth: number;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onExpand: (id: string) => void;
}
```

### MessageBubble
Individual message display with anchor support

```typescript
interface MessageBubbleProps {
  message: Message;
  anchors: Anchor[];
  onAnchorClick: (anchorId: string) => void;
  onTextSelect: (selection: Selection) => void;
}
```

### AnchoredText
Highlighted text span that links to subthread

```typescript
interface AnchoredTextProps {
  text: string;
  subthreadId: string;
  onClick: () => void;
}
```

### SelectionPopup
Popup for creating subthread from selection

```typescript
interface SelectionPopupProps {
  position: { x: number; y: number };
  selectedText: string;
  onSubmit: (message: string) => void;
  onDismiss: () => void;
}
```

### SubthreadCard
Collapsible card in right pane

```typescript
interface SubthreadCardProps {
  subthread: Thread;
  messages: Message[];
  isExpanded: boolean;
  isHighlighted: boolean;
  onToggle: () => void;
  onEnter: () => void;
}
```

### Breadcrumb
Thread hierarchy path display

```typescript
interface BreadcrumbProps {
  path: Array<{ id: string; title: string }>;
  onNavigate: (id: string) => void;
}
```

### MessageInput
Auto-expanding textarea with anchor syntax highlighting

```typescript
interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}
```

### StreamingMessage
Message component with streaming text support

```typescript
interface StreamingMessageProps {
  content: string;
  isStreaming: boolean;
}
```

---

# 7. Theming System

## 7.1 Design Principles

- No colors hardcoded in components
- All colors referenced via CSS variables
- Semantic naming (background, foreground, primary, etc.)
- Three modes: Light, Dark, System

## 7.2 CSS Variables

Following Shadcn's theming conventions, all colors are defined as HSL values:

### Base Colors
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
}
```

### Semantic Colors
```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
}
```

### Custom Variables for Rather
```css
:root {
  --anchor-bg: 210 100% 95%;
  --anchor-bg-hover: 210 100% 90%;
  --user-message-bg: 221.2 83.2% 96%;
  --ai-message-bg: 0 0% 98%;
  --sidebar-bg: 210 40% 98%;
  --right-pane-bg: 210 40% 98%;
}

.dark {
  --anchor-bg: 221.2 83.2% 25%;
  --anchor-bg-hover: 221.2 83.2% 30%;
  --user-message-bg: 221.2 83.2% 15%;
  --ai-message-bg: 222.2 84% 8%;
  --sidebar-bg: 222.2 84% 6%;
  --right-pane-bg: 222.2 84% 6%;
}
```

## 7.3 Theme Implementation

**Storage:**
- `localStorage` for immediate access on page load
- User profile in database for cross-device sync

**System Mode:**
- Uses `prefers-color-scheme` media query
- Updates automatically when system preference changes

```typescript
// hooks/useTheme.ts
type Theme = 'light' | 'dark' | 'system';

function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');
  
  useEffect(() => {
    const root = document.documentElement;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (theme === 'dark' || (theme === 'system' && systemDark)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);
  
  return { theme, setTheme };
}
```

---

# 8. Database Schema

## 8.1 Overview

PostgreSQL database hosted on Neon, accessed via Drizzle ORM. The schema supports the fractal thread structure with efficient queries for hierarchy traversal.

## 8.2 Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────────────┐
│   users     │       │   threads   │       │      messages       │
├─────────────┤       ├─────────────┤       ├─────────────────────┤
│ id (PK)     │◄──────│ user_id(FK) │       │ id (PK)             │
│ email       │       │ id (PK)     │◄──────│ thread_id (FK)      │
│ name        │       │ parent_id   │───┐   │ role                │
│ theme_pref  │       │ anchor_msg  │   │   │ content             │
│ created_at  │       │ anchor_start│   │   │ position            │
│ updated_at  │       │ anchor_end  │   │   │ created_at          │
└─────────────┘       │ title       │   │   └─────────────────────┘
                      │ summary     │   │              │
                      │ created_at  │   │              │
                      │ updated_at  │   │              ▼
                      └─────────────┘   │   ┌─────────────────────┐
                            │           │   │ message_embeddings  │
                            └───────────┘   ├─────────────────────┤
                       (self-reference)     │ id (PK)             │
                                            │ message_id (FK)     │
                                            │ embedding (vector)  │
                                            │ created_at          │
                                            └─────────────────────┘
```

## 8.3 Table Definitions

### users

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | Clerk user ID |
| `email` | TEXT | User email |
| `name` | TEXT | Display name |
| `theme_preference` | TEXT | 'light', 'dark', or 'system' |
| `created_at` | TIMESTAMP | Account creation time |
| `updated_at` | TIMESTAMP | Last update time |

### threads

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | Unique identifier |
| `user_id` | TEXT FK | Owner user reference |
| `parent_thread_id` | UUID FK NULL | Parent thread (NULL for root) |
| `anchor_message_id` | UUID FK NULL | Message containing anchor |
| `anchor_start` | INT NULL | Anchor text start position |
| `anchor_end` | INT NULL | Anchor text end position |
| `title` | TEXT | Thread title (auto/user generated) |
| `summary` | TEXT NULL | AI-generated summary for context |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last message/activity time |

**Indexes:**
- `idx_threads_user_id` on `user_id`
- `idx_threads_parent_id` on `parent_thread_id`
- `idx_threads_updated_at` on `updated_at DESC`

### messages

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | Unique identifier |
| `thread_id` | UUID FK | Parent thread |
| `role` | TEXT | 'user' or 'assistant' |
| `content` | TEXT | Message text content |
| `position` | INT | Order within thread (0-indexed) |
| `created_at` | TIMESTAMP | Creation time |

**Indexes:**
- `idx_messages_thread_id` on `thread_id`
- `idx_messages_position` on `(thread_id, position)`

### message_embeddings

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | Unique identifier |
| `message_id` | UUID FK | Reference to message |
| `embedding` | VECTOR(1536) | OpenAI embedding vector |
| `created_at` | TIMESTAMP | Creation time |

**Indexes:**
- `idx_embeddings_message_id` on `message_id`
- HNSW index on `embedding` for vector similarity search

## 8.4 Drizzle Schema

```typescript
// db/schema.ts
import { pgTable, text, timestamp, uuid, integer, vector } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name'),
  themePreference: text('theme_preference').default('system'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const threads = pgTable('threads', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id).notNull(),
  parentThreadId: uuid('parent_thread_id').references(() => threads.id),
  anchorMessageId: uuid('anchor_message_id'),
  anchorStart: integer('anchor_start'),
  anchorEnd: integer('anchor_end'),
  title: text('title').notNull(),
  summary: text('summary'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  threadId: uuid('thread_id').references(() => threads.id).notNull(),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  position: integer('position').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const messageEmbeddings = pgTable('message_embeddings', {
  id: uuid('id').primaryKey().defaultRandom(),
  messageId: uuid('message_id').references(() => messages.id).notNull(),
  embedding: vector('embedding', { dimensions: 1536 }),
  createdAt: timestamp('created_at').defaultNow(),
});
```

## 8.5 Key Queries

### Get Thread with Breadcrumb Path

```typescript
async function getThreadWithPath(threadId: string) {
  // Recursive CTE to get ancestors
  const result = await db.execute(sql`
    WITH RECURSIVE ancestors AS (
      SELECT id, title, parent_thread_id, 0 as depth
      FROM threads WHERE id = ${threadId}
      UNION ALL
      SELECT t.id, t.title, t.parent_thread_id, a.depth + 1
      FROM threads t
      JOIN ancestors a ON t.id = a.parent_thread_id
    )
    SELECT * FROM ancestors ORDER BY depth DESC
  `);
  return result;
}
```

### Get Root Threads with Descendant Update Time

```typescript
async function getRootThreads(userId: string) {
  const result = await db.execute(sql`
    WITH RECURSIVE descendants AS (
      SELECT id, id as root_id, updated_at
      FROM threads WHERE user_id = ${userId} AND parent_thread_id IS NULL
      UNION ALL
      SELECT t.id, d.root_id, t.updated_at
      FROM threads t
      JOIN descendants d ON t.parent_thread_id = d.id
    )
    SELECT 
      t.*,
      MAX(d.updated_at) as last_activity
    FROM threads t
    JOIN descendants d ON t.id = d.root_id
    WHERE t.parent_thread_id IS NULL AND t.user_id = ${userId}
    GROUP BY t.id
    ORDER BY last_activity DESC
  `);
  return result;
}
```

### Get Subthreads of a Thread

```typescript
async function getSubthreads(threadId: string) {
  return await db
    .select()
    .from(threads)
    .where(eq(threads.parentThreadId, threadId))
    .orderBy(asc(threads.anchorStart));
}
```

---

# 9. API Endpoints

## 9.1 Thread Endpoints

### GET /api/threads
Get user's root threads ordered by last activity.

**Response:**
```json
{
  "threads": [
    {
      "id": "uuid",
      "title": "Thread Title",
      "lastActivity": "2024-12-01T10:00:00Z",
      "hasSubthreads": true
    }
  ]
}
```

### GET /api/threads/:id
Get thread with messages and metadata.

**Response:**
```json
{
  "thread": {
    "id": "uuid",
    "title": "Thread Title",
    "parentThreadId": null,
    "breadcrumb": [
      { "id": "uuid", "title": "Root" },
      { "id": "uuid", "title": "Current" }
    ]
  },
  "messages": [
    {
      "id": "uuid",
      "role": "user",
      "content": "Message content",
      "anchors": [
        { "start": 10, "end": 25, "subthreadId": "uuid" }
      ],
      "createdAt": "2024-12-01T10:00:00Z"
    }
  ],
  "subthreads": [
    {
      "id": "uuid",
      "title": "Subthread",
      "anchorStart": 10,
      "anchorEnd": 25
    }
  ]
}
```

### POST /api/threads
Create a new thread.

**Request:**
```json
{
  "parentThreadId": "uuid | null",
  "anchorMessageId": "uuid | null",
  "anchorStart": 10,
  "anchorEnd": 25,
  "firstMessage": "User's first message"
}
```

### PATCH /api/threads/:id
Update thread (title, etc.).

**Request:**
```json
{
  "title": "New Title"
}
```

### DELETE /api/threads/:id
Delete thread and all descendants.

**Response:**
```json
{
  "deleted": ["uuid1", "uuid2", "uuid3"]
}
```

### GET /api/threads/:id/subthreads
Get subthreads of a thread.

## 9.2 Message Endpoints

### POST /api/threads/:id/messages
Send a message and get AI response (streaming).

**Request:**
```json
{
  "content": "User message",
  "anchors": [
    { "start": 5, "end": 20, "createSubthread": true }
  ]
}
```

**Response:** Server-Sent Events stream

```
data: {"type": "user_message", "id": "uuid", "content": "..."}

data: {"type": "assistant_chunk", "content": "Hello"}
data: {"type": "assistant_chunk", "content": " there"}
data: {"type": "assistant_done", "id": "uuid", "content": "Hello there..."}

data: {"type": "subthread_created", "id": "uuid", "anchorStart": 10, "anchorEnd": 25}

data: {"type": "done"}
```

## 9.3 Search Endpoints

### GET /api/search?q=query
Semantic search across user's threads.

**Response:**
```json
{
  "results": [
    {
      "threadId": "uuid",
      "threadTitle": "Thread Title",
      "messageId": "uuid",
      "snippet": "...matching content...",
      "path": ["Root", "Parent", "Thread"],
      "score": 0.89
    }
  ]
}
```

## 9.4 User Endpoints

### GET /api/user/preferences
Get user preferences.

### PATCH /api/user/preferences
Update user preferences.

**Request:**
```json
{
  "themePreference": "dark"
}
```

---

# 10. State Management

## 10.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Zustand    │  │  TanStack    │  │   Context    │       │
│  │    Store     │  │    Query     │  │  (Theme)     │       │
│  │              │  │              │  │              │       │
│  │ - UI State   │  │ - Server     │  │ - Theme      │       │
│  │ - Navigation │  │   Cache      │  │ - User       │       │
│  │ - Selections │  │ - Mutations  │  │              │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## 10.2 Zustand Store

```typescript
// stores/appStore.ts
import { create } from 'zustand';

interface NavigationHistory {
  threadId: string;
  timestamp: number;
}

interface AppState {
  // Navigation
  activeThreadId: string | null;
  navigationHistory: NavigationHistory[];
  rightPaneOpen: boolean;
  sidebarOpen: boolean;
  
  // UI State
  expandedThreads: Set<string>;
  highlightedSubthreadId: string | null;
  
  // Selection
  textSelection: {
    messageId: string;
    text: string;
    start: number;
    end: number;
  } | null;
  
  // Streaming
  isStreaming: boolean;
  streamingContent: string;
  
  // Actions
  setActiveThread: (id: string) => void;
  goBack: () => void;
  toggleRightPane: () => void;
  toggleSidebar: () => void;
  toggleThreadExpanded: (id: string) => void;
  setHighlightedSubthread: (id: string | null) => void;
  setTextSelection: (selection: AppState['textSelection']) => void;
  clearTextSelection: () => void;
  setStreaming: (streaming: boolean, content?: string) => void;
  appendStreamingContent: (chunk: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  activeThreadId: null,
  navigationHistory: [],
  rightPaneOpen: false,
  sidebarOpen: true,
  expandedThreads: new Set(),
  highlightedSubthreadId: null,
  textSelection: null,
  isStreaming: false,
  streamingContent: '',
  
  // Actions
  setActiveThread: (id) => set((state) => ({
    activeThreadId: id,
    navigationHistory: [
      ...state.navigationHistory,
      { threadId: id, timestamp: Date.now() }
    ].slice(-50), // Keep last 50
    highlightedSubthreadId: null,
  })),
  
  goBack: () => {
    const { navigationHistory } = get();
    if (navigationHistory.length < 2) return;
    
    const previousThread = navigationHistory[navigationHistory.length - 2];
    set({
      activeThreadId: previousThread.threadId,
      navigationHistory: navigationHistory.slice(0, -1),
    });
  },
  
  toggleRightPane: () => set((state) => ({ 
    rightPaneOpen: !state.rightPaneOpen 
  })),
  
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),
  
  toggleThreadExpanded: (id) => set((state) => {
    const newExpanded = new Set(state.expandedThreads);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    return { expandedThreads: newExpanded };
  }),
  
  setHighlightedSubthread: (id) => set({ highlightedSubthreadId: id }),
  
  setTextSelection: (selection) => set({ textSelection: selection }),
  
  clearTextSelection: () => set({ textSelection: null }),
  
  setStreaming: (streaming, content = '') => set({ 
    isStreaming: streaming, 
    streamingContent: content 
  }),
  
  appendStreamingContent: (chunk) => set((state) => ({ 
    streamingContent: state.streamingContent + chunk 
  })),
}));
```

## 10.3 TanStack Query Setup

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// hooks/useThreads.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useRootThreads() {
  return useQuery({
    queryKey: ['threads', 'root'],
    queryFn: () => fetch('/api/threads').then(r => r.json()),
  });
}

export function useThread(threadId: string) {
  return useQuery({
    queryKey: ['threads', threadId],
    queryFn: () => fetch(`/api/threads/${threadId}`).then(r => r.json()),
    enabled: !!threadId,
  });
}

export function useCreateThread() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateThreadData) => 
      fetch('/api/threads', {
        method: 'POST',
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });
}

export function useDeleteThread() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (threadId: string) => 
      fetch(`/api/threads/${threadId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });
}

export function useUpdateThreadTitle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ threadId, title }: { threadId: string; title: string }) =>
      fetch(`/api/threads/${threadId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title }),
      }),
    onMutate: async ({ threadId, title }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['threads', threadId] });
      const previous = queryClient.getQueryData(['threads', threadId]);
      queryClient.setQueryData(['threads', threadId], (old: any) => ({
        ...old,
        thread: { ...old.thread, title },
      }));
      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['threads', variables.threadId], context?.previous);
    },
  });
}
```

---

# 11. LLM Integration

## 11.1 Vercel AI SDK Setup

```typescript
// lib/ai.ts
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

export const models = {
  'gpt-4.1': openai('gpt-4.1'),
  'claude-opus-4.5': anthropic('claude-opus-4-5-20251101'),
  'gemini-3-pro': google('gemini-3-pro'),
} as const;

export type ModelId = keyof typeof models;
```

## 11.2 Streaming Response Handler

```typescript
// app/api/threads/[id]/messages/route.ts
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { models, ModelId } from '@/lib/ai';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { content, modelId = 'claude-opus-4.5' } = await req.json();
  const threadId = params.id;
  
  // Get thread context
  const context = await buildThreadContext(threadId);
  
  // Save user message
  const userMessage = await saveMessage(threadId, 'user', content);
  
  const result = await streamText({
    model: models[modelId as ModelId],
    system: context.systemPrompt,
    messages: context.messages,
    tools: {
      createSubthread: tool({
        description: 'Create a subthread to explore a topic in depth',
        parameters: z.object({
          anchorText: z.string().describe('Text to anchor the subthread to'),
          subthreadContent: z.string().describe('Initial content for subthread'),
          reason: z.string().describe('Why this deserves a separate thread'),
        }),
        execute: async ({ anchorText, subthreadContent, reason }) => {
          return { anchorText, subthreadContent, reason };
        },
      }),
    },
    onFinish: async ({ text, toolCalls }) => {
      await saveMessage(threadId, 'assistant', text);
      
      for (const call of toolCalls || []) {
        if (call.toolName === 'createSubthread') {
          await processSubthreadCreation(threadId, text, call.args);
        }
      }
      
      await maybeGenerateTitle(threadId);
      await generateEmbedding(userMessage.id, content);
    },
  });
  
  return result.toDataStreamResponse();
}
```

---

# 12. Context Management

## 12.1 Context Building Strategy

For MVP, context is built from:
1. Parent thread summary (if subthread)
2. Anchor text that spawned the subthread
3. First message of the subthread
4. All subsequent messages in current thread

```typescript
// lib/context.ts
interface ThreadContext {
  systemPrompt: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}

async function buildThreadContext(threadId: string): Promise<ThreadContext> {
  const thread = await getThread(threadId);
  const messages = await getMessages(threadId);
  
  let systemPrompt = BASE_SYSTEM_PROMPT;
  
  if (thread.parentThreadId) {
    const parent = await getThread(thread.parentThreadId);
    const anchorMessage = await getMessage(thread.anchorMessageId);
    const anchorText = anchorMessage.content.slice(
      thread.anchorStart, 
      thread.anchorEnd
    );
    
    systemPrompt += `\n\n## Context from Parent Thread
**Parent Thread Summary:** ${parent.summary || 'No summary available'}

**This subthread was created to explore:** "${anchorText}"

Please continue the discussion focused on this specific topic.`;
  }
  
  systemPrompt += SUBTHREAD_GUIDELINES;
  
  return {
    systemPrompt,
    messages: messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  };
}
```

## 12.2 Summary Generation

```typescript
async function generateThreadSummary(threadId: string): Promise<string> {
  const messages = await getMessages(threadId);
  
  const result = await generateText({
    model: models['claude-opus-4.5'],
    system: 'Create concise 2-3 sentence summaries.',
    prompt: `Summarize this conversation:
${messages.map(m => `${m.role}: ${m.content}`).join('\n\n')}`,
  });
  
  await updateThread(threadId, { summary: result.text });
  return result.text;
}
```

---

# 13. AI Subthread Creation

## 13.1 Tool Definition

```typescript
const createSubthreadTool = tool({
  description: `Create a subthread when a topic deserves deeper exploration 
but would disrupt the main narrative flow.`,
  parameters: z.object({
    anchorText: z.string()
      .describe('Exact text from your response to anchor the subthread'),
    subthreadContent: z.string()
      .describe('Detailed content for the subthread'),
    subthreadTitle: z.string()
      .describe('Short title for the subthread (5-10 words)'),
  }),
});
```

## 13.2 Processing Tool Calls

```typescript
async function processSubthreadCreation(
  parentThreadId: string,
  aiMessageContent: string,
  toolArgs: {
    anchorText: string;
    subthreadContent: string;
    subthreadTitle: string;
  }
) {
  const { anchorText, subthreadContent, subthreadTitle } = toolArgs;
  
  const anchorStart = aiMessageContent.indexOf(anchorText);
  if (anchorStart === -1) return null;
  const anchorEnd = anchorStart + anchorText.length;
  
  const messages = await getMessages(parentThreadId);
  const aiMessage = messages[messages.length - 1];
  
  const subthread = await db.insert(threads).values({
    userId: aiMessage.userId,
    parentThreadId,
    anchorMessageId: aiMessage.id,
    anchorStart,
    anchorEnd,
    title: subthreadTitle,
  }).returning();
  
  await db.insert(messages).values({
    threadId: subthread[0].id,
    role: 'assistant',
    content: subthreadContent,
    position: 0,
  });
  
  await pusher.trigger(`thread-${parentThreadId}`, 'subthread-created', {
    subthreadId: subthread[0].id,
    anchorMessageId: aiMessage.id,
    anchorStart,
    anchorEnd,
    title: subthreadTitle,
  });
  
  return subthread[0];
}
```

---

# 14. Search Implementation

## 14.1 Embedding Generation

```typescript
import { embed } from 'ai';
import { openai } from './ai';

async function generateEmbedding(messageId: string, content: string) {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: content,
  });
  
  await db.insert(messageEmbeddings).values({
    messageId,
    embedding,
  });
}
```

## 14.2 Semantic Search

```typescript
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  const userId = await getCurrentUserId();
  
  if (!query) return Response.json({ results: [] });
  
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: query,
  });
  
  const results = await db.execute(sql`
    SELECT 
      m.id as message_id,
      m.content,
      m.thread_id,
      t.title as thread_title,
      1 - (e.embedding <=> ${embedding}::vector) as similarity
    FROM message_embeddings e
    JOIN messages m ON e.message_id = m.id
    JOIN threads t ON m.thread_id = t.id
    WHERE t.user_id = ${userId}
    ORDER BY e.embedding <=> ${embedding}::vector
    LIMIT 20
  `);
  
  return Response.json({ results });
}
```

---

# 15. Real-time Sync

## 15.1 Pusher Setup

```typescript
// lib/pusher.ts
import Pusher from 'pusher';
import PusherClient from 'pusher-js';

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER! }
);
```

## 15.2 Client Subscription

```typescript
export function useRealtimeSync(userId: string) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = pusherClient.subscribe(`user-${userId}`);
    
    channel.bind('thread-created', () => {
      queryClient.invalidateQueries({ queryKey: ['threads', 'root'] });
    });
    
    channel.bind('thread-updated', (data: { thread: Thread }) => {
      queryClient.invalidateQueries({ queryKey: ['threads', data.thread.id] });
    });
    
    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`user-${userId}`);
    };
  }, [userId, queryClient]);
}
```

---

# 16. Authentication

## 16.1 Clerk Setup

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/app(.*)', '/api(.*)']);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});
```

## 16.2 User Sync via Webhook

```typescript
// app/api/webhooks/clerk/route.ts
export async function POST(req: Request) {
  const evt = await verifyWebhook(req);
  
  if (evt.type === 'user.created') {
    await db.insert(users).values({
      id: evt.data.id,
      email: evt.data.email_addresses[0]?.email_address,
      name: `${evt.data.first_name} ${evt.data.last_name}`.trim(),
    });
  }
  
  return new Response('OK');
}
```

---

# 17. Error Handling

## 17.1 Error Types

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, 'NOT_FOUND', 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super('Unauthorized', 'UNAUTHORIZED', 401);
  }
}
```

## 17.2 API Error Handler

```typescript
export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.statusCode }
        );
      }
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
```

---

# 18. Performance Considerations

## 18.1 Query Optimization

```sql
-- Core indexes
CREATE INDEX idx_threads_user_updated ON threads(user_id, updated_at DESC);
CREATE INDEX idx_threads_parent ON threads(parent_thread_id);
CREATE INDEX idx_messages_thread_position ON messages(thread_id, position);

-- Vector search index
CREATE INDEX idx_embeddings_vector ON message_embeddings 
  USING hnsw (embedding vector_cosine_ops);
```

## 18.2 Caching Strategy

- TanStack Query: 1 min stale time, 5 min cache
- Prefetch threads on hover
- Optimistic updates for UI responsiveness

## 18.3 Bundle Optimization

- Dynamic imports for heavy components
- Virtualize long message lists (react-virtual)
- Next.js Image for avatars

---

# 19. Tech Stack Summary

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14+ (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Components** | Shadcn/ui |
| **State (Client)** | Zustand |
| **State (Server)** | TanStack Query |
| **Database** | PostgreSQL (Neon) |
| **ORM** | Drizzle |
| **Vector Search** | pgvector |
| **Auth** | Clerk |
| **AI SDK** | Vercel AI SDK |
| **LLM (Primary)** | Claude Opus 4.5 |
| **Embeddings** | OpenAI text-embedding-3-small |
| **Real-time** | Pusher |
| **Deployment** | Vercel |

## Environment Variables

```bash
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...
NEXT_PUBLIC_PUSHER_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=...
PUSHER_APP_ID=...
PUSHER_SECRET=...
```

---

# 20. MVP Scope & Phasing

## Phase 1: Core MVP (4-6 weeks)

### Must Have
- User authentication (Clerk)
- Create/delete root threads
- Basic chat with AI (single model: Claude)
- Auto-generated thread titles
- Editable thread titles
- Sidebar with thread list
- User-created subthreads from AI messages (selection popup)
- User-created subthreads from own messages ([[syntax]])
- AI-created subthreads (tool calling)
- Breadcrumb navigation
- Back button (history-based)
- Right pane with subthread cards
- Anchor highlighting
- Basic context inheritance
- Light/Dark/System theme
- Mobile responsive layout
- Streaming AI responses

### Should Have
- Nested thread display in sidebar
- Thread deletion with cascade
- Thread summary generation
- Basic search

## Phase 2: Enhanced Experience (2-3 weeks)
- Semantic search with embeddings
- Hover preview on anchors
- Real-time sync (Pusher)
- Optimistic UI updates
- Message editing/deletion

## Phase 3: Polish & Scale (2-3 weeks)
- Multi-model support
- File attachments
- Usage tracking
- Performance optimization

## Phase 4: Future
- Pay-as-you-go billing
- Export (Markdown, PDF)
- Share threads
- Thread templates
- Collaboration features

---

# 21. Future Ideas

1. **Thread Templates**: Pre-structured hierarchies for common use cases
2. **Export/Share**: Markdown, PDF, shareable public links
3. **Collaboration**: Share threads, real-time editing, comments
4. **Advanced Context**: Sibling summaries, cross-thread retrieval
5. **AI Enhancements**: Configurable autonomy, suggested subthreads
6. **Organization**: Folders, tags, pinned threads, archive
7. **Rich Content**: Image generation, code execution, diagrams
8. **Integrations**: Notion, Google Docs, webhooks

---

# Appendix A: File Structure

```
rather/
├── app/
│   ├── (auth)/sign-in/, sign-up/
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── thread/[id]/page.tsx
│   ├── api/
│   │   ├── threads/
│   │   ├── search/
│   │   ├── user/
│   │   └── webhooks/clerk/
│   └── globals.css
├── components/
│   ├── ui/          # Shadcn
│   ├── layout/      # Sidebar, Header, RightPane
│   ├── thread/      # ThreadItem, Breadcrumb
│   ├── message/     # MessageBubble, Input
│   └── subthread/   # Card, Popup
├── hooks/
├── stores/
├── lib/
├── db/
├── types/
└── middleware.ts
```

---

# Appendix B: Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift + Enter` | New line |
| `Ctrl/Cmd + K` | Search |
| `Ctrl/Cmd + N` | New thread |
| `Ctrl/Cmd + B` | Toggle sidebar |
| `Ctrl/Cmd + \` | Toggle right pane |
| `Escape` | Close popup |
| `Ctrl/Cmd + [` | Go back |

---

# Appendix C: Glossary

| Term | Definition |
|------|------------|
| **Thread** | A linear conversation between user and AI |
| **Root Thread** | A top-level thread with no parent |
| **Subthread** | A thread spawned from an anchor in a parent |
| **Anchor** | Highlighted text that spawns a subthread |
| **Breadcrumb** | Navigation path showing thread hierarchy |
| **Streaming** | Real-time delivery of AI response |

---

*End of Specification Document*

**Version**: 1.0  
**Last Updated**: December 2025  
**Status**: Ready for Development