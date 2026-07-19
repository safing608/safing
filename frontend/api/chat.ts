import {
  createChatRequest,
  createChatResponse,
  getChatListResponse,
  getChatResponse,
  sendQuestionRequest
} from "@/types/chat";
import { dev } from "@/utils/dev";
import axiosInstance from "./axios";

// 대화 목록 조회
export async function getChatList(): Promise<getChatListResponse> {
  const response = await axiosInstance.get("/chats");
  return response?.data?.data;
}

// 대화 조회
export async function getChat(sessionId: number): Promise<getChatResponse> {
  dev.log("sessionId", sessionId);
  const response = await axiosInstance.get(`/chats/${sessionId}`);
  return response?.data?.data;
}

// 새 대화 시작
export async function createChat(
  payload: createChatRequest,
): Promise<createChatResponse> {
  const response = await axiosInstance.post("/chats", payload);
  return response?.data?.data;
}

// 대화 삭제
export async function deleteChat(sessionId: number) {
  const response = await axiosInstance.delete(`/chats/${sessionId}`);
  return response?.data?.data;
}

// 기존 대화에 질문 전송
export async function sendQuestion(payload: sendQuestionRequest) {
  const response = await axiosInstance.post(`/chats/${payload.sessionId}/messages`, payload);
  return response?.data?.data;
}