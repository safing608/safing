import { useAuthStore } from "@/stores/authStore";
import { dev } from "@/utils/dev";
import axios, { create } from "axios";

// API 클라이언트 생성
const axiosInstance = create({
  baseURL: process.env.EXPO_PUBLIC_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: 모든 요청에 accessToken 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();

    dev.log("요청 URL:", config.url);

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: 에러 시 토큰 갱신
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 로그인/가입 관련 엔드포인트와 첫 진입 시 토큰 갱신 제외
    const isAuthEndpoint =
      originalRequest.url?.includes("/api/auth/google") ||
      originalRequest.url?.includes("/api/auth/google/signup") ||
      originalRequest.url?.includes("/api/auth/reissue");

    // 401 또는 403 에러이고 아직 재시도하지 않은 경우 (단, 인증 엔드포인트 제외)
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      dev.log("토큰 갱신 시도:", {
        status: error.response?.status,
        url: originalRequest.url,
        method: originalRequest.method,
      });

      try {
        const { refreshToken, updateTokens, logout } =
          useAuthStore.getState();

          dev.log("refreshToken", refreshToken);

        // 리프레시 토큰이 없는 경우
        if (!refreshToken) {
          await logout("/login");
          throw new Error("Refresh token 없음");
        }

        // 토큰 재발급 요청
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/auth/reissue`,
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (response?.status !== 200) {
          await logout("/login");
          dev.error("토큰 재발급 실패:", response.data?.message);
        }

        // 새로운 access token 추출
        const newAccessToken = response.data?.data?.accessToken ?? "";
        dev.log("새로운 access token", newAccessToken ? "발급 완료" : "실패");

        // 새로운 access token을 저장
        await updateTokens(newAccessToken, refreshToken);

        // 원래 요청에 새 토큰 적용 (headers 객체 보장)
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        dev.log("원래 요청 재시도:", {
          url: originalRequest.url,
          method: originalRequest.method,
          hasAuthHeader: !!originalRequest.headers.Authorization,
          authHeaderValue:
            originalRequest.headers.Authorization?.substring(0, 20) + "...",
        });

        // 원래 요청 재시도
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // 토큰 재발급 실패 시 로그아웃
        await useAuthStore.getState().logout("/login");
        throw refreshError;
      }
    }

    // 에러 디버깅 정보 추가
    dev.error("Axios 응답 에러:", {
      uri: error.config?.baseURL + error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });

    throw error;
  },
);

export default axiosInstance;
