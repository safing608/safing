export const chatKeys = {
  all: ["chat"] as const,

  // 세션(대화방) 목록
  sessionList: () => [...chatKeys.all, "sessionList"] as const,

  // 특정 세션 상세
  session: (sessionId: number) =>
    [...chatKeys.all, "session", sessionId] as const,

  // 특정 세션의 메시지 목록
  messages: (sessionId: number) =>
    [...chatKeys.all, "messages", sessionId] as const,
};
