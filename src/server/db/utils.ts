import { uuid, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/** ID column (shared column instance) */
export const id = uuid("id")
  .defaultRandom()
  .primaryKey()
  .notNull();

/** Timestamp fields */
export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),

  deletedAt: timestamp("deleted_at", { withTimezone: true }),
};

/** Audit fields */
export const auditMeta = {
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  deletedBy: uuid("deleted_by"),
};
