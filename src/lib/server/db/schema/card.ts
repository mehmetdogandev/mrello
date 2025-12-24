import { id, timestamps, auditMeta } from "../utils";
import {
  pgTable,
  text,
  integer,
  primaryKey,
  index,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { list } from "./list";
import { user } from "./autentication";

/**
 * Card (Kart)
 * Her listede birden fazla kart olabilir
 * Detaylı kart yapısı: başlık, açıklama, due date, labels, attachments vb.
 */
export const card = pgTable(
  "card",
  {
    id,
    title: text("title").notNull(),
    description: text("description"),
    position: integer("position").notNull().default(0), // Kart sıralaması
    color: text("color"), // Kart rengi (hex color code)
    coverImage: text("cover_image"), // Kart cover image URL
    dueDate: timestamp("due_date", { withTimezone: true }), // Bitiş tarihi
    isCompleted: boolean("is_completed").default(false).notNull(), // Tamamlandı mı?
    startDate: timestamp("start_date", { withTimezone: true }), // Başlangıç tarihi
    listId: text("list_id")
      .notNull()
      .references(() => list.id, { onDelete: "cascade" }),
    ...timestamps,
    ...auditMeta,
  },
  (table) => ({
    listIdIdx: index("card_list_id_idx").on(table.listId),
    positionIdx: index("card_position_idx").on(table.position),
    dueDateIdx: index("card_due_date_idx").on(table.dueDate),
    isCompletedIdx: index("card_is_completed_idx").on(table.isCompleted),
  }),
);

/**
 * Card Members (Many-to-Many)
 * Karta atanan üyeler
 */
export const cardMember = pgTable(
  "card_member",
  {
    cardId: text("card_id")
      .notNull()
      .references(() => card.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").default("member"), // owner, member
    ...timestamps,
  },
  (table) => ({
    pk: primaryKey({ columns: [table.cardId, table.userId] }),
    cardIdIdx: index("card_member_card_id_idx").on(table.cardId),
    userIdIdx: index("card_member_user_id_idx").on(table.userId),
  }),
);

/**
 * Card Labels
 * Kartlara eklenen etiketler
 */
export const cardLabel = pgTable(
  "card_label",
  {
    id,
    cardId: text("card_id")
      .notNull()
      .references(() => card.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").notNull(), // Hex color code
    ...timestamps,
  },
  (table) => ({
    cardIdIdx: index("card_label_card_id_idx").on(table.cardId),
  }),
);

/**
 * Card Attachments
 * Kartlara eklenen dosyalar
 */
export const cardAttachment = pgTable(
  "card_attachment",
  {
    id,
    cardId: text("card_id")
      .notNull()
      .references(() => card.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    fileUrl: text("file_url").notNull(),
    fileType: text("file_type"), // image, document, etc.
    fileSize: integer("file_size"), // Bytes
    uploadedBy: text("uploaded_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => ({
    cardIdIdx: index("card_attachment_card_id_idx").on(table.cardId),
    uploadedByIdx: index("card_attachment_uploaded_by_idx").on(
      table.uploadedBy,
    ),
  }),
);

/**
 * Card Comments
 * Kartlara eklenen yorumlar
 */
export const cardComment = pgTable(
  "card_comment",
  {
    id,
    content: text("content").notNull(),
    cardId: text("card_id")
      .notNull()
      .references(() => card.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
    ...auditMeta,
  },
  (table) => ({
    cardIdIdx: index("card_comment_card_id_idx").on(table.cardId),
    userIdIdx: index("card_comment_user_id_idx").on(table.userId),
    createdAtIdx: index("card_comment_created_at_idx").on(table.createdAt),
  }),
);

/**
 * Card Checklist
 * Kartlara eklenen checklist'ler
 */
export const cardChecklist = pgTable(
  "card_checklist",
  {
    id,
    cardId: text("card_id")
      .notNull()
      .references(() => card.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    position: integer("position").notNull().default(0),
    ...timestamps,
  },
  (table) => ({
    cardIdIdx: index("card_checklist_card_id_idx").on(table.cardId),
  }),
);

/**
 * Card Checklist Item
 * Checklist içindeki item'lar
 */
export const cardChecklistItem = pgTable(
  "card_checklist_item",
  {
    id,
    checklistId: text("checklist_id")
      .notNull()
      .references(() => cardChecklist.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    isCompleted: boolean("is_completed").default(false).notNull(),
    position: integer("position").notNull().default(0),
    ...timestamps,
  },
  (table) => ({
    checklistIdIdx: index("card_checklist_item_checklist_id_idx").on(
      table.checklistId,
    ),
  }),
);

// Relations - will be defined in index.ts to avoid circular dependencies

export const cardMemberRelations = relations(cardMember, ({ one }) => ({
  card: one(card, {
    fields: [cardMember.cardId],
    references: [card.id],
  }),
  user: one(user, {
    fields: [cardMember.userId],
    references: [user.id],
  }),
}));

export const cardLabelRelations = relations(cardLabel, ({ one }) => ({
  card: one(card, {
    fields: [cardLabel.cardId],
    references: [card.id],
  }),
}));

export const cardAttachmentRelations = relations(cardAttachment, ({ one }) => ({
  card: one(card, {
    fields: [cardAttachment.cardId],
    references: [card.id],
  }),
  uploadedByUser: one(user, {
    fields: [cardAttachment.uploadedBy],
    references: [user.id],
  }),
}));

export const cardCommentRelations = relations(cardComment, ({ one }) => ({
  card: one(card, {
    fields: [cardComment.cardId],
    references: [card.id],
  }),
  user: one(user, {
    fields: [cardComment.userId],
    references: [user.id],
  }),
}));

export const cardChecklistRelations = relations(cardChecklist, ({ one, many }) => ({
  card: one(card, {
    fields: [cardChecklist.cardId],
    references: [card.id],
  }),
  items: many(cardChecklistItem),
}));

export const cardChecklistItemRelations = relations(
  cardChecklistItem,
  ({ one }) => ({
    checklist: one(cardChecklist, {
      fields: [cardChecklistItem.checklistId],
      references: [cardChecklist.id],
    }),
  }),
);
