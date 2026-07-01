import { COLORS } from "@/constants/colors";
import { Stack } from "expo-router";
import React from "react";

export default function DevLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: COLORS.WHITE,
        },
      }}
    >
      <Stack.Screen name="components" options={{ headerShown: false, title: "Components" }} />
    </Stack>
  );
}