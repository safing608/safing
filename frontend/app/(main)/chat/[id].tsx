import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput, { ChatInputHandle } from "@/components/chat/ChatInput";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/sizes";
import { useGetChat, useSendQuestion } from "@/hooks/queries/useChat";
import useKeyboard from "@/hooks/useKeyboard";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

  const [inputHeight, setInputHeight] = useState(0);

  const animatedBottom = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const chatInputRef = useRef<ChatInputHandle>(null);

  const { id: sessionId } = useLocalSearchParams<{ id: string }>();
  const { data: chat } = useGetChat(Number(sessionId));

  const { mutate: sendQuestion, isPending } = useSendQuestion();

  const scrollToBottom = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    });
  }, []);

  // 메시지 추가/로드 시 맨 아래로
  useEffect(() => {
    if (!chat?.length) return;
    scrollToBottom(true);
  }, [chat?.length, scrollToBottom]);

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

  // 기존 대화에 질문 전송
  const handleSendQuestion = (content: string) => {
    if (isPending) return;
    sendQuestion(
      { sessionId: Number(sessionId), content },
      {
        onSuccess: () => {
          scrollToBottom(true);
        },
      },
    );
  };

  // 실제 측정된 inputHeight + 키보드 위치 = 정확한 paddingBottom
  const scrollPaddingBottom = inputHeight + targetBottomPosition + SPACING.XS;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.chatContentContainer,
          { paddingBottom: scrollPaddingBottom },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollToBottom(false)}
      >
        {chat?.map((item) => (
          <ChatBubble
            key={item.messageId}
            role={item.role as "USER" | "ASSISTANT"}
            text={item.content as string}
          />
        ))}
      </ScrollView>

      {/* 채팅 input 컨테이너 */}
      <Animated.View
        style={[styles.chatInputContainer, { bottom: animatedBottom }]}
        onLayout={handleInputLayout}
      >
        <ChatInput
          ref={chatInputRef}
          onSend={handleSendQuestion}
          disabled={isPending}
        />
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
