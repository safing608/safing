import { COLORS } from "@/constants/colors";
import { FONT_SIZES, SPACING } from "@/constants/sizes";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { Lucide } from "@react-native-vector-icons/lucide";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import IconButton from "./IconButton";

interface ChatBubbleProps {
  role: "user" | "assistant";
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

  // 복사 완료 상태를 2초 후에 리셋
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return (
    <View
      style={[
        styles.container,
        role === "user" ? styles.userRow : styles.assistantRow,
      ]}
    >
      {/* 사용자 메시지 */}
      {role === "user" ? (
        <View style={styles.messageWrapper}>
          {/* 말풍선 */}
          <View style={[styles.userContainer, { maxWidth: maxBubbleWidth }]}>
            <Text style={styles.userText}>{text}</Text>
          </View>
          {/* 사용자 에러 메시지 */}
          {userError && (
            <View style={[styles.errorContainer, styles.userErrorContainer]}>
              <FontAwesome6
                name="circle-exclamation"
                size={12}
                color={COLORS.ERROR_RED}
              />
              <Text style={styles.userErrorText}>
                {userError}
              </Text>
            </View>
          )}

          {/* 버튼들 */}
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
                icon={<Lucide name="refresh-ccw" size={16} color={COLORS.MOEL_BLUE} />}
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
        // 서버 메시지
        <View style={styles.messageWrapper}>
          {/* 말풍선 */}
          <View style={[
            assistantError ? styles.assistantErrorContainer : styles.assistantContainer,
            { maxWidth: maxBubbleWidth }
          ]}>
            {!assistantError ? (
              <Text style={styles.assistantText}>{text}</Text>
            ) : (
              <View style={styles.errorContainer}>
                <FontAwesome6
                  name="circle-exclamation"
                  size={12}
                  color={COLORS.ERROR_RED}
                />
                <Text style={styles.assistantErrorText}>
                  {assistantError}
                </Text>
              </View>
            )}
          </View>

          {/* 버튼들 */}
          <View style={[styles.buttonRow, { justifyContent: "flex-start" }]}>
            <IconButton
              icon={isCopied ? 
                <Lucide name="copy-check" size={16} color={COLORS.BLACK} /> : 
                <Lucide name="copy" size={16} color={COLORS.BLACK} />
              }
              onPress={handleCopy}
              size="small"
              backgroundColor={COLORS.WHITE}
              borderColor={COLORS.LIGHT_GRAY}
              borderWidth={1}
            />
            
            {assistantError && (
              <IconButton
                icon={<Lucide name="refresh-ccw" size={16} color={COLORS.MOEL_BLUE} />}
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
  userErrorContainer: {
    marginVertical: SPACING.SMALL,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.XS,
  },
  userButtonRow: {
    alignItems: "flex-end",
    marginTop: SPACING.XS,
    gap: 3,
  },
  assistantButtonRow: {
    alignItems: "flex-start",
    marginTop: SPACING.XS,
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
    fontWeight: "500",
    lineHeight: 22,
  },
  assistantText: {
    color: COLORS.BLACK,
    fontSize: FONT_SIZES.BODY,
    fontWeight: "400",
    lineHeight: 22,
  },
  userErrorText: {
    fontSize: FONT_SIZES.CAPTION,
    color: COLORS.ERROR_RED,
    fontStyle: "italic",
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
