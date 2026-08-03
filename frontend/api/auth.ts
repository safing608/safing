import {
  LoginRequestDTO,
  LogoutRequestDTO,
  SignupRequestDTO,
} from "@/types/auth";
import axiosInstance from "./axios";

// 회원가입 API
export async function signup(payload: SignupRequestDTO) {
  const response = await axiosInstance.post(
    "/auth/google/signup",
    payload,
    {
      headers: {
        Authorization: undefined,
      },
    },
  );

  // 409 중복 회원가입 시 1초 후 /auth/google을 1회 재호출하여 가입 상태를 다시 확인
  if (response.status === 409) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const data = await login({ idToken: payload.idToken });
    return data;
  }

  return response?.data?.data;
}

// 로그인 API
export async function login(payload: LoginRequestDTO) {
  const response = await axiosInstance.post("/auth/google", payload, {
    headers: {
      Authorization: undefined,
    },
  });

  return response?.data?.data;
}

// 로그아웃 API
export async function logout(payload: LogoutRequestDTO) {
  const response = await axiosInstance.post("/auth/logout", payload);

  if (response.status !== 200) {
    throw new Error();
  }
  return response?.data?.data;
}

// 토큰 갱신 API
export async function reissueToken(refreshToken: string) {
  const response = await axiosInstance.post(
    "/auth/reissue",
    { refreshToken },
    {
      headers: {
        Authorization: undefined,
      },
    },
  );

  if (response.status !== 200) {
    throw new Error(response.data?.message);
  }

  return response.data?.data;
}

// 회원 탈퇴 API 구현중
export async function deleteAccount() {
  // TODO: 회원 탈퇴 API 구현
}
