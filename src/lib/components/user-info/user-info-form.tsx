"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/server/trpc/react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/lib/components/ui/card"
import { Button } from "@/lib/components/ui/button"
import { Input } from "@/lib/components/ui/input"
import { Label } from "@/lib/components/ui/label"
import { Avatar } from "@/lib/components/ui/avatar"
import { authClient } from "@/lib/server/better-auth/client"
import { Loader2, Save } from "lucide-react"

interface UserInfoFormProps {
  userId: string
}

export function UserInfoForm({ userId }: UserInfoFormProps) {
  const [user, setUser] = useState<{
    name: string
    email: string
    image: string | null
  } | null>(null)

  const [formData, setFormData] = useState({
    lastName: "",
    birthDate: "",
    address: "",
    phoneNumber: "",
  })

  const { data: userInfoData } = api.auth.getUserInfo.useQuery()
  const saveUserInfo = api.auth.saveUserInfo.useMutation({
    onSuccess: () => {
      alert("Bilgileriniz başarıyla güncellendi!")
    },
  })

  useEffect(() => {
    const fetchUser = async () => {
      const session = await authClient.getSession()
      if (session?.data?.user) {
        setUser({
          name: session.data.user.name || "",
          email: session.data.user.email || "",
          image: session.data.user.image || null,
        })
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (userInfoData) {
      setFormData({
        lastName: userInfoData.lastName || "",
        birthDate: userInfoData.birthDate
          ? new Date(userInfoData.birthDate).toISOString().split("T")[0]
          : "",
        address: userInfoData.address || "",
        phoneNumber: userInfoData.phoneNumber || "",
      })
    }
  }, [userInfoData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveUserInfo.mutate({
      lastName: formData.lastName || undefined,
      birthDate: formData.birthDate || undefined,
      address: formData.address || undefined,
      phoneNumber: formData.phoneNumber || undefined,
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar
                src={user?.image || undefined}
                name={user?.name}
                size="xl"
              />
              <div>
                <h2 className="text-xl font-semibold">{user?.name || "Kullanıcı"}</h2>
                <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Kişisel Bilgiler</CardTitle>
            <CardDescription>
              Profil bilgilerinizi güncelleyin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName">Soyad</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    placeholder="Soyadınız"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Doğum Tarihi</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Telefon Numarası</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  placeholder="0555 123 45 67"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adres</Label>
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Adresiniz"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {saveUserInfo.error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {saveUserInfo.error.message}
                </div>
              )}

              <Button type="submit" disabled={saveUserInfo.isPending} className="gap-2">
                {saveUserInfo.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Kaydet
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
