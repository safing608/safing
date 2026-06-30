import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef, useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  Pressable,
  TextInputProps,
} from "react-native";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/sizes";
import { useTranslation } from "react-i18next";

interface ChatInputProps extends TextInputProps {
  onSend?: (message: string) => void;
  maxLength?: number;
  // React Hook Form 연동을 위한 props
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  name?: string;
}

const ChatInput = forwardRef<TextInput, ChatInputProps>(
  (
    { onSend, maxLength = 500, onChangeText, onBlur, name, ...textInputProps },
    ref,
  ) => {
    // 버튼 표시/숨김을 위한 최소한의 상태만 관리
    const [hasText, setHasText] = useState(false);
    const { t } = useTranslation();
    const textRef = useRef("");

    // 텍스트 변경 핸들러 - 재렌더링 최소화
    const handleChangeText = useCallback(
      (text: string) => {
        textRef.current = text;

        // 버튼 표시 상태만 업데이트 (재렌더링 최소화)
        const newHasText = text.trim().length > 0;
        if (newHasText !== hasText) {
          setHasText(newHasText);
        }

        // React Hook Form onChange 호출
        onChangeText?.(text);
      },
      [hasText, onChangeText],
    );

    // 전송 핸들러
    const handleSend = useCallback(() => {
      const currentText = textRef.current.trim();
      if (currentText && onSend) {
        onSend(currentText);

        // TextInput 직접 조작으로 재렌더링 없이 초기화
        if (ref && "current" in ref && ref.current) {
          ref.current.clear();
          textRef.current = "";
          setHasText(false);
        }
      }
    }, [onSend, ref]);

    return (
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            ref={ref}
            style={styles.input}
            placeholder={t("chat.input_placeholder")}
            placeholderTextColor={COLORS.MOEL_DARK_GRAY}
            returnKeyType="send"
            onChangeText={handleChangeText}
            onBlur={onBlur}
            autoCapitalize="none"
            spellCheck={false}
            autoCorrect={false}
            multiline
            maxLength={maxLength}
            {...textInputProps}
          />
          {/* 전송 버튼 */}
          {hasText && (
            <Pressable style={styles.sendButton} onPress={handleSend}>
              <Ionicons name="arrow-up" size={20} color={COLORS.WHITE} />
            </Pressable>
          )}
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.SMALL,
    paddingVertical: SPACING.SMALL,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: COLORS.WHITE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    paddingLeft: SPACING.MEDIUM,
    paddingRight: SPACING.SMALL,
    paddingVertical: SPACING.SMALL,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 150,
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.BLACK,
    paddingVertical: SPACING.XS,
    textAlignVertical: "center",
    fontFamily: "Pretendard_Regular",
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.MOEL_BLUE,
  },
});

ChatInput.displayName = "ChatInput";

export default ChatInput;
