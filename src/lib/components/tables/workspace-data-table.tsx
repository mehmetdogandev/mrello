"use client";

import { useState } from "react";
import { api } from "@/lib/server/trpc/react";
import { Button } from "@/lib/components/ui/button";
import { Card } from "@/lib/components/ui/card";
import { Badge } from "@/lib/components/ui/badge";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";
import { UpdateWorkspaceDialog } from "./update-workspace-dialog";
import { DeleteWorkspaceDialog } from "./delete-workspace-dialog";
import { useRouter } from "next/navigation";

export function WorkspaceDataTable() {
  const router = useRouter();
  const { data, isLoading } = api.workspace.getAll.useQuery();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<{
    id: string;
    name: string;
    description: string | null;
    color: string | null;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const allWorkspaces = [
    ...(data?.owned || []).map((w) => ({ ...w, type: "owned" as const })),
    ...(data?.memberOf || []).map((w) => ({ ...w, type: "member" as const })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Çalışma Alanları</h1>
          <p className="mt-1 text-sm text-gray-600">
            Tüm çalışma alanlarınızı buradan yönetin
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="gradient-primary shadow-lg"
        >
          <svg
            className="mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Yeni Çalışma Alanı
        </Button>
      </div>

      {/* Workspaces Grid */}
      {allWorkspaces.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Henüz çalışma alanı yok
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            İlk çalışma alanınızı oluşturarak başlayın
          </p>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="mt-4 gradient-primary"
          >
            Çalışma Alanı Oluştur
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allWorkspaces.map((workspace) => (
            <Card
              key={workspace.id}
              variant="elevated"
              className="group cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02]"
              onClick={() => router.push(`/workspaces/${workspace.id}`)}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md"
                    style={{
                      backgroundColor: workspace.color || "#3b82f6",
                    }}
                  >
                    {workspace.name.charAt(0).toUpperCase()}
                  </div>
                  <Badge
                    variant={
                      workspace.type === "owned" ? "default" : "info"
                    }
                  >
                    {workspace.type === "owned" ? "Sahip" : "Üye"}
                  </Badge>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {workspace.name}
                </h3>
                {workspace.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {workspace.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWorkspace(workspace);
                      setUpdateDialogOpen(true);
                    }}
                    className="flex-1"
                  >
                    <svg
                      className="mr-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Düzenle
                  </Button>
                  {workspace.type === "owned" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWorkspace(workspace);
                        setDeleteDialogOpen(true);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </Button>
                  )}
                </div>
              </div>
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
  );
}

