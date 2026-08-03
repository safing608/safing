import { COLORS } from "@/constants/colors";
import { Stack } from "expo-router";
import React from "react";

export default function SetupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: COLORS.WHITE,
        },
      }}
    >
      <Stack.Screen name="language" options={{ headerShown: false }} />
    </Stack>
  );
}
