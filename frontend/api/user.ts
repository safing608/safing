import { ChangeCountryCodeRequestDTO } from "@/types/user";
import axiosInstance from "./axios";

// 국가 코드 변경
export async function changeCountryCode(payload: ChangeCountryCodeRequestDTO) {
  const response = await axiosInstance.patch("/users/country-code", payload);

  if (response.status !== 200) {
    throw new Error();
  }

}
