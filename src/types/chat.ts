export interface ChatMessage {
  id: string;
  walkId: string;
  senderId: string;
  text: string;
  sentAt: string;
  read: boolean;
}
