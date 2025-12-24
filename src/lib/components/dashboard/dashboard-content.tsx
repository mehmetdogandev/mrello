"use client"

import { useRouter } from "next/navigation"
import { api } from "@/lib/server/trpc/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card"
import { Button } from "@/lib/components/ui/button"
import { Badge } from "@/lib/components/ui/badge"
import { Loader2, Plus, Briefcase, User, ArrowRight, CheckCircle2, Users } from "lucide-react"

interface DashboardContentProps {
  userId: string
}

export function DashboardContent({ userId }: DashboardContentProps) {
  const router = useRouter()
  const { data: workspaces, isLoading } = api.workspace.getAll.useQuery()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const ownedCount = workspaces?.owned?.length || 0
  const memberCount = workspaces?.memberOf?.length || 0
  const totalWorkspaces = ownedCount + memberCount

  const recentWorkspaces = [
    ...(workspaces?.owned || []).slice(0, 3),
    ...(workspaces?.memberOf || []).slice(0, 3),
  ].slice(0, 6)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Hoş Geldiniz! 👋</h1>
        <p className="text-lg text-muted-foreground">
          Projelerinizi yönetmek için hazırsınız
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="bg-primary text-primary-foreground border-primary">
          <CardHeader>
            <CardTitle className="text-primary-foreground flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Toplam Çalışma Alanı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalWorkspaces}</p>
            <p className="text-primary-foreground/80 mt-2">
              {ownedCount} sahip, {memberCount} üye
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Sahip Olduklarım
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{ownedCount}</p>
            <p className="text-muted-foreground mt-2">Çalışma alanı sahibisiniz</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Üye Olduklarım
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{memberCount}</p>
            <p className="text-muted-foreground mt-2">Çalışma alanına üyesiniz</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => router.push("/workspaces")}
          size="lg"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Yeni Çalışma Alanı
        </Button>
        <Button
          onClick={() => router.push("/workspaces")}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <Briefcase className="h-4 w-4" />
          Tüm Çalışma Alanları
        </Button>
        <Button
          onClick={() => router.push("/user-info")}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <User className="h-4 w-4" />
          Profil Bilgileri
        </Button>
      </div>

      {/* Recent Workspaces */}
      {recentWorkspaces.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Son Çalışma Alanları</h2>
            <Button
              variant="ghost"
              onClick={() => router.push("/workspaces")}
              className="gap-2"
            >
              Tümünü Gör
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentWorkspaces.map((workspace) => {
              const isOwned = workspaces?.owned?.some(
                (w) => w.id === workspace.id,
              )
              return (
                <Card
                  key={workspace.id}
                  className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] group"
                  onClick={() => router.push(`/workspaces/${workspace.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm"
                        style={{
                          backgroundColor: workspace.color || "hsl(var(--primary))",
                        }}
                      >
                        {workspace.name.charAt(0).toUpperCase()}
                      </div>
                      <Badge variant={isOwned ? "default" : "secondary"} className="text-xs">
                        {isOwned ? "Sahip" : "Üye"}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{workspace.name}</h3>
                    {workspace.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {workspace.description}
                      </p>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full group-hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/workspaces/${workspace.id}`)
                      }}
                    >
                      Aç
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalWorkspaces === 0 && (
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
            <Briefcase className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Henüz çalışma alanınız yok</h3>
          <p className="text-muted-foreground mb-6">
            İlk çalışma alanınızı oluşturarak başlayın ve projelerinizi organize
            edin
          </p>
          <Button
            onClick={() => router.push("/workspaces")}
            size="lg"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            İlk Çalışma Alanını Oluştur
          </Button>
        </Card>
      )}
    </div>
  )
}
