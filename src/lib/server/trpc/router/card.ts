import { z } from "zod";
import { eq, and, desc, isNull } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/lib/server/trpc/trpc";
import {
  card,
  cardMember,
  cardLabel,
  cardAttachment,
  cardComment,
  cardChecklist,
  cardChecklistItem,
  list,
  board,
  workspace,
  workspaceMember,
} from "@/lib/server/db/schema";
import { db } from "@/lib/server/db";

// Helper function: Check workspace access
async function checkWorkspaceAccess(
  workspaceId: string,
  userId: string,
): Promise<boolean> {
  const [workspaceData] = await db
    .select()
    .from(workspace)
    .where(eq(workspace.id, workspaceId))
    .limit(1);

  if (!workspaceData) throw new Error("Workspace not found");

  const isOwner = workspaceData.ownerId === userId;
  if (isOwner) return true;

  const isMember = await db
    .select()
    .from(workspaceMember)
    .where(
      and(
        eq(workspaceMember.workspaceId, workspaceId),
        eq(workspaceMember.userId, userId),
      ),
    )
    .limit(1);

  return isMember.length > 0;
}

export const cardRouter = createTRPCRouter({
  // Listedeki tüm kartları getir
  getByList: protectedProcedure
    .input(z.object({ listId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      // List, board ve workspace erişim kontrolü
      const [listData] = await db
        .select()
        .from(list)
        .where(eq(list.id, input.listId))
        .limit(1);

      if (!listData) throw new Error("List not found");

      const [boardData] = await db
        .select()
        .from(board)
        .where(eq(board.id, listData.boardId))
        .limit(1);

      if (!boardData) throw new Error("Board not found");

      await checkWorkspaceAccess(boardData.workspaceId, userId);

      const cards = await db
        .select()
        .from(card)
        .where(and(eq(card.listId, input.listId), isNull(card.deletedAt)))
        .orderBy(card.position, desc(card.createdAt));

      return cards;
    }),

  // Kart oluştur
  create: protectedProcedure
    .input(
      z.object({
        listId: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        color: z.string().optional(),
        coverImage: z.string().optional(),
        dueDate: z.string().optional(),
        startDate: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      // List, board ve workspace erişim kontrolü
      const [listData] = await db
        .select()
        .from(list)
        .where(eq(list.id, input.listId))
        .limit(1);

      if (!listData) throw new Error("List not found");

      const [boardData] = await db
        .select()
        .from(board)
        .where(eq(board.id, listData.boardId))
        .limit(1);

      if (!boardData) throw new Error("Board not found");

      await checkWorkspaceAccess(boardData.workspaceId, userId);

      // Son position'ı bul
      const lastCard = await db
        .select()
        .from(card)
        .where(eq(card.listId, input.listId))
        .orderBy(desc(card.position))
        .limit(1);

      const position = lastCard[0]?.position ? lastCard[0].position + 1 : 0;

      const [newCard] = await db
        .insert(card)
        .values({
          title: input.title,
          description: input.description,
          color: input.color,
          coverImage: input.coverImage,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          startDate: input.startDate ? new Date(input.startDate) : null,
          listId: input.listId,
          position,
          createdBy: userId,
          updatedBy: userId,
        })
        .returning();

      return newCard;
    }),

  // Kart getir
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const [cardData] = await db
        .select()
        .from(card)
        .where(and(eq(card.id, input.id), isNull(card.deletedAt)))
        .limit(1);

      if (!cardData) throw new Error("Card not found");

      // List, board ve workspace erişim kontrolü
      const [listData] = await db
        .select()
        .from(list)
        .where(eq(list.id, cardData.listId))
        .limit(1);

      if (!listData) throw new Error("List not found");

      const [boardData] = await db
        .select()
        .from(board)
        .where(eq(board.id, listData.boardId))
        .limit(1);

      if (!boardData) throw new Error("Board not found");

      await checkWorkspaceAccess(boardData.workspaceId, userId);

      return cardData;
    }),

  // Kart güncelle
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        color: z.string().optional(),
        coverImage: z.string().optional(),
        dueDate: z.string().optional(),
        startDate: z.string().optional(),
        isCompleted: z.boolean().optional(),
        position: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const { id, dueDate, startDate, ...updateData } = input;

      // Card, list, board ve workspace erişim kontrolü
      const [cardData] = await db
        .select()
        .from(card)
        .where(eq(card.id, id))
        .limit(1);

      if (!cardData) throw new Error("Card not found");

      const [listData] = await db
        .select()
        .from(list)
        .where(eq(list.id, cardData.listId))
        .limit(1);

      if (!listData) throw new Error("List not found");

      const [boardData] = await db
        .select()
        .from(board)
        .where(eq(board.id, listData.boardId))
        .limit(1);

      if (!boardData) throw new Error("Board not found");

      await checkWorkspaceAccess(boardData.workspaceId, userId);

      const [updated] = await db
        .update(card)
        .set({
          ...updateData,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          startDate: startDate ? new Date(startDate) : undefined,
          updatedBy: userId,
        })
        .where(eq(card.id, id))
        .returning();

      return updated;
    }),

  // Kart sil
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      // Card, list, board ve workspace erişim kontrolü
      const [cardData] = await db
        .select()
        .from(card)
        .where(and(eq(card.id, input.id), isNull(card.deletedAt)))
        .limit(1);

      if (!cardData) throw new Error("Card not found");

      const [listData] = await db
        .select()
        .from(list)
        .where(eq(list.id, cardData.listId))
        .limit(1);

      if (!listData) throw new Error("List not found");

      const [boardData] = await db
        .select()
        .from(board)
        .where(eq(board.id, listData.boardId))
        .limit(1);

      if (!boardData) throw new Error("Board not found");

      await checkWorkspaceAccess(boardData.workspaceId, userId);

      await db
        .update(card)
        .set({
          deletedAt: new Date(),
          deletedBy: userId,
        })
        .where(eq(card.id, input.id));

      return { success: true };
    }),

  // Kart position güncelle
  updatePosition: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        position: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const [cardData] = await db
        .select()
        .from(card)
        .where(and(eq(card.id, input.id), isNull(card.deletedAt)))
        .limit(1);

      if (!cardData) throw new Error("Card not found");

      const [updated] = await db
        .update(card)
        .set({
          position: input.position,
          updatedBy: userId,
        })
        .where(eq(card.id, input.id))
        .returning();

      return updated;
    }),

  // ========== CARD MEMBERS ==========

  // Karta üye ekle
  addMember: protectedProcedure
    .input(
      z.object({
        cardId: z.string(),
        userId: z.string(),
        role: z.enum(["owner", "member"]).default("member"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session?.user?.id;
      if (!currentUserId) throw new Error("Unauthorized");

      // Card erişim kontrolü
      const [cardData] = await db
        .select()
        .from(card)
        .where(eq(card.id, input.cardId))
        .limit(1);

      if (!cardData) throw new Error("Card not found");

      const [listData] = await db
        .select()
        .from(list)
        .where(eq(list.id, cardData.listId))
        .limit(1);

      if (!listData) throw new Error("List not found");

      const [boardData] = await db
        .select()
        .from(board)
        .where(eq(board.id, listData.boardId))
        .limit(1);

      if (!boardData) throw new Error("Board not found");

      await checkWorkspaceAccess(boardData.workspaceId, currentUserId);

      const [newMember] = await db
        .insert(cardMember)
        .values({
          cardId: input.cardId,
          userId: input.userId,
          role: input.role,
        })
        .returning();

      return newMember;
    }),

  // Karttan üye çıkar
  removeMember: protectedProcedure
    .input(
      z.object({
        cardId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session?.user?.id;
      if (!currentUserId) throw new Error("Unauthorized");

      // Card erişim kontrolü
      const [cardData] = await db
        .select()
        .from(card)
        .where(eq(card.id, input.cardId))
        .limit(1);

      if (!cardData) throw new Error("Card not found");

      const [listData] = await db
        .select()
        .from(list)
        .where(eq(list.id, cardData.listId))
        .limit(1);

      if (!listData) throw new Error("List not found");

      const [boardData] = await db
        .select()
        .from(board)
        .where(eq(board.id, listData.boardId))
        .limit(1);

      if (!boardData) throw new Error("Board not found");

      await checkWorkspaceAccess(boardData.workspaceId, currentUserId);

      await db
        .delete(cardMember)
        .where(
          and(
            eq(cardMember.cardId, input.cardId),
            eq(cardMember.userId, input.userId),
          ),
        );

      return { success: true };
    }),

  // Kart üyelerini getir
  getMembers: protectedProcedure
    .input(z.object({ cardId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      // Card erişim kontrolü
      const [cardData] = await db
        .select()
        .from(card)
        .where(eq(card.id, input.cardId))
        .limit(1);

      if (!cardData) throw new Error("Card not found");

      const members = await db
        .select()
        .from(cardMember)
        .where(eq(cardMember.cardId, input.cardId));

      return members;
    }),

  // ========== CARD LABELS ==========

  // Karta label ekle
  addLabel: protectedProcedure
    .input(
      z.object({
        cardId: z.string(),
        name: z.string().min(1),
        color: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      // Card erişim kontrolü
      const [cardData] = await db
        .select()
        .from(card)
        .where(eq(card.id, input.cardId))
        .limit(1);

      if (!cardData) throw new Error("Card not found");

      const [listData] = await db
        .select()
        .from(list)
        .where(eq(list.id, cardData.listId))
        .limit(1);

      if (!listData) throw new Error("List not found");

      const [boardData] = await db
        .select()
        .from(board)
        .where(eq(board.id, listData.boardId))
        .limit(1);

      if (!boardData) throw new Error("Board not found");

      await checkWorkspaceAccess(boardData.workspaceId, userId);

      const [newLabel] = await db
        .insert(cardLabel)
        .values({
          cardId: input.cardId,
          name: input.name,
          color: input.color,
        })
        .returning();

      return newLabel;
    }),

  // Karttan label çıkar
  removeLabel: protectedProcedure
    .input(z.object({ labelId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      // Label ve card erişim kontrolü
      const [labelData] = await db
        .select()
        .from(cardLabel)
        .where(eq(cardLabel.id, input.labelId))
        .limit(1);

      if (!labelData) throw new Error("Label not found");

      const [cardData] = await db
        .select()
        .from(card)
        .where(eq(card.id, labelData.cardId))
        .limit(1);

      if (!cardData) throw new Error("Card not found");

      const [listData] = await db
        .select()
        .from(list)
        .where(eq(list.id, cardData.listId))
        .limit(1);

      if (!listData) throw new Error("List not found");

      const [boardData] = await db
        .select()
        .from(board)
        .where(eq(board.id, listData.boardId))
        .limit(1);

      if (!boardData) throw new Error("Board not found");

      await checkWorkspaceAccess(boardData.workspaceId, userId);

      await db.delete(cardLabel).where(eq(cardLabel.id, input.labelId));

      return { success: true };
    }),

  // Kart label'larını getir
  getLabels: protectedProcedure
    .input(z.object({ cardId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const labels = await db
        .select()
        .from(cardLabel)
        .where(eq(cardLabel.cardId, input.cardId));

      return labels;
    }),

  // ========== CARD COMMENTS ==========

  // Karta yorum ekle
  addComment: protectedProcedure
    .input(
      z.object({
        cardId: z.string(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      // Card erişim kontrolü
      const [cardData] = await db
        .select()
        .from(card)
        .where(eq(card.id, input.cardId))
        .limit(1);

      if (!cardData) throw new Error("Card not found");

      const [listData] = await db
        .select()
        .from(list)
        .where(eq(list.id, cardData.listId))
        .limit(1);

      if (!listData) throw new Error("List not found");

      const [boardData] = await db
        .select()
        .from(board)
        .where(eq(board.id, listData.boardId))
        .limit(1);

      if (!boardData) throw new Error("Board not found");

      await checkWorkspaceAccess(boardData.workspaceId, userId);

      const [newComment] = await db
        .insert(cardComment)
        .values({
          cardId: input.cardId,
          userId,
          content: input.content,
          createdBy: userId,
          updatedBy: userId,
        })
        .returning();

      return newComment;
    }),

  // Kart yorumlarını getir
  getComments: protectedProcedure
    .input(z.object({ cardId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const comments = await db
        .select()
        .from(cardComment)
        .where(eq(cardComment.cardId, input.cardId))
        .orderBy(desc(cardComment.createdAt));

      return comments;
    }),

  // Yorum sil
  deleteComment: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      // Comment ve card erişim kontrolü
      const [commentData] = await db
        .select()
        .from(cardComment)
        .where(eq(cardComment.id, input.commentId))
        .limit(1);

      if (!commentData) throw new Error("Comment not found");

      // Sadece yorum sahibi veya workspace owner/admin silebilir
      if (commentData.userId !== userId) {
        const [cardData] = await db
          .select()
          .from(card)
          .where(eq(card.id, commentData.cardId))
          .limit(1);

        if (cardData) {
          const [listData] = await db
            .select()
            .from(list)
            .where(eq(list.id, cardData.listId))
            .limit(1);

          if (listData) {
            const [boardData] = await db
              .select()
              .from(board)
              .where(eq(board.id, listData.boardId))
              .limit(1);

            if (boardData) {
              const [workspaceData] = await db
                .select()
                .from(workspace)
                .where(eq(workspace.id, boardData.workspaceId))
                .limit(1);

              if (workspaceData && workspaceData.ownerId !== userId) {
                throw new Error("Unauthorized");
              }
            }
          }
        }
      }

      await db
        .delete(cardComment)
        .where(eq(cardComment.id, input.commentId));

      return { success: true };
    }),

  // ========== CARD CHECKLISTS ==========

  // Karta checklist ekle
  addChecklist: protectedProcedure
    .input(
      z.object({
        cardId: z.string(),
        title: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      // Card erişim kontrolü
      const [cardData] = await db
        .select()
        .from(card)
        .where(eq(card.id, input.cardId))
        .limit(1);

      if (!cardData) throw new Error("Card not found");

      const [listData] = await db
        .select()
        .from(list)
        .where(eq(list.id, cardData.listId))
        .limit(1);

      if (!listData) throw new Error("List not found");

      const [boardData] = await db
        .select()
        .from(board)
        .where(eq(board.id, listData.boardId))
        .limit(1);

      if (!boardData) throw new Error("Board not found");

      await checkWorkspaceAccess(boardData.workspaceId, userId);

      // Son position'ı bul
      const lastChecklist = await db
        .select()
        .from(cardChecklist)
        .where(eq(cardChecklist.cardId, input.cardId))
        .orderBy(desc(cardChecklist.position))
        .limit(1);

      const position = lastChecklist[0]?.position
        ? lastChecklist[0].position + 1
        : 0;

      const [newChecklist] = await db
        .insert(cardChecklist)
        .values({
          cardId: input.cardId,
          title: input.title,
          position,
        })
        .returning();

      return newChecklist;
    }),

  // Checklist'e item ekle
  addChecklistItem: protectedProcedure
    .input(
      z.object({
        checklistId: z.string(),
        text: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      // Checklist ve card erişim kontrolü
      const [checklistData] = await db
        .select()
        .from(cardChecklist)
        .where(eq(cardChecklist.id, input.checklistId))
        .limit(1);

      if (!checklistData) throw new Error("Checklist not found");

      const [cardData] = await db
        .select()
        .from(card)
        .where(eq(card.id, checklistData.cardId))
        .limit(1);

      if (!cardData) throw new Error("Card not found");

      const [listData] = await db
        .select()
        .from(list)
        .where(eq(list.id, cardData.listId))
        .limit(1);

      if (!listData) throw new Error("List not found");

      const [boardData] = await db
        .select()
        .from(board)
        .where(eq(board.id, listData.boardId))
        .limit(1);

      if (!boardData) throw new Error("Board not found");

      await checkWorkspaceAccess(boardData.workspaceId, userId);

      // Son position'ı bul
      const lastItem = await db
        .select()
        .from(cardChecklistItem)
        .where(eq(cardChecklistItem.checklistId, input.checklistId))
        .orderBy(desc(cardChecklistItem.position))
        .limit(1);

      const position = lastItem[0]?.position ? lastItem[0].position + 1 : 0;

      const [newItem] = await db
        .insert(cardChecklistItem)
        .values({
          checklistId: input.checklistId,
          text: input.text,
          position,
        })
        .returning();

      return newItem;
    }),

  // Checklist item toggle (completed/uncompleted)
  toggleChecklistItem: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      // Item, checklist ve card erişim kontrolü
      const [itemData] = await db
        .select()
        .from(cardChecklistItem)
        .where(eq(cardChecklistItem.id, input.itemId))
        .limit(1);

      if (!itemData) throw new Error("Item not found");

      const [checklistData] = await db
        .select()
        .from(cardChecklist)
        .where(eq(cardChecklist.id, itemData.checklistId))
        .limit(1);

      if (!checklistData) throw new Error("Checklist not found");

      const [cardData] = await db
        .select()
        .from(card)
        .where(eq(card.id, checklistData.cardId))
        .limit(1);

      if (!cardData) throw new Error("Card not found");

      const [listData] = await db
        .select()
        .from(list)
        .where(eq(list.id, cardData.listId))
        .limit(1);

      if (!listData) throw new Error("List not found");

      const [boardData] = await db
        .select()
        .from(board)
        .where(eq(board.id, listData.boardId))
        .limit(1);

      if (!boardData) throw new Error("Board not found");

      await checkWorkspaceAccess(boardData.workspaceId, userId);

      const [updated] = await db
        .update(cardChecklistItem)
        .set({
          isCompleted: !itemData.isCompleted,
        })
        .where(eq(cardChecklistItem.id, input.itemId))
        .returning();

      return updated;
    }),

  // Kart checklist'lerini getir
  getChecklists: protectedProcedure
    .input(z.object({ cardId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const checklists = await db
        .select()
        .from(cardChecklist)
        .where(eq(cardChecklist.cardId, input.cardId))
        .orderBy(cardChecklist.position);

      // Her checklist için item'ları getir
      const checklistsWithItems = await Promise.all(
        checklists.map(async (checklist) => {
          const items = await db
            .select()
            .from(cardChecklistItem)
            .where(eq(cardChecklistItem.checklistId, checklist.id))
            .orderBy(cardChecklistItem.position);

          return {
            ...checklist,
            items,
          };
        }),
      );

      return checklistsWithItems;
    }),
});
