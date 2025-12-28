"use client"

import { useRouter } from "next/navigation"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/lib/components/ui/card"
import { Badge } from "@/lib/components/ui/badge"
import { Calendar, Users, GripVertical } from "lucide-react"

interface CardItemProps {
  card: {
    id: string
    title: string
    description: string | null
    dueDate: Date | null
    color: string | null
    isCompleted: boolean
  }
  listId: string
  boardId: string
  workspaceId: string
}

export function CardItem({ card, listId, boardId, workspaceId }: CardItemProps) {
  const router = useRouter()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: "card",
      card,
      listId,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    ...(card.color
      ? {
          borderLeftColor: card.color,
          borderLeftWidth: "4px",
        }
      : {}),
  }

  const handleClick = () => {
    router.push(
      `/workspaces/${workspaceId}/boards/${boardId}/cards/${card.id}`
    )
  }

  const isOverdue =
    card.dueDate && !card.isCompleted && new Date(card.dueDate) < new Date()

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="cursor-pointer transition-all hover:shadow-md group"
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start gap-2">
          <GripVertical className="h-3 w-3 text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex-1">
            {card.color && (
              <div
                className="h-1 w-full rounded mb-2"
                style={{ backgroundColor: card.color }}
              />
            )}
            <h4
              className={`font-medium text-sm ${
                card.isCompleted ? "line-through text-muted-foreground" : ""
              }`}
            >
              {card.title}
            </h4>
            {card.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {card.description}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap mt-2">
              {card.dueDate && (
                <Badge
                  variant={isOverdue ? "destructive" : "secondary"}
                  className="text-xs gap-1"
                >
                  <Calendar className="h-3 w-3" />
                  {new Date(card.dueDate).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "short",
                  })}
                </Badge>
              )}
              {card.isCompleted && (
                <Badge variant="default" className="text-xs">
                  Tamamlandı
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
