import { useAuthStore } from "@/stores/authStore";
import { router } from "expo-router";
import React, { ReactNode, useEffect } from "react";

interface AuthRouteProps {
  children: ReactNode;
}

function AuthRoute({ children }: AuthRouteProps) {
  const { isAuthenticated, isHydrated } = useAuthStore();

  useEffect(() => {
    // 인증 상태 확인
    if (isHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isHydrated]);

  if (!isHydrated || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export default AuthRoute;
