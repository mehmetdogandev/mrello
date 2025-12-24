import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { workspace } from "./Workspace";
import { id,timestamps,auditMeta } from "../utils";


export const board = pgTable("board", {
  id,
  name: text("name").notNull(),

  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id, { onDelete: "cascade" }),
    ...timestamps,
    ...auditMeta,
});
