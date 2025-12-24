import { z } from "zod";
import { eq, and, desc, isNull } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/lib/server/trpc/trpc";
import { board, workspace, workspaceMember } from "@/lib/server/db/schema";
import { db } from "@/lib/server/db";

// UUID validation helper
const uuidSchema = z.string().uuid();

export const boardRouter = createTRPCRouter({
  // Workspace'teki tüm board'ları getir
  getByWorkspace: protectedProcedure
    .input(z.object({ workspaceId: uuidSchema }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      // Workspace erişim kontrolü
      const [workspaceData] = await db
        .select()
        .from(workspace)
        .where(eq(workspace.id, input.workspaceId))
        .limit(1);

      if (!workspaceData) throw new Error("Workspace not found");

      const isOwner = workspaceData.ownerId === userId;
      const isMember = await db
        .select()
        .from(workspaceMember)
        .where(
          and(
            eq(workspaceMember.workspaceId, input.workspaceId),
            eq(workspaceMember.userId, userId),
          ),
        )
        .limit(1);

      if (!isOwner && isMember.length === 0) {
        throw new Error("Unauthorized");
      }

      const boards = await db
        .select()
        .from(board)
        .where(and(eq(board.workspaceId, input.workspaceId), isNull(board.deletedAt)))
        .orderBy(board.position, desc(board.createdAt));

      return boards;
    }),

  // Board oluştur
  create: protectedProcedure
    .input(
      z.object({
        workspaceId: uuidSchema,
        name: z.string().min(1),
        description: z.string().optional(),
        color: z.string().optional(),
        coverImage: z.string().optional(),
        isPublic: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      // Workspace erişim kontrolü
      const [workspaceData] = await db
        .select()
        .from(workspace)
        .where(eq(workspace.id, input.workspaceId))
        .limit(1);

      if (!workspaceData) throw new Error("Workspace not found");

      const isOwner = workspaceData.ownerId === userId;
      const isMember = await db
        .select()
        .from(workspaceMember)
        .where(
          and(
            eq(workspaceMember.workspaceId, input.workspaceId),
            eq(workspaceMember.userId, userId),
          ),
        )
        .limit(1);

      if (!isOwner && isMember.length === 0) {
        throw new Error("Unauthorized");
      }

      // Son position'ı bul
      const lastBoard = await db
        .select()
        .from(board)
        .where(eq(board.workspaceId, input.workspaceId))
        .orderBy(desc(board.position))
        .limit(1);

      const position = lastBoard[0]?.position
        ? lastBoard[0].position + 1
        : 0;

      const [newBoard] = await db
        .insert(board)
        .values({
          name: input.name,
          description: input.description,
          color: input.color,
          coverImage: input.coverImage,
          isPublic: input.isPublic || "false",
          workspaceId: input.workspaceId,
          position,
          createdBy: userId,
          updatedBy: userId,
        })
        .returning();

      return newBoard;
    }),

  // Board getir
  getById: protectedProcedure
    .input(z.object({ id: uuidSchema }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const [boardData] = await db
        .select()
        .from(board)
        .where(and(eq(board.id, input.id), isNull(board.deletedAt)))
        .limit(1);

      if (!boardData) throw new Error("Board not found");

      // Workspace erişim kontrolü
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

      return boardData;
    }),

  // Board güncelle
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        color: z.string().optional(),
        coverImage: z.string().optional(),
        isPublic: z.string().optional(),
        position: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const { id, ...updateData } = input;

      // Board ve workspace erişim kontrolü
      const [boardData] = await db
        .select()
        .from(board)
        .where(eq(board.id, id))
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
        .update(board)
        .set({
          ...updateData,
          updatedBy: userId,
        })
        .where(eq(board.id, id))
        .returning();

      return updated;
    }),

  // Board sil
  delete: protectedProcedure
    .input(z.object({ id: uuidSchema }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      // Board ve workspace erişim kontrolü
      const [boardData] = await db
        .select()
        .from(board)
        .where(and(eq(board.id, input.id), isNull(board.deletedAt)))
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
        .update(board)
        .set({
          deletedAt: new Date(),
          deletedBy: userId,
        })
        .where(eq(board.id, input.id));

      return { success: true };
    }),

  // Board position güncelle (sıralama)
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

      const [boardData] = await db
        .select()
        .from(board)
        .where(and(eq(board.id, input.id), isNull(board.deletedAt)))
        .limit(1);

      if (!boardData) throw new Error("Board not found");

      const [updated] = await db
        .update(board)
        .set({
          position: input.position,
          updatedBy: userId,
        })
        .where(eq(board.id, input.id))
        .returning();

      return updated;
    }),
});
