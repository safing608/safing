// utils/chatCache.ts
import queryClient from "@/api/client";
import { chatKeys } from "@/constants/queryKeys";
import { getChatResponse } from "@/types/chat";

type ChatMessage = {
  messageId: number;
  role: "USER" | "ASSISTANT";
  status: "DONE";
  riskTypeName: string | null;
  content: string;
};

// 메시지 추가
export function appendMessageToCache(
  sessionId: number,
  message: ChatMessage,
) {
  queryClient.setQueryData<getChatResponse>(
    chatKeys.session(sessionId),
    (prev) => [...(prev ?? []), message],
  );
}

// messageId가 이미 있으면 그 자리에서 교체, 없으면 추가
export function upsertMessageInCache(sessionId: number, message: ChatMessage) {
  queryClient.setQueryData<getChatResponse>(
    chatKeys.session(sessionId),
    (prev) => {
      const list = prev ?? [];
      const index = list.findIndex((item) => item.messageId === message.messageId);

      if (index === -1) {
        return [...list, message];
      }

      const next = [...list];
      next[index] = message;
      return next;
    },
  );
}
