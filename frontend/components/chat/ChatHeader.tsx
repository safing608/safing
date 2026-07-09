import IconButton from "@/components/common/IconButton";
import { COLORS } from "@/constants/colors";
import { FONT_SIZES, SPACING } from "@/constants/sizes";
import { MaterialIcons } from "@expo/vector-icons";
import { Lucide } from "@react-native-vector-icons/lucide";
import React from "react";
import { StyleSheet, View } from "react-native";
import FontText from "../common/FontText";

interface ChatHeaderProps {
  onMenuPress: () => void;
  onBackPress?: () => void;
}

function ChatHeader({ onMenuPress, onBackPress }: ChatHeaderProps) {
  return (
    <View style={styles.container}>
        <IconButton
          icon={<Lucide name="menu" size={28} color={COLORS.MOEL_BLUE} />}
          onPress={onMenuPress}
          size="small"
        />
        <FontText
          weight="semibold"
          size={FONT_SIZES.H3}
          color={COLORS.MOEL_BLUE}
        >
          {"SAFING"}
        </FontText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingVertical: SPACING.MEDIUM,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
    minHeight: 56,
    gap: SPACING.MEDIUM,
  },
});

export default ChatHeader;
