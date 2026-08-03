import React, { useState } from "react";
import { Pressable, PressableProps, StyleSheet } from "react-native";

interface IconButtonProps extends PressableProps {
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  shape?: "square" | "circle";
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

function IconButton({
  icon,
  onPress,
  disabled = false,
  size = "medium",
  shape = "square",
  backgroundColor = "transparent",
  borderColor,
  borderWidth = 0,
  ...props
}: IconButtonProps) {
  const [pressed, setPressed] = useState<boolean>(false);

  return (
    <Pressable
      style={[
        styles.container,
        styles[`${size}Container`],
        shape === "circle" && styles.circleContainer,
        {
          backgroundColor: disabled
            ? `${backgroundColor}80`
            : backgroundColor,
          borderColor,
          borderWidth,
        },
        pressed && !disabled && styles.pressed,
      ]}
      onPress={() => {
        setPressed(true);
        onPress();
      }}
      disabled={disabled}
      {...props}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  // Size styles
  smallContainer: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  mediumContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  largeContainer: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },

  // Shape styles
  circleContainer: {
    borderRadius: 999, // 완전한 원형
  },

  // States
  pressed: {
    opacity: 0.8,
  },
});

export default IconButton;
