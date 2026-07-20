import { create } from "zustand";

// AI 답변 스트림 상태
interface StreamEntry {
  content: string;
  riskTypeCode: string | null;
  riskTypeName: string | null;
  status: "connecting" | "streaming" | "done" | "error";
  errorMessage: string | null;
}

// 초기 스트림 상태 설정
const DEFAULT_STREAM_ENTRY: StreamEntry = {
  content: "",
  riskTypeCode: null,
  riskTypeName: null,
  status: "connecting",
  errorMessage: null,
};

// 채팅 스트림 상태
interface ChatStreamState {
  streams: Record<number, StreamEntry>;

  // Actions
  setStream: (sessionId: number, entry: Partial<StreamEntry>) => void;
  clearStream: (sessionId: number) => void;
}

export const useChatStreamStore = create<ChatStreamState>((set) => ({
  streams: {},
  setStream: (sessionId, entry) =>
    set((state) => ({
      streams: {
        ...state.streams,
        //기본값 → 기존 세션 값 → 새로 들어온 값 순으로 덮어쓰기
        [sessionId]: {
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
