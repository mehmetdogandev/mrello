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
import { Loader2 } from "lucide-react"

interface CreateListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  boardId: string
}

export function CreateListDialog({
  open,
  onOpenChange,
  boardId,
}: CreateListDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    color: "#3b82f6",
  })

  const utils = api.useUtils()
  const createList = api.list.create.useMutation({
    onSuccess: () => {
      utils.list.getByBoard.invalidate({ boardId })
      onOpenChange(false)
      setFormData({ name: "", color: "#3b82f6" })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createList.mutate({
      boardId,
      name: formData.name,
      color: formData.color || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Yeni Liste Oluştur</DialogTitle>
          <DialogDescription>
            Yeni bir liste oluşturarak kartlarınızı organize edin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Liste Adı <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Örn: Yapılacaklar"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Renk</Label>
            <div className="flex items-center gap-3">
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="h-12 w-20 cursor-pointer"
              />
              <Input
                type="text"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>

          {createList.error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {createList.error.message}
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
            <Button type="submit" disabled={createList.isPending}>
              {createList.isPending ? (
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

