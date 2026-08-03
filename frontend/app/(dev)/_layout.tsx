import { COLORS } from "@/constants/colors";
import { Redirect, Stack } from "expo-router";
import React from "react";

export default function DevLayout() {
  
  // 프로덕션 빌드에서는 이 레이아웃 자체를 렌더링하지 않고 바로 리다이렉트
  if (!__DEV__) {
    return <Redirect href="/chat" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: COLORS.WHITE,
        },
      }}
    >
      <Stack.Screen
        name="components"
        options={{ headerShown: false, title: "Components" }}
      />
    </Stack>
  );
}
