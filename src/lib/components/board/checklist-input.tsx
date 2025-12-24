"use client"

import { useState } from "react"
import { Button } from "@/lib/components/ui/button"
import { Input } from "@/lib/components/ui/input"
import { Label } from "@/lib/components/ui/label"
import { Plus, X } from "lucide-react"

interface Checklist {
  title: string
  items: string[]
}

interface ChecklistInputProps {
  checklists: Checklist[]
  onChecklistsChange: (checklists: Checklist[]) => void
}

export function ChecklistInput({
  checklists,
  onChecklistsChange,
}: ChecklistInputProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newChecklist, setNewChecklist] = useState({ title: "", items: [""] })

  const handleAddChecklist = () => {
    if (newChecklist.title.trim()) {
      onChecklistsChange([
        ...checklists,
        {
          title: newChecklist.title,
          items: newChecklist.items.filter((item) => item.trim()),
        },
      ])
      setNewChecklist({ title: "", items: [""] })
      setIsAdding(false)
    }
  }

  const handleRemoveChecklist = (index: number) => {
    onChecklistsChange(checklists.filter((_, i) => i !== index))
  }

  const handleAddItem = (checklistIndex: number) => {
    const updated = [...checklists]
    updated[checklistIndex].items.push("")
    onChecklistsChange(updated)
  }

  const handleUpdateItem = (
    checklistIndex: number,
    itemIndex: number,
    value: string
  ) => {
    const updated = [...checklists]
    updated[checklistIndex].items[itemIndex] = value
    onChecklistsChange(updated)
  }

  const handleRemoveItem = (checklistIndex: number, itemIndex: number) => {
    const updated = [...checklists]
    updated[checklistIndex].items = updated[checklistIndex].items.filter(
      (_, i) => i !== itemIndex
    )
    onChecklistsChange(updated)
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">Kontrol Listeleri</Label>

      {/* Existing Checklists */}
      {checklists.map((checklist, checklistIndex) => (
        <div
          key={checklistIndex}
          className="p-3 border rounded-lg bg-muted/50 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{checklist.title}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleRemoveChecklist(checklistIndex)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1 pl-4">
            {checklist.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border border-muted-foreground/30 flex-shrink-0" />
                <Input
                  value={item}
                  onChange={(e) =>
                    handleUpdateItem(checklistIndex, itemIndex, e.target.value)
                  }
                  placeholder="Kontrol listesi öğesi"
                  className="h-7 text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemoveItem(checklistIndex, itemIndex)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => handleAddItem(checklistIndex)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Öğe Ekle
            </Button>
          </div>
        </div>
      ))}

      {/* Add Checklist Form */}
      {isAdding ? (
        <div className="p-3 border rounded-lg bg-muted/50 space-y-3">
          <Input
            placeholder="Kontrol listesi başlığı"
            value={newChecklist.title}
            onChange={(e) =>
              setNewChecklist({ ...newChecklist, title: e.target.value })
            }
            className="h-8"
          />
          <div className="space-y-2">
            {newChecklist.items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border border-muted-foreground/30 flex-shrink-0" />
                <Input
                  value={item}
                  onChange={(e) => {
                    const updated = [...newChecklist.items]
                    updated[index] = e.target.value
                    setNewChecklist({ ...newChecklist, items: updated })
                  }}
                  placeholder="Öğe adı"
                  className="h-7 text-sm"
                />
                {newChecklist.items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      const updated = newChecklist.items.filter((_, i) => i !== index)
                      setNewChecklist({ ...newChecklist, items: updated })
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() =>
                setNewChecklist({
                  ...newChecklist,
                  items: [...newChecklist.items, ""],
                })
              }
            >
              <Plus className="h-3 w-3 mr-1" />
              Öğe Ekle
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAddChecklist}
              disabled={!newChecklist.title.trim()}
            >
              Ekle
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setIsAdding(false)
                setNewChecklist({ title: "", items: [""] })
              }}
            >
              İptal
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Kontrol Listesi Ekle
        </Button>
      )}
    </div>
  )
}

