import { dev } from "@/utils/dev";
import { useFonts } from "expo-font";

export const useAppFonts = () => {
  const [loaded, error] = useFonts({
    "Pretendard-Thin": require("@/assets/fonts/Pretendard-Thin.otf"),
    "Pretendard-Light": require("@/assets/fonts/Pretendard-Light.otf"),
    "Pretendard-Regular": require("@/assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Medium": require("@/assets/fonts/Pretendard-Medium.otf"),
    "Pretendard-SemiBold": require("@/assets/fonts/Pretendard-SemiBold.otf"),
    "Pretendard-ExtraBold": require("@/assets/fonts/Pretendard-ExtraBold.otf"),
    "Pretendard-Black": require("@/assets/fonts/Pretendard-Black.otf"),
  });

  return { fontsReady: loaded || !!error, fontsError: error };
};