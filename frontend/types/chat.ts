export interface createChatRequest {
  content: string;
}

export interface createChatResponse {
  sessionId: number;
  messageId: number;
}

export interface sendMessageRequest {
  sessionId: number;
  content: string;
}

export interface sendMessageResponse {
  messageId: number;
}
