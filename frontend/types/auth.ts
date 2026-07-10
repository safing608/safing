import { ResponseDTO } from "./api";

// 로그인 요청
export interface LoginRequestDTO {
  idToken: string;
}

// 로그인 응답
export interface LoginResponseDTO {
  status: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
}

// 미가입 유저 로그인 응답
export interface NotRegisteredLoginResponseDTO {
  status: "SIGNUP_REQUIRED";
}

// 회원가입 요청
export interface SignupRequestDTO {
  idToken: string;
  countryCode: string;
}

// 회원가입 응답
export interface SignupResponseDTO {
  userId: string;
  accessToken: string;
  refreshToken: string;
}

// 로그아웃 요청
export interface LogoutRequestDTO {
  refreshToken: string;
}

// 토큰 재발급 요청
export type TokenRequestDTO = {
  refreshToken: string;
};

// 토큰 재발급 응답
export type TokenResponseDTO = ResponseDTO<{
  accessToken: string;
  refreshToken: string;
}>;
