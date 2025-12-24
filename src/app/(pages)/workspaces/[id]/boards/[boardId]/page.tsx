import { redirect } from "next/navigation"
import { getSession } from "@/lib/server/better-auth/server"
import { Header } from "@/lib/components/layout/header"
import { Footer } from "@/lib/components/layout/footer"
import { BoardView } from "@/lib/components/board/board-view"

export default async function BoardDetailPage({
  params,
}: {
  params: Promise<{ id: string; boardId: string }>
}) {
  const session = await getSession()
  const { id: workspaceId, boardId } = await params

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
        <BoardView workspaceId={workspaceId} boardId={boardId} userId={session.user.id} />
      </main>
      <Footer />
    </div>
  )
}

