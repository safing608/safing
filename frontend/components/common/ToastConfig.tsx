import FontText from "@/components/common/FontText";
import { COLORS } from "@/constants/colors";
import { FONT_SIZES, SPACING } from "@/constants/sizes";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ToastConfig } from "react-native-toast-message";

const toastConfig: ToastConfig = {
  success: ({ text1 }) => (
    <View style={[styles.container, styles.success]}>
      <Ionicons name="checkmark-circle" size={20} color={COLORS.GREEN} />
      <FontText weight="medium" size={FONT_SIZES.BODY} style={styles.text}>
        {text1}
      </FontText>
    </View>
  ),
  error: ({ text1 }) => (
    <View style={[styles.container, styles.error]}>
      <Ionicons name="alert-circle" size={20} color={COLORS.ERROR_RED} />
      <FontText weight="medium" size={FONT_SIZES.BODY} style={styles.text}>
        {text1}
      </FontText>
    </View>
  ),
  info: ({ text1 }) => (
    <View style={[styles.container, styles.info]}>
      <Ionicons name="information-circle" size={20} color={COLORS.MOEL_BLUE} />
      <FontText weight="medium" size={FONT_SIZES.BODY} style={styles.text}>
        {text1}
      </FontText>
    </View>
  ),
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.SMALL,
    backgroundColor: COLORS.WHITE,
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.LARGE,
    borderRadius: 12,
    marginHorizontal: SPACING.LARGE,
    borderLeftWidth: 4,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  success: {
    borderLeftColor: COLORS.GREEN,
  },
  error: {
    borderLeftColor: COLORS.ERROR_RED,
  },
  info: {
    borderLeftColor: COLORS.MOEL_BLUE,
  },
  text: {
    color: COLORS.BLACK,
    flexShrink: 1,
  },
});

export default toastConfig;
