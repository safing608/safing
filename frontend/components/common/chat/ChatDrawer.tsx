import FontText from "@/components/common/FontText";
import IconButton from "@/components/common/IconButton";
import { COLORS } from "@/constants/colors";
import { FONT_SIZES, SPACING } from "@/constants/sizes";
import { mockChatItem } from "@/mock/chat";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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
  onChatHistory: () => void;
}

function ChatDrawer({
  visible,
  onClose,
  onNewChat,
  onLanguageChange,
  onChatHistory,
}: ChatDrawerProps) {
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.8, 320); // 최대 320px

  const { t } = useTranslation();

  // 메뉴 아이템 데이터
  const menuItemsData = [
    {
      id: "newChat",
      icon: "add-circle-outline" as const,
      title: t("chat.drawer_new_chat"),
    },
    {
      id: "language",
      icon: "language" as const,
      title: t("chat.drawer_language"),
    },
  ];

  const mockChatItemData = mockChatItem;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Background Overlay */}
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Drawer Container */}
        <View style={[styles.drawerContainer, { width: drawerWidth }]}>
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <IconButton
                icon={<Ionicons name="close" size={24} color={COLORS.BLACK} />}
                onPress={onClose}
                size="small"
              />
            </View>

            {/* Content */}
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Menu Items */}
              <View>
                {menuItemsData.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.menuItem}
                    onPress={() => {}}
                  >
                    <MaterialIcons
                      name={item.icon}
                      size={20}
                      color={COLORS.MOEL_BLUE}
                    />
                    <FontText
                      weight="medium"
                      size={FONT_SIZES.BODY}
                      color={COLORS.BLACK}
                      style={styles.menuText}
                    >
                      {item.title}
                    </FontText>
                  </Pressable>
                ))}
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Chat History Section */}
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
