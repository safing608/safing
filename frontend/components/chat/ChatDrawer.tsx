import FontText from "@/components/common/FontText";
import IconButton from "@/components/common/IconButton";
import { COLORS } from "@/constants/colors";
import { FONT_SIZES, SPACING } from "@/constants/sizes";
import { mockChatItem } from "@/mock/chat";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Lucide from "@react-native-vector-icons/lucide";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ChatDrawerProps {
  visible: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onLanguageChange: () => void;
  onSettings: () => void;
  onChatHistory: () => void;
}

function ChatDrawer({
  visible,
  onClose,
  onNewChat,
  onLanguageChange,
  onSettings,
  onChatHistory,
}: ChatDrawerProps) {
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.8, 320); // 최대 320px

  const { t } = useTranslation();

  const mockChatItemData = mockChatItem;


  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* 배경 Overlay */}
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* 드로어 컨테이너 */}
        <View style={[styles.drawerContainer, { width: drawerWidth }]}>
          <SafeAreaView style={styles.safeArea}>
            {/* 헤더 */}
            <View style={styles.header}>
              <IconButton
                icon={<Ionicons name="close" size={24} color={COLORS.BLACK} />}
                onPress={onClose}
                size="small"
              />
            </View>

            {/* 메뉴 목록 */}
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <View>
                {/* 새로운 대화 */}
                <Pressable style={styles.menuItem} onPress={onNewChat}>
                  <MaterialIcons
                    name="add-circle-outline"
                    size={20}
                    color={COLORS.MOEL_BLUE}
                  />
                  <FontText
                    weight="medium"
                    size={FONT_SIZES.BODY}
                    color={COLORS.BLACK}
                    style={styles.menuText}
                  >
                    {t("chat.drawer_new_chat")}
                  </FontText>
                </Pressable>
                {/* 언어 변경 */}
                <Pressable style={styles.menuItem} onPress={onLanguageChange}>
                  <MaterialIcons
                    name="language"
                    size={20}
                    color={COLORS.MOEL_BLUE}
                  />
                  <FontText
                    weight="medium"
                    size={FONT_SIZES.BODY}
                    color={COLORS.BLACK}
                    style={styles.menuText}
                  >
                    {t("chat.drawer_language")}
                  </FontText>
                </Pressable>

                {/* auth 관련 */}
                <Pressable style={styles.menuItem} onPress={onSettings}>
                  <Lucide
                    name="settings"
                    size={20}
                    color={COLORS.MOEL_BLUE}
                  />
                  <FontText
                    weight="medium"
                    size={FONT_SIZES.BODY}
                    color={COLORS.BLACK}
                    style={styles.menuText}
                  >
                    {t("auth.settings")}
                  </FontText>
                </Pressable>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* 대화 목록 */}
              {mockChatItemData.length > 0 && (
              <View style={styles.historySection}>
                <View style={styles.historyItemHeader}>
                  <MaterialIcons
                    name="chat-bubble-outline"
                    size={20}
                    color={COLORS.MOEL_BLUE}
                  />
                  <FontText
                    weight="medium"
                    size={FONT_SIZES.BODY}
                    color={COLORS.BLACK}
                    style={styles.sectionTitle}
                  >
                    {t("chat.drawer_chat_history")}
                  </FontText>
                </View>

                {mockChatItemData.map((title, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.historyItem,
                      index === 0 && styles.historyItemSelected,
                    ]}
                    onPress={onChatHistory}
                  >
                    <FontText
                      size={FONT_SIZES.CAPTION}
                      color={index === 0 ? COLORS.WHITE : COLORS.BLACK}
                      style={styles.historyText}
                    >
                      {title}
                    </FontText>
                  </Pressable>
                ))}
              </View>
                 )}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
  },
  drawerContainer: {
    height: "100%",
    backgroundColor: COLORS.WHITE,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: SPACING.LARGE,
    paddingVertical: SPACING.MEDIUM,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.LARGE,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.MEDIUM,
    gap: SPACING.MEDIUM,
  },
  menuText: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginVertical: SPACING.MEDIUM,
  },
  historySection: {
    paddingBottom: SPACING.LARGE,
  },
  sectionTitle: {
    paddingVertical: SPACING.MEDIUM,
  },
  historyItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.MEDIUM,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.MEDIUM,
    gap: SPACING.SMALL,
    borderRadius: 8,
    marginVertical: 2,
  },
  historyItemSelected: {
    backgroundColor: COLORS.MOEL_BLUE,
  },
  historyText: {
    flex: 1,
    lineHeight: 18,
  },
});

export default ChatDrawer;
