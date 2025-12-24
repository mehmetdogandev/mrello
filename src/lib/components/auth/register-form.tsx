"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRegister } from "@/lib/hooks/use-register";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";

export function RegisterForm() {
  const router = useRouter();
  const { register, isLoading, error } = useRegister();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    lastName: "",
    birthDate: "",
    address: "",
    phoneNumber: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      userInfo: {
        lastName: formData.lastName || undefined,
        birthDate: formData.birthDate || undefined,
        address: formData.address || undefined,
        phoneNumber: formData.phoneNumber || undefined,
      },
    });

    if (result?.success) {
      router.push("/");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Ad
        </label>
        <Input
          id="name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Adınız"
        />
      </div>

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
          minLength={6}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="En az 6 karakter"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
          Soyad
        </label>
        <Input
          id="lastName"
          type="text"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          placeholder="Soyadınız"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
          Doğum Tarihi
        </label>
        <Input
          id="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Adres
        </label>
        <Input
          id="address"
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Adresiniz"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
          Telefon Numarası
        </label>
        <Input
          id="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          placeholder="0555 123 45 67"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Kayıt olunuyor..." : "Kayıt Ol"}
      </Button>
    </form>
  );
}

