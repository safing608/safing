import { COLORS } from "@/constants/colors";
import { Stack } from "expo-router";
import React from "react";

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: COLORS.WHITE,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false, title: "" }} />
    </Stack>
  );
}
