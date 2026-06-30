import React, { useState } from "react";
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import { COLORS } from "@/constants/colors";
import { FONT_SIZES, SIZES, SPACING } from "@/constants/sizes";
import FontText from "./FontText";

interface ButtonProps extends PressableProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "tertiary" | "outline" | "blueFilled" | "blueOutline";
  size?: "small" | "medium" | "large";
  pressableStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  // Icon props
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

function Button({
  label,
  onPress,
  disabled = false,
  variant = "primary",
  size = "medium",
  pressableStyle,
  textStyle,
  icon,
  iconPosition = "left",
  ...props
}: ButtonProps) {
  const [pressed, setPressed] = useState<boolean>(false);

  // 컨텐츠 렌더링 함수
  const renderContent = () => {
    const textStyleArray = [
      styles[`${variant}Text`],
      styles[`${size}Text`],
      disabled && styles.disabledText,
    ];

    // 텍스트만
    if (!icon && label) {
      return <FontText style={[textStyleArray, textStyle]}>{label}</FontText>;
    }

    // 아이콘 + 텍스트
    if (icon && label) {
      return (
        <View style={styles.contentRow}>
          {iconPosition === "left" && (
            <View style={styles.iconContainer}>{icon}</View>
          )}
          <FontText style={[textStyleArray, textStyle]}>{label}</FontText>
          {iconPosition === "right" && (
            <View style={styles.iconContainer}>{icon}</View>
          )}
        </View>
      );
    }

    // 기본 텍스트
    return <FontText style={textStyleArray}>{label}</FontText>;
  };

  return (
    <Pressable
      style={[
        styles.container,
        styles[`${variant}Container`],
        styles[`${size}Container`],
        disabled && styles.disabledContainer,
        pressed && !disabled && styles.pressed,
        pressableStyle,
      ]}
      onPress={() => {
        setPressed(true);
        onPress();
      }}
      disabled={disabled}
      {...props}
    >
      {renderContent()}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: SIZES.XL,
  },

  // Size styles
  smallContainer: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.XS,
    minHeight: 36,
  },
  mediumContainer: {
    paddingHorizontal: SPACING.LARGE,
    paddingVertical: SPACING.SMALL,
    minHeight: 48,
  },
  largeContainer: {
    paddingHorizontal: SPACING.XL,
    paddingVertical: SPACING.MEDIUM,
    minHeight: 56,
  },

  // Variant container styles
  primaryContainer: {
    backgroundColor: COLORS.BLACK,
  },
  tertiaryContainer: {
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  outlineContainer: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.BLACK,
  },
  blueFilledContainer: {
    backgroundColor: COLORS.MOEL_BLUE,
  },
  blueOutlineContainer: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.MOEL_BLUE,
  },

  // Text size styles
  smallText: {
    fontSize: FONT_SIZES.CAPTION,
    fontWeight: "600",
  },
  mediumText: {
    fontSize: FONT_SIZES.BODY,
    fontWeight: "600",
  },
  largeText: {
    fontSize: FONT_SIZES.H3,
    fontWeight: "700",
  },

  // Variant text styles
  primaryText: {
    color: COLORS.WHITE,
  },
  tertiaryText: {
    color: COLORS.BLACK,
  },
  outlineText: {
    color: COLORS.BLACK,
  },
  blueFilledText: {
    color: COLORS.WHITE,
  },
  blueOutlineText: {
    color: COLORS.MOEL_BLUE,
  },

  // States
  disabledContainer: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.8,
  },

  // Icon and content layout styles
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginHorizontal: SPACING.XS,
  },
});

export default Button;
