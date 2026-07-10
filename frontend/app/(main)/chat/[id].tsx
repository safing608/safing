import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/sizes";
import useKeyboard from "@/hooks/useKeyboard";
import { mockChatContent } from "@/mock/chat";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

interface ChatRoomScreenProps {}

function ChatRoomScreen({}: ChatRoomScreenProps) {
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();
  const mockChatContentData = mockChatContent;

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

  useEffect(() => {
    Animated.timing(animatedBottom, {
      toValue: targetBottomPosition,
      duration: Platform.OS === "ios" ? 250 : 200,
      useNativeDriver: false,
    }).start();
  }, [targetBottomPosition]);

  const handleInputLayout = (e: LayoutChangeEvent) => {
    setInputHeight(e.nativeEvent.layout.height);
  };

  // 실제 측정된 inputHeight + 키보드 위치 = 정확한 paddingBottom
  const scrollPaddingBottom = inputHeight + targetBottomPosition + SPACING.XS;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.chatContentContainer,
          { paddingBottom: scrollPaddingBottom },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {mockChatContentData.map((item) => (
          <ChatBubble
            key={item.id}
            role={item.role as "user" | "assistant"}
            text={item.text as string}
          />
        ))}
      </ScrollView>

      {/* 채팅 input 컨테이너 */}
      <Animated.View
        style={[styles.chatInputContainer, { bottom: animatedBottom }]}
        onLayout={handleInputLayout}
      >
        <ChatInput />
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
  scrollView: {
    flex: 1,
  },
  chatContentContainer: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingTop: SPACING.MEDIUM,
    flexGrow: 1,
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

export default ChatRoomScreen;
