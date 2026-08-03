import { signup } from "@/api/auth";
import Button from "@/components/common/Button";
import FontText from "@/components/common/FontText";
import LanguageCard from "@/components/common/LanguageCard";
import { COLORS } from "@/constants/colors";
import { CountryCode, LANGUAGE_OPTIONS } from "@/constants/i18n";
import { FONT_SIZES, SPACING } from "@/constants/sizes";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { dev } from "@/utils/dev";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

function LanguageScreen() {
  const language = useUserStore((state) => state.language);
  const setLanguage = useUserStore((state) => state.setLanguage);
  const { login: setAuth } = useAuthStore.getState();
  const { t } = useTranslation();

  // URL 파라미터로 받은 idToken과 returnTo 확인
  const { idToken, returnTo } = useLocalSearchParams<{
    idToken?: string;
    returnTo?: string;
  }>();

  // 백엔드에 토큰 전송
  const sendTokenToBackend = async (idToken: string, countryCode: string) => {
    try {
      const data = await signup({
        idToken,
        countryCode,
      });

      await setAuth(data.accessToken, data.refreshToken, data.countryCode);

      router.replace("/chat");
      
    } catch (error) {
      dev.error("language 화면에서 API 오류:", error);
      Toast.show({
        type: "error",
        text1: t("error.common_error"),
      });
    }
  };

  // 언어 선택 확인
  const handleSubmit = async () => {
    // Google 로그인에서 온 경우 백엔드 API 호출
    if (idToken && returnTo === "login") {
      await sendTokenToBackend(idToken, language);
    } else {
      // 일반적인 언어 설정 후 메인 화면으로 이동
      router.replace("/chat");
    }
  };

  // 언어 선택 시 언어 설정
  const handleSelect = useCallback(
    (countryCode: CountryCode) => {
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
              isSelected={language === countryCode}
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
