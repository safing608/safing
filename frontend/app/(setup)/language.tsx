import Button from "@/components/common/Button";
import FontText from "@/components/common/FontText";
import LanguageCard from "@/components/common/LanguageCard";
import { COLORS } from "@/constants/colors";
import { COUNTRY_CODE_TO_LANGUAGE, LANGUAGE_OPTIONS } from "@/constants/i18n";
import { FONT_SIZES, SPACING } from "@/constants/sizes";
import { useUserStore } from "@/stores/userStore";
import { dev } from "@/utils/dev";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function LanguageScreen() {
  const language = useUserStore((state) => state.language);
  const hasSetLanguage = useUserStore((state) => state.hasSetLanguage);
  const setLanguage = useUserStore((state) => state.setLanguage);

  // 언어 선택 확인
  const handleSubmit = () => {
    dev.log("language", language);
    // TODO: 언어 설정 후 메인 화면으로 이동
    router.push("/chat");
  };

  // 언어 선택 시 언어 설정
  const handleSelect = useCallback(
    (countryCode: keyof typeof COUNTRY_CODE_TO_LANGUAGE) => {
      dev.log("handleSelect", countryCode);
      setLanguage(COUNTRY_CODE_TO_LANGUAGE[countryCode]);
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
              isSelected={
                hasSetLanguage &&
                language === COUNTRY_CODE_TO_LANGUAGE[countryCode]
              }
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
