"use client";

import { useState } from "react";
import { authClient } from "@/lib/server/better-auth/client";
import { api } from "@/lib/server/trpc/react";

interface RegisterData {
  name: string;
  email: string;
  password: string;
  userInfo?: {
    lastName?: string;
    birthDate?: string;
    address?: string;
    phoneNumber?: string;
  };
}

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveUserInfo = api.auth.saveUserInfo.useMutation();

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Better-auth signup (otomatik olarak login yapar)
      const result = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        throw new Error(result.error.message || "Kayıt işlemi başarısız oldu");
      }

      // UserInfo'yu kaydet (signup otomatik login yaptığı için session var)
      if (data.userInfo && result.data?.user) {
        // Kısa bir gecikme ekleyerek session'ın hazır olmasını sağla
        await new Promise((resolve) => setTimeout(resolve, 100));
        
        try {
          await saveUserInfo.mutateAsync({
            lastName: data.userInfo.lastName,
            birthDate: data.userInfo.birthDate,
            address: data.userInfo.address,
            phoneNumber: data.userInfo.phoneNumber,
          });
        } catch (err) {
          console.error("UserInfo kaydedilemedi:", err);
          // UserInfo kaydedilemese bile kayıt başarılı sayılır
        }
      }

      return { success: true, user: result.data?.user };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Kayıt işlemi başarısız oldu";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error };
}

