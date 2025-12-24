"use client"

import { useState } from "react"
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

  const { data: cards, isLoading } = api.card.getByList.useQuery({
    listId: list.id,
  })

  return (
    <div className="min-w-[280px] flex-shrink-0">
      <Card className="h-full flex flex-col">
        {/* List Header */}
        <CardContent className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-1">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
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
        <CardContent className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-2 min-h-[200px]">
          {isLoading ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              Yükleniyor...
            </div>
          ) : cards && cards.length > 0 ? (
            cards.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                listId={list.id}
                boardId={boardId}
                workspaceId={workspaceId}
              />
            ))
          ) : (
            <div className="text-center text-sm text-muted-foreground py-4">
              Henüz kart yok
            </div>
          )}

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

