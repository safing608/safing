import { useAuthStore } from "@/stores/authStore";
import { LoginRequestDTO, SignupRequestDTO } from "@/types/auth";
import { dev } from "@/utils/dev";
import axiosInstance from "./axios";

// 회원가입 API
export async function signup(payload: SignupRequestDTO) {
  const response = await axiosInstance.post(
    "/api/auth/google/signup",
    payload,
    {
      headers: {
        Authorization: undefined,
      },
    },
  );

  // 409 중복 회원가입 시 1초 후 /api/auth/google을 1회 재호출하여 가입 상태를 다시 확인
  if (response.status === 409) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const status = await login({ idToken: payload.idToken });
    if (status.isSignupRequired) {
      return { isSignupRequired: true };
    }
  }

  // 회원 가입 후 로그인 진행
  if (response.status === 200) {
    await login({ idToken: payload.idToken });
  } else {
    throw new Error();
  }
}

// 로그인 API
export async function login(payload: LoginRequestDTO) {
  const response = await axiosInstance.post("/api/auth/google", payload, {
    headers: {
      Authorization: undefined,
    },
  });

  const data = response?.data?.data;

  // 회원가입 필요한 신규 회원인 경우
  if (data.status === "SIGNUP_REQUIRED") {
    return { isSignupRequired: true };
  }

  // 기존 회원의 로그인
  const { login: setAuth } = useAuthStore.getState();
  await setAuth(data.accessToken, data.refreshToken, data.countryCode);

  return { isSignupRequired: false };
}

// 로그아웃 API
export async function logout() {
  const { refreshToken, logout: logoutAction } = useAuthStore.getState();

  if (!refreshToken) {
    dev.error("RefreshToken이 없습니다");
  }

  const response = await axiosInstance.post("/api/auth/logout", {
    refreshToken,
  });

  if (response.status === 200) {
    await logoutAction("/login");
  } else {
    throw new Error();
  }
}

// 회원 탈퇴 API 구현중
export async function deleteAccount() {
  // TODO: 회원 탈퇴 API 구현
}
