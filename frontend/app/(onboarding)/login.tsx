import FontText from "@/components/common/FontText";
import { COLORS } from "@/constants/colors";
import { FONT_SIZES, SPACING } from "@/constants/sizes";
import { Image } from "expo-image";
import React from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// TODO: 백엔드 API 준비 후 주석 해제
// import { GoogleSignin } from '@react-native-google-signin/google-signin';

interface LoginScreenProps {}

function LoginScreen({}: LoginScreenProps) {
  const { width } = useWindowDimensions();
  // SVG 원본 비율: 694:778 (가로:세로)
  const aspectRatio = 778 / 694; // 약 1.12 (세로가 더 김)
  const imageWidth = width * 0.4;
  const imageHeight = imageWidth * aspectRatio;

  // Google 로고 반응형 크기 계산
  // 원본 Google SVG 비율: 189:40 (가로:세로)
  const googleAspectRatio = 40 / 189; // 세로/가로
  const googleButtonWidth = Math.min(300, width * 0.5); // 화면 너비의 50%
  const googleButtonHeight = googleButtonWidth * googleAspectRatio;

  // 반응형 폰트 크기 계산 (고려해보기)
  // const responsiveTitleSize = Math.min(Math.max(width * 0.07, 16), 24); // 최소 20px, 최대 32px
  // const responsiveCaptionSize = Math.min(Math.max(width * 0.04, 8 ), 16); // 최소 12px, 최대 18px

  // TODO: 백엔드 API 연동 시 실제 Google OAuth 구현
  const handleGoogleLogin = async () => {
    try {
      // TODO: Google 설정 초기화 (app.json의 GoogleService 파일 필요)
      // await GoogleSignin.hasPlayServices();
      // const userInfo = await GoogleSignin.signIn();
      // console.log('Google User Info:', userInfo);

      // TODO: 백엔드 API로 토큰 전송하여 인증 처리
      // const response = await fetch('/api/auth/google', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ idToken: userInfo.idToken })
      // });

      Alert.alert(
        "Google 로그인",
        "백엔드 API 연동 후 구현될 예정입니다.\n\n준비사항:\n• Google Cloud Console 설정\n• GoogleService-Info.plist (iOS)\n• google-services.json (Android)",
        [{ text: "확인" }],
      );
    } catch (error) {
      console.error("Google Sign-In Error:", error);
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
          <Pressable onPress={handleGoogleLogin}>
            <Image
              source={require("@/assets/icons/google.svg")}
              style={[
                styles.googleIcon,
                {
                  width: googleButtonWidth,
                  height: googleButtonHeight,
                },
              ]}
            />
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
  },
  googleIcon: {
    // 반응형 크기는 인라인 스타일로 적용
    borderRadius: 20, // Google 버튼의 둥근 모서리
  },
});

export default LoginScreen;
