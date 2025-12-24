import { uuid, timestamp, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./schema/autentication";

/** ID column (shared column instance) */
export const id = uuid("id")
  .defaultRandom()
  .primaryKey()
  .notNull();

/** Timestamp fields */
export const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() =>new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at"),
};

/** Audit fields */
export const auditMeta = {
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
  lastUpdatedBy: text("last_updated_by").references(() => user.id, {
    onDelete: "set null",
  }),
  deletedBy: text("deleted_by").references(() => user.id, {
    onDelete: "set null",
  }),
};
