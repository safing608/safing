import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { dev } from "./dev";

/**
 * GoogleSignin 1회 초기화
 * - _layout.tsx 모듈 최상단에서 호출
 * - webClientId: Google Cloud Console → OAuth 클라이언트 ID → 웹 애플리케이션 항목의 ID
 *   (Android 클라이언트 ID가 아닌 Web Client ID 사용 — idToken 발급에 필요)
 */
export const configureGoogleSignin = () => {
  dev.log("GoogleSignin 설정 시도", process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID);

  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "",
  });
};
