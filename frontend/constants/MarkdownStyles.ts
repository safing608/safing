import { COLORS } from "@/constants/colors";
import { FONT_SIZES, SPACING } from "@/constants/sizes";

export const markdownStyles = {
  body: {
    fontSize: FONT_SIZES.BODY,
    color: COLORS.BLACK,
    lineHeight: 20,
    fontFamily: "Pretendard-Regular",
  },
  heading1: {
    fontSize: FONT_SIZES.H2,
    fontFamily: "Pretendard-SemiBold",
    color: COLORS.MOEL_BLUE,
    marginTop: SPACING.SMALL,
    marginBottom: SPACING.SMALL,
  },
  heading2: {
    fontSize: FONT_SIZES.H3,
    fontFamily: "Pretendard-SemiBold",
    color: COLORS.MOEL_BLUE,
    marginTop: SPACING.SMALL,
    marginBottom: SPACING.SMALL,
  },
  heading3: {
    fontSize: FONT_SIZES.BODY,
    fontFamily: "Pretendard-SemiBold",
    color: COLORS.MOEL_BLUE,
    marginTop: SPACING.XS,
    marginBottom: SPACING.XS,
  },
  paragraph: {
    marginBottom: SPACING.XS,
    lineHeight: 20,
    fontFamily: "Pretendard-Light",
  },
  strong: {
    fontFamily: "Pretendard-SemiBold",
    fontWeight: "600" as const,
    color: COLORS.MOEL_BLUE,
  },
  em: {
    fontStyle: "italic" as const,
    color: COLORS.MOEL_DARK_GRAY,
    fontFamily: "Pretendard-Light",
  },
  list_item: {
    marginVertical: 2,
    flexDirection: "row" as const,
    fontFamily: "Pretendard-Regular",
  },
  ordered_list: {
    marginVertical: SPACING.XS,
    fontFamily: "Pretendard-Regular",
  },
  bullet_list: {
    marginVertical: SPACING.XS,
    fontFamily: "Pretendard-Regular",
  },
  blockquote: {
    backgroundColor: COLORS.WHITE,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.MOEL_BLUE,
    paddingLeft: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    marginVertical: SPACING.SMALL,
    borderRadius: 4,
    fontFamily: "Pretendard-Regular",
  },
  code_inline: {
    backgroundColor: COLORS.LIGHT_GRAY,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: "monospace",
    fontSize: FONT_SIZES.CAPTION,
  },
  fence: {
    backgroundColor: COLORS.LIGHT_GRAY,
    padding: SPACING.MEDIUM,
    borderRadius: 8,
    marginVertical: SPACING.SMALL,
    fontFamily: "Pretendard-Regular",
  },
  code_block: {
    backgroundColor: COLORS.LIGHT_GRAY,
    padding: SPACING.MEDIUM,
    borderRadius: 8,
    marginVertical: SPACING.SMALL,
    fontFamily: "monospace",
  },
};
