"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/server/trpc/react"
import { Button } from "@/lib/components/ui/button"
import { Card, CardContent } from "@/lib/components/ui/card"
import { Badge } from "@/lib/components/ui/badge"
import { CreateBoardDialog } from "./create-board-dialog"
import { Loader2, Plus, Layout, ArrowLeft, Settings } from "lucide-react"
import Link from "next/link"

interface WorkspaceBoardsProps {
  workspaceId: string
  userId: string
}

export function WorkspaceBoards({ workspaceId, userId }: WorkspaceBoardsProps) {
  const router = useRouter()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const { data: workspace, isLoading: workspaceLoading } =
    api.workspace.getById.useQuery({ id: workspaceId })
  const { data: boards, isLoading: boardsLoading } =
    api.board.getByWorkspace.useQuery({ workspaceId })

  if (workspaceLoading || boardsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-12 text-center">
          <h3 className="text-xl font-bold mb-2">Çalışma Alanı Bulunamadı</h3>
          <p className="text-muted-foreground mb-6">
            Bu çalışma alanına erişim yetkiniz yok veya mevcut değil.
          </p>
          <Button onClick={() => router.push("/workspaces")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Çalışma Alanlarına Dön
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-full">
      {/* Workspace Header */}
      <div
        className="relative h-48 w-full bg-gradient-to-br from-primary/20 to-primary/5 border-b"
        style={
          workspace.color
            ? {
                background: `linear-gradient(135deg, ${workspace.color}20 0%, ${workspace.color}08 100%)`,
              }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />
        <div className="container mx-auto px-4 py-6 relative z-10">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/workspaces")}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Geri
                </Button>
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                  style={{
                    backgroundColor: workspace.color || "var(--primary)",
                  }}
                >
                  {workspace.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    {workspace.name}
                  </h1>
                  {workspace.description && (
                    <p className="text-muted-foreground mt-1">
                      {workspace.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Ayarlar
            </Button>
          </div>
        </div>
      </div>

      {/* Boards Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Panolar</h2>
            <p className="text-muted-foreground mt-1">
              Projelerinizi organize edin ve yönetin
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Yeni Pano
          </Button>
        </div>

        {/* Boards Grid */}
        {boards && boards.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {boards.map((board) => (
              <Link
                key={board.id}
                href={`/workspaces/${workspaceId}/boards/${board.id}`}
              >
                <Card className="group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] h-full">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Board Header */}
                      <div className="flex items-start justify-between">
                        <div
                          className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md"
                          style={{
                            backgroundColor: board.color || "var(--primary)",
                          }}
                        >
                          {board.name.charAt(0).toUpperCase()}
                        </div>
                        {board.isPublic === "true" && (
                          <Badge variant="secondary" className="text-xs">
                            Public
                          </Badge>
                        )}
                      </div>

                      {/* Board Info */}
                      <div>
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                          {board.name}
                        </h3>
                        {board.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {board.description}
                          </p>
                        )}
                      </div>

                      {/* Board Footer */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                        <Layout className="h-4 w-4" />
                        <span>Pano</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
              <Layout className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Henüz pano yok</h3>
            <p className="text-muted-foreground mb-6">
              İlk panonuzu oluşturarak başlayın ve projelerinizi organize edin
            </p>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              size="lg"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              İlk Panoyu Oluştur
            </Button>
          </Card>
        )}
      </div>

      {/* Create Board Dialog */}
      <CreateBoardDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        workspaceId={workspaceId}
      />
    </div>
  )
}

