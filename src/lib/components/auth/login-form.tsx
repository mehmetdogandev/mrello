"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLogin } from "@/lib/hooks/use-login";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading, error } = useLogin();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login({
      email: formData.email,
      password: formData.password,
    });

    if (result?.success) {
      router.push("/");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          E-posta
        </label>
        <Input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="ornek@email.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Şifre
        </label>
        <Input
          id="password"
          type="password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Şifreniz"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </Button>

      <div className="text-center text-sm text-gray-600">
        Hesabınız yok mu?{" "}
        <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700">
          Kayıt ol
        </Link>
      </div>
    </form>
  );
}

