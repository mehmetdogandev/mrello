"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/server/better-auth/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/lib/components/ui/dropdown"
import { Avatar } from "@/lib/components/ui/avatar"
import { Button } from "@/lib/components/ui/button"
import { ThemeToggle } from "@/lib/components/theme-toggle"
import { User, LogOut, LayoutDashboard, Briefcase } from "lucide-react"

interface HeaderProps {
  user?: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await authClient.signOut()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <span className="text-xl font-bold">M</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">MIRELLO</h1>
        </div>

        {/* Navigation */}
        {user && (
          <nav className="hidden items-center gap-1 md:flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/workspaces")}
              className="gap-2"
            >
              <Briefcase className="h-4 w-4" />
              Çalışma Alanları
            </Button>
          </nav>
        )}

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar src={user.image || undefined} name={user.name} size="sm" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/user-info")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Çıkış Yap</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
                Giriş Yap
              </Button>
              <Button size="sm" onClick={() => router.push("/register")}>
                Kayıt Ol
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

