import { deleteAccount, logout } from "@/api/auth";
import FontText from "@/components/common/FontText";
import { COLORS } from "@/constants/colors";
import { FONT_SIZES, SPACING } from "@/constants/sizes";
import { useModalAnimation } from "@/hooks/useModalAnimation";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { dev } from "@/utils/dev";
import Lucide from "@react-native-vector-icons/lucide";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

interface AuthSheetProps {
  visible: boolean;
  onClose: () => void;
}

function AuthSheet({ visible, onClose }: AuthSheetProps) {
  const { bottom } = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { logout: logoutAction, refreshToken } = useAuthStore.getState();
  const { overlayOpacity, sheetTranslateY, sheetScale } = useModalAnimation({
    visible,
  });

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await logout({ refreshToken: refreshToken! });
      await logoutAction("/login");
    } catch (error) {
      dev.error("로그아웃 오류:", error);
    } finally {
      router.replace("/login");
    }
  };

  // 회원탈퇴 핸들러
  const handleDeleteAccount = useCallback(() => {
    Alert.alert(t("auth.delete_account"), t("auth.delete_account_confirm"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("auth.delete"),
        style: "destructive",
        onPress: () => {
          deleteAccount();
          onClose();
        },
      },
    ]);
  }, [onClose]);

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

      {/* 시트: 아래에서 위로 슬라이드 + 스케일 */}
      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: bottom + SPACING.LARGE },
          {
            transform: [{ translateY: sheetTranslateY }, { scale: sheetScale }],
          },
        ]}
      >
        <View style={styles.handle} />

        <FontText
          weight="semibold"
          size={FONT_SIZES.BODY}
          color={COLORS.BLACK}
          style={styles.title}
        >
          {t("auth.settings")}
        </FontText>

        {/* 메뉴 옵션 */}
        <View style={styles.menuContainer}>
          {/* 로그아웃 */}
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
            onPress={handleLogout}
            disabled={loading}
          >
            <View style={styles.menuItemContent}>
              <Lucide
                name="log-out"
                size={24}
                color={COLORS.MOEL_BLUE}
                style={styles.menuIcon}
              />
              <FontText
                weight="medium"
                size={FONT_SIZES.BODY}
                color={COLORS.BLACK}
              >
                {t("auth.logout")}
              </FontText>
            </View>
          </Pressable>

          {/* 구분선 */}
          <View style={styles.separator} />

          {/* 회원탈퇴 */}
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
            onPress={handleDeleteAccount}
            disabled={loading}
          >
            <View style={styles.menuItemContent}>
              <Lucide
                name="user-round-x"
                size={24}
                color={COLORS.ERROR_RED}
                style={styles.menuIcon}
              />
              <FontText
                weight="medium"
                size={FONT_SIZES.BODY}
                color={COLORS.ERROR_RED}
              >
                {t("auth.delete_account")}
              </FontText>
            </View>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: SPACING.SMALL,
    paddingHorizontal: SPACING.SCREEN_PADDING,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
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
  menuContainer: {
    width: "100%",
    paddingVertical: SPACING.MEDIUM,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.SMALL,
    borderRadius: 12,
  },
  menuItemPressed: {
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    marginRight: SPACING.MEDIUM,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginHorizontal: SPACING.SMALL,
  },
});

export default AuthSheet;
