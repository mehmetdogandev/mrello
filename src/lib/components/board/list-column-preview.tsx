"use client"

import { Card, CardContent } from "@/lib/components/ui/card"
import { Badge } from "@/lib/components/ui/badge"
import { api } from "@/lib/server/trpc/react"
import { GripVertical, Calendar } from "lucide-react"

interface ListColumnPreviewProps {
  list?: {
    id: string
    name: string
    color: string | null
    position: number
  } | null
  boardId: string
  workspaceId: string
}

export function ListColumnPreview({
  list,
  boardId,
  workspaceId,
}: ListColumnPreviewProps) {
  const { data: cards } = api.card.getByList.useQuery(
    { listId: list?.id || "" },
    { enabled: !!list?.id }
  )

  if (!list) return null

  return (
    <div className="min-w-[280px] opacity-95 rotate-2 shadow-2xl pointer-events-none">
      <Card className="h-full flex flex-col border-2 border-primary">
        {/* List Header */}
        <CardContent className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-1">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
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
          </div>
          <div className="text-xs text-muted-foreground">
            {cards?.length || 0} kart
          </div>
        </CardContent>

        {/* Cards Preview - Tüm kartları göster */}
        <CardContent className="p-4 flex-1 space-y-2 max-h-[600px] overflow-y-auto">
          {cards && cards.length > 0 ? (
            <div className="space-y-2">
              {cards.map((card) => (
                <Card key={card.id} className="border">
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
                          variant={
                            card.dueDate && !card.isCompleted && new Date(card.dueDate) < new Date()
                              ? "destructive"
                              : "secondary"
                          }
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
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-4">
              Henüz kart yok
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
