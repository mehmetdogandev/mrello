import Link from "next/link"
import { RegisterForm } from "@/lib/components/auth/register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/components/ui/card"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <span className="text-3xl font-bold text-primary-foreground">M</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">MIRELLO</h1>
          <p className="text-muted-foreground">
            Trello benzeri proje yönetim uygulamasına hoş geldiniz
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Hesap Oluştur</CardTitle>
            <CardDescription>
              Yeni bir hesap oluşturmak için bilgilerinizi girin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Zaten hesabınız var mı? </span>
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline"
              >
                Giriş yap
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
