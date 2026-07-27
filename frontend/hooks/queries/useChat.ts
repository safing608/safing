import {
  createChat,
  deleteChat,
  getChat,
  getChatList,
  retryQuestion,
  sendQuestion,
} from "@/api/chat";
import queryClient from "@/api/client";
import { chatKeys } from "@/constants/queryKeys";
import {
  createChatResponse,
  getChatListResponse,
  retryQuestionRequest,
  sendQuestionRequest,
  sendQuestionResponse,
} from "@/types/chat";
import {
  appendMessageToCache,
  clearMessageErrorInCache,
  removeMessageFromCache,
  setMessageErrorInCache,
  updateMessageInCache,
} from "@/utils/chatCache";
import { startChatStream } from "@/utils/chatStreamManager";
import { useChatStreamStore } from "@/stores/chatStreamStore";
import { dev } from "@/utils/dev";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { t } from "i18next";
import Toast from "react-native-toast-message";

// 대화 목록 조회
export function useGetChatList(enabled = true) {
  return useQuery({
    queryFn: getChatList,
    queryKey: chatKeys.sessionList(),
    enabled,
  });
}

// 대화 조회
export function useGetChat(sessionId: number) {
  return useQuery({
    queryFn: () => getChat(sessionId),
    queryKey: chatKeys.session(sessionId),
    enabled: !!sessionId,
    // 낙관적 업데이트 / SSE 캐시를 불필요하게 덮어쓰지 않음 -> 화면 전환 시 데이터 어긋날 가능성 막음
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

// 새 대화방 생성
export function useCreateChat() {
  return useMutation({
    mutationFn: createChat,
    onSuccess: (data: createChatResponse, variables) => {
      queryClient.setQueryData<getChatListResponse>(
        chatKeys.sessionList(),
        (prev) => {
          const list = prev ?? [];
          // 중복 추가 방어
          if (list.some((item) => item.sessionId === data.sessionId)) {
            return list;
          }
          return [{ sessionId: data.sessionId, title: null }, ...list];
        },
      );

      const userMessageId = -Date.now();
      // 진입 전 캐시 시드 — 마운트 직후 GET이 낙관적 UI를 덮지 않도록
      queryClient.setQueryData(chatKeys.session(data.sessionId), [
        {
          messageId: userMessageId,
          role: "USER",
          status: "DONE",
          riskTypeName: null,
          content: variables.content,
          errorMessage: null,
        },
      ]);

      // SSE 연결
      startChatStream(data.sessionId, data.messageId, {
        userMessageId,
        userContent: variables.content,
      });

      router.push(`/chat/${data.sessionId}`);
    },
    onError: (error) => {
      dev.error(error);
      Toast.show({
        text1: t("error.default_error"),
        type: "error",
      });
    },
  });
}

// 대화 삭제
export function useDeleteChat() {
  return useMutation({
    mutationFn: (sessionId: number) => deleteChat(sessionId),
    onSuccess: (_, sessionId: number) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.sessionList() });
      queryClient.removeQueries({ queryKey: chatKeys.session(sessionId) });
      queryClient.removeQueries({ queryKey: chatKeys.messages(sessionId) });

      Toast.show({
        text1: t("chat.delete_chat_success"),
        type: "success",
      });

      router.replace("/chat");
    },
    onError: (error) => {
      dev.error("대화 삭제 실패", error);
      Toast.show({
        text1: t("chat.delete_chat_failed"),
        type: "error",
      });
    },
  });
}

type SendQuestionVariables = sendQuestionRequest & {
  /** 재시도 시 기존 유저 메시지 ID 재사용 */
  tempMessageId?: number;
};

