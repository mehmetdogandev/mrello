import { pgTable, text, integer, index, uuid } from "drizzle-orm/pg-core";
import { workspace } from "./workspace";
import { id, timestamps, auditMeta } from "../utils";

/**
 * Board (Pano)
 * Her workspace'te birden fazla board olabilir
 */
export const board = pgTable(
  "board",
  {
  id,
  name: text("name").notNull(),
    description: text("description"),
    coverImage: text("cover_image"), // Board cover image URL
    color: text("color"), // Board rengi (hex color code)
    position: integer("position").notNull().default(0), // Board sıralaması
    isPublic: text("is_public").default("false"), // Public/Private board
    workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspace.id, { onDelete: "cascade" }),
    ...timestamps,
    ...auditMeta,
  },
  (table) => ({
    workspaceIdIdx: index("board_workspace_id_idx").on(table.workspaceId), 
    positionIdx: index("board_position_idx").on(table.position),
    createdAtIdx: index("board_created_at_idx").on(table.createdAt),
  }),
);

// Relations - will be defined in index.ts to avoid circular dependencies
