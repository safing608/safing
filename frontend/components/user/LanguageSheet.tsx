import { changeCountryCode } from "@/api/user";
import FontText from "@/components/common/FontText";
import LanguageCard from "@/components/common/LanguageCard";
import { COLORS } from "@/constants/colors";
import { CountryCode, LANGUAGE_OPTIONS } from "@/constants/i18n";
import { FONT_SIZES, SPACING } from "@/constants/sizes";
import { useModalAnimation } from "@/hooks/useModalAnimation";
import { useUserStore } from "@/stores/userStore";
import { t as i18nT } from "i18next";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

interface LanguageSheetProps {
  visible: boolean;
  onClose: () => void;
}

function LanguageSheet({ visible, onClose }: LanguageSheetProps) {
  const { bottom } = useSafeAreaInsets();
  const { t } = useTranslation();
  const language = useUserStore((state) => state.language);
  const setLanguage = useUserStore((state) => state.setLanguage);

  const { overlayOpacity, sheetTranslateY, animationDurationOut } =
    useModalAnimation({
      visible,
    });

  // 언어 선택 시 언어 설정
  const handleSelect = useCallback(
    async (countryCode: CountryCode) => {
      try {
        await changeCountryCode({ countryCode });

        setLanguage(countryCode);
        onClose();
        setTimeout(() => {
          Toast.show({
            type: "success",
            text1: i18nT("language.changed"),
          });
        }, animationDurationOut + 50);
      } catch (error) {
        onClose();
        Toast.show({
          type: "error",
          text1: t("error.common_error"),
        });
      }
    },
    [setLanguage, onClose],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* 오버레이: fade */}
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* 시트: 아래에서 위로 슬라이드 */}
      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: bottom + SPACING.LARGE },
          { transform: [{ translateY: sheetTranslateY }] },
        ]}
      >
        <View style={styles.handle} />

        <FontText
          weight="semibold"
          size={FONT_SIZES.BODY}
          color={COLORS.BLACK}
          style={styles.title}
        >
          {t("language.select_language")}
        </FontText>

        {/*  언어 카드 그리드 */}
        <View style={styles.cardGrid}>
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
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: SPACING.SMALL,
    paddingHorizontal: SPACING.SCREEN_PADDING,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginBottom: SPACING.LARGE,
  },
  title: {
    marginBottom: SPACING.MEDIUM,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: SPACING.LARGE,
    maxWidth: 320,
    paddingVertical: SPACING.MEDIUM,
  },
});

export default LanguageSheet;
