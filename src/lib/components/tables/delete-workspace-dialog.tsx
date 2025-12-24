"use client"

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
import { Loader2, AlertTriangle } from "lucide-react"

interface DeleteWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspace: {
    id: string
    name: string
  } | null
}

export function DeleteWorkspaceDialog({
  open,
  onOpenChange,
  workspace,
}: DeleteWorkspaceDialogProps) {
  const utils = api.useUtils()
  const deleteWorkspace = api.workspace.delete.useMutation({
    onSuccess: () => {
      utils.workspace.getAll.invalidate()
      onOpenChange(false)
    },
  })

  const handleDelete = () => {
    if (!workspace) return
    deleteWorkspace.mutate({ id: workspace.id })
  }

  if (!workspace) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Çalışma Alanını Sil
          </DialogTitle>
          <DialogDescription className="pt-2">
            <span className="font-semibold text-foreground">
              {workspace.name}
            </span>{" "}
            adlı çalışma alanını silmek istediğinizden emin misiniz? Bu işlem
            geri alınamaz ve tüm board'lar, listeler ve kartlar silinecektir.
          </DialogDescription>
        </DialogHeader>

        {deleteWorkspace.error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {deleteWorkspace.error.message}
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
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteWorkspace.isPending}
          >
            {deleteWorkspace.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Siliniyor...
              </>
            ) : (
              "Sil"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
