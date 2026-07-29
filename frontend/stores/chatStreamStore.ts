import { StreamEntry } from "@/types/sse";
import { create } from "zustand";

const DEFAULT_STREAM_ENTRY: StreamEntry = {
  content: "",
  riskTypeCode: null,
  riskTypeName: null,
  status: "connecting",
  errorMessage: null,
  errorType: null,
  assistantMessageId: null,
  userMessageId: null,
  lastUserContent: null,
};

interface ChatStreamState {
  streams: Record<number, StreamEntry>;
  setStream: (sessionId: number, entry: Partial<StreamEntry>) => void;
  clearStream: (sessionId: number) => void;
}

export const useChatStreamStore = create<ChatStreamState>((set) => ({
  streams: {},
  setStream: (sessionId, entry) =>
    set((state) => ({
      streams: {
        ...state.streams,
        [sessionId]: {
          //기본값 → 기존 세션 값 → 새로 들어온 값 순으로 덮어쓰기
          ...DEFAULT_STREAM_ENTRY,
          ...state.streams[sessionId],
          ...entry,
        },
      },
    })),
  clearStream: (sessionId) =>
    set((state) => {
      const { [sessionId]: _, ...rest } = state.streams;
      return { streams: rest };
    }),
}));
