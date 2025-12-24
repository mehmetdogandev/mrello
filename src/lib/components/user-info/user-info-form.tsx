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
import { Badge } from "@/lib/components/ui/badge"
import { authClient } from "@/lib/server/better-auth/client"
import {
  Loader2,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  CheckCircle2,
} from "lucide-react"

interface UserInfoFormProps {
  userId: string
}

export function UserInfoForm({ userId }: UserInfoFormProps) {
  const [user, setUser] = useState<{
    name: string
    email: string
    image: string | null
    createdAt?: Date
    emailVerified?: boolean
  } | null>(null)

  const [formData, setFormData] = useState({
    lastName: "",
    birthDate: "",
    address: "",
    phoneNumber: "",
  })

  const utils = api.useUtils()
  const { data: userInfoData } = api.auth.getUserInfo.useQuery()
  const saveUserInfo = api.auth.saveUserInfo.useMutation({
    onSuccess: () => {
      utils.auth.getUserInfo.invalidate()
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
          createdAt: session.data.user.createdAt
            ? new Date(session.data.user.createdAt)
            : undefined,
          emailVerified: session.data.user.emailVerified || false,
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
          ? new Date(userInfoData.birthDate).toISOString().split("T")[0] || ""
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

  const formatDate = (date?: Date) => {
    if (!date) return "Bilinmiyor"
    return new Intl.DateTimeFormat("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Avatar
                  src={user?.image || undefined}
                  name={user?.name}
                  size="xl"
                  className="ring-4 ring-primary/20"
                />
                {user?.emailVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5 shadow-lg">
                    <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">{user?.name || "Kullanıcı"}</h2>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{user?.email}</span>
                </div>
                {user?.emailVerified && (
                  <Badge variant="default" className="mt-2">
                    E-posta Doğrulandı
                  </Badge>
                )}
              </div>
              
              <div className="w-full pt-4 border-t space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-left">
                    <span className="block font-medium text-foreground">Üyelik Tarihi</span>
                    <span className="text-xs">{formatDate(user?.createdAt)}</span>
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Kişisel Bilgiler</CardTitle>
                <CardDescription>
                  Profil bilgilerinizi görüntüleyin ve güncelleyin
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Read-only Account Info */}
              <div className="space-y-4 pb-4 border-b">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Hesap Bilgileri
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Ad
                    </Label>
                    <Input
                      value={user?.name || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      E-posta
                    </Label>
                    <Input
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>

              {/* Editable Personal Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Kişisel Bilgiler
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Soyad
                    </Label>
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
                    <Label htmlFor="birthDate" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Doğum Tarihi
                    </Label>
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
                  <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefon Numarası
                  </Label>
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
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Adres
                  </Label>
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
              </div>

              {saveUserInfo.isSuccess && (
                <div className="rounded-lg border border-primary/50 bg-primary/10 p-3 text-sm text-primary flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Bilgileriniz başarıyla güncellendi!
                </div>
              )}

              {saveUserInfo.error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {saveUserInfo.error.message}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={saveUserInfo.isPending} className="gap-2" size="lg">
                  {saveUserInfo.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Değişiklikleri Kaydet
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
