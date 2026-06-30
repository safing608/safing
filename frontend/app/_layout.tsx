import queryClient from "@/api/client";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack } from "expo-router";
import "react-native-reanimated";
import { useFonts } from "expo-font";
import { use } from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_LANGUAGE } from "@/constants/i18n";
import { useUserStore } from "@/stores/userStore";
import { dev } from "@/utils/dev";
import Toast from "react-native-toast-message";
import toastConfig from "@/components/common/ToastConfig";

// 저장된 언어 확인하고 i18n 초기화
const initializeI18n = (() => {
  let isInitialized = false;

  return async () => {
    if (isInitialized) return;

    // AsyncStorage에서 저장된 언어 확인
    let initialLanguage = DEFAULT_LANGUAGE;
    try {
      const stored = await AsyncStorage.getItem("user-storage");
      if (stored) {
        const parsed = JSON.parse(stored);
        const userData = parsed.state;
        // 이미 언어를 설정한 사용자는 저장된 언어 사용
        if (userData?.hasSetLanguage && userData?.language) {
          initialLanguage = userData.language;
        }
      }
    } catch {
      // AsyncStorage 오류 시 기본 언어 사용
    }

    dev.log("initialLanguage", initialLanguage);

    await use(initReactI18next).init({
      resources: {
        KR: { translation: require("@/utils/i18n/kr.json").translation },
        US: { translation: require("@/utils/i18n/us.json").translation },
        KH: { translation: require("@/utils/i18n/kh.json").translation },
        VN: { translation: require("@/utils/i18n/vn.json").translation },
        NP: { translation: require("@/utils/i18n/np.json").translation },
      },
      lng: initialLanguage, // 저장된 언어 또는 기본 한국어
      fallbackLng: "KR",
      interpolation: {
        escapeValue: false,
      },
    });

    isInitialized = true;
  };
})();

// 앱 시작 시 i18n 초기화
initializeI18n().catch(console.error);

export const unstable_settings = {
  initialRouteName: "index",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useReactQueryDevTools(queryClient);
  const isHydrated = useUserStore((state) => state.isHydrated);

  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator isHydrated={isHydrated} />
      <Toast config={toastConfig} topOffset={80} bottomOffset={80} />
    </QueryClientProvider>
  );
}

function RootNavigator({ isHydrated }: { isHydrated: boolean }) {
  const [loaded, error] = useFonts({
    "Pretendard-Thin": require("@/assets/fonts/Pretendard-Thin.otf"),
    "Pretendard-Light": require("@/assets/fonts/Pretendard-Light.otf"),
    "Pretendard-Regular": require("@/assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Medium": require("@/assets/fonts/Pretendard-Medium.otf"),
    "Pretendard-SemiBold": require("@/assets/fonts/Pretendard-SemiBold.otf"),
    "Pretendard-ExtraBold": require("@/assets/fonts/Pretendard-ExtraBold.otf"),
    "Pretendard-Black": require("@/assets/fonts/Pretendard-Black.otf"),
  });

  // 폰트 로딩 완료 + store hydration 완료 대기
  if (!loaded && !error) {
    return null;
  }

  // Store가 완전히 hydrate될 때까지 네이티브 스플래시 유지
  if (!isHydrated) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(dev)" options={{ headerShown: false }} />
      <Stack.Screen name="(setup)" options={{ headerShown: false }} />
      <Stack.Screen name="(main)" options={{ headerShown: false }} />
    </Stack>
  );
}
