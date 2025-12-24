"use client"

import { useState } from "react"
import { api } from "@/lib/server/trpc/react"
import { Avatar } from "@/lib/components/ui/avatar"
import { Button } from "@/lib/components/ui/button"
import { Label } from "@/lib/components/ui/label"
import { Badge } from "@/lib/components/ui/badge"
import { X, Plus, Users, Loader2 } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/lib/components/ui/popover"

interface Member {
  id: string
  name: string
  email: string
  image?: string | null
}

interface MemberSelectorProps {
  workspaceId: string
  selectedMembers: Member[]
  onMembersChange: (members: Member[]) => void
}

export function MemberSelector({
  workspaceId,
  selectedMembers,
  onMembersChange,
}: MemberSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Get workspace members
  const { data: workspace } = api.workspace.getById.useQuery({ id: workspaceId })
  const { data: workspaceMembers } = api.workspace.getAll.useQuery()

  // Combine owned and member workspaces to get all members
  const allWorkspaceMembers: Member[] = []
  
  if (workspaceMembers) {
    // Get members from owned workspaces
    workspaceMembers.owned?.forEach((ws) => {
      if (ws.id === workspaceId) {
        // We need to fetch members separately, for now we'll use a different approach
      }
    })
  }

  // For now, we'll use a simple approach - get all users from workspace
  // In a real app, you'd have a getWorkspaceMembers endpoint
  const availableMembers: Member[] = [
    // This would come from an API call
    // For now, we'll show a placeholder
  ]

  const handleAddMember = (member: Member) => {
    if (!selectedMembers.find((m) => m.id === member.id)) {
      onMembersChange([...selectedMembers, member])
    }
    setIsOpen(false)
  }

  const handleRemoveMember = (memberId: string) => {
    onMembersChange(selectedMembers.filter((m) => m.id !== memberId))
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">Üyeler</Label>
      
      {/* Selected Members */}
      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedMembers.map((member) => (
            <Badge
              key={member.id}
              variant="secondary"
              className="gap-2 px-2 py-1"
            >
              <Avatar
                src={member.image || undefined}
                name={member.name}
                size="xs"
              />
              <span className="text-xs">{member.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveMember(member.id)}
                className="ml-1 hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add Member Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Üye Ekle
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="space-y-2">
            <div className="text-sm font-semibold mb-2">Çalışma Alanı Üyeleri</div>
            {availableMembers.length > 0 ? (
              <div className="space-y-1">
                {availableMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleAddMember(member)}
                    className="w-full flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors"
                  >
                    <Avatar
                      src={member.image || undefined}
                      name={member.name}
                      size="sm"
                    />
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">{member.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {member.email}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Henüz üye yok</p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

