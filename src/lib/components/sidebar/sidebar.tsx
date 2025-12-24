"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/server/better-auth/client";
import { Avatar } from "@/lib/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/lib/components/ui/dropdown";
import { cn } from "@/lib/utils";
import { User, LogOut } from "lucide-react";

interface SidebarProps {
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const days = [
      "Pazar",
      "Pazartesi",
      "Salı",
      "Çarşamba",
      "Perşembe",
      "Cuma",
      "Cumartesi",
    ];
    const months = [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ];

    const day = days[date.getDay()];
    const dayNum = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return {
      day,
      dayNum,
      month,
      year,
      time: `${hours}:${minutes}:${seconds}`,
    };
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  const dateInfo = formatDate(currentTime);

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold shadow-lg">
            M
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gradient bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            MIRELLO
          </h1>
        </div>

        {/* User Dropdown */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/10">
                <Avatar
                  src={user.image || undefined}
                  name={user.name}
                  size="sm"
                />
                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-300">{user.email}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => router.push("/user-info")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Çıkış Yap</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <nav className="space-y-2">
          <button
            onClick={() => router.push("/workspaces")}
            className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-white/10"
          >
            <svg
              className="h-5 w-5"
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
            <span className="font-medium">Çalışma Alanları</span>
          </button>
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 bg-black/20 px-6 py-4">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">📅</span>
              <span className="font-medium">
                {dateInfo.dayNum} {dateInfo.month} {dateInfo.year}
              </span>
            </div>
            <span className="text-gray-500">•</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">🗓️</span>
              <span className="font-medium">{dateInfo.day}</span>
            </div>
            <span className="text-gray-500">•</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">🕐</span>
              <span className="font-mono font-semibold text-blue-400">
                {dateInfo.time}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            © {dateInfo.year} MIRELLO. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
}

