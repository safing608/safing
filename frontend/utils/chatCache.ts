import queryClient from "@/api/client";
import { chatKeys } from "@/constants/queryKeys";
import { getChatResponse } from "@/types/chat";
import { CachedChatMessage } from "@/types/sse";

// 메시지 추가 
export function appendMessageToCache(
  sessionId: number,
  message: CachedChatMessage,
) {
  queryClient.setQueryData<getChatResponse>(
    chatKeys.session(sessionId),
    (prev) => [...(prev ?? []), message],
  );
}

// messageId가 있으면 교체, 없으면 추가 
export function upsertMessageInCache(
  sessionId: number,
  message: CachedChatMessage,
) {
  queryClient.setQueryData<getChatResponse>(
    chatKeys.session(sessionId),
    (prev) => {
      const list = prev ?? [];
      const index = list.findIndex(
        (item) => item.messageId === message.messageId,
      );

      if (index === -1) {
        return [...list, message];
      }

      const next = [...list];
      next[index] = { ...list[index], ...message };
      return next;
    },
  );
}

// 특정 메시지 부분 업데이트 
export function updateMessageInCache(
  sessionId: number,
  messageId: number,
  patch: Partial<CachedChatMessage>,
) {
  queryClient.setQueryData<getChatResponse>(
    chatKeys.session(sessionId),
    (prev) => {
      const list = prev ?? [];
      const index = list.findIndex((item) => item.messageId === messageId);
      if (index === -1) return list;

      const next = [...list];
      next[index] = { ...list[index], ...patch };
      return next;
    },
  );
}

// 유저/어시스턴트 메시지에 에러 표시
export function setMessageErrorInCache(
  sessionId: number,
  messageId: number,
  errorMessage: string,
) {
  updateMessageInCache(sessionId, messageId, {
    errorMessage,
    status: "ERROR",
  });
}

// 에러 상태 제거 
export function clearMessageErrorInCache(
  sessionId: number,
  messageId: number,
) {
  updateMessageInCache(sessionId, messageId, {
    errorMessage: null,
    status: "DONE",
  });
}
