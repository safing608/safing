import IconButton from "@/components/common/IconButton";
import FontText from "@/components/common/FontText";
import { markdownStyles } from "@/constants/MarkdownStyles";
import { COLORS } from "@/constants/colors";
import { FONT_SIZES, SPACING } from "@/constants/sizes";
import { FontAwesome6 } from "@expo/vector-icons";
import { Lucide } from "@react-native-vector-icons/lucide";
import * as Clipboard from "expo-clipboard";
import { t } from "i18next";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Markdown from "react-native-markdown-display";
import { dev } from "@/utils/dev";

interface ChatBubbleProps {
  role: "USER" | "ASSISTANT";
  text?: string;
  status?: string;
  userError?: string;
  assistantError?: string;
  riskTypeCode?: string;
  riskTypeName?: string;
  onRetry?: () => void;
  retryable?: boolean;
  retryDisabled?: boolean; // 재시도/스트리밍 중 중복 요청 방지
}

function ChatBubble({
  role,
  text,
  status,
  riskTypeCode,
  riskTypeName,
  userError,
  assistantError,
  onRetry,
  retryable = true,
  retryDisabled = false,
}: ChatBubbleProps) {
  const { width: screenWidth } = useWindowDimensions();
  const maxBubbleWidth = screenWidth * 0.7;

  const [isCopied, setIsCopied] = useState(false);

  const isFailedWithNoContent = status === "FAILED" && !text;

  const handleCopy = async () => {
    const content = text?.trim();
    if (!content) return;

    await Clipboard.setStringAsync(content);
    setIsCopied(true);
  };

  const handleRetry = () => {
    if (retryDisabled) return;
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
            <View style={[styles.errorContainer]}>
              <FontAwesome6
                name="circle-exclamation"
                size={12}
                color={COLORS.ERROR_RED}
              />
              <FontText weight="light" style={styles.errorText}>
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
                    color={
                      retryDisabled ? COLORS.MOEL_DARK_GRAY : COLORS.MOEL_BLUE
                    }
                  />
                }
                onPress={handleRetry}
                disabled={retryDisabled}
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
          {!!riskTypeCode && riskTypeCode !== "Z" && (
            <FontText
              weight="medium"
              size={FONT_SIZES.CAPTION}
              color={COLORS.MOEL_BLUE}
              style={styles.riskTypeLabel}
            >
              ⚠️ {t("chat.risk_type_name")}: {riskTypeName}
            </FontText>
          )}
          {isFailedWithNoContent ? (
            // [DB] FAILED 전용 컨테이너
            <View
              style={[
                styles.assistantErrorContainer,
                { maxWidth: maxBubbleWidth },
              ]}
            >
              <View style={styles.assistantErrorContent}>
                <FontAwesome6
                  name="circle-exclamation"
                  size={12}
                  color={COLORS.ERROR_RED}
                />
                <FontText weight="light" style={styles.assistantErrorText}>
                  {t("error.stream_failed")}
                </FontText>
              </View>
            </View>
          ) : (
            // [DB 및 Streaming] 정상 답변 및 스트리밍 중 에러 표시
            <>
              <View
                style={[
                  styles.assistantContainer,
                  { maxWidth: maxBubbleWidth },
                ]}
              >
                <Markdown style={markdownStyles as any}>{text || ""}</Markdown>
              </View>

              {assistantError && (
                <View style={styles.errorContainer}>
                  <FontAwesome6
                    name="circle-exclamation"
                    size={12}
                    color={COLORS.ERROR_RED}
                  />
                  <FontText weight="light" style={styles.errorText}>
                    {assistantError}
                  </FontText>
                </View>
              )}

              {/* 어시스턴스 메시지 복사 및 재시도 버튼*/}
              <View
                style={[styles.buttonRow, { justifyContent: "flex-start" }]}
              >
                <IconButton
                  icon={
                    isCopied ? (
                      <Lucide
                        name="copy-check"
                        size={16}
                        color={COLORS.BLACK}
                      />
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
                {assistantError && retryable && (
                  <IconButton
                    icon={
                      <Lucide
                        name="refresh-cw"
                        size={16}
                        color={
                          retryDisabled
                            ? COLORS.MOEL_DARK_GRAY
                            : COLORS.MOEL_BLUE
                        }
                      />
                    }
                    onPress={handleRetry}
                    disabled={retryDisabled}
                    size="small"
                    backgroundColor={COLORS.WHITE}
                    borderColor={COLORS.LIGHT_GRAY}
                    borderWidth={1}
                  />
                )}
              </View>
            </>
          )}
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
  riskTypeLabel: {
    marginBottom: SPACING.XS,
    marginLeft: SPACING.XS,
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
    backgroundColor: COLORS.WHITE,
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
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.XS,
    marginVertical: SPACING.SMALL,
  },
  assistantErrorContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.XS,
  },
  errorText: {
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
