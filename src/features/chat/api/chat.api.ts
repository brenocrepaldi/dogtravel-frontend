import api, { isApiConfigured } from "@/services/api";

export interface ChatMsg {
  id: string;
  senderId: string;
  text: string;
  sentAt: string;
  read: boolean;
}

// The in-memory mock lives in chat.mock.ts and is loaded dynamically so it
// (and mock-data) never reaches the client bundle when a real API is configured.
export const ChatApi = {
  getMessages: async (walkId: string): Promise<ChatMsg[]> => {
    if (!isApiConfigured) {
      const { chatMock } = await import("./chat.mock");
      return chatMock.getMessages(walkId);
    }
    return api
      .get<ChatMsg[]>(`/walks/${walkId}/messages`)
      .then((r) => r.data);
  },

  sendMessage: async (walkId: string, senderId: string, text: string): Promise<ChatMsg> => {
    if (!isApiConfigured) {
      const { chatMock } = await import("./chat.mock");
      return chatMock.sendMessage(walkId, senderId, text);
    }
    return api
      .post<ChatMsg>(`/walks/${walkId}/messages`, { senderId, text })
      .then((r) => r.data);
  },
};
