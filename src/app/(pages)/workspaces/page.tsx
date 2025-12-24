import { redirect } from "next/navigation";
import { getSession } from "@/lib/server/better-auth/server";
import { Sidebar } from "@/lib/components/sidebar/sidebar";
import { WorkspaceDataTable } from "@/lib/components/tables/workspace-data-table";

export default async function WorkspacesPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        user={{
          id: session.user.id,
          name: session.user.name || "Kullanıcı",
          email: session.user.email || "",
          image: session.user.image,
        }}
      />
      <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <WorkspaceDataTable />
      </div>
    </div>
  );
}

