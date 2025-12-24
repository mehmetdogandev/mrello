import { pgTable, text, primaryKey, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./autentication";
import { timestamps, auditMeta, id } from "../utils";

/**
 * Workspace (Çalışma Alanı)
 * Her kullanıcı birden fazla workspace oluşturabilir
 */
export const workspace = pgTable(
  "workspace",
  {
    id,
    name: text("name").notNull(),
    description: text("description"),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
    ...timestamps,
    ...auditMeta,
  },
  (table) => ({
    ownerIdIdx: index("workspace_owner_id_idx").on(table.ownerId),
    createdAtIdx: index("workspace_created_at_idx").on(table.createdAt),
  }),
);

/**
 * Workspace Members (Many-to-Many)
 * Workspace'e üye olan kullanıcılar
 */
export const workspaceMember = pgTable(
  "workspace_member",
  {
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"), // owner, admin, member
    ...timestamps,
  },
  (table) => ({
    pk: primaryKey({ columns: [table.workspaceId, table.userId] }),
    workspaceIdIdx: index("workspace_member_workspace_id_idx").on(
      table.workspaceId,
    ),
    userIdIdx: index("workspace_member_user_id_idx").on(table.userId),
  }),
);

// Relations - will be defined in index.ts to avoid circular dependencies

export const workspaceMemberRelations = relations(
  workspaceMember,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [workspaceMember.workspaceId],
      references: [workspace.id],
    }),
    user: one(user, {
      fields: [workspaceMember.userId],
      references: [user.id],
    }),
  }),
);
