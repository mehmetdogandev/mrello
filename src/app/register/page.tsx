import Link from "next/link";
import { RegisterForm } from "@/lib/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Hesap Oluştur
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Trello benzeri proje yönetim uygulamasına hoş geldiniz
          </p>
        </div>
        <div className="rounded-lg bg-white px-6 py-8 shadow-md">
          <RegisterForm />
          <div className="mt-4 text-center text-sm text-gray-600">
            Zaten hesabınız var mı?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
              Giriş yap
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

