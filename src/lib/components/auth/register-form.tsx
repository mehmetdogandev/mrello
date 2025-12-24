"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useRegister } from "@/lib/hooks/use-register"
import { Button } from "@/lib/components/ui/button"
import { Input } from "@/lib/components/ui/input"
import { Label } from "@/lib/components/ui/label"
import { AlertCircle, Loader2 } from "lucide-react"

export function RegisterForm() {
  const router = useRouter()
  const { register, isLoading, error } = useRegister()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    lastName: "",
    birthDate: "",
    address: "",
    phoneNumber: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
    })

    if (result?.success) {
      router.push("/")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">
            Ad <span className="text-destructive">*</span>
          </Label>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          E-posta <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          placeholder="ornek@email.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          Şifre <span className="text-destructive">*</span>
        </Label>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          placeholder="En az 6 karakter"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adres</Label>
        <Input
          id="address"
          type="text"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          placeholder="Adresiniz"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading} size="lg">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Kayıt olunuyor...
          </>
        ) : (
          "Kayıt Ol"
        )}
      </Button>
    </form>
  )
}
