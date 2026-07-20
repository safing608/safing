// 대화 목록 조회
export interface getChatListItem {
  sessionId: number;
  title: string | null;
}

export type getChatListResponse = getChatListItem[];

// 대화 조회
export interface getChatItem {
  messageId: number;
  status: string;
  role: string;
  content: string | null;
  riskTypeName: string | null;
}

export type getChatResponse = getChatItem[];

// 대화 생성
export interface createChatRequest {
  content: string;
}

export interface createChatResponse {
  sessionId: number;
  messageId: number;
}
// 대화 삭제
export interface deleteChatRequest {
  sessionId: number;
}

// 메시지 전송
export interface sendMessageRequest {
  sessionId: number;
  content: string;
}

export interface sendMessageResponse {
  messageId: number;
}

// 기존 대화에 질문 전송
export interface sendQuestionRequest {
  sessionId: number;
  content: string;
}

export interface sendQuestionResponse {
  messageId: number;
}

// AI 답변 스트림

export type streamEvent = "riskType" | "message" | "complete" | "error";

export interface riskTypeEventResponse {
  riskTypeCode: string;
  riskTypeName: string;
}

export interface MessageEventResponse {
  content: string;
}

export interface CompleteEventResponse {
  title: string;
  riskTypeCode: string;
  riskTypeName: string;
  answer: string;
}

export interface ErrorEventResponse {
  code: string;
  message: string;
  sessionId: number;
  messageId: number;
}