// 기존 대화에 질문 전송
export function useSendQuestion() {
  return useMutation({
    mutationFn: ({ tempMessageId: _, ...payload }: SendQuestionVariables) =>
      sendQuestion(payload),
    // 낙관적 업데이트
    onMutate: async (variables) => {
      const tempMessageId = variables.tempMessageId ?? -Date.now();
      const prevStream =
        useChatStreamStore.getState().streams[variables.sessionId];

      // stop/에러 후 재시도: 이전에 남긴 assistant 부분 답변 제거
      if (prevStream?.assistantMessageId != null) {
        removeMessageFromCache(
          variables.sessionId,
          prevStream.assistantMessageId,
        );
      }

      // 재시도인 경우
      if (variables.tempMessageId) {
        clearMessageErrorInCache(variables.sessionId, tempMessageId);
        updateMessageInCache(variables.sessionId, tempMessageId, {
          content: variables.content,
          status: "DONE",
        });
      } else {
        // 신규 전송인 경우: 새 유저 메시지 추가
        appendMessageToCache(variables.sessionId, {
          messageId: tempMessageId,
          role: "USER",
          status: "DONE",
          riskTypeName: null,
          content: variables.content,
          errorMessage: null,
        });
      }

      useChatStreamStore.getState().setStream(variables.sessionId, {
        lastUserContent: variables.content,
        userMessageId: tempMessageId,
        status: "connecting",
        errorMessage: null,
        errorType: null,
        content: "",
        riskTypeCode: null,
        riskTypeName: null,
        assistantMessageId: null,
      });

      return { tempMessageId };
    },
    onSuccess: (
      data: sendQuestionResponse,
      payload: SendQuestionVariables,
      context,
    ) => {
      const userMessageId = context?.tempMessageId ?? -Date.now();
      const current = useChatStreamStore.getState().streams[payload.sessionId];

      // POST 대기 중 사용자가 stop 한 경우 스트림 시작하지 않음
      if (current?.status === "stopped") {
        return;
      }

      startChatStream(payload.sessionId, data.messageId, {
        userMessageId,
        userContent: payload.content,
      });
    },
    onError: (error, payload, context) => {
      dev.error(error);
      const errorMessage = t("error.default_error");
      const userMessageId = context?.tempMessageId;

      if (userMessageId != null) {
        setMessageErrorInCache(payload.sessionId, userMessageId, errorMessage);
      }

      useChatStreamStore.getState().setStream(payload.sessionId, {
        status: "error",
        errorType: "USER",
        errorMessage,
        userMessageId: userMessageId ?? null,
        lastUserContent: payload.content,
        content: "",
        assistantMessageId: null,
        riskTypeCode: null,
        riskTypeName: null,
      });
    },
  });
}

// 재연결
export function useRetryQuestion() {
  return useMutation({
    mutationFn: (payload: retryQuestionRequest) => retryQuestion(payload),
    onMutate: (payload) => {
      // 이전 부분 답변/에러 내용 지우고 스트림 버블만 표시
      updateMessageInCache(payload.sessionId, payload.messageId, {
        errorMessage: null,
        status: "PROCESSING",
        content: null,
        riskTypeName: null,
      });

      const prev = useChatStreamStore.getState().streams[payload.sessionId];
      useChatStreamStore.getState().setStream(payload.sessionId, {
        status: "connecting",
        errorMessage: null,
        errorType: null,
        content: "",
        riskTypeCode: null,
        riskTypeName: null,
        assistantMessageId: payload.messageId,
        userMessageId: prev?.userMessageId ?? null,
        lastUserContent: prev?.lastUserContent ?? null,
      });
    },
    onSuccess: (_data, payload) => {
      const stream = useChatStreamStore.getState().streams[payload.sessionId];

      // stop 된 경우 스트림 시작하지 않음
      if (stream?.status === "stopped") {
        return;
      }

      startChatStream(payload.sessionId, payload.messageId, {
        force: true,
        userMessageId: stream?.userMessageId ?? undefined,
        userContent: stream?.lastUserContent ?? undefined,
      });
    },
    onError: (error, payload) => {
      dev.error(error);
      const errorMessage = t("error.stream_failed");
      setMessageErrorInCache(payload.sessionId, payload.messageId, errorMessage);
      useChatStreamStore.getState().setStream(payload.sessionId, {
        status: "error",
        errorType: "ASSISTANT",
        errorMessage,
        assistantMessageId: payload.messageId,
        content: "",
      });
    },
  });
}