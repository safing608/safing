import FontText from "@/components/common/FontText";
import LanguageCard from "@/components/common/LanguageCard";
import { COLORS } from "@/constants/colors";
import { FONT_SIZES, SPACING } from "@/constants/sizes";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface LanguageScreenProps {}

function LanguageScreen({}: LanguageScreenProps) {
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
            Please choose Your language
          </FontText>
        </View>
        <View style={styles.languageContainer}>
          <LanguageCard
            countryCode="KR"
            languageName="한국어"
            isSelected={false}
          />
          <LanguageCard
            countryCode="US"
            languageName="영어"
            isSelected={false}
          />
          <LanguageCard
            countryCode="KH"
            languageName="캄보디아어"
            isSelected={false}
          />
          <LanguageCard
            countryCode="VN"
            languageName="베트남어"
            isSelected={false}
          />
          <LanguageCard
            countryCode="NP"
            languageName="네팔어"
            isSelected={false}
          />
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
    maxWidth: 300, // 2개씩 배치되도록 최대 너비 제한
  },
});

export default LanguageScreen;
