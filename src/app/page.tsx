import { redirect } from "next/navigation";
import { getSession } from "@/lib/server/better-auth/server";
import { Sidebar } from "@/lib/components/sidebar/sidebar";
import { DashboardContent } from "@/lib/components/dashboard/dashboard-content";

export default async function Home() {
  const session = await getSession();

  // Session yoksa veya kullanıcı yoksa login'e yönlendir
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        user={{
          id: session.user.id,
          name: session.user.name || "Kullanıcı",
          email: session.user.email || "",
          image: session.user.image,
        }}
      />
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50">
        <DashboardContent userId={session.user.id} />
      </div>
    </div>
  );
}
