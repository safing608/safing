import { COLORS } from "@/constants/colors";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

interface TypingDotsProps {
  color?: string;
  size?: number;
}

/**
 * AI 답변 생성 중임을 나타내는 점 3개 애니메이션.
 * ChatBubble에서 스트리밍 연결은 됐지만 아직 message 이벤트가
 * 도착하지 않은 상태(isLoading && !text)에 사용됨.
 */
function TypingDots({ color = COLORS.MOEL_BLUE, size = 6 }: TypingDotsProps) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      );

    const animation = Animated.parallel([
      createAnimation(dot1, 0),
      createAnimation(dot2, 150),
      createAnimation(dot3, 300),
    ]);

    animation.start();

    // 언마운트 시 애니메이션 정리
    return () => animation.stop();
  }, [dot1, dot2, dot3]);

  const dots = [dot1, dot2, dot3];

  return (
    <View style={styles.container}>
      {dots.map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              opacity: dot.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
              transform: [
                {
                  translateY: dot.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -3],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  dot: {},
});

export default TypingDots;
