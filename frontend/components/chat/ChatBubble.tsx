import IconButton from "@/components/common/IconButton";
import FontText from "@/components/common/FontText";
import { COLORS } from "@/constants/colors";
import { FONT_SIZES, SPACING } from "@/constants/sizes";
import { FontAwesome6 } from "@expo/vector-icons";
import { Lucide } from "@react-native-vector-icons/lucide";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Markdown from "react-native-markdown-display";
import { markdownStyles } from "@/constants/MarkdownStyles";

interface ChatBubbleProps {
  role: "USER" | "ASSISTANT";
  text: string;
  userError?: string;
  assistantError?: string;
  onCopy?: () => void;
  onRetry?: () => void;
}

function ChatBubble({
  role,
  text,
  userError,
  assistantError,
  onCopy,
  onRetry,
}: ChatBubbleProps) {
  const { width: screenWidth } = useWindowDimensions();
  const maxBubbleWidth = screenWidth * 0.7;

  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    onCopy?.();
    setIsCopied(true);
  };

  const handleRetry = () => {
    onRetry?.();
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return (
    <View
      style={[
        styles.container,
        role === "USER" ? styles.userRow : styles.assistantRow,
      ]}
    >
      {role === "USER" ? (
        // 사용자 메시지
        <View style={styles.messageWrapper}>
          <View style={[styles.userContainer, { maxWidth: maxBubbleWidth }]}>
            <FontText weight="light" style={styles.userText}>
              {text}
            </FontText>
          </View>

          {/* 사용자 에러 메시지 */}
          {userError && (
            <View style={[styles.errorContainer, styles.userErrorContainer]}>
              <FontAwesome6
                name="circle-exclamation"
                size={12}
                color={COLORS.ERROR_RED}
              />
              <FontText weight="light" style={styles.userErrorText}>
                {userError}
              </FontText>
            </View>
          )}

          {/* 사용자 메시지 복사 및 재시도 버튼 */}
          <View style={styles.buttonRow}>
            <IconButton
              icon={
                isCopied ? (
                  <Lucide name="copy-check" size={16} color={COLORS.BLACK} />
                ) : (
                  <Lucide name="copy" size={16} color={COLORS.BLACK} />
                )
              }
              onPress={handleCopy}
              size="small"
              backgroundColor={COLORS.WHITE}
              borderColor={COLORS.LIGHT_GRAY}
              borderWidth={1}
            />
            {userError && (
              <IconButton
                icon={
                  <Lucide
                    name="refresh-cw"
                    size={16}
                    color={COLORS.MOEL_BLUE}
                  />
                }
                onPress={handleRetry}
                size="small"
                backgroundColor={COLORS.WHITE}
                borderColor={COLORS.LIGHT_GRAY}
                borderWidth={1}
              />
            )}
          </View>
        </View>
      ) : (
        // AI 응답 메시지
        <View style={styles.messageWrapper}>
          <View
            style={[
              assistantError
                ? styles.assistantErrorContainer
                : styles.assistantContainer,
              { maxWidth: maxBubbleWidth },
            ]}
          >
            {!assistantError ? (
              <Markdown style={markdownStyles as any}>{text}</Markdown>
            ) : (
              <View style={styles.errorContainer}>
                <FontAwesome6
                  name="circle-exclamation"
                  size={12}
                  color={COLORS.ERROR_RED}
                />
                <FontText weight="light" style={styles.assistantErrorText}>
                  {assistantError}
                </FontText>
              </View>
            )}
          </View>

          <View style={[styles.buttonRow, { justifyContent: "flex-start" }]}>
            <IconButton
              icon={
                isCopied ? (
                  <Lucide name="copy-check" size={16} color={COLORS.BLACK} />
                ) : (
                  <Lucide name="copy" size={16} color={COLORS.BLACK} />
                )
              }
              onPress={handleCopy}
              size="small"
              backgroundColor={COLORS.WHITE}
              borderColor={COLORS.LIGHT_GRAY}
              borderWidth={1}
            />
            {assistantError && (
              <IconButton
                icon={
                  <Lucide
                    name="refresh-cw"
                    size={16}
                    color={COLORS.MOEL_BLUE}
                  />
                }
                onPress={handleRetry}
                size="small"
                backgroundColor={COLORS.WHITE}
                borderColor={COLORS.LIGHT_GRAY}
                borderWidth={1}
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: SPACING.SMALL,
    paddingHorizontal: SPACING.SMALL,
  },
  userRow: {
    justifyContent: "flex-end",
  },
  assistantRow: {
    justifyContent: "flex-start",
  },
  messageWrapper: {
    maxWidth: "100%",
  },
  userContainer: {
    backgroundColor: COLORS.MOEL_BLUE,
    padding: SPACING.MEDIUM,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    alignSelf: "flex-end",
  },
  assistantContainer: {
    backgroundColor: COLORS.WHITE,
    padding: SPACING.MEDIUM,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
  },
  assistantErrorContainer: {
    padding: SPACING.MEDIUM,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.ERROR_RED,
  },
  userText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.BODY,
    lineHeight: 22,
  },
  userErrorContainer: {
    marginVertical: SPACING.SMALL,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.XS,
  },
  userErrorText: {
    fontSize: FONT_SIZES.CAPTION,
    color: COLORS.ERROR_RED,
    flexShrink: 1,
  },
  assistantErrorText: {
    fontSize: FONT_SIZES.BODY,
    color: COLORS.ERROR_RED,
    flexShrink: 1,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: SPACING.XS,
    gap: SPACING.XS,
  },
});

export default ChatBubble;
