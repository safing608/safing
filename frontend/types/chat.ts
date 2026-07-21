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
  errorMessage?: string | null;
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

// 기존 대화에 질문 전송
export interface sendQuestionRequest {
  sessionId: number;
  content: string;
}

export interface sendQuestionResponse {
  messageId: number;
}

// 질문 재전송
export interface retryQuestionRequest {
  sessionId: number;
  messageId: number;
}

export interface retryQuestionResponse {
  messageId: number;
}
