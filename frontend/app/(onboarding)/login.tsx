import FontText from "@/components/common/FontText";
import { COLORS } from "@/constants/colors";
import { FONT_SIZES, SPACING } from "@/constants/sizes";
import { dev } from "@/utils/dev";
import axiosInstance from "@/api/axios";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
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
  const { hasSetLanguage, language } = useUserStore();
  const { login } = useAuthStore();

  // SVG 원본 비율: 694:778 (가로:세로)
  const aspectRatio = 778 / 694;
  const imageWidth = width * 0.4;
  const imageHeight = imageWidth * aspectRatio;

  // Google 로고 반응형 크기: 원본 비율 189:40
  const googleAspectRatio = 40 / 189;
  const googleButtonWidth = Math.min(300, width * 0.5);
  const googleButtonHeight = googleButtonWidth * googleAspectRatio;

  const handleGoogleLogin = async () => {

    try {
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) {
        dev.log("Google 로그인이 취소되었습니다.");
        return;
      }

      dev.log("Google 로그인 응답:", response);

      const idToken = response.data.idToken;
      if (!idToken) {
        Toast.show({
          type: "error",
          text1: "Google 인증 토큰을 받을 수 없습니다.",
        });
        return;
      }

      dev.log("Google idToken 획득:", idToken);

      // 신규 유저인지 확인 (언어 설정 여부로 판단)
      if (!hasSetLanguage) {
        dev.log("신규 유저 - 언어 선택 화면으로 이동");

        // idToken을 임시로 저장하고 언어 선택 화면으로 이동
        // 언어 선택 후 다시 돌아와서 백엔드 API 호출
        router.push({
          pathname: "/(setup)/language",
          params: { idToken, returnTo: "login" },
        });
      } else {
        // 기존 유저 - 바로 백엔드 API 호출
        await sendTokenToBackend(idToken, language);
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            dev.log("사용자가 로그인을 취소했습니다.");
            break;
          case statusCodes.IN_PROGRESS:
            Toast.show({
              type: "error",
              text1: "이미 로그인 프로세스가 진행 중입니다.",
            });
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Toast.show({
              type: "error",
              text1: "Google Play Services가 사용할 수 없습니다.",
            });
            break;
          default:
            Toast.show({
              type: "error",
              text1: "로그인 중 오류가 발생했습니다.",
            });

            dev.error("Google 로그인 오류 코드:", error);
        }
      } else {
        dev.error("Google 로그인 오류:", error);
        Toast.show({
          type: "error",
          text1: "로그인 중 오류가 발생했습니다.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // 백엔드에 토큰 전송
  const sendTokenToBackend = async (idToken: string, countryCode: string) => {
    try {
      dev.log("백엔드에 토큰 전송:", { idToken: "***", countryCode });

      const response = await axiosInstance.post("/backend_api/google", {
        idToken,
        countryCode,
      });

      dev.log("백엔드 응답:", response.data);

      // 응답에서 토큰 추출 (백엔드 응답 구조에 따라 조정 필요)
      const { accessToken, refreshToken } = response.data;

      if (accessToken && refreshToken) {
        // AuthStore에 로그인 정보 저장
        login(accessToken, refreshToken, countryCode);

        Toast.show({
          type: "success",
          text1: "로그인 성공",
        });

        // 메인 앱으로 이동
        router.replace("/(main)");
      } else {
        throw new Error("토큰을 받을 수 없습니다.");
      }
    } catch (error) {
      dev.error("백엔드 API 오류:", error);
      Toast.show({
        type: "error",
        text1: "서버 연결 중 오류가 발생했습니다.",
      });
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
