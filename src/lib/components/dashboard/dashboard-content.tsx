"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/server/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { Badge } from "@/lib/components/ui/badge";
import { Avatar } from "@/lib/components/ui/avatar";

interface DashboardContentProps {
  userId: string;
}

export function DashboardContent({ userId }: DashboardContentProps) {
  const router = useRouter();
  const { data: workspaces, isLoading } = api.workspace.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const ownedCount = workspaces?.owned?.length || 0;
  const memberCount = workspaces?.memberOf?.length || 0;
  const totalWorkspaces = ownedCount + memberCount;

  const recentWorkspaces = [
    ...(workspaces?.owned || []).slice(0, 3),
    ...(workspaces?.memberOf || []).slice(0, 3),
  ].slice(0, 6);

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">
          Hoş Geldiniz! 👋
        </h1>
        <p className="text-lg text-gray-600">
          Projelerinizi yönetmek için hazırsınız
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-primary-foreground shadow-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <svg
                className="h-6 w-6"
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
              Toplam Çalışma Alanı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalWorkspaces}</p>
            <p className="text-blue-100 mt-2">
              {ownedCount} sahip, {memberCount} üye
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Sahip Olduklarım
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">{ownedCount}</p>
            <p className="text-gray-600 mt-2">Çalışma alanı sahibisiniz</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700">
              <svg
                className="h-6 w-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Üye Olduklarım
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">{memberCount}</p>
            <p className="text-gray-600 mt-2">Çalışma alanına üyesiniz</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={() => router.push("/workspaces")}
          className="gradient-primary shadow-lg"
          size="lg"
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
        <Button
          onClick={() => router.push("/workspaces")}
          size="lg"
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          Tüm Çalışma Alanları
        </Button>
        <Button
          onClick={() => router.push("/user-info")}
          size="lg"
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Profil Bilgileri
        </Button>
      </div>

      {/* Recent Workspaces */}
      {recentWorkspaces.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Son Çalışma Alanları
            </h2>
            <Button
              onClick={() => router.push("/workspaces")}
              className="text-blue-600 hover:text-blue-700"
            >
              Tümünü Gör
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentWorkspaces.map((workspace) => {
              const isOwned = workspaces?.owned?.some(
                (w) => w.id === workspace.id,
              );
              return (
                <Card
                  key={workspace.id}
                  className="cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] group"
                  onClick={() => router.push(`/workspaces/${workspace.id}`)}
                >
                  <CardContent className="p-6">
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
                        variant={isOwned ? "default" : "info"}
                        size="sm"
                      >
                        {isOwned ? "Sahip" : "Üye"}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {workspace.name}
                    </h3>
                    {workspace.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {workspace.description}
                      </p>
                    )}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Button
                        size="sm"
                        className="w-full group-hover:text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/workspaces/${workspace.id}`);
                        }}
                      >
                        Aç
                        <svg
                          className="ml-2 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalWorkspaces === 0 && (
        <Card className="p-12 text-center shadow-lg">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100">
            <svg
              className="h-10 w-10 text-blue-600"
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
          <h3 className="mt-6 text-2xl font-bold text-gray-900">
            Henüz çalışma alanınız yok
          </h3>
          <p className="mt-2 text-gray-600">
            İlk çalışma alanınızı oluşturarak başlayın ve projelerinizi organize
            edin
          </p>
          <Button
            onClick={() => router.push("/workspaces")}
            className="mt-6 gradient-primary shadow-lg"
            size="lg"
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
            İlk Çalışma Alanını Oluştur
          </Button>
        </Card>
      )}
    </div>
  );
}

