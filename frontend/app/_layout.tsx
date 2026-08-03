import queryClient from "@/api/client";
import toastConfig from "@/components/common/ToastConfig";
import { useAppFonts } from "@/hooks/useAppFonts";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { dev } from "@/utils/dev";
import { configureGoogleSignin } from "@/utils/googleSignin";
import { initializeI18n } from "@/utils/i18n/initializeI18n";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack } from "expo-router";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import Toast from "react-native-toast-message";

// GoogleSignin 1회 초기화
configureGoogleSignin();

export const unstable_settings = {
  initialRouteName: "index",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useReactQueryDevTools(queryClient);

  const isHydrated = useUserStore((state) => state.isHydrated);
  const { fontsReady } = useAppFonts();
  const [i18nReady, setI18nReady] = useState(false);
  const [authRestored, setAuthRestored] = useState(false);

  useEffect(() => {
    // i18n 초기화
    initializeI18n()
      .catch((error) => dev.error("i18n init failed:", error))
      .finally(() => setI18nReady(true));

    // 토큰 복원
    useAuthStore
      .getState()
      .restoreTokens()
      .catch((error) => dev.error("token restore failed:", error))
      .finally(() => setAuthRestored(true));
  }, []);

  const isReady = fontsReady && isHydrated && i18nReady && authRestored;

  // 모든 초기화가 완료되었으면 스플래시 화면 숨기기
  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  // 모든 초기화가 완료되지 않았으면 네이티브 스플래시 유지
  if (!isReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
      <Toast config={toastConfig} topOffset={80} bottomOffset={80} />
    </QueryClientProvider>
  );
}

function RootNavigator() {
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
