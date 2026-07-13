import createChat from "@/api/chat";
import queryClient from "@/api/client";
import { chatKeys } from "@/constants/queryKeys";
import { createChatResponse } from "@/types/chat";
import { dev } from "@/utils/dev";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";

export function useCreateChat() {
  return useMutation({
    mutationFn: createChat,
    onSuccess: (data: createChatResponse) => {
      // 새 대화방으로 이동
      queryClient.invalidateQueries({ queryKey: chatKeys.sessionList() });
      router.push(`/chat/${data.sessionId}`);
    },
    onError: (error) => {
      dev.error(error);
    },
  });
}
