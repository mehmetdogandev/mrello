"use client"

import { useState } from "react"
import { api } from "@/lib/server/trpc/react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/lib/components/ui/dialog"
import { Button } from "@/lib/components/ui/button"
import { Input } from "@/lib/components/ui/input"
import { Label } from "@/lib/components/ui/label"
import { LabelSelector } from "./label-selector"
import { MemberSelector } from "./member-selector"
import { ChecklistInput } from "./checklist-input"
import { Loader2 } from "lucide-react"

interface CreateCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listId: string
  boardId: string
  workspaceId: string
}

interface Label {
  id?: string
  name: string
  color: string
}

interface Member {
  id: string
  name: string
  email: string
  image?: string | null
}

interface Checklist {
  title: string
  items: string[]
}

export function CreateCardDialog({
  open,
  onOpenChange,
  listId,
  boardId,
  workspaceId,
}: CreateCardDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    color: "",
    dueDate: "",
  })
  const [selectedLabels, setSelectedLabels] = useState<Label[]>([])
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([])
  const [checklists, setChecklists] = useState<Checklist[]>([])

  const utils = api.useUtils()
  const createCard = api.card.create.useMutation({
    onSuccess: async (newCard) => {
      // Add labels
      for (const label of selectedLabels) {
        await api.card.addLabel.mutate({
          cardId: newCard.id,
          name: label.name,
          color: label.color,
        })
      }

      // Add members
      for (const member of selectedMembers) {
        await api.card.addMember.mutate({
          cardId: newCard.id,
          userId: member.id,
        })
      }

      // Add checklists
      for (const checklist of checklists) {
        const [newChecklist] = await api.card.addChecklist.mutate({
          cardId: newCard.id,
          title: checklist.title,
        })

        // Add checklist items
        for (const item of checklist.items) {
          if (item.trim()) {
            await api.card.addChecklistItem.mutate({
              checklistId: newChecklist.id,
              text: item,
            })
          }
        }
      }

      utils.card.getByList.invalidate({ listId })
      onOpenChange(false)
      setFormData({ title: "", description: "", color: "", dueDate: "" })
      setSelectedLabels([])
      setSelectedMembers([])
      setChecklists([])
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createCard.mutate({
      listId,
      title: formData.title,
      description: formData.description || undefined,
      color: formData.color || undefined,
      dueDate: formData.dueDate || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Kart Oluştur</DialogTitle>
          <DialogDescription>
            Yeni bir kart oluşturarak görevlerinizi takip edin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Kart Başlığı <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Kart başlığı"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Kart açıklaması..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Renk</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color || "#3b82f6"}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="h-10 w-full cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Bitiş Tarihi</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="border-t pt-4">
            <LabelSelector
              selectedLabels={selectedLabels}
              onLabelsChange={setSelectedLabels}
            />
          </div>

          {/* Members */}
          <div className="border-t pt-4">
            <MemberSelector
              workspaceId={workspaceId}
              selectedMembers={selectedMembers}
              onMembersChange={setSelectedMembers}
            />
          </div>

          {/* Checklists */}
          <div className="border-t pt-4">
            <ChecklistInput
              checklists={checklists}
              onChecklistsChange={setChecklists}
            />
          </div>

          {createCard.error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {createCard.error.message}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              İptal
            </Button>
            <Button type="submit" disabled={createCard.isPending}>
              {createCard.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                "Oluştur"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
