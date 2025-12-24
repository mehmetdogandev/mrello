import {id, timestamps, auditMeta} from "../utils";
import { pgTable, text ,primaryKey} from "drizzle-orm/pg-core";
import { list } from "./list";
import {user} from "./autentication";
import { uuid } from "better-auth";


export const card = pgTable("card", {
  id,
  name: text("name").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  position: text("position").notNull(),
  listId: text("list_id")
    .notNull()
    .references(() => list.id, { onDelete: "cascade" }),
    ...timestamps,
    ...auditMeta,
});


export const cardMember = pgTable(
  "card_member",
  {
    cardId: text("card_id")
      .notNull()
      .references(() => card.id, { onDelete: "cascade" }),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.cardId, t.userId] }),
  }),
);


export const comment = pgTable("comment", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),

  cardId: text("card_id")
    .notNull()
    .references(() => card.id, { onDelete: "cascade" }),

  userId: text("user_id")
    .notNull()
    .references(() => user.id),
    ...timestamps,
    ...auditMeta,
});