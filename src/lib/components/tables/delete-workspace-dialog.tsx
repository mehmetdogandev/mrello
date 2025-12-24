"use client";

import { api } from "@/lib/server/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/lib/components/ui/dialog";
import { Button } from "@/lib/components/ui/button";

interface DeleteWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: {
    id: string;
    name: string;
  } | null;
}

export function DeleteWorkspaceDialog({
  open,
  onOpenChange,
  workspace,
}: DeleteWorkspaceDialogProps) {
  const utils = api.useUtils();
  const deleteWorkspace = api.workspace.delete.useMutation({
    onSuccess: () => {
      utils.workspace.getAll.invalidate();
      onOpenChange(false);
    },
  });

  const handleDelete = () => {
    if (!workspace) return;
    deleteWorkspace.mutate({ id: workspace.id });
  };

  if (!workspace) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Çalışma Alanını Sil</DialogTitle>
          <DialogDescription>
            <span className="font-semibold text-gray-900">
              {workspace.name}
            </span>{" "}
            adlı çalışma alanını silmek istediğinizden emin misiniz? Bu işlem
            geri alınamaz ve tüm board'lar, listeler ve kartlar silinecektir.
          </DialogDescription>
        </DialogHeader>

        {deleteWorkspace.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
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
            variant="default"
            onClick={handleDelete}
            disabled={deleteWorkspace.isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {deleteWorkspace.isPending ? "Siliniyor..." : "Sil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

