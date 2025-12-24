import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/lib/server/trpc/trpc";
import { workspace, workspaceMember } from "@/lib/server/db/schema";
import { db } from "@/lib/server/db";

export const workspaceRouter = createTRPCRouter({
  // Tüm workspace'leri getir (kullanıcının sahip olduğu veya üye olduğu)
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    // Kullanıcının sahip olduğu workspace'ler
    const owned = await db
      .select()
      .from(workspace)
      .where(eq(workspace.ownerId, userId))
      .orderBy(desc(workspace.createdAt));

    // Kullanıcının üye olduğu workspace'ler
    const memberOf = await db
      .select({
        workspace: workspace,
      })
      .from(workspaceMember)
      .innerJoin(workspace, eq(workspaceMember.workspaceId, workspace.id))
      .where(eq(workspaceMember.userId, userId));

    return {
      owned,
      memberOf: memberOf.map((m) => m.workspace),
    };
  }),

  // Workspace oluştur
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        color: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const [newWorkspace] = await db
        .insert(workspace)
        .values({
          name: input.name,
          description: input.description,
          color: input.color,
          ownerId: userId,
          createdBy: userId,
          updatedBy: userId,
        })
        .returning();

      return newWorkspace;
    }),

  // Workspace getir
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const [workspaceData] = await db
        .select()
        .from(workspace)
        .where(eq(workspace.id, input.id))
        .limit(1);

      if (!workspaceData) throw new Error("Workspace not found");

      // Kullanıcı owner mı veya member mı kontrol et
      const isOwner = workspaceData.ownerId === userId;
      const isMember = await db
        .select()
        .from(workspaceMember)
        .where(
          and(
            eq(workspaceMember.workspaceId, input.id),
            eq(workspaceMember.userId, userId),
          ),
        )
        .limit(1);

      if (!isOwner && isMember.length === 0) {
        throw new Error("Unauthorized");
      }

      return workspaceData;
    }),

  // Workspace güncelle
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        color: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const { id, ...updateData } = input;

      // Owner kontrolü
      const [workspaceData] = await db
        .select()
        .from(workspace)
        .where(eq(workspace.id, id))
        .limit(1);

      if (!workspaceData || workspaceData.ownerId !== userId) {
        throw new Error("Unauthorized");
      }

      const [updated] = await db
        .update(workspace)
        .set({
          ...updateData,
          updatedBy: userId,
        })
        .where(eq(workspace.id, id))
        .returning();

      return updated;
    }),

  // Workspace sil
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      // Owner kontrolü
      const [workspaceData] = await db
        .select()
        .from(workspace)
        .where(eq(workspace.id, input.id))
        .limit(1);

      if (!workspaceData || workspaceData.ownerId !== userId) {
        throw new Error("Unauthorized");
      }

      await db.delete(workspace).where(eq(workspace.id, input.id));

      return { success: true };
    }),

  // Workspace'e üye ekle
  addMember: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        userId: z.string(),
        role: z.enum(["owner", "admin", "member"]).default("member"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session?.user?.id;
      if (!currentUserId) throw new Error("Unauthorized");

      // Owner veya admin kontrolü
      const [workspaceData] = await db
        .select()
        .from(workspace)
        .where(eq(workspace.id, input.workspaceId))
        .limit(1);

      if (!workspaceData) throw new Error("Workspace not found");

      const isOwner = workspaceData.ownerId === currentUserId;
      if (!isOwner) {
        // Admin kontrolü
        const [member] = await db
          .select()
          .from(workspaceMember)
          .where(
            and(
              eq(workspaceMember.workspaceId, input.workspaceId),
              eq(workspaceMember.userId, currentUserId),
            ),
          )
          .limit(1);

        if (!member || member.role !== "admin") {
          throw new Error("Unauthorized");
        }
      }

      const [newMember] = await db
        .insert(workspaceMember)
        .values({
          workspaceId: input.workspaceId,
          userId: input.userId,
          role: input.role,
        })
        .returning();

      return newMember;
    }),

  // Workspace'ten üye çıkar
  removeMember: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session?.user?.id;
      if (!currentUserId) throw new Error("Unauthorized");

      // Owner veya admin kontrolü
      const [workspaceData] = await db
        .select()
        .from(workspace)
        .where(eq(workspace.id, input.workspaceId))
        .limit(1);

      if (!workspaceData) throw new Error("Workspace not found");

      const isOwner = workspaceData.ownerId === currentUserId;
      if (!isOwner) {
        const [member] = await db
          .select()
          .from(workspaceMember)
          .where(
            and(
              eq(workspaceMember.workspaceId, input.workspaceId),
              eq(workspaceMember.userId, currentUserId),
            ),
          )
          .limit(1);

        if (!member || member.role !== "admin") {
          throw new Error("Unauthorized");
        }
      }

      await db
        .delete(workspaceMember)
        .where(
          and(
            eq(workspaceMember.workspaceId, input.workspaceId),
            eq(workspaceMember.userId, input.userId),
          ),
        );

      return { success: true };
    }),
});
