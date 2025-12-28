"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core"
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
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
  const [activeListId, setActiveListId] = useState<string | null>(null)

  const utils = api.useUtils()
  const { data: board, isLoading: boardLoading } = api.board.getById.useQuery({
    id: boardId,
  })
  const { data: lists, isLoading: listsLoading } = api.list.getByBoard.useQuery({
    boardId,
  })

  const updateListPosition = api.list.updatePosition.useMutation({
    onSuccess: () => {
      utils.list.getByBoard.invalidate({ boardId })
    },
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveListId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveListId(null)

    if (!over || active.id === over.id) return

    if (!lists) return

    const activeIndex = lists.findIndex((list) => list.id === active.id)
    const overIndex = lists.findIndex((list) => list.id === over.id)

    if (activeIndex === -1 || overIndex === -1) return

    // Yeni pozisyonları hesapla
    const newLists = [...lists]
    const [movedList] = newLists.splice(activeIndex, 1)
    newLists.splice(overIndex, 0, movedList)

    // Tüm listelerin pozisyonlarını güncelle
    newLists.forEach((list, index) => {
      if (list.position !== index) {
        updateListPosition.mutate({
          id: list.id,
          position: index,
        })
      }
    })
  }

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

  const listIds = lists?.map((list) => list.id) || []

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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              <SortableContext
                items={listIds}
                strategy={horizontalListSortingStrategy}
              >
                {lists.map((list) => (
                  <ListColumn
                    key={list.id}
                    list={list}
                    boardId={boardId}
                    workspaceId={workspaceId}
                  />
                ))}
              </SortableContext>
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
            <DragOverlay>
              {activeListId ? (
                <div className="min-w-[280px] opacity-50">
                  <div className="bg-background border rounded-lg p-4 shadow-lg">
                    <div className="font-semibold text-sm">
                      {lists.find((l) => l.id === activeListId)?.name}
                    </div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
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
