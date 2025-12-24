import { redirect } from "next/navigation"
import { getSession } from "@/lib/server/better-auth/server"
import { Header } from "@/lib/components/layout/header"
import { Footer } from "@/lib/components/layout/footer"
import { WorkspaceBoards } from "@/lib/components/workspace/workspace-boards"

export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  const { id } = await params

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
        <WorkspaceBoards workspaceId={id} userId={session.user.id} />
      </main>
      <Footer />
    </div>
  )
}

