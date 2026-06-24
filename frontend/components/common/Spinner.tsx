import React from "react";
import { ActivityIndicator, ActivityIndicatorProps } from "react-native";
import { COLORS } from "@/constants/colors";

interface SpinnerProps extends Omit<ActivityIndicatorProps, "color"> {
  // 배경색 기반 자동 색상 선택
  backgroundColor: string;
  // 또는 직접 색상 지정
  color?: string;
  // 크기 (기본값 유지하면서 명시적 타입)
  size?: "small" | "large" | number;
}

function Spinner({
  backgroundColor,
  color,
  size = "small",
  ...props
}: SpinnerProps) {
  // 배경색 기반 스피너 색상 자동 결정
  const getSpinnerColor = (): string => {
    if (color) return color;

    // 밝기를 계산해서 판단
    return isLightColor(backgroundColor) ? COLORS.BLACK : COLORS.WHITE;
  };

  // 색상의 밝기를 계산하는 헬퍼 함수
  const isLightColor = (hexColor: string): boolean => {
    // #을 제거하고 RGB 값 추출
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // 밝기 계산 (0-255, 128 이상이면 밝은 색)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  };

  return <ActivityIndicator color={getSpinnerColor()} size={size} {...props} />;
}

export default Spinner;
