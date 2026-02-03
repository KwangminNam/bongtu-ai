import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

interface ChatState {
  messages: Message[];
  addMessage: (message: Omit<Message, "createdAt">) => void;
  updateLastAssistantMessage: (content: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],

      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            { ...message, createdAt: Date.now() },
          ],
        })),

      updateLastAssistantMessage: (content) =>
        set((state) => {
          const messages = [...state.messages];
          const lastIndex = messages.length - 1;
          if (lastIndex >= 0 && messages[lastIndex].role === "assistant") {
            messages[lastIndex] = { ...messages[lastIndex], content };
          }
          return { messages };
        }),

      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: "chat-history",
    }
  )
);
