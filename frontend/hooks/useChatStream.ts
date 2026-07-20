import { useChatStreamStore } from "@/stores/chatStreamStore";
import { startChatStream } from "@/utils/chatStreamManager";

export function useChatStream(sessionId: number) {
  const stream = useChatStreamStore((state) => state.streams[sessionId]);

  const connect = (messageId: number) => startChatStream(sessionId, messageId);

  return {
    content: stream?.content ?? "",
    riskTypeCode: stream?.riskTypeCode ?? null,
    riskTypeName: stream?.riskTypeName ?? null,
    status: stream?.status ?? "idle",
    connect,
  };
}
