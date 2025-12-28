"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core"
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
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
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<"list" | "card" | null>(null)
  const [optimisticLists, setOptimisticLists] = useState<typeof lists | null>(null)

  const utils = api.useUtils()
  const { data: board, isLoading: boardLoading } = api.board.getById.useQuery({
    id: boardId,
  })
  const { data: lists, isLoading: listsLoading } = api.list.getByBoard.useQuery({
    boardId,
  })

  // Optimistic lists state - listeler sürüklenirken anlık güncelleme için
  const displayLists = optimisticLists || lists

  const updateListPosition = api.list.updatePosition.useMutation({
    onSuccess: () => {
      utils.list.getByBoard.invalidate({ boardId })
    },
  })

  const updateCardPosition = api.card.updatePosition.useMutation({
    onMutate: async ({ id, position }) => {
      // Optimistic update için tüm listeleri kontrol et
      lists?.forEach((list) => {
        const cards = utils.card.getByList.getData({ listId: list.id })
        if (cards?.some((card: any) => card.id === id)) {
          utils.card.getByList.setData({ listId: list.id }, (old: any) => {
            if (!old) return old
            const newCards = [...old]
            const cardIndex = newCards.findIndex((card: any) => card.id === id)
            if (cardIndex === -1) return old
            const [movedCard] = newCards.splice(cardIndex, 1)
            newCards.splice(position, 0, movedCard)
            return newCards.map((card: any, index: number) => ({
              ...card,
              position: index,
            }))
          })
        }
      })
    },
    onError: (err, variables) => {
      // Hata durumunda sadece ilgili listeyi invalidate et
      lists?.forEach((list) => {
        const cards = utils.card.getByList.getData({ listId: list.id })
        if (cards?.some((card: any) => card.id === variables.id)) {
          utils.card.getByList.invalidate({ listId: list.id })
        }
      })
    },
    onSuccess: (updatedCard) => {
      // Başarılı olduğunda cache'i güncelle, invalidate etme
      if (updatedCard) {
        lists?.forEach((list) => {
          const cards = utils.card.getByList.getData({ listId: list.id })
          if (cards?.some((card: any) => card.id === updatedCard.id)) {
            utils.card.getByList.setData({ listId: list.id }, (old: any) => {
              if (!old) return old
              return old.map((card: any) =>
                card.id === updatedCard.id ? updatedCard : card
              )
            })
          }
        })
      }
    },
  })

  const updateCard = api.card.update.useMutation({
    onMutate: async ({ id, listId, position }) => {
      // Optimistic update: Tüm listelerin kartlarını güncelle
      if (listId) {
        let sourceListId: string | null = null
        let cardData: any = null

        // Eski listeyi bul ve kartı al
        lists?.forEach((list) => {
          const cards = utils.card.getByList.getData({ listId: list.id })
          const card = cards?.find((c: any) => c.id === id)
          if (card) {
            sourceListId = list.id
            cardData = card
          }
        })

        if (!cardData || !sourceListId) return

        // Eski listeden kartı kaldır
        utils.card.getByList.setData({ listId: sourceListId }, (old: any) => {
          if (!old) return old
          return old.filter((card: any) => card.id !== id).map((card: any, index: number) => ({
            ...card,
            position: index,
          }))
        })

        // Yeni listeye kartı ekle
        const targetCards = utils.card.getByList.getData({ listId }) || []
        const newCard = {
          ...cardData,
          listId,
          position: position ?? targetCards.length,
        }
        
        utils.card.getByList.setData({ listId }, (old: any) => {
          const newCards = old ? [...old, newCard] : [newCard]
          return newCards.sort((a: any, b: any) => a.position - b.position)
        })
      }
    },
    onError: (err, variables) => {
      // Hata durumunda sadece ilgili listeleri invalidate et
      if (variables.listId) {
        lists?.forEach((list) => {
          const cards = utils.card.getByList.getData({ listId: list.id })
          if (cards?.some((card: any) => card.id === variables.id)) {
            utils.card.getByList.invalidate({ listId: list.id })
          }
        })
        utils.card.getByList.invalidate({ listId: variables.listId })
      }
    },
    onSuccess: (updatedCard) => {
      // Başarılı olduğunda cache'i güncelle, invalidate etme
      if (updatedCard && updatedCard.listId) {
        // Eski listeden kaldır (eğer farklı bir listeye taşındıysa)
        lists?.forEach((list) => {
          if (list.id !== updatedCard.listId) {
            const cards = utils.card.getByList.getData({ listId: list.id })
            if (cards?.some((card: any) => card.id === updatedCard.id)) {
              utils.card.getByList.setData({ listId: list.id }, (old: any) => {
                if (!old) return old
                return old.filter((card: any) => card.id !== updatedCard.id)
              })
            }
          }
        })

        // Yeni listeye ekle/güncelle
        utils.card.getByList.setData({ listId: updatedCard.listId }, (old: any) => {
          if (!old) return [updatedCard]
          const existingIndex = old.findIndex((card: any) => card.id === updatedCard.id)
          if (existingIndex >= 0) {
            // Kart zaten listede, güncelle
            const newCards = [...old]
            newCards[existingIndex] = updatedCard
            return newCards.sort((a: any, b: any) => a.position - b.position)
          } else {
            // Kart yeni, ekle
            const newCards = [...old, updatedCard]
            return newCards.sort((a: any, b: any) => a.position - b.position)
          }
        })
      }
    },
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    const activeData = event.active.data.current
    if (activeData?.type === "card") {
      setActiveType("card")
    } else {
      setActiveType("list")
    }
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const activeData = active.data.current
    const overData = over.data.current

    // Liste sürükleme - diğer listelerin pozisyonunu güncelle
    if (activeData?.type !== "card" && overData?.type !== "card") {
      if (!lists) return

      const activeIndex = lists.findIndex((list) => list.id === active.id)
      const overIndex = lists.findIndex((list) => list.id === over.id)

      if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) return

      // Optimistic update: Listelerin pozisyonunu anında güncelle
      const newLists = [...lists]
      const [movedList] = newLists.splice(activeIndex, 1)
      if (movedList) {
        newLists.splice(overIndex, 0, movedList)
        // Optimistic state'i güncelle
        setOptimisticLists(newLists)
      }
    }

    // Kart sürükleme - diğer kartların pozisyonunu güncelle
    if (activeData?.type === "card" && activeData?.card) {
      const sourceListId = activeData.listId

      // Hedef listeyi bul
      let targetListId: string | null = null

      if (overData?.type === "list") {
        targetListId = overData.listId
      } else if (overData?.listId) {
        targetListId = overData.listId
      } else if (overData?.type === "card" && overData?.listId) {
        targetListId = overData.listId
      }

      if (!targetListId && typeof over.id === "string") {
        if (over.id.startsWith("list-drop-")) {
          targetListId = over.id.replace("list-drop-", "")
        } else {
          const list = lists?.find((l) => l.id === over.id)
          if (list) {
            targetListId = list.id
          }
        }
      }

      if (!targetListId) return

      // Aynı liste içinde sürükleme
      if (targetListId === sourceListId && overData?.type === "card") {
        const sourceCards = utils.card.getByList.getData({ listId: sourceListId }) || []
        const activeIndex = sourceCards.findIndex((card: any) => card.id === active.id)
        const overIndex = sourceCards.findIndex((card: any) => card.id === over.id)

        if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) return

        // Optimistic update: Kartların pozisyonunu anında güncelle
        utils.card.getByList.setData({ listId: sourceListId }, (old: any) => {
          if (!old) return old
          const newCards = [...old]
          const [movedCard] = newCards.splice(activeIndex, 1)
          newCards.splice(overIndex, 0, movedCard)
          return newCards.map((card: any, index: number) => ({
            ...card,
            position: index,
          }))
        })
      } else if (targetListId !== sourceListId) {
        // Farklı listeye sürükleme - sadece görsel olarak güncelle
        const sourceCards = utils.card.getByList.getData({ listId: sourceListId }) || []
        const targetCards = utils.card.getByList.getData({ listId: targetListId }) || []
        const activeCard = sourceCards.find((card: any) => card.id === active.id)

        if (!activeCard) return

        // Eski listeden kaldır (görsel olarak)
        utils.card.getByList.setData({ listId: sourceListId }, (old: any) => {
          if (!old) return old
          return old.filter((card: any) => card.id !== active.id).map((card: any, index: number) => ({
            ...card,
            position: index,
          }))
        })

        // Yeni listeye ekle (görsel olarak)
        let newPosition = targetCards.length
        if (overData?.type === "card" && overData?.card) {
          const overIndex = targetCards.findIndex((card: any) => card.id === over.id)
          newPosition = overIndex >= 0 ? overIndex : targetCards.length
        }

        utils.card.getByList.setData({ listId: targetListId }, (old: any) => {
          const newCard = {
            ...activeCard,
            listId: targetListId,
            position: newPosition,
          }
          const newCards = old ? [...old] : []
          // Eğer kart zaten listede varsa kaldır
          const filteredCards = newCards.filter((card: any) => card.id !== active.id)
          filteredCards.splice(newPosition, 0, newCard)
          return filteredCards.map((card: any, index: number) => ({
            ...card,
            position: index,
          }))
        })
      }
    }
  }, [lists, utils])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setActiveType(null)
    setOptimisticLists(null as typeof lists | null) // Optimistic state'i temizle

    if (!over || active.id === over.id) return

    if (!lists) return

    const activeData = active.data.current
    const overData = over.data.current

    // Liste sürükleme
    if (activeData?.type !== "card") {
      const activeIndex = lists.findIndex((list) => list.id === active.id)
      const overIndex = lists.findIndex((list) => list.id === over.id)

      if (activeIndex === -1 || overIndex === -1) return

      // Yeni pozisyonları hesapla
      const newLists = [...lists]
      const [movedList] = newLists.splice(activeIndex, 1)
      if (movedList) {
        newLists.splice(overIndex, 0, movedList)
      }

      // Tüm listelerin pozisyonlarını güncelle
      newLists.forEach((list, index) => {
        if (list.position !== index) {
          updateListPosition.mutate({
            id: list.id,
            position: index,
          })
        }
      })
      return
    }

    // Kart sürükleme
    if (activeData?.type === "card" && activeData?.card) {
      const activeCard = activeData.card
      const sourceListId = activeData.listId

      // Hedef listeyi bul
      let targetListId: string | null = null

      if (overData?.type === "list") {
        targetListId = overData.listId
      } else if (overData?.listId) {
        targetListId = overData.listId
      } else if (overData?.type === "card" && overData?.listId) {
        targetListId = overData.listId
      }

      // Eğer hedef liste bulunamadıysa, over.id'den liste ID'sini çıkar
      if (!targetListId && typeof over.id === "string") {
        if (over.id.startsWith("list-drop-")) {
          targetListId = over.id.replace("list-drop-", "")
        } else {
          const list = lists.find((l) => l.id === over.id)
          if (list) {
            targetListId = list.id
          }
        }
      }

      if (!targetListId) return

      // Aynı liste içinde sürükleme
      if (targetListId === sourceListId && overData?.type === "card") {
        const sourceCards = utils.card.getByList.getData({ listId: sourceListId }) || []
        const activeIndex = sourceCards.findIndex((card: any) => card.id === active.id)
        const overIndex = sourceCards.findIndex((card: any) => card.id === over.id)

        if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) return

        updateCardPosition.mutate({
          id: activeCard.id,
          position: overIndex,
        })
        return
      }

      // Farklı listeye sürükleme
      if (targetListId !== sourceListId) {
        const targetCards = utils.card.getByList.getData({ listId: targetListId }) || []
        let newPosition = targetCards.length

        if (overData?.type === "card" && overData?.card) {
          // Kartın üzerine bırakıldıysa, o kartın pozisyonunu al
          const overIndex = targetCards.findIndex((card: any) => card.id === over.id)
          newPosition = overIndex >= 0 ? overIndex : targetCards.length
        }

        updateCard.mutate({
          id: activeCard.id,
          listId: targetListId,
          position: newPosition,
        })
      }
    }
  }, [lists, utils, updateListPosition, updateCardPosition, updateCard])

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

  const listIds = displayLists?.map((list) => list.id) || []
  const allCardIds: string[] = []
  displayLists?.forEach((list) => {
    const cards = utils.card.getByList.getData({ listId: list.id })
    if (cards) {
      cards.forEach((card: any) => {
        allCardIds.push(card.id)
      })
    }
  })

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
        {displayLists && displayLists.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              <SortableContext
                items={[...listIds, ...allCardIds]}
                strategy={horizontalListSortingStrategy}
              >
                {displayLists.map((list) => (
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
              {activeId && activeType === "list" ? (
                <div className="min-w-[280px] opacity-50">
                  <div className="bg-background border rounded-lg p-4 shadow-lg">
                    <div className="font-semibold text-sm">
                      {displayLists?.find((l) => l.id === activeId)?.name}
                    </div>
                  </div>
                </div>
              ) : activeId && activeType === "card" ? (
                <div className="opacity-50">
                  <div className="bg-background border rounded-lg p-3 shadow-lg">
                    <div className="font-medium text-sm">Kart</div>
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
