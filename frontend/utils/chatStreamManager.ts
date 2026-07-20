import queryClient from "@/api/client";
import { chatKeys } from "@/constants/queryKeys";
import { useAuthStore } from "@/stores/authStore";
import { useChatStreamStore } from "@/stores/chatStreamStore";
import {
  CompleteEventResponse,
  ErrorEventResponse,
  MessageEventResponse,
  riskTypeEventResponse,
} from "@/types/chat";
import EventSource from "react-native-sse";
import { dev } from "./dev";
import { t } from "i18next";
import { appendMessageToCache, upsertMessageInCache } from "./chatCache";

const activeConnections = new Map<number, EventSource>();

export const startChatStream = (sessionId: number, messageId: number) => {
  // 이미 연결이 되어있으면 재연결 X
  if (activeConnections.has(sessionId)) return;

  dev.log("SSE 연결 생성 시도", sessionId, messageId);

  const { setStream, clearStream } = useChatStreamStore.getState();
  const accessToken = useAuthStore.getState().accessToken;

  // SSE 연결 생성
  const es = new EventSource(
    `${process.env.EXPO_PUBLIC_API_URL}/chats/${sessionId}/messages/${messageId}/stream`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  // 연결 관리
  activeConnections.set(sessionId, es);

  setStream(sessionId, {
    content: "",
    status: "connecting",
    errorMessage: null,
    riskTypeCode: null,
    riskTypeName: null,
  });

  let buffer = "";

  // 위험 유형 이벤트 처리
  es.addEventListener("riskType" as any, (event: any) => {
    dev.log("위험 유형 이벤트 처리", event.data);
    const payload: riskTypeEventResponse = JSON.parse(event.data ?? "{}");
    setStream(sessionId, {
      riskTypeCode: payload.riskTypeCode,
      riskTypeName: payload.riskTypeName,
      status: "streaming",
    });
  });

  // 메시지 이벤트 처리
  es.addEventListener("message" as any, (event: any) => {
    dev.log("메시지 이벤트 처리", event.data);
    const payload: MessageEventResponse = JSON.parse(event.data ?? "{}");
    dev.log("메시지 이벤트 페이로드", payload);
    buffer += payload.content;
    setStream(sessionId, { content: buffer });
  });

  // 완료 이벤트 처리
  es.addEventListener("complete" as any, (event: any) => {
    dev.log("완료 이벤트 처리", event.data);
    const payload: CompleteEventResponse = JSON.parse(event.data ?? "{}");
    dev.log("완료 이벤트 페이로드", payload);
    upsertMessageInCache(sessionId, {
      messageId,
      status: "DONE",
      role: "ASSISTANT",
      riskTypeName: payload.riskTypeName,
      content: payload.answer,
    });

    queryClient.invalidateQueries({ queryKey: chatKeys.sessionList() });

    // 연결 종료
    es.close();
    activeConnections.delete(sessionId);
    clearStream(sessionId);
  });

  // 에러 이벤트 처리
  es.addEventListener("error" as any, (event: any) => {
    dev.log("에러 이벤트 처리", event.data);
    let errorMessage = t("error.default_error");
    try {
      const payload: ErrorEventResponse = JSON.parse(event.data ?? "{}");
      errorMessage = payload.message;
    } catch (error) {
      dev.error(error);
    }
    setStream(sessionId, { errorMessage: errorMessage, status: "error" });
    es.close();
    activeConnections.delete(sessionId);
  });
};

// 채팅 스트림 종료 (사용자 채팅 종료 시)
export function stopChatStream(sessionId: number) {
  activeConnections.get(sessionId)?.close();
  activeConnections.delete(sessionId);
}
