import ChatInput from "@/components/chat/ChatInput";
import FontText from "@/components/common/FontText";
import { COLORS } from "@/constants/colors";
import { FONT_SIZES, SPACING } from "@/constants/sizes";
import { useCreateChat } from "@/hooks/queries/useChat";
import useKeyboard from "@/hooks/useKeyboard";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  View,
} from "react-native";

function ChatScreen() {
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();
  const { t } = useTranslation();
  const { mutate: createChat, isPending } = useCreateChat();

  const [inputHeight, setInputHeight] = useState(0);

  const animatedBottom = useRef(new Animated.Value(0)).current;
  // 플랫폼별 입력창 bottom 위치 계산
  // iOS: keyboardWillShow로 미리 감지 → 애니메이션 duration 맞춰야 함
  // Android: SafeAreaView가 감싸고 있으므로 keyboardHeight에서 paddingVertical만큼 차감
  const targetBottomPosition = isKeyboardVisible
    ? Platform.OS === "ios"
      ? keyboardHeight // iOS: SafeAreaView 내부 좌표계에서 keyboardHeight 그대로 사용
      : keyboardHeight - SPACING.XS // Android: paddingVertical(SPACING.XS) 상쇄
    : 0;

  // 부드러운 애니메이션
  useEffect(() => {
    Animated.timing(animatedBottom, {
      toValue: targetBottomPosition,
      duration: Platform.OS === "ios" ? 250 : 200,
      useNativeDriver: false,
    }).start();
  }, [targetBottomPosition]);

  // input 레이아웃 변경 시 높이 저장
  const handleInputLayout = (e: LayoutChangeEvent) => {
    setInputHeight(e.nativeEvent.layout.height);
  };

  // input 전송 시 대화 생성
  const handleCreateChat = (content: string) => {
    if (isPending) return;
    createChat({ content });
  };

  return (
    <View style={styles.container}>
      {/* 새로운 채팅 안내 컨테이너 */}
      <View
        style={[
          styles.newChatContainer,
          isKeyboardVisible && styles.newChatContainerKeyboard,
        ]}
      >
        <FontText
          weight="regular"
          size={FONT_SIZES.H3}
          style={{ textAlign: "center", lineHeight: 36 }}
        >
          {t("chat.welcome_message")}
        </FontText>
        <FontText
          weight="regular"
          size={FONT_SIZES.H3}
          style={{ textAlign: "center", lineHeight: 36 }}
        >
          {t("chat.start_message")}
        </FontText>
      </View>

      {/* 채팅 input 컨테이너  */}
      <Animated.View
        style={[styles.chatInputContainer, { bottom: animatedBottom }]}
        onLayout={handleInputLayout}
      >
        <ChatInput onSend={handleCreateChat} disabled={isPending} />
        <View style={styles.bottomSpacer} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  newChatContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  newChatContainerKeyboard: {
    // 키보드가 열렸을 때 상단 영역 축소
    flex: 0.4,
  },
  chatInputContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.XS,
    paddingVertical: SPACING.XS,
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
    backgroundColor: COLORS.WHITE,
    overflow: "visible",
  },
  bottomSpacer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -500,
    height: 500,
    backgroundColor: COLORS.WHITE,
  },
});

export default ChatScreen;
