import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

const ANIMATION_DURATION_IN = 350;
const ANIMATION_DURATION_OUT = 250;

export interface UseModalAnimationProps {
  visible: boolean;
  initialTranslateY?: number;
  initialScale?: number;
}

export interface UseModalAnimationReturn {
  overlayOpacity: Animated.Value;
  sheetTranslateY: Animated.Value;
  sheetScale: Animated.Value;
  animationDurationOut: number;
}

export const useModalAnimation = ({
  visible,
  initialTranslateY = 400,
  initialScale = 0.95,
}: UseModalAnimationProps): UseModalAnimationReturn => {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(initialTranslateY)).current;
  const sheetScale = useRef(new Animated.Value(initialScale)).current;

  useEffect(() => {
    if (visible) {
      // 나타날 때: 부드럽고 자연스러운 spring 효과
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATION_IN,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: ANIMATION_DURATION_IN,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // easeOutQuad와 유사한 부드러운 곡선
          useNativeDriver: true,
        }),
        Animated.timing(sheetScale, {
          toValue: 1,
          duration: ANIMATION_DURATION_IN,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 사라질 때: 빠르고 깔끔하게
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: ANIMATION_DURATION_OUT,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: initialTranslateY,
          duration: ANIMATION_DURATION_OUT,
          easing: Easing.bezier(0.55, 0.06, 0.68, 0.19), // easeInQuad와 유사한 가속 곡선
          useNativeDriver: true,
        }),
        Animated.timing(sheetScale, {
          toValue: initialScale,
          duration: ANIMATION_DURATION_OUT,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, overlayOpacity, sheetTranslateY, sheetScale, initialTranslateY, initialScale]);

  return {
    overlayOpacity,
    sheetTranslateY,
    sheetScale,
    animationDurationOut: ANIMATION_DURATION_OUT,
  };
};