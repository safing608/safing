import queryClient from "@/api/client";
import { chatKeys } from "@/constants/queryKeys";
import { useAuthStore } from "@/stores/authStore";
import { useChatStreamStore } from "@/stores/chatStreamStore";
import {
  CompleteEventResponse,
  ErrorEventResponse,
  MessageEventResponse,
  riskTypeEventResponse,
  StartChatStreamOptions,
  streamEvent,
} from "@/types/sse";
import { t } from "i18next";
import EventSource from "react-native-sse";
import {
  removeMessageFromCache,
  setMessageErrorInCache,
  updateMessageInCache,
  upsertMessageInCache,
} from "./chatCache";
import { dev } from "./dev";

function getStreamUrl(sessionId: number, messageId: number) {
  const baseUrl = process.env.EXPO_PUBLIC_BASE_URL?.replace(/\/$/, "");
  return `${baseUrl}/chats/${sessionId}/messages/${messageId}/stream`;
}

const activeConnections = new Map<number, EventSource<streamEvent>>();

// SSE 연결 시작
export function startChatStream(
  sessionId: number,
  messageId: number,
  options: StartChatStreamOptions = {},
) {
  const { force = false, userMessageId, userContent } = options;

  if (activeConnections.has(sessionId) && !force) {
    return;
  }

  if (activeConnections.has(sessionId)) {
    closeConnection(sessionId);
  }

  const { setStream, clearStream, streams } = useChatStreamStore.getState();
  const prev = streams[sessionId];
  const accessToken = useAuthStore.getState().accessToken;

  dev.log("accessToken 존재 여부: ", !!accessToken);

  const resolvedUserMessageId = userMessageId ?? prev?.userMessageId ?? null;
  const resolvedUserContent = userContent ?? prev?.lastUserContent ?? null;

  // 재시도/재연결 시 이전 내용 지우고 스트림 버블만 보이게
  updateMessageInCache(sessionId, messageId, {
    errorMessage: null,
    status: "PROCESSING",
    content: null,
    riskTypeName: null,
  });

  setStream(sessionId, {
    content: "",
    status: "connecting",
    errorMessage: null,
    errorType: null,
    riskTypeCode: null,
    riskTypeName: null,
    assistantMessageId: messageId,
    userMessageId: resolvedUserMessageId,
    lastUserContent: resolvedUserContent,
  });

  dev.log("SSE 연결", sessionId, messageId);

  const es = new EventSource<streamEvent>(getStreamUrl(sessionId, messageId), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  activeConnections.set(sessionId, es);

  let buffer = "";
  let settled = false;

  const failAssistant = (errorMessage: string) => {
    if (settled) return;
    settled = true;

    upsertMessageInCache(sessionId, {
      messageId,
      status: "ERROR",
      role: "ASSISTANT",
      riskTypeName: null,
      content: buffer || null,
      errorMessage,
    });

    setStream(sessionId, {
      status: "error",
      errorType: "ASSISTANT",
      errorMessage,
      content: buffer,
      assistantMessageId: messageId,
      userMessageId: resolvedUserMessageId,
      lastUserContent: resolvedUserContent,
    });

    closeConnection(sessionId);
  };

  // SSE 기본 이벤트
  es.addEventListener("open", () => {
    if (settled) return;
    setStream(sessionId, { status: "streaming" });
  });

  es.addEventListener("riskType", (event) => {
    if (settled) return;
    try {
      const payload: riskTypeEventResponse = JSON.parse(event.data ?? "{}");
      dev.log("riskType 이벤트 payload:", payload);
      setStream(sessionId, {
        riskTypeCode: payload.riskTypeCode,
        riskTypeName: payload.riskTypeName,
        status: "streaming",
      });
    } catch (error) {
      dev.error("riskType 이벤트 error: ", error);
    }
  });

  es.addEventListener("message", (event) => {
    if (settled) return;
    try {
      const payload: MessageEventResponse = JSON.parse(event.data ?? "{}");
      dev.log("message 이벤트 payload:", payload);
      buffer += payload.content ?? "";
      setStream(sessionId, { content: buffer, status: "streaming" });
    } catch (error) {
      dev.error("message 이벤트 에러: ", error);
    }
  });

  es.addEventListener("complete", (event) => {
    if (settled) return;
    settled = true;
    try {
      const payload: CompleteEventResponse = JSON.parse(event.data ?? "{}");

      dev.log("complete 이벤트 payload:", payload);

      // upsertMessageInCache(sessionId, {
      //   messageId,
      //   status: "DONE",
      //   role: "ASSISTANT",
      //   riskTypeName: payload.riskTypeName,
      //   content: payload.answer,
      //   errorMessage: null,
      // });

      const stream = useChatStreamStore.getState().streams[sessionId];

      // 완료 시 상태만 업데이트(이전 Message 내용 유지)
      upsertMessageInCache(sessionId, {
        messageId,
        status: "DONE",
        role: "ASSISTANT",
        riskTypeName: stream.riskTypeName,
        content: stream.content,
        errorMessage: null,
      });

      queryClient.invalidateQueries({ queryKey: chatKeys.sessionList() });

      closeConnection(sessionId);
      clearStream(sessionId);
    } catch (error) {
      settled = false;
      dev.error("complete 이벤트 에러:", error);
      failAssistant(t("error.stream_failed"));
    }
  });

  // 서버 event:error(JSON data) + 네트워크/연결 오류
  es.addEventListener("error", (event) => {
    if (settled) return;

    const data = (event as { data?: string | null }).data;
    if (data) {
      try {
        const payload: ErrorEventResponse = JSON.parse(data);
        dev.log("error 이벤트: ", payload.message);
        failAssistant(t("error.stream_failed"));
        return;
      } catch {}
    }

    dev.error("SSE connection error", event);
    failAssistant(t("error.stream_failed"));
  });
}

// SSE 연결 해제
function closeConnection(sessionId: number) {
  const es = activeConnections.get(sessionId);
  if (!es) return;
  es.removeAllEventListeners();
  es.close();
  activeConnections.delete(sessionId);
}

// 사용자 stop — 생성 중이던 내용이 있으면 남기고, userError 표시 후 연결 종료
export function stopChatStream(sessionId: number) {
  const { setStream, streams } = useChatStreamStore.getState();
  const stream = streams[sessionId];

  closeConnection(sessionId);

  const errorMessage = t("error.stream_stopped");
  const partialContent = stream?.content?.trim() ?? "";

  if (stream?.userMessageId != null) {
    setMessageErrorInCache(sessionId, stream.userMessageId, errorMessage);
  }

  if (stream?.assistantMessageId != null) {
    if (partialContent) {
      // 중간에 생성된 답변은 assistant 말풍선으로 유지
      upsertMessageInCache(sessionId, {
        messageId: stream.assistantMessageId,
        status: "DONE",
        role: "ASSISTANT",
        riskTypeName: stream.riskTypeName,
        content: partialContent,
        errorMessage: null,
      });
    } else {
      // 아직 내용이 없으면 PROCESSING 스텁 제거
      removeMessageFromCache(sessionId, stream.assistantMessageId);
    }
  }

  setStream(sessionId, {
    status: "stopped",
    errorType: "USER",
    errorMessage,
    content: partialContent,
    riskTypeCode: stream?.riskTypeCode ?? null,
    riskTypeName: stream?.riskTypeName ?? null,
  });
}

export function isChatStreaming(sessionId: number) {
  return activeConnections.has(sessionId);
}
