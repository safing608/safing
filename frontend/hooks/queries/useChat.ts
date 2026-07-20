import {
  createChat,
  deleteChat,
  getChat,
  getChatList,
  sendQuestion,
} from "@/api/chat";
import queryClient from "@/api/client";
import { chatKeys } from "@/constants/queryKeys";
import {
  createChatResponse,
  getChatListResponse,
  sendQuestionRequest,
  sendQuestionResponse
} from "@/types/chat";
import { appendMessageToCache } from "@/utils/chatCache";
import { startChatStream } from "@/utils/chatStreamManager";
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
  });
}

// 새 대화방 생성
export function useCreateChat() {
  return useMutation({
    mutationFn: createChat,
    onSuccess: (data: createChatResponse) => {
      // 방법 1. invalidate 로 캐시 갱신
      // queryClient.invalidateQueries({ queryKey: chatKeys.sessionList() });
      // queryClient.invalidateQueries({
      //   queryKey: chatKeys.session(data.sessionId),
      // });
      // 방법 2. invalidate 대신 캐시 갱신 — 불필요한 GET /chats 중복 방지
      queryClient.setQueryData<getChatListResponse>(
        chatKeys.sessionList(),
        (prev) => {
          const list = prev ?? [];
          if (list.some((item) => item.sessionId === data.sessionId)) {
            return list;
          }
          return [{ sessionId: data.sessionId, title: null }, ...list];
        },
      );

      startChatStream(data.sessionId, data.messageId);

      router.push(`/chat/${data.sessionId}`);
    },
    onError: (error) => {
      dev.error(error);
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

      router.push("/chat");
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

// 기존 대화에 질문 전송
export function useSendQuestion() {
  return useMutation({
    mutationFn: (payload: sendQuestionRequest) => sendQuestion(payload),
    onSuccess: (data: sendQuestionResponse, payload: sendQuestionRequest) => {
      appendMessageToCache(payload.sessionId, {
        messageId: -Date.now(), // 임시 messageId
        role: "USER",
        status: "DONE",
        riskTypeName: null,
        content: payload.content,
      });

      startChatStream(payload.sessionId, data.messageId);
      
    },
    onError: (error) => {
      dev.error(error);
    },
  });
}
