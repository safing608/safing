import IconButton from "@/components/common/IconButton";
import { COLORS } from "@/constants/colors";
import { FONT_SIZES, SPACING } from "@/constants/sizes";
import { Lucide } from "@react-native-vector-icons/lucide";
import React from "react";
import { StyleSheet, View } from "react-native";
import FontText from "../common/FontText";

interface ChatHeaderProps {
  onMenuPress: () => void;
  onDeletePress?: () => void;
}

function ChatHeader({ onMenuPress, onDeletePress }: ChatHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
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
      {onDeletePress && (
        <View style={styles.rightContainer}>
          <IconButton
            icon={<Lucide name="trash-2" size={28} color={COLORS.MOEL_BLUE} />}
            onPress={onDeletePress}
            size="small"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.MEDIUM,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
    minHeight: 56,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.MEDIUM,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default ChatHeader;
