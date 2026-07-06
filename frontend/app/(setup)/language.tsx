import Button from "@/components/common/Button";
import FontText from "@/components/common/FontText";
import LanguageCard from "@/components/common/LanguageCard";
import { COLORS } from "@/constants/colors";
import { CountryCode, LANGUAGE_OPTIONS } from "@/constants/i18n";
import { FONT_SIZES, SPACING } from "@/constants/sizes";
import { useUserStore } from "@/stores/userStore";
import { useAuthStore } from "@/stores/authStore";
import axiosInstance from "@/api/axios";
import { dev } from "@/utils/dev";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

function LanguageScreen() {
  const language = useUserStore((state) => state.language);
  const hasSetLanguage = useUserStore((state) => state.hasSetLanguage);
  const setLanguage = useUserStore((state) => state.setLanguage);
  const { login } = useAuthStore();
  
  // URL 파라미터로 받은 idToken과 returnTo 확인
  const { idToken, returnTo } = useLocalSearchParams<{
    idToken?: string;
    returnTo?: string;
  }>();

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

  // 언어 선택 확인
  const handleSubmit = async () => {
    dev.log("선택된 언어:", language);
    
    // 언어 설정 완료 (hasSetLanguage를 true로 설정)
    if (!hasSetLanguage) {
      setLanguage(language);
    }
    
    // Google 로그인에서 온 경우 백엔드 API 호출
    if (idToken && returnTo === "login") {
      await sendTokenToBackend(idToken, language);
    } else {
      // 일반적인 언어 설정 후 메인 화면으로 이동
      router.replace("/(main)/chat");
    }
  };

  // 언어 선택 시 언어 설정
  const handleSelect = useCallback(
    (countryCode: CountryCode) => {
      dev.log("handleSelect", countryCode);
      setLanguage(countryCode);
    },
    [setLanguage],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.guideTextContainer}>
          <FontText
            weight="semibold"
            size={FONT_SIZES.BODY}
            color={COLORS.MOEL_BLUE}
            style={styles.guideText}
          >
            언어를 설정해주세요.
          </FontText>
          <FontText
            weight="semibold"
            size={FONT_SIZES.BODY}
            color={COLORS.MOEL_BLUE}
            style={styles.guideText}
          >
            Please choose your language
          </FontText>
        </View>
        <View style={styles.languageContainer}>
          {LANGUAGE_OPTIONS.map(({ countryCode, languageName }) => (
            <LanguageCard
              key={countryCode}
              countryCode={countryCode}
              languageName={languageName}
              isSelected={hasSetLanguage && language === countryCode}
              onPress={() => handleSelect(countryCode)}
            />
          ))}
        </View>
        <Button
          label="확인"
          onPress={handleSubmit}
          variant="blueFilled"
          pressableStyle={styles.confirmButton}
        />
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.SCREEN_PADDING,
    paddingVertical: SPACING.XL,
    gap: SPACING.XL,
  },
  guideTextContainer: {
    gap: SPACING.XS,
  },
  guideText: {
    textAlign: "center",
  },
  languageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.LARGE,
    maxWidth: 300,
  },
  confirmButton: {
    width: "60%",
  },
});

export default LanguageScreen;
