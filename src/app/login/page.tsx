import { LoginForm } from "@/lib/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Hesabınıza Giriş Yapın
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Projelerinizi yönetmek için giriş yapın
          </p>
        </div>
        <div className="rounded-lg bg-white px-6 py-8 shadow-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

