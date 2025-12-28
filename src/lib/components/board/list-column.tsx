"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { api } from "@/lib/server/trpc/react"
import { Card, CardContent } from "@/lib/components/ui/card"
import { Button } from "@/lib/components/ui/button"
import { CardItem } from "./card-item"
import { CreateCardDialog } from "./create-card-dialog"
import { Plus, MoreVertical, GripVertical } from "lucide-react"

interface ListColumnProps {
  list: {
    id: string
    name: string
    color: string | null
    position: number
  }
  boardId: string
  workspaceId: string
}

export function ListColumn({ list, boardId, workspaceId }: ListColumnProps) {
  const [createCardDialogOpen, setCreateCardDialogOpen] = useState(false)

  const utils = api.useUtils()
  const { data: cards, isLoading } = api.card.getByList.useQuery({
    listId: list.id,
  })

  const updateCardPosition = api.card.updatePosition.useMutation({
    onSuccess: () => {
      utils.card.getByList.invalidate({ listId: list.id })
    },
  })

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: {
      type: "list",
      listId: list.id,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `list-drop-${list.id}`,
    data: {
      type: "list",
      listId: list.id,
    },
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleCardDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id || !cards) return

    // Sadece aynı liste içindeki kart sıralamasını handle et
    const activeIndex = cards.findIndex((card) => card.id === active.id)
    const overIndex = cards.findIndex((card) => card.id === over.id)

    if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex)
      return

    // Yeni pozisyonları hesapla
    const newCards = [...cards]
    const [movedCard] = newCards.splice(activeIndex, 1)
    newCards.splice(overIndex, 0, movedCard)

    // Tüm kartların pozisyonlarını güncelle
    newCards.forEach((card, index) => {
      if (card.position !== index) {
        updateCardPosition.mutate({
          id: card.id,
          position: index,
        })
      }
    })
  }

  const cardIds = cards?.map((card) => card.id) || []

  return (
    <div ref={setNodeRef} style={style} className="min-w-[280px] flex-shrink-0">
      <Card className="h-full flex flex-col">
        {/* List Header */}
        <CardContent className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-1">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3
                className="font-semibold text-sm flex items-center gap-2"
                style={
                  list.color
                    ? {
                        color: list.color,
                      }
                    : undefined
                }
              >
                {list.name}
              </h3>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            {cards?.length || 0} kart
          </div>
        </CardContent>

        {/* Cards */}
        <CardContent
          ref={setDroppableRef}
          className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-2"
          style={{ maxHeight: "calc(100vh - 250px)", minHeight: "200px" }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleCardDragEnd}
          >
            {isLoading ? (
              <div className="text-center text-sm text-muted-foreground py-4">
                Yükleniyor...
              </div>
            ) : cards && cards.length > 0 ? (
              <SortableContext
                items={cardIds}
                strategy={verticalListSortingStrategy}
              >
                {cards.map((card) => (
                  <CardItem
                    key={card.id}
                    card={card}
                    listId={list.id}
                    boardId={boardId}
                    workspaceId={workspaceId}
                  />
                ))}
              </SortableContext>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-4">
                Henüz kart yok
              </div>
            )}
          </DndContext>

          {/* Add Card Button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => setCreateCardDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Kart Ekle
          </Button>
        </CardContent>
      </Card>

      {/* Create Card Dialog */}
      <CreateCardDialog
        open={createCardDialogOpen}
        onOpenChange={setCreateCardDialogOpen}
        listId={list.id}
        boardId={boardId}
        workspaceId={workspaceId}
      />
    </div>
  )
}
