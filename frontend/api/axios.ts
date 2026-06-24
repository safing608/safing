import axios from "axios";
import { Platform } from "react-native";

// API 클라이언트 생성
const axiosInstance = axios.create({
    baseURL: process.env.EXPO_API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
});

export default axiosInstance;
