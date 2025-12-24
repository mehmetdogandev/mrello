import { z } from "zod";
import { eq, and, desc, isNull } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/lib/server/trpc/trpc";
import { list, board, workspace, workspaceMember } from "@/lib/server/db/schema";
import { db } from "@/lib/server/db";

export const listRouter = createTRPCRouter({
  // Board'taki tüm listeleri getir
  getByBoard: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      // Board ve workspace erişim kontrolü
      const [boardData] = await db
        .select()
        .from(board)
        .where(eq(board.id, input.boardId))
        .limit(1);

      if (!boardData) throw new Error("Board not found");

      const [workspaceData] = await db
        .select()
        .from(workspace)
        .where(eq(workspace.id, boardData.workspaceId))
        .limit(1);

      if (!workspaceData) throw new Error("Workspace not found");

      const isOwner = workspaceData.ownerId === userId;
      const isMember = await db
        .select()
        .from(workspaceMember)
        .where(
          and(
            eq(workspaceMember.workspaceId, boardData.workspaceId),
            eq(workspaceMember.userId, userId),
          ),
        )
        .limit(1);

      if (!isOwner && isMember.length === 0) {
        throw new Error("Unauthorized");
      }

      const lists = await db
        .select()
        .from(list)
        .where(and(eq(list.boardId, input.boardId), isNull(list.deletedAt)))
        .orderBy(list.position, desc(list.createdAt));

      return lists;
    }),

  // Liste oluştur
  create: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        name: z.string().min(1),
        color: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      // Board ve workspace erişim kontrolü
      const [boardData] = await db
        .select()
        .from(board)
        .where(eq(board.id, input.boardId))
        .limit(1);

      if (!boardData) throw new Error("Board not found");

      const [workspaceData] = await db
        .select()
        .from(workspace)
        .where(eq(workspace.id, boardData.workspaceId))
        .limit(1);

      if (!workspaceData) throw new Error("Workspace not found");

      const isOwner = workspaceData.ownerId === userId;
      const isMember = await db
        .select()
        .from(workspaceMember)
        .where(
          and(
            eq(workspaceMember.workspaceId, boardData.workspaceId),
            eq(workspaceMember.userId, userId),
          ),
        )
        .limit(1);

      if (!isOwner && isMember.length === 0) {
        throw new Error("Unauthorized");
      }

      // Son position'ı bul
      const lastList = await db
        .select()
        .from(list)
        .where(eq(list.boardId, input.boardId))
        .orderBy(desc(list.position))
        .limit(1);

      const position = lastList[0]?.position ? lastList[0].position + 1 : 0;

      const [newList] = await db
        .insert(list)
        .values({
          name: input.name,
          color: input.color,
          boardId: input.boardId,
          position,
          createdBy: userId,
          updatedBy: userId,
        })
        .returning();

      return newList;
    }),

  // Liste getir
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const [listData] = await db
        .select()
        .from(list)
        .where(and(eq(list.id, input.id), isNull(list.deletedAt)))
        .limit(1);

      if (!listData) throw new Error("List not found");

      // Board ve workspace erişim kontrolü
      const [boardData] = await db
        .select()
        .from(board)
        .where(eq(board.id, listData.boardId))
        .limit(1);

      if (!boardData) throw new Error("Board not found");

      const [workspaceData] = await db
        .select()
        .from(workspace)
        .where(eq(workspace.id, boardData.workspaceId))
        .limit(1);

      if (!workspaceData) throw new Error("Workspace not found");

      const isOwner = workspaceData.ownerId === userId;
      const isMember = await db
        .select()
        .from(workspaceMember)
        .where(
          and(
            eq(workspaceMember.workspaceId, boardData.workspaceId),
            eq(workspaceMember.userId, userId),
          ),
        )
        .limit(1);

      if (!isOwner && isMember.length === 0) {
        throw new Error("Unauthorized");
      }

      return listData;
    }),

  // Liste güncelle
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        color: z.string().optional(),
        position: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const { id, ...updateData } = input;

      // List, board ve workspace erişim kontrolü
      const [listData] = await db
        .select()
        .from(list)
        .where(eq(list.id, id))
        .limit(1);

      if (!listData) throw new Error("List not found");

      const [boardData] = await db
        .select()
        .from(board)
        .where(eq(board.id, listData.boardId))
        .limit(1);

      if (!boardData) throw new Error("Board not found");

      const [workspaceData] = await db
        .select()
        .from(workspace)
        .where(eq(workspace.id, boardData.workspaceId))
        .limit(1);

      if (!workspaceData) throw new Error("Workspace not found");

      const isOwner = workspaceData.ownerId === userId;
      const isMember = await db
        .select()
        .from(workspaceMember)
        .where(
          and(
            eq(workspaceMember.workspaceId, boardData.workspaceId),
            eq(workspaceMember.userId, userId),
          ),
        )
        .limit(1);

      if (!isOwner && isMember.length === 0) {
        throw new Error("Unauthorized");
      }

      const [updated] = await db
        .update(list)
        .set({
          ...updateData,
          updatedBy: userId,
        })
        .where(eq(list.id, id))
        .returning();

      return updated;
    }),

  // Liste sil
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      // List, board ve workspace erişim kontrolü
      const [listData] = await db
        .select()
        .from(list)
        .where(and(eq(list.id, input.id), isNull(list.deletedAt)))
        .limit(1);

      if (!listData) throw new Error("List not found");

      const [boardData] = await db
        .select()
        .from(board)
        .where(eq(board.id, listData.boardId))
        .limit(1);

      if (!boardData) throw new Error("Board not found");

      const [workspaceData] = await db
        .select()
        .from(workspace)
        .where(eq(workspace.id, boardData.workspaceId))
        .limit(1);

      if (!workspaceData) throw new Error("Workspace not found");

      const isOwner = workspaceData.ownerId === userId;
      const isMember = await db
        .select()
        .from(workspaceMember)
        .where(
          and(
            eq(workspaceMember.workspaceId, boardData.workspaceId),
            eq(workspaceMember.userId, userId),
          ),
        )
        .limit(1);

      if (!isOwner && isMember.length === 0) {
        throw new Error("Unauthorized");
      }

      await db
        .update(list)
        .set({
          deletedAt: new Date(),
          deletedBy: userId,
        })
        .where(eq(list.id, input.id));

      return { success: true };
    }),

  // Liste position güncelle
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

      const [listData] = await db
        .select()
        .from(list)
        .where(and(eq(list.id, input.id), isNull(list.deletedAt)))
        .limit(1);

      if (!listData) throw new Error("List not found");

      const [updated] = await db
        .update(list)
        .set({
          position: input.position,
          updatedBy: userId,
        })
        .where(eq(list.id, input.id))
        .returning();

      return updated;
    }),
});
