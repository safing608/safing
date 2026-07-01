import { COLORS } from "@/constants/colors";
import { CountryCode, LANGUAGE_OPTIONS } from "@/constants/i18n";
import { FONT_SIZES, SPACING } from "@/constants/sizes";
import { Asset } from "expo-asset";
import { Image } from "expo-image";
import React, { memo } from "react";
import { Pressable, PressableProps, StyleSheet, View } from "react-native";
import FontText from "./FontText";

// 국기 SVG 파일과 크기 설정
const flagConfig = {
  KR: {
    asset: Asset.fromModule(require("@/assets/icons/KR.svg")),
    width: 90,
    height: 90,
  },
  US: {
    asset: Asset.fromModule(require("@/assets/icons/US.svg")),
    width: 150,
    height: 150,
  },
  KH: {
    asset: Asset.fromModule(require("@/assets/icons/KH.svg")),
    width: 130,
    height: 130,
  },
  VN: {
    asset: Asset.fromModule(require("@/assets/icons/VN.svg")),
    width: 120,
    height: 120,
  },
  NP: {
    asset: Asset.fromModule(require("@/assets/icons/NP.svg")),
    width: 110,
    height: 110,
  },
} as const;

// svg 렌더링을 위해 memo 활용
const FlagIcon = memo(function FlagIcon({
  countryCode,
}: {
  countryCode: CountryCode;
}) {
  const { asset, width, height } = flagConfig[countryCode];
  return (
    <View style={styles.flagContainer}>
      <Image
        source={{ uri: asset.uri }}
        style={{ width, height }}
        contentFit="cover"
      />
    </View>
  );
});

interface LanguageCardProps extends PressableProps {
  countryCode: CountryCode;
  languageName: (typeof LANGUAGE_OPTIONS)[number]["languageName"];
  isSelected?: boolean;
}

function LanguageCard({
  countryCode,
  languageName,
  isSelected = false,
  ...props
}: LanguageCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      {...props}
    >
      {/* flagWrapper: FlagIcon 고정 + 선택 링 오버레이를 분리 */}
      <View style={styles.flagWrapper}>
        <FlagIcon countryCode={countryCode} />
        {isSelected && (
          <View style={styles.selectionRing} pointerEvents="none" />
        )}
      </View>
      <FontText
        weight="regular"
        style={[styles.languageText, isSelected && styles.selectedText]}
      >
        {languageName}
      </FontText>
    </Pressable>
  );
}

const CONTAINER_SIZE = 80;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.LARGE,
    paddingHorizontal: SPACING.MEDIUM,
    minWidth: CONTAINER_SIZE,
    minHeight: 90,
  },
  pressed: {
    transform: [{ scale: 1.05 }],
  },
  flagWrapper: {
    width: CONTAINER_SIZE,
    height: CONTAINER_SIZE,
    marginBottom: SPACING.SMALL,
  },
  // FlagIcon memo container
  flagContainer: {
    width: CONTAINER_SIZE,
    height: CONTAINER_SIZE,
    borderRadius: CONTAINER_SIZE / 2,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    shadowColor: COLORS.MOEL_DARK_GRAY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectionRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CONTAINER_SIZE / 2,
    borderWidth: 2,
    borderColor: COLORS.MOEL_BLUE,
    transform: [{ scale: 1.05 }],
  },
  languageText: {
    fontSize: FONT_SIZES.BODY,
    color: COLORS.BLACK,
    textAlign: "center",
  },
  selectedText: {
    color: COLORS.MOEL_BLUE,
  },
});

export default memo(LanguageCard);
