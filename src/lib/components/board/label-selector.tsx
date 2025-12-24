"use client"

import { useState } from "react"
import { Badge } from "@/lib/components/ui/badge"
import { Button } from "@/lib/components/ui/button"
import { Input } from "@/lib/components/ui/input"
import { Label } from "@/lib/components/ui/label"
import { X, Plus } from "lucide-react"

interface Label {
  id?: string
  name: string
  color: string
}

interface LabelSelectorProps {
  selectedLabels: Label[]
  onLabelsChange: (labels: Label[]) => void
}

// Önceden tanımlı güzel etiket renkleri
const PRESET_LABEL_COLORS = [
  { name: "Kırmızı", color: "#ef4444" },
  { name: "Turuncu", color: "#f97316" },
  { name: "Sarı", color: "#eab308" },
  { name: "Yeşil", color: "#22c55e" },
  { name: "Mavi", color: "#3b82f6" },
  { name: "Mor", color: "#a855f7" },
  { name: "Pembe", color: "#ec4899" },
  { name: "Gri", color: "#6b7280" },
  { name: "Turkuaz", color: "#06b6d4" },
  { name: "Lime", color: "#84cc16" },
]

export function LabelSelector({
  selectedLabels,
  onLabelsChange,
}: LabelSelectorProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newLabel, setNewLabel] = useState({ name: "", color: PRESET_LABEL_COLORS[0].color })

  const handleAddLabel = () => {
    if (newLabel.name.trim()) {
      onLabelsChange([...selectedLabels, { ...newLabel, id: undefined }])
      setNewLabel({ name: "", color: PRESET_LABEL_COLORS[0].color })
      setIsAdding(false)
    }
  }

  const handleRemoveLabel = (index: number) => {
    onLabelsChange(selectedLabels.filter((_, i) => i !== index))
  }

  const handlePresetClick = (color: string) => {
    if (isAdding) {
      setNewLabel({ ...newLabel, color })
    }
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">Etiketler</Label>
      
      {/* Selected Labels */}
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedLabels.map((label, index) => (
            <Badge
              key={index}
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
              <button
                type="button"
                onClick={() => handleRemoveLabel(index)}
                className="ml-1 hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add Label Form */}
      {isAdding ? (
        <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
          <Input
            placeholder="Etiket adı"
            value={newLabel.name}
            onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })}
            className="h-8"
          />
          
          {/* Preset Colors */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Renk Seç
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_LABEL_COLORS.map((preset) => (
                <button
                  key={preset.color}
                  type="button"
                  onClick={() => handlePresetClick(preset.color)}
                  className={`h-8 w-full rounded border-2 transition-all ${
                    newLabel.color === preset.color
                      ? "border-foreground scale-110"
                      : "border-transparent hover:border-foreground/50"
                  }`}
                  style={{ backgroundColor: preset.color }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          {/* Custom Color */}
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Özel Renk:</Label>
            <Input
              type="color"
              value={newLabel.color}
              onChange={(e) => setNewLabel({ ...newLabel, color: e.target.value })}
              className="h-8 w-16 cursor-pointer"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAddLabel}
              disabled={!newLabel.name.trim()}
            >
              Ekle
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setIsAdding(false)
                setNewLabel({ name: "", color: PRESET_LABEL_COLORS[0].color })
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
          Etiket Ekle
        </Button>
      )}
    </div>
  )
}

