"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/server/trpc/react"
import { Button } from "@/lib/components/ui/button"
import { CreateListDialog } from "./create-list-dialog"
import { ListColumn } from "./list-column"
import { Loader2, ArrowLeft, Plus, MoreVertical } from "lucide-react"

interface BoardViewProps {
  workspaceId: string
  boardId: string
  userId: string
}

export function BoardView({ workspaceId, boardId, userId }: BoardViewProps) {
  const router = useRouter()
  const [createListDialogOpen, setCreateListDialogOpen] = useState(false)

  const { data: board, isLoading: boardLoading } = api.board.getById.useQuery({
    id: boardId,
  })
  const { data: lists, isLoading: listsLoading } = api.list.getByBoard.useQuery({
    boardId,
  })

  if (boardLoading || listsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!board) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Pano Bulunamadı</h3>
          <p className="text-muted-foreground mb-6">
            Bu panoya erişim yetkiniz yok veya mevcut değil.
          </p>
          <Button
            onClick={() => router.push(`/workspaces/${workspaceId}`)}
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Panolara Dön
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-muted/30">
      {/* Board Header */}
      <div
        className="sticky top-0 z-40 h-20 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        style={
          board.color
            ? {
                borderBottomColor: `${board.color}40`,
              }
            : undefined
        }
      >
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/workspaces/${workspaceId}`)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri
            </Button>
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold shadow-md"
                style={{
                  backgroundColor: board.color || "var(--primary)",
                }}
              >
                {board.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">{board.name}</h1>
                {board.description && (
                  <p className="text-sm text-muted-foreground">{board.description}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateListDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Liste Ekle
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Board Content - Lists */}
      <div className="container mx-auto px-4 py-6">
        {lists && lists.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {lists.map((list) => (
              <ListColumn
                key={list.id}
                list={list}
                boardId={boardId}
                workspaceId={workspaceId}
              />
            ))}
            {/* Add List Button */}
            <div className="min-w-[280px] flex-shrink-0">
              <Button
                variant="outline"
                className="w-full h-full min-h-[200px] border-dashed gap-2"
                onClick={() => setCreateListDialogOpen(true)}
              >
                <Plus className="h-5 w-5" />
                Liste Ekle
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-bold mb-2">Henüz liste yok</h3>
            <p className="text-muted-foreground mb-6">
              İlk listenizi oluşturarak başlayın
            </p>
            <Button
              onClick={() => setCreateListDialogOpen(true)}
              size="lg"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              İlk Listeyi Oluştur
            </Button>
          </div>
        )}
      </div>

      {/* Create List Dialog */}
      <CreateListDialog
        open={createListDialogOpen}
        onOpenChange={setCreateListDialogOpen}
        boardId={boardId}
      />
    </div>
  )
}

