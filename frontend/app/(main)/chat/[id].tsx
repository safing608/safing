import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput, { ChatInputHandle } from "@/components/chat/ChatInput";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/sizes";
import {
  useGetChat,
  useRetryQuestion,
  useSendQuestion,
} from "@/hooks/queries/useChat";
import { useChatStream } from "@/hooks/useChatStream";
import useKeyboard from "@/hooks/useKeyboard";
import { useChatStreamStore } from "@/stores/chatStreamStore";
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

function ChatRoomScreen() {
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();

  const [inputHeight, setInputHeight] = useState(0);

  const animatedBottom = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const chatInputRef = useRef<ChatInputHandle>(null);

  const { id: sessionIdParam } = useLocalSearchParams<{ id: string }>();
  const sessionId = Number(sessionIdParam);

  const { data: chat } = useGetChat(sessionId);
  const { mutate: sendQuestion, isPending } = useSendQuestion();
  const { mutate: retryQuestion } = useRetryQuestion();

  const {
    content: streamContent,
    riskTypeName: streamRiskTypeName,
    isStreaming,
    stop,
    userMessageId,
    lastUserContent,
    assistantMessageId,
  } = useChatStream(sessionId);

  const scrollToBottom = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    });
  }, []);

  useEffect(() => {
    if (!chat?.length) return;
    scrollToBottom(true);
  }, [chat?.length, scrollToBottom]);

  useEffect(() => {
    if (!isStreaming) return;
    scrollToBottom(false);
  }, [streamContent, isStreaming, scrollToBottom]);

  const targetBottomPosition = isKeyboardVisible
    ? Platform.OS === "ios"
      ? keyboardHeight
      : keyboardHeight - SPACING.XS
    : 0;

  useEffect(() => {
    Animated.timing(animatedBottom, {
      toValue: targetBottomPosition,
      duration: Platform.OS === "ios" ? 250 : 200,
      useNativeDriver: false,
    }).start();
  }, [targetBottomPosition, animatedBottom]);

  const handleInputLayout = (e: LayoutChangeEvent) => {
    setInputHeight(e.nativeEvent.layout.height);
  };

  const handleSendQuestion = (content: string) => {
    if (isPending || isStreaming) return;
    // 이전 에러 스트림 상태 정리
    useChatStreamStore.getState().clearStream(sessionId);
    sendQuestion({ sessionId, content });
  };

  const handleRetryUser = (messageId: number, content: string) => {
    if (isPending || isStreaming) return;
    sendQuestion({
      sessionId,
      content,
      tempMessageId: messageId,
    });
  };

  const handleRetryAssistant = (messageId?: number) => {
    if (isPending || isStreaming) return;
    const targetMessageId = messageId ?? assistantMessageId;
    if (targetMessageId) {
      retryQuestion({ sessionId, messageId: targetMessageId });
      return;
    }
    if (lastUserContent) {
      handleRetryUser(userMessageId ?? -Date.now(), lastUserContent);
    }
  };

  const scrollPaddingBottom = inputHeight + targetBottomPosition + SPACING.XS;

  // 스트리밍 중이면 캐시에 이미 들어간 동일 assistant 에러 버블은 숨김
  const visibleMessages = (chat ?? []).filter((item) => {
    if (item.role === "ASSISTANT" && item.status === "PROCESSING") {
      return false;
    }
    if (isStreaming && item.role === "ASSISTANT" && item.status === "ERROR") {
      return item.messageId !== assistantMessageId;
    }
    return true;
  });

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
        {visibleMessages.map((item) => {
          const role = item.role as "USER" | "ASSISTANT";
          const isUser = role === "USER";

          return (
            <ChatBubble
              key={item.messageId}
              role={role}
              text={item.content ?? ""}
              riskTypeName={item.riskTypeName ?? ""}
              userError={isUser ? (item.errorMessage ?? "") : ""}
              assistantError={
                !isUser ? (item.errorMessage ?? "") : ""
              }
              onRetry={() => {
                if (isUser) {
                  handleRetryUser(item.messageId, item.content ?? "");
                } else {
                  handleRetryAssistant(item.messageId);
                }
              }}
            />
          );
        })}

        {/* 스트리밍 중인 답변 */}
        {isStreaming && (
          <ChatBubble
            role="ASSISTANT"
            text={streamContent}
            riskTypeName={streamRiskTypeName ?? ""}
          />
        )}
      </ScrollView>

      <Animated.View
        style={[styles.chatInputContainer, { bottom: animatedBottom }]}
        onLayout={handleInputLayout}
      >
        <ChatInput
          ref={chatInputRef}
          onSend={handleSendQuestion}
          onStop={stop}
          isStreaming={isStreaming}
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
