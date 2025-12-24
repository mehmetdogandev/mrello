"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/lib/components/ui/card"
import { Badge } from "@/lib/components/ui/badge"
import { Calendar, Users } from "lucide-react"

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

  const handleClick = () => {
    router.push(
      `/workspaces/${workspaceId}/boards/${boardId}/cards/${card.id}`
    )
  }

  const isOverdue =
    card.dueDate && !card.isCompleted && new Date(card.dueDate) < new Date()

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md group"
      onClick={handleClick}
      style={
        card.color
          ? {
              borderLeftColor: card.color,
              borderLeftWidth: "4px",
            }
          : undefined
      }
    >
      <CardContent className="p-3 space-y-2">
        {card.color && (
          <div
            className="h-1 w-full rounded"
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
          <p className="text-xs text-muted-foreground line-clamp-2">
            {card.description}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
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
      </CardContent>
    </Card>
  )
}

