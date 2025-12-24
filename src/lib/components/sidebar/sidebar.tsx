"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/server/better-auth/client";
import { Avatar } from "@/lib/components/ui/avatar";
import { Dropdown, DropdownItem } from "@/lib/components/ui/dropdown";
import { cn } from "@/lib/utils";

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
          <Dropdown
            trigger={
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
            }
            align="right"
          >
            <DropdownItem
              icon={
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
              onClick={() => router.push("/profile")}
            >
              Profil
            </DropdownItem>
            <DropdownItem
              icon={
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              }
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-50"
            >
              Çıkış Yap
            </DropdownItem>
          </Dropdown>
        )}
      </div>

      {/* Main Content Area - will be filled by children */}
      <div className="flex-1 overflow-y-auto">{/* Content goes here */}</div>

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

