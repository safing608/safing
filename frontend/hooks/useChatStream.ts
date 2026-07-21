import { retryQuestion } from "@/api/chat";
import { useChatStreamStore } from "@/stores/chatStreamStore";
import { startChatStream, stopChatStream } from "@/utils/chatStreamManager";

export function useChatStream(sessionId: number) {
  const stream = useChatStreamStore((state) => state.streams[sessionId]);

  const status = stream?.status ?? "idle";
  const isStreaming = status === "connecting" || status === "streaming";
  const hasError = status === "error" || status === "stopped";

  return {
    content: stream?.content ?? "",
    riskTypeCode: stream?.riskTypeCode ?? null,
    riskTypeName: stream?.riskTypeName ?? null,
    status,
    isStreaming,
    hasError,
    errorType: stream?.errorType ?? null,
    errorMessage: stream?.errorMessage ?? null,
    assistantMessageId: stream?.assistantMessageId ?? null,
    userMessageId: stream?.userMessageId ?? null,
    lastUserContent: stream?.lastUserContent ?? null,
    connect: (
      messageId: number,
      options?: {
        force?: boolean;
        userMessageId?: number;
        userContent?: string;
      },
    ) => startChatStream(sessionId, messageId, options),
    stop: () => stopChatStream(sessionId),
    retryAssistant: (messageId?: number) => {
      const targetMessageId = messageId ?? stream?.assistantMessageId;
      if (!targetMessageId) return;
      retryQuestion({ sessionId, messageId: targetMessageId });
    },
  };
}
