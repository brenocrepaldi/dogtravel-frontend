import api, { isApiConfigured } from "@/services/api";

export interface ChatMsg {
  id: string;
  senderId: string;
  text: string;
  sentAt: string;
  read: boolean;
}

// Module-level mutable store — used only when API is not configured.
// Lazily populated via dynamic import so mock-data.ts never reaches the
// client bundle when a real API is configured.
let chatStore: Record<string, ChatMsg[]> | null = null;

async function getChatStore(): Promise<Record<string, ChatMsg[]>> {
  if (!chatStore) {
    const { chatMessagesByWalk } = await import("@/lib/mock-data");
    chatStore = Object.fromEntries(
      Object.entries(chatMessagesByWalk).map(([k, v]) => [k, [...v]])
    );
  }
  return chatStore;
}

export const ChatApi = {
  getMessages: async (walkId: string): Promise<ChatMsg[]> => {
    if (!isApiConfigured) {
      const store = await getChatStore();
      return [...(store[walkId] ?? [])];
    }
    return api
      .get<ChatMsg[]>(`/walks/${walkId}/messages`)
      .then((r) => r.data);
  },

  sendMessage: async (walkId: string, senderId: string, text: string): Promise<ChatMsg> => {
    if (!isApiConfigured) {
      const store = await getChatStore();
      const msg: ChatMsg = {
        id: crypto.randomUUID(),
        senderId,
        text,
        sentAt: new Date().toISOString(),
        read: false,
      };
      store[walkId] = [...(store[walkId] ?? []), msg];
      return msg;
    }
    return api
      .post<ChatMsg>(`/walks/${walkId}/messages`, { senderId, text })
      .then((r) => r.data);
  },
};
