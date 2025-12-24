import { pgTable, text,uuid} from "drizzle-orm/pg-core";
import {user} from "./autentication";
import { timestamps, auditMeta, id } from "../utils";


export const workspace = pgTable("workspace", {
  id,
  name: text("name").notNull(),
  description: text("description"),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),  ...timestamps,
  ...auditMeta,
});
