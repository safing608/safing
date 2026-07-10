import * as SecureStore from "expo-secure-store";

// 저장
async function saveSecureStore(key: string, value: string) {
  await SecureStore.setItemAsync(key, value);
}

// 조회
async function getSecureStore(key: string) {
  const storedData = (await SecureStore.getItemAsync(key)) ?? null;
  return storedData;
}

// 삭제
async function deleteSecureStore(key: string) {
  await SecureStore.deleteItemAsync(key);
}

export { saveSecureStore, getSecureStore, deleteSecureStore };
