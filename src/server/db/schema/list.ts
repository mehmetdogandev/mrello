import {id, timestamps, auditMeta} from "../utils";
import { pgTable, text } from "drizzle-orm/pg-core";
import { board } from "./board";

export const list = pgTable("list", {
  id,
  name: text("name").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  position: text("position").notNull(),
  boardId: text("board_id")
    .notNull()
    .references(() => board.id, { onDelete: "cascade" }),
    ...timestamps,
    ...auditMeta,
});