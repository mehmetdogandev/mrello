"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/server/trpc/react"
import { Button } from "@/lib/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card"
import { Input } from "@/lib/components/ui/input"
import { Label } from "@/lib/components/ui/label"
import { Badge } from "@/lib/components/ui/badge"
import { Loader2, ArrowLeft, Save, Calendar, Users, Tag, MessageSquare, CheckSquare } from "lucide-react"

interface CardDetailProps {
  workspaceId: string
  boardId: string
  cardId: string
  userId: string
}

export function CardDetail({
  workspaceId,
  boardId,
  cardId,
  userId,
}: CardDetailProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    color: "",
  })

  const { data: card, isLoading } = api.card.getById.useQuery({ id: cardId })
  const utils = api.useUtils()
  
  const updateCard = api.card.update.useMutation({
    onSuccess: () => {
      utils.card.getById.invalidate({ id: cardId })
      setIsEditing(false)
    },
  })

  // Initialize form data when card loads
  useEffect(() => {
    if (card) {
      setFormData({
        title: card.title,
        description: card.description || "",
        dueDate: card.dueDate
          ? new Date(card.dueDate).toISOString().slice(0, 16)
          : "",
        color: card.color || "",
      })
    }
  }, [card])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!card) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Kart Bulunamadı</h3>
          <p className="text-muted-foreground mb-6">
            Bu karta erişim yetkiniz yok veya mevcut değil.
          </p>
          <Button
            onClick={() => router.push(`/workspaces/${workspaceId}/boards/${boardId}`)}
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Pano'ya Dön
          </Button>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    updateCard.mutate({
      id: cardId,
      title: formData.title || undefined,
      description: formData.description || undefined,
      dueDate: formData.dueDate || undefined,
      color: formData.color || undefined,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/workspaces/${workspaceId}/boards/${boardId}`)}
        className="mb-4 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Pano'ya Dön
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={formData.title || card.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="text-2xl font-bold mb-2"
                  placeholder="Kart başlığı"
                />
              ) : (
                <CardTitle className="text-2xl mb-2">{card.title}</CardTitle>
              )}
              {card.color && (
                <div
                  className="h-1 w-20 rounded mb-2"
                  style={{ backgroundColor: card.color }}
                />
              )}
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    İptal
                  </Button>
                  <Button onClick={handleSave} disabled={updateCard.isPending}>
                    {updateCard.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Kaydet
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Düzenle
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Açıklama</Label>
            {isEditing ? (
              <textarea
                value={formData.description !== undefined ? formData.description : (card.description || "")}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Kart açıklaması..."
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            ) : (
              <p className="text-muted-foreground">
                {card.description || "Açıklama eklenmemiş"}
              </p>
            )}
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Bitiş Tarihi
              </Label>
              {isEditing ? (
                <Input
                  type="datetime-local"
                  value={
                    formData.dueDate !== undefined
                      ? formData.dueDate
                      : card.dueDate
                        ? new Date(card.dueDate).toISOString().slice(0, 16)
                        : ""
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              ) : (
                <p className="text-muted-foreground">
                  {card.dueDate
                    ? new Date(card.dueDate).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Belirtilmemiş"}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Renk
              </Label>
              {isEditing ? (
                <Input
                  type="color"
                  value={formData.color !== undefined ? formData.color : (card.color || "#3b82f6")}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="h-10 w-full cursor-pointer"
                />
              ) : (
                <div className="flex items-center gap-2">
                  {card.color && (
                    <div
                      className="h-8 w-8 rounded border"
                      style={{ backgroundColor: card.color }}
                    />
                  )}
                  <span className="text-muted-foreground">
                    {card.color || "Renk seçilmemiş"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Durum</Label>
            <Badge variant={card.isCompleted ? "default" : "secondary"}>
              {card.isCompleted ? "Tamamlandı" : "Devam Ediyor"}
            </Badge>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Üyeler
            </Button>
            <Button variant="outline" className="gap-2">
              <Tag className="h-4 w-4" />
              Etiketler
            </Button>
            <Button variant="outline" className="gap-2">
              <CheckSquare className="h-4 w-4" />
              Kontrol Listesi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

