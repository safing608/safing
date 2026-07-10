import { reissueToken } from "@/api/auth";
import FontText from "@/components/common/FontText";
import { COLORS } from "@/constants/colors";
import { FONT_SIZES, SPACING } from "@/constants/sizes";
import { useAuthStore } from "@/stores/authStore";
import { dev } from "@/utils/dev";
import { Image } from "expo-image";
import { router, SplashScreen } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface OnboardingScreenProps {}

// 해당 경로는 SPLASH SCREEN
function OnboardingScreen({}: OnboardingScreenProps) {
  const { refreshToken } = useAuthStore.getState();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 토큰 유효성 검증
        await reissueToken(refreshToken ?? "");

        // 스플래시 화면 최소 표시 시간 (1.2초)
        await new Promise((resolve) => setTimeout(resolve, 1200));

        router.replace("/chat");
      } catch (error) {
        dev.error("토큰 갱신 실패:", error);
        router.replace("/login");
      }
    };

    initializeApp();
  }, [refreshToken]);

  const { width } = useWindowDimensions();
  // SVG 원본 비율: 694:778 (가로:세로)
  const aspectRatio = 778 / 694; // 약 1.12 (세로가 더 김)
  const imageWidth = width * 0.4;
  const imageHeight = imageWidth * aspectRatio;
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require("@/assets/logo/safing_origin.svg")}
          style={[styles.image, { width: imageWidth, height: imageHeight }]}
        />
        <FontText
          weight="black"
          size={FONT_SIZES.BODY}
          color={COLORS.MOEL_BLUE}
          style={styles.title}
        >
          세이핑
        </FontText>
        <FontText
          weight="semibold"
          size={FONT_SIZES.CAPTION}
          color={COLORS.MOEL_BLUE}
          style={styles.caption}
        >
          외국인 근로자 산업안전 지원 AI 서비스
        </FontText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.SCREEN_PADDING,
  },
  image: {
    tintColor: COLORS.MOEL_BLUE,
  },
  title: {
    fontSize: FONT_SIZES.H3,
  },
  caption: {
    paddingVertical: SPACING.SMALL,
  },
});

export default OnboardingScreen;
