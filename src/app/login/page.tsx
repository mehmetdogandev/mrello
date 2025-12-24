import Link from "next/link";
import { LoginForm } from "@/lib/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
            <span className="text-3xl font-bold text-white">M</span>
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900">
            MIRELLO
          </h1>
          <h2 className="mt-2 text-2xl font-semibold text-gray-700">
            Hesabınıza Giriş Yapın
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Projelerinizi yönetmek için giriş yapın
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-effect rounded-2xl px-8 py-10 shadow-xl backdrop-blur-lg">
          <LoginForm />
        </div>

        {/* Footer Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Hesabınız yok mu?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
            >
              Kayıt ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
