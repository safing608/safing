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
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MainLayout() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [languageSheetVisible, setLanguageSheetVisible] = useState(false);
  const [authSheetVisible, setAuthSheetVisible] = useState(false);
  const pathname = usePathname();
  const { mutate: deleteChat } = useDeleteChat();

  // /chat/[id] 경로에서만 sessionId 추출 (새 대화 /chat 이면 null)
  const currentSessionId = (() => {
    const match = pathname.match(/^\/chat\/(\d+)$/);
    return match ? Number(match[1]) : null;
  })();

  // 채팅 드로어 열기
  const handleMenuPress = () => {
    setDrawerVisible(true);
  };

  // 채팅 드로어 닫기
  const handleDrawerClose = () => {
    setDrawerVisible(false);
  };

  // 새로운 대화 클릭 시 새로운 대화 화면으로 이동
  const handleNewChat = () => {
    setDrawerVisible(false);
    // 이미 chat 화면이면 반응 x
    if (pathname === "/chat") {
      return;
    }
    router.push("/chat");
  };

  // 언어 변경 클릭 시 언어 변경 모달 열기
  const handleLanguageChange = () => {
    setDrawerVisible(false);
    setLanguageSheetVisible(true);
  };

  // 대화 내역 클릭 시 선택된 대화방으로 이동
  const handleChatHistory = (sessionId: number) => {
    setDrawerVisible(false);

    if (currentSessionId === sessionId) {
      return;
    }

    router.push(`/chat/${sessionId}`);
  };

  // 계정 설정 클릭 시 계정 설정 액션 시트 열기
  const handleSettings = () => {
    setDrawerVisible(false);
    setAuthSheetVisible(true);
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
            visible={drawerVisible}
            onClose={handleDrawerClose}
            onNewChat={handleNewChat}
            onLanguageChange={handleLanguageChange}
            onChatHistory={handleChatHistory}
            onSettings={handleSettings}
            currentSessionId={currentSessionId}
          />

          <LanguageSheet
            visible={languageSheetVisible}
            onClose={() => setLanguageSheetVisible(false)}
          />
          <AuthSheet
            visible={authSheetVisible}
            onClose={() => setAuthSheetVisible(false)}
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
