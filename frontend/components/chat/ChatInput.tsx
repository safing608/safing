import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/sizes";
import { Ionicons } from "@expo/vector-icons";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

export interface ChatInputHandle {
  clear: () => void;
  focus: () => void;
}

interface ChatInputProps extends TextInputProps {
  onSend?: (message: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  maxLength?: number;
  disabled?: boolean;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  name?: string;
}

const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
  (
    {
      onSend,
      onStop,
      isStreaming = false,
      maxLength = 500,
      disabled = false,
      onChangeText,
      onBlur,
      name,
      ...textInputProps
    },
    ref,
  ) => {
    const [hasText, setHasText] = useState(false);
    const { t } = useTranslation();
    const textRef = useRef("");
    const inputRef = useRef<TextInput>(null);

    const clear = useCallback(() => {
      inputRef.current?.clear();
      textRef.current = "";
      setHasText(false);
      onChangeText?.("");
    }, [onChangeText]);

    useImperativeHandle(
      ref,
      () => ({
        clear,
        focus: () => inputRef.current?.focus(),
      }),
      [clear],
    );

    const handleChangeText = useCallback(
      (text: string) => {
        textRef.current = text;
        const newHasText = text.trim().length > 0;
        if (newHasText !== hasText) {
          setHasText(newHasText);
        }
        onChangeText?.(text);
      },
      [hasText, onChangeText],
    );

    const handleSend = useCallback(() => {
      if (disabled || isStreaming) return;
      const currentText = textRef.current.trim();
      if (currentText && onSend) {
        onSend(currentText);
        clear();
      }
    }, [onSend, clear, disabled, isStreaming]);

    const handleStop = useCallback(() => {
      onStop?.();
    }, [onStop]);

    return (
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
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
            editable={!disabled && !isStreaming}
            {...textInputProps}
          />

          {isStreaming ? (
            <Pressable style={styles.stopButton} onPress={handleStop}>
              <Ionicons name="stop" size={16} color={COLORS.WHITE} />
            </Pressable>
          ) : (
            hasText && (
              <Pressable
                style={[
                  styles.sendButton,
                  disabled && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={disabled}
              >
                <Ionicons name="arrow-up" size={20} color={COLORS.WHITE} />
              </Pressable>
            )
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
  stopButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.MOEL_BLUE,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

ChatInput.displayName = "ChatInput";

export default ChatInput;
