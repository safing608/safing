import { useAuthStore } from "@/stores/authStore";
import { dev } from "@/utils/dev";
import axios from "axios";

// API 클라이언트 생성
const axiosInstance = axios.create({
  baseURL: process.env.EXPO_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: 모든 요청에 accessToken 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();

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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken, updateAccessToken, logout } =
          useAuthStore.getState();

        // 리프레시 토큰이 없는 경우
        if (!refreshToken) {
          logout("/login");
          dev.log("Refresh token is not found");
          throw new Error("Refresh token is not found");
        }

        // 토큰 재발급 요청
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_API_BASE_URL}/reissue`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          },
        );

        dev.log("요청 응답 확인", response);

        // 새로운 access token 추출
        const newAccessToken = response.data?.data?.accessToken ?? "";
        dev.log("새로운 access token", newAccessToken);

        // 새로운 access token이 없는 경우
        if (!newAccessToken) {
          dev.log("새로운 access token을 발급받지 못했습니다.");
          throw new Error("새로운 access token을 발급받지 못했습니다.");
        }

        // 새로운 access token을 저장
        updateAccessToken(newAccessToken);

        // 새로운 access token을 헤더에 추가
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 원래 요청 재시도
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // 토큰 재발급 실패 시 로그아웃
        useAuthStore.getState().logout("/login");
        throw refreshError;
      }
    }

    throw error;
  },
);

export default axiosInstance;
