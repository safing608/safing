import { COLORS } from "@/constants/colors";
import { FONT_SIZES, SPACING } from "@/constants/sizes";
import { Asset } from "expo-asset";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
} from "react-native";

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

interface LanguageCardProps extends PressableProps {
  countryCode: "KR" | "US" | "KH" | "VN" | "NP";
  languageName: "한국어" | "영어" | "캄보디아어" | "베트남어" | "네팔어";
  isSelected?: boolean;
  onPress?: () => void;
}

function LanguageCard({
  countryCode,
  languageName,
  isSelected = false,
  onPress,
  ...props
}: LanguageCardProps) {
  const [pressed, setPressed] = useState(false);
  const flagInfo = flagConfig[countryCode];

  return (
    <Pressable
      style={[styles.container, pressed && styles.pressed]}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      {...props}
    >
      <View style={[styles.flagContainer, isSelected && styles.selected]}>
        <Image
          source={flagInfo.asset.uri}
          style={{
            width: flagInfo.width,
            height: flagInfo.height,
          }}
          contentFit="cover"
        />
      </View>
      <Text style={[styles.languageText, isSelected && styles.selectedText]}>
        {languageName}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.LARGE,
    paddingHorizontal: SPACING.MEDIUM,
    minWidth: 80,
    minHeight: 90,
  },
  selected: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.MOEL_DARK_GRAY,
    borderWidth: 1,
    shadowColor: COLORS.MOEL_DARK_GRAY,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    transform: [{ scale: 1.05 }],
  },
  pressed: {
    transform: [{ scale: 1.05 }],
  },
  flagContainer: {
    width: 80,
    height: 80,
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: SPACING.SMALL,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
    shadowColor: COLORS.MOEL_DARK_GRAY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  languageText: {
    fontSize: FONT_SIZES.BODY,
    color: COLORS.BLACK,
    textAlign: "center",
  },
  selectedText: {
    color: COLORS.BLACK,
    fontWeight: "bold",
  },
});

export default LanguageCard;
