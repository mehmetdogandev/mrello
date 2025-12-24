"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/server/trpc/react"
import { Button } from "@/lib/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card"
import { Input } from "@/lib/components/ui/input"
import { Label } from "@/lib/components/ui/label"
import { Badge } from "@/lib/components/ui/badge"
import { Avatar } from "@/lib/components/ui/avatar"
import { LabelSelector } from "./label-selector"
import { MemberSelector } from "./member-selector"
import { ChecklistInput } from "./checklist-input"
import {
  Loader2,
  ArrowLeft,
  Save,
  Calendar,
  Users,
  Tag,
  MessageSquare,
  CheckSquare,
  X,
  Plus,
} from "lucide-react"

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
  const { data: cardLabels = [] } = api.card.getLabels.useQuery(
    { cardId },
    { enabled: !!cardId }
  )
  const { data: cardMembers = [] } = api.card.getMembers.useQuery(
    { cardId },
    { enabled: !!cardId }
  )
  const { data: cardChecklists = [] } = api.card.getChecklists.useQuery(
    { cardId },
    { enabled: !!cardId }
  )
  const { data: cardComments = [] } = api.card.getComments.useQuery(
    { cardId },
    { enabled: !!cardId }
  )

  // Get user details for members
  const memberUserIds = cardMembers.map((m) => m.userId)
  const { data: workspaceMembers = [] } = api.workspace.getMembers.useQuery(
    { workspaceId },
    { enabled: !!workspaceId && memberUserIds.length > 0 }
  )

  const utils = api.useUtils()

  const updateCard = api.card.update.useMutation({
    onSuccess: () => {
      utils.card.getById.invalidate({ id: cardId })
      setIsEditing(false)
    },
  })

  const addLabel = api.card.addLabel.useMutation({
    onSuccess: () => {
      utils.card.getLabels.invalidate({ cardId })
    },
  })

  const removeLabel = api.card.removeLabel.useMutation({
    onSuccess: () => {
      utils.card.getLabels.invalidate({ cardId })
    },
  })

  const addMember = api.card.addMember.useMutation({
    onSuccess: () => {
      utils.card.getMembers.invalidate({ cardId })
    },
  })

  const removeMember = api.card.removeMember.useMutation({
    onSuccess: () => {
      utils.card.getMembers.invalidate({ cardId })
    },
  })

  const addChecklist = api.card.addChecklist.useMutation({
    onSuccess: () => {
      utils.card.getChecklists.invalidate({ cardId })
    },
  })

  const addChecklistItem = api.card.addChecklistItem.useMutation({
    onSuccess: () => {
      utils.card.getChecklists.invalidate({ cardId })
    },
  })

  const toggleChecklistItem = api.card.toggleChecklistItem.useMutation({
    onSuccess: () => {
      utils.card.getChecklists.invalidate({ cardId })
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

  // Map members to user details
  const membersWithDetails = cardMembers.map((member) => {
    const user = workspaceMembers.find((u) => u.id === member.userId)
    return {
      ...member,
      name: user?.name || "Bilinmeyen",
      email: user?.email || "",
      image: user?.image || null,
    }
  })

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

          {/* Labels */}
          <div className="border-t pt-4">
            <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Etiketler
            </Label>
            {cardLabels.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {cardLabels.map((label) => (
                  <Badge
                    key={label.id}
                    className="gap-2 px-3 py-1.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${label.color}20`,
                      color: label.color,
                      borderColor: `${label.color}40`,
                    }}
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    {label.name}
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => removeLabel.mutate({ labelId: label.id })}
                        className="ml-1 hover:opacity-70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            )}
            {isEditing && (
              <LabelSelector
                selectedLabels={cardLabels.map((l) => ({
                  id: l.id,
                  name: l.name,
                  color: l.color,
                }))}
                onLabelsChange={(labels) => {
                  // Add new labels
                  labels.forEach((label) => {
                    if (!label.id) {
                      addLabel.mutate({
                        cardId,
                        name: label.name,
                        color: label.color,
                      })
                    }
                  })
                  // Remove deleted labels
                  cardLabels.forEach((existingLabel) => {
                    if (!labels.find((l) => l.id === existingLabel.id)) {
                      removeLabel.mutate({ labelId: existingLabel.id })
                    }
                  })
                }}
              />
            )}
          </div>

          {/* Members */}
          <div className="border-t pt-4">
            <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Üyeler
            </Label>
            {membersWithDetails.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {membersWithDetails.map((member) => (
                  <Badge
                    key={member.userId}
                    variant="secondary"
                    className="gap-2 px-2 py-1"
                  >
                    <Avatar
                      src={member.image || undefined}
                      name={member.name}
                      size="xs"
                    />
                    <span className="text-xs">{member.name}</span>
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() =>
                          removeMember.mutate({
                            cardId,
                            userId: member.userId,
                          })
                        }
                        className="ml-1 hover:opacity-70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            )}
            {isEditing && (
              <MemberSelector
                workspaceId={workspaceId}
                selectedMembers={membersWithDetails}
                onMembersChange={(members) => {
                  // Add new members
                  members.forEach((member) => {
                    if (!cardMembers.find((m) => m.userId === member.id)) {
                      addMember.mutate({
                        cardId,
                        userId: member.id,
                      })
                    }
                  })
                  // Remove deleted members
                  cardMembers.forEach((existingMember) => {
                    if (!members.find((m) => m.id === existingMember.userId)) {
                      removeMember.mutate({
                        cardId,
                        userId: existingMember.userId,
                      })
                    }
                  })
                }}
              />
            )}
          </div>

          {/* Checklists */}
          <div className="border-t pt-4">
            <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Kontrol Listeleri
            </Label>
            {cardChecklists.length > 0 && (
              <div className="space-y-3 mb-3">
                {cardChecklists.map((checklist) => (
                  <div
                    key={checklist.id}
                    className="p-3 border rounded-lg bg-muted/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {checklist.title}
                      </span>
                    </div>
                    {checklist.items && checklist.items.length > 0 && (
                      <div className="space-y-1 pl-4">
                        {checklist.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="checkbox"
                              checked={item.isCompleted}
                              onChange={() =>
                                toggleChecklistItem.mutate({ itemId: item.id })
                              }
                              className="h-4 w-4 rounded border-muted-foreground/30"
                            />
                            <span
                              className={`text-sm ${
                                item.isCompleted
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {isEditing && (
              <ChecklistInput
                checklists={cardChecklists.map((c) => ({
                  title: c.title,
                  items: c.items?.map((i) => i.text) || [],
                }))}
                onChecklistsChange={(checklists) => {
                  // This is a simplified version - in a real app you'd need to handle updates/deletes
                  checklists.forEach((checklist) => {
                    if (
                      !cardChecklists.find((c) => c.title === checklist.title)
                    ) {
                      addChecklist.mutate({
                        cardId,
                        title: checklist.title,
                      })
                    }
                  })
                }}
              />
            )}
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
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
          <div className="border-t pt-4">
            <Label className="text-sm font-semibold mb-2 block">Durum</Label>
            <Badge variant={card.isCompleted ? "default" : "secondary"}>
              {card.isCompleted ? "Tamamlandı" : "Devam Ediyor"}
            </Badge>
          </div>

          {/* Comments */}
          <div className="border-t pt-4">
            <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Yorumlar ({cardComments.length})
            </Label>
            {cardComments.length > 0 ? (
              <div className="space-y-3">
                {cardComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3 border rounded-lg bg-muted/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={undefined}
                          name={comment.userId}
                          size="sm"
                        />
                        <div>
                          <div className="text-sm font-medium">
                            {comment.userId}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString(
                              "tr-TR"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Henüz yorum yok
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
