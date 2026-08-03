import { getChatItem } from "./chat";

// 스트리밍 상태 관련
export type StreamStatus =
  | "connecting"
  | "streaming"
  | "done"
  | "error"
  | "stopped";

export type StreamErrorType = "USER" | "ASSISTANT";

/** AI 답변 스트림 상태 (세션별) */
export interface StreamEntry {
  content: string;
  riskTypeCode: string | null;
  riskTypeName: string | null;
  status: StreamStatus;
  errorMessage: string | null;
  errorType: StreamErrorType | null;
  assistantMessageId: number | null; // SSE 대상 AI 메시지 ID
  userMessageId: number | null; // 낙관적 업데이트된 유저 메시지 ID
  lastUserContent: string | null; // 재시도용 마지막 유저 입력
}

export type CachedChatMessage = getChatItem & {
    errorMessage?: string | null;
    retryable?: boolean; 
  };
  
export type StartChatStreamOptions = {
  force?: boolean;
  userMessageId?: number;
  userContent?: string;
};

// SSE 이벤트 스트림
export type streamEvent = "open" | "riskType" | "message" | "complete" | "error";

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
