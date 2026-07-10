import { login } from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";
import FontText from "@/components/common/FontText";
import { COLORS } from "@/constants/colors";
import { FONT_SIZES, SPACING } from "@/constants/sizes";
import { dev } from "@/utils/dev";
import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

function LoginScreen() {
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const setAuth = useAuthStore((state) => state.login);

  // SVG 원본 비율: 694:778 (가로:세로)
  const aspectRatio = 778 / 694;
  const imageWidth = width * 0.4;
  const imageHeight = imageWidth * aspectRatio;

  // Google 로고 반응형 크기: 원본 비율 189:40
  const googleAspectRatio = 40 / 189;
  const googleButtonWidth = Math.min(300, width * 0.5);
  const googleButtonHeight = googleButtonWidth * googleAspectRatio;

  // 구글 로그인
  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // Google Play Services 체크
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Google 로그인 시도
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) {
        throw new Error();
      }

      const idToken = response.data.idToken;

      if (!idToken) {
        throw new Error();
      }

      dev.log("Google idToken 획득:", idToken ? "획득" : "없음");

      const data = await login({ idToken });

      if (data.status === "SIGNUP_REQUIRED") {
        router.push({
          pathname: "/language",
          params: { idToken, returnTo: "login" },
        });
        return;
      }

      // 기존 회원: 첫 login 응답으로 바로 로그인 처리
      await setAuth(
        data.accessToken,
        data.refreshToken,
        data.countryCode ?? "",
      );
      router.replace("/chat");
    } catch (error) {
      dev.error("Google 로그인 오류:", error);
      Toast.show({
        type: "error",
        text1: t("auth.login_failed"),
      });
    } finally {
      setLoading(false);
    }
  };

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
        <View style={styles.loginButtonContainer}>
          <Pressable onPress={handleGoogleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.MOEL_BLUE} />
            ) : (
              <Image
                source={require("@/assets/icons/google.svg")}
                style={[
                  styles.googleIcon,
                  { width: googleButtonWidth, height: googleButtonHeight },
                ]}
              />
            )}
          </Pressable>
        </View>
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
  loginButtonContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.XS,
    minHeight: 44,
  },
  googleIcon: {
    borderRadius: 20,
  },
});

export default LoginScreen;
