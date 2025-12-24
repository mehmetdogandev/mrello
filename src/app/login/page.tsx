import Link from "next/link"
import { LoginForm } from "@/lib/components/auth/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/components/ui/card"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <span className="text-3xl font-bold text-primary-foreground">M</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">MIRELLO</h1>
          <p className="text-muted-foreground">
            Projelerinizi yönetmek için giriş yapın
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Giriş Yap</CardTitle>
            <CardDescription>
              Hesabınıza giriş yapmak için bilgilerinizi girin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Hesabınız yok mu? </span>
              <Link
                href="/register"
                className="font-semibold text-primary hover:underline"
              >
                Kayıt ol
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
