"use client"

import { useState } from "react"
import { api } from "@/lib/server/trpc/react"
import { Button } from "@/lib/components/ui/button"
import { Card, CardContent } from "@/lib/components/ui/card"
import { Badge } from "@/lib/components/ui/badge"
import { CreateWorkspaceDialog } from "./create-workspace-dialog"
import { UpdateWorkspaceDialog } from "./update-workspace-dialog"
import { DeleteWorkspaceDialog } from "./delete-workspace-dialog"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, ArrowRight, Briefcase, Loader2 } from "lucide-react"

export function WorkspaceDataTable() {
  const router = useRouter()
  const { data, isLoading } = api.workspace.getAll.useQuery()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState<{
    id: string
    name: string
    description: string | null
    color: string | null
  } | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const allWorkspaces = [
    ...(data?.owned || []).map((w) => ({ ...w, type: "owned" as const })),
    ...(data?.memberOf || []).map((w) => ({ ...w, type: "member" as const })),
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Çalışma Alanları</h2>
          <p className="text-muted-foreground mt-1">
            Tüm çalışma alanlarınızı buradan yönetin
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Yeni Çalışma Alanı
        </Button>
      </div>

      {/* Workspaces Grid */}
      {allWorkspaces.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Briefcase className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Henüz çalışma alanı yok</h3>
          <p className="text-muted-foreground mb-6">
            İlk çalışma alanınızı oluşturarak başlayın
          </p>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Çalışma Alanı Oluştur
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allWorkspaces.map((workspace) => (
            <Card
              key={workspace.id}
              className="group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] overflow-hidden relative"
              onClick={() => router.push(`/workspaces/${workspace.id}`)}
              style={{
                background: workspace.color
                  ? `linear-gradient(135deg, ${workspace.color}15 0%, ${workspace.color}08 100%)`
                  : undefined,
                borderColor: workspace.color
                  ? `${workspace.color}40`
                  : undefined,
              }}
            >
              <CardContent className="p-6 relative z-10">
                {/* Color accent bar */}
                {workspace.color && (
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: workspace.color }}
                  />
                )}
                
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="h-14 w-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: workspace.color || "var(--primary)",
                      backgroundImage: workspace.color
                        ? `linear-gradient(135deg, ${workspace.color} 0%, ${workspace.color}dd 100%)`
                        : undefined,
                    }}
                  >
                    {workspace.name.charAt(0).toUpperCase()}
                  </div>
                  <Badge
                    variant={workspace.type === "owned" ? "default" : "secondary"}
                    className="text-xs backdrop-blur-sm bg-background/80"
                  >
                    {workspace.type === "owned" ? "Sahip" : "Üye"}
                  </Badge>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {workspace.name}
                </h3>
                {workspace.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {workspace.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="group-hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/workspaces/${workspace.id}`)
                    }}
                  >
                    Aç
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {workspace.type === "owned" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedWorkspace(workspace)
                            setUpdateDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedWorkspace(workspace)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateWorkspaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      <UpdateWorkspaceDialog
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        workspace={selectedWorkspace}
      />
      <DeleteWorkspaceDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        workspace={selectedWorkspace}
      />
    </div>
  )
}
