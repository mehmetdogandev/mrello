export * from "./autentication";
export * from "./board";
export * from "./workspace";
export * from "./list";
export * from "./card";

// Relations - defined here to avoid circular dependencies
import { relations } from "drizzle-orm";
import { user, account, session } from "./autentication";
import { workspace, workspaceMember } from "./workspace";
import { board } from "./board";
import { list } from "./list";
import {
  card,
  cardMember,
  cardLabel,
  cardAttachment,
  cardComment,
  cardChecklist,
  cardChecklistItem,
} from "./card";

// User Relations
export const userRelations = relations(user, ({ many }) => ({
  account: many(account),
  session: many(session),
  workspaces: many(workspace),
  workspaceMembers: many(workspaceMember),
  cardMembers: many(cardMember),
  cardComments: many(cardComment),
  cardAttachments: many(cardAttachment),
}));

// Workspace Relations
export const workspaceRelations = relations(workspace, ({ one, many }) => ({
  owner: one(user, {
    fields: [workspace.ownerId],
    references: [user.id],
  }),
  members: many(workspaceMember),
  boards: many(board),
}));

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

// Board Relations
export const boardRelations = relations(board, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [board.workspaceId],
    references: [workspace.id],
  }),
  lists: many(list),
}));

// List Relations
export const listRelations = relations(list, ({ one, many }) => ({
  board: one(board, {
    fields: [list.boardId],
    references: [board.id],
  }),
  cards: many(card),
}));

// Card Relations
export const cardRelations = relations(card, ({ one, many }) => ({
  list: one(list, {
    fields: [card.listId],
    references: [list.id],
  }),
  members: many(cardMember),
  labels: many(cardLabel),
  attachments: many(cardAttachment),
  comments: many(cardComment),
  checklists: many(cardChecklist),
}));

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
