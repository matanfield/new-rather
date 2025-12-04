import { create } from 'zustand';
import type { Thread, Message } from '@/db/schema';

interface NavigationHistory {
  threadId: string;
  timestamp: number;
}

// For optimistic UI when creating subthreads
interface NewSubthreadState {
  thread: Thread;
  userMessage: Message;
}

interface AppState {
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Right Pane
  rightPaneOpen: boolean;
  toggleRightPane: () => void;
  setRightPaneOpen: (open: boolean) => void;

  // Navigation
  activeThreadId: string | null;
  navigationHistory: NavigationHistory[];
  setActiveThread: (id: string | null) => void;
  goBack: () => void;
  canGoBack: () => boolean;

  // UI State
  expandedThreads: Set<string>;
  toggleThreadExpanded: (id: string) => void;
  highlightedSubthreadId: string | null;
  setHighlightedSubthread: (id: string | null) => void;

  // Text Selection (for creating subthreads)
  textSelection: {
    messageId: string;
    text: string;
    start: number;
    end: number;
  } | null;
  setTextSelection: (selection: AppState['textSelection']) => void;
  clearTextSelection: () => void;

  // Streaming
  isStreaming: boolean;
  streamingContent: string;
  setStreaming: (streaming: boolean, content?: string) => void;
  appendStreamingContent: (chunk: string) => void;

  // Subthread streaming (for right pane)
  newSubthread: NewSubthreadState | null;
  subthreadStreamingId: string | null;
  subthreadStreamingContent: string;
  setNewSubthread: (state: NewSubthreadState | null) => void;
  setSubthreadStreaming: (threadId: string | null, content?: string) => void;
  appendSubthreadStreamingContent: (chunk: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Sidebar - open by default on desktop
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Right Pane - closed by default
  rightPaneOpen: false,
  toggleRightPane: () => set((state) => ({ rightPaneOpen: !state.rightPaneOpen })),
  setRightPaneOpen: (open) => set({ rightPaneOpen: open }),

  // Navigation
  activeThreadId: null,
  navigationHistory: [],
  setActiveThread: (id) =>
    set((state) => {
      if (id === null) {
        return { activeThreadId: null };
      }
      return {
        activeThreadId: id,
        navigationHistory: [
          ...state.navigationHistory,
          { threadId: id, timestamp: Date.now() },
        ].slice(-50), // Keep last 50
        highlightedSubthreadId: null,
      };
    }),
  goBack: () => {
    const { navigationHistory } = get();
    if (navigationHistory.length < 2) return;

    const newHistory = navigationHistory.slice(0, -1);
    const previousThread = newHistory[newHistory.length - 1];

    set({
      activeThreadId: previousThread?.threadId ?? null,
      navigationHistory: newHistory,
    });
  },
  canGoBack: () => get().navigationHistory.length >= 2,

  // UI State
  expandedThreads: new Set(),
  toggleThreadExpanded: (id) =>
    set((state) => {
      const newExpanded = new Set(state.expandedThreads);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return { expandedThreads: newExpanded };
    }),
  highlightedSubthreadId: null,
  setHighlightedSubthread: (id) => set({ highlightedSubthreadId: id }),

  // Text Selection
  textSelection: null,
  setTextSelection: (selection) => set({ textSelection: selection }),
  clearTextSelection: () => set({ textSelection: null }),

  // Streaming
  isStreaming: false,
  streamingContent: '',
  setStreaming: (streaming, content = '') =>
    set({ isStreaming: streaming, streamingContent: content }),
  appendStreamingContent: (chunk) =>
    set((state) => ({ streamingContent: state.streamingContent + chunk })),

  // Subthread streaming (for right pane)
  newSubthread: null,
  subthreadStreamingId: null,
  subthreadStreamingContent: '',
  setNewSubthread: (state) => set({ newSubthread: state }),
  setSubthreadStreaming: (threadId, content = '') =>
    set({ subthreadStreamingId: threadId, subthreadStreamingContent: content }),
  appendSubthreadStreamingContent: (chunk) =>
    set((state) => ({ subthreadStreamingContent: state.subthreadStreamingContent + chunk })),
}));
