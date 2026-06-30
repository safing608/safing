import ChatDrawer from "@/components/common/chat/ChatDrawer";
import ChatHeader from "@/components/common/chat/ChatHeader";
import LanguageSheet from "@/components/common/LanguageSheet";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/sizes";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MainLayout() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [languageSheetVisible, setLanguageSheetVisible] = useState(false);
  const router = useRouter();

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
    router.push("/chat");
  };

  const handleLanguageChange = () => {
    setDrawerVisible(false);
    setLanguageSheetVisible(true);
  };

  // 대화 내역 클릭 시 대화 내역 화면으로 이동
  const handleChatHistory = () => {
    setDrawerVisible(false);
    // TODO: 선택된 대화방으로 이동
    Alert.alert("대화 내역", "선택된 대화방으로 이동합니다.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ChatHeader onMenuPress={handleMenuPress} />

        <Stack
          screenOptions={{
            headerShown: false,
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
        />

        <LanguageSheet
          visible={languageSheetVisible}
          onClose={() => setLanguageSheetVisible(false)}
        />
      </View>
    </SafeAreaView>
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
