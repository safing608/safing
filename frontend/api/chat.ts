import { createChatRequest, createChatResponse } from "@/types/chat";
import axiosInstance from "./axios";

export default async function createChat(
  payload: createChatRequest,
): Promise<createChatResponse> {
  const response = await axiosInstance.post("/api/chat", payload);
  return response?.data?.data;
}
