import { id, timestamps, auditMeta } from "../utils";
import { pgTable, text, integer, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { board } from "./board";

/**
 * List (Liste)
 * Her board'ta birden fazla liste olabilir
 * Position: Liste sıralaması için
 */
export const list = pgTable(
  "list",
  {
    id,
    name: text("name").notNull(),
    position: integer("position").notNull().default(0), // Liste sıralaması
    color: text("color"), // Liste rengi (hex color code)
    boardId: text("board_id")
      .notNull()
      .references(() => board.id, { onDelete: "cascade" }),
    ...timestamps,
    ...auditMeta,
  },
  (table) => ({
    boardIdIdx: index("list_board_id_idx").on(table.boardId),
    positionIdx: index("list_position_idx").on(table.position),
  }),
);

// Relations - will be defined in index.ts to avoid circular dependencies
