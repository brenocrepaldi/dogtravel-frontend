import { chatMessagesByWalk } from "@/lib/mock/mock-data";
import type { ChatMsg } from "./chat.api";

// In-memory mock backend, loaded only when no real API is configured
// (see the dynamic import in chat.api.ts).
let chatStore: Record<string, ChatMsg[]> | null = null;

function getChatStore(): Record<string, ChatMsg[]> {
  if (!chatStore) {
    chatStore = Object.fromEntries(
      Object.entries(chatMessagesByWalk).map(([k, v]) => [k, [...v]])
    );
  }
  return chatStore;
}

export const chatMock = {
  getMessages: async (walkId: string): Promise<ChatMsg[]> => {
    const store = getChatStore();
    return [...(store[walkId] ?? [])];
  },

  sendMessage: async (walkId: string, senderId: string, text: string): Promise<ChatMsg> => {
    const store = getChatStore();
    const msg: ChatMsg = {
      id: crypto.randomUUID(),
      senderId,
      text,
      sentAt: new Date().toISOString(),
      read: false,
    };
    store[walkId] = [...(store[walkId] ?? []), msg];
    return msg;
  },
};
