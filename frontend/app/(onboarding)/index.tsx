import { reissueToken } from "@/api/auth";
import FontText from "@/components/common/FontText";
import { COLORS } from "@/constants/colors";
import { FONT_SIZES, SPACING } from "@/constants/sizes";
import { useAuthStore } from "@/stores/authStore";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface OnboardingScreenProps {}

// 해당 경로는 SPLASH SCREEN
function OnboardingScreen({}: OnboardingScreenProps) {
  // 첫 진입 시 토큰 갱신으로 토큰 유효성 검사
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const { refreshToken, updateTokens } = useAuthStore.getState();

        if (!refreshToken) {
          router.replace("/login");
          return;
        }

        // 토큰 유효성 검증
        const data = await reissueToken(refreshToken);
        await updateTokens(data.accessToken, data.refreshToken);

        router.replace("/chat");
      } catch (error) {
        await useAuthStore.getState().logout("/login");
      }
    };

    initializeApp();
  }, []);

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
