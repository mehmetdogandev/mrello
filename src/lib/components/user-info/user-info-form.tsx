"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/server/trpc/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import { Avatar } from "@/lib/components/ui/avatar";
import { authClient } from "@/lib/server/better-auth/client";

interface UserInfoFormProps {
  userId: string;
}

export function UserInfoForm({ userId }: UserInfoFormProps) {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    image: string | null;
  } | null>(null);

  const [formData, setFormData] = useState({
    lastName: "",
    birthDate: "",
    address: "",
    phoneNumber: "",
  });

  const { data: userInfoData } = api.auth.getUserInfo.useQuery();
  const saveUserInfo = api.auth.saveUserInfo.useMutation({
    onSuccess: () => {
      alert("Bilgileriniz başarıyla güncellendi!");
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      const session = await authClient.getSession();
      if (session?.data?.user) {
        setUser({
          name: session.data.user.name || "",
          email: session.data.user.email || "",
          image: session.data.user.image || null,
        });
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (userInfoData) {
      setFormData({
        lastName: userInfoData.lastName || "",
        birthDate: userInfoData.birthDate
          ? new Date(userInfoData.birthDate).toISOString().split("T")[0]
          : "",
        address: userInfoData.address || "",
        phoneNumber: userInfoData.phoneNumber || "",
      });
    }
  }, [userInfoData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveUserInfo.mutate({
      lastName: formData.lastName || undefined,
      birthDate: formData.birthDate || undefined,
      address: formData.address || undefined,
      phoneNumber: formData.phoneNumber || undefined,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profil Bilgileri</h1>
        <p className="mt-1 text-sm text-gray-600">
          Kişisel bilgilerinizi görüntüleyin ve güncelleyin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar
                src={user?.image || undefined}
                name={user?.name}
                size="xl"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user?.name || "Kullanıcı"}
                </h2>
                <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Info Form */}
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Kişisel Bilgiler</CardTitle>
            <CardDescription>
              Ek bilgilerinizi buradan güncelleyebilirsiniz
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Soyad
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    placeholder="Soyadınız"
                    className="transition-all focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="birthDate"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Doğum Tarihi
                  </label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDate: e.target.value })
                    }
                    className="transition-all focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Telefon Numarası
                </label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  placeholder="0555 123 45 67"
                  className="transition-all focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="address"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Adres
                </label>
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Adresiniz"
                  rows={3}
                  className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                />
              </div>

              {saveUserInfo.error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {saveUserInfo.error.message}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={saveUserInfo.isPending}
                  className="gradient-primary shadow-lg"
                >
                  {saveUserInfo.isPending ? "Kaydediliyor..." : "Bilgileri Kaydet"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

