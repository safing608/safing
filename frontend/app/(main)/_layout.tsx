import AuthRoute from "@/components/auth/AuthRoute";
import ChatDrawer from "@/components/chat/ChatDrawer";
import ChatHeader from "@/components/chat/ChatHeader";
import AuthSheet from "@/components/user/AuthSheet";
import LanguageSheet from "@/components/user/LanguageSheet";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/sizes";
import { useDeleteChat } from "@/hooks/queries/useChat";
import { dev } from "@/utils/dev";
import { router, Stack, usePathname } from "expo-router";
import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 활성화된 오버레이 타입
type ActiveOverlay = "drawer" | "language" | "auth" | null;

export default function MainLayout() {
  const [activeOverlay, setActiveOverlay] = useState<ActiveOverlay>(null);

  const handleLanguageChange = () => setActiveOverlay("language");
  const handleSettings = () => setActiveOverlay("auth");
  const handleMenuPress = () => setActiveOverlay("drawer");

  const pathname = usePathname();
  const { mutate: deleteChat } = useDeleteChat();

  // /chat/[id] 경로에서만 sessionId 추출
  const currentSessionId = useMemo(() => {
    const match = pathname.match(/^\/chat\/(\d+)$/);
    return match ? Number(match[1]) : null;
  }, [pathname]);

  // 새로운 대화 클릭 시 새로운 대화 화면으로 이동
  const handleNewChat = () => {
    setActiveOverlay(null);
    // 이미 chat 화면이면 반응 x
    if (pathname === "/chat") {
      return;
    }
    router.push("/chat");
  };

  // 대화 내역 클릭 시 선택된 대화방으로 이동
  const handleChatHistory = (sessionId: number) => {
    setActiveOverlay(null);

    if (currentSessionId === sessionId) {
      return;
    }

    router.push(`/chat/${sessionId}`);
  };

  // 대화 삭제 클릭 시 대화 삭제
  const handleDeletePress = () => {
    if (currentSessionId) {
      dev.log("대화 삭제", currentSessionId);
      deleteChat(currentSessionId);
    }
  };

  return (
    <AuthRoute>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ChatHeader
            onMenuPress={handleMenuPress}
            onDeletePress={currentSessionId ? handleDeletePress : undefined}
          />

          <Stack
            screenOptions={{
              headerShown: false,
              animation: "none",
              contentStyle: {
                backgroundColor: COLORS.WHITE,
              },
            }}
          >
            <Stack.Screen
              name="chat/index"
              options={{ headerShown: false, title: "" }}
            />
            <Stack.Screen
              name="chat/[id]"
              options={{ headerShown: false, title: "" }}
            />
          </Stack>

          <ChatDrawer
            visible={activeOverlay === "drawer"}
            onClose={() => setActiveOverlay(null)}
            onNewChat={handleNewChat}
            onLanguageChange={handleLanguageChange}
            onChatHistory={handleChatHistory}
            onSettings={handleSettings}
            currentSessionId={currentSessionId}
          />

          <LanguageSheet
            visible={activeOverlay === "language"}
            onClose={() => setActiveOverlay(null)}
          />
          <AuthSheet
            visible={activeOverlay === "auth"}
            onClose={() => setActiveOverlay(null)}
          />
        </View>
      </SafeAreaView>
    </AuthRoute>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    padding: SPACING.SCREEN_PADDING,
  },
  container: {
    flex: 1,
  },
});
