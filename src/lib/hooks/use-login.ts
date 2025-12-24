"use client";

import { useState } from "react";
import { authClient } from "@/lib/server/better-auth/client";

interface LoginData {
  email: string;
  password: string;
}

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: LoginData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        throw new Error(result.error.message || "Giriş işlemi başarısız oldu");
      }

      return { success: true, user: result.data?.user };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Giriş işlemi başarısız oldu";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
}

