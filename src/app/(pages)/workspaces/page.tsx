import { redirect } from "next/navigation"
import { getSession } from "@/lib/server/better-auth/server"
import { Header } from "@/lib/components/layout/header"
import { Footer } from "@/lib/components/layout/footer"
import { WorkspaceDataTable } from "@/lib/components/tables/workspace-data-table"

export default async function WorkspacesPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        user={{
          id: session.user.id,
          name: session.user.name || "Kullanıcı",
          email: session.user.email || "",
          image: session.user.image,
        }}
      />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Çalışma Alanları</h1>
            <p className="text-muted-foreground mt-2">
              Projelerinizi organize etmek için çalışma alanları oluşturun
            </p>
          </div>
          <WorkspaceDataTable />
        </div>
      </main>
      <Footer />
    </div>
  )
}
