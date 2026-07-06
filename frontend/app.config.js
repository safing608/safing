export default {
  expo: {
    name: "SAFING",
    slug: "SAFING",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/logo/icon.png",
    scheme: "safing",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    extra: {
      eas: {
        projectId: "155a8adc-1cfa-46fe-aee0-99c5ac77f099",
      },
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.safing.app",
      googleServicesFile:
        process.env.GOOGLE_INFO_JSON ?? "./GoogleService-Info.plist",
    },

    android: {
      package: "com.safing.app",
      supportsTablet: false,
      adaptiveIcon: {
        backgroundColor: "#FAFAFA",
        foregroundImage: "./assets/logo/icon.png",
        resizeMode: "contain",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      // EAS 빌드 시 환경변수(파일 시크릿)로 주입, 로컬은 파일 직접 참조
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
    },

    web: {
      output: "static",
      favicon: "./assets/logo/icon.png",
      bundleIdentifier: "com.safing.app",
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#FAFAFA",
          image: "./assets/logo/safing_not_title.png",
          resizeMode: "contain",
        },
      ],
      "expo-asset",
      [
        "expo-font",
        {
          fonts: [
            "assets/fonts/Pretendard-Thin.otf",
            "assets/fonts/Pretendard-Light.otf",
            "assets/fonts/Pretendard-Regular.otf",
            "assets/fonts/Pretendard-Medium.otf",
            "assets/fonts/Pretendard-SemiBold.otf",
            "assets/fonts/Pretendard-ExtraBold.otf",
            "assets/fonts/Pretendard-Black.otf",
          ],
        },
      ],
    ],
  },
};
