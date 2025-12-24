import { z } from "zod";
import { eq } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/lib/server/trpc/trpc";
import { userInfo } from "@/lib/server/db/schema";
import { db } from "@/lib/server/db";

export const authRouter = createTRPCRouter({
  saveUserInfo: protectedProcedure
    .input(
      z.object({
        lastName: z.string().optional(),
        birthDate: z.string().optional(),
        address: z.string().optional(),
        phoneNumber: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new Error("Kullanıcı oturumu bulunamadı");
      }

      // Mevcut userInfo'yu kontrol et
      const existing = await db
        .select()
        .from(userInfo)
        .where(eq(userInfo.userId, ctx.session.user.id))
        .limit(1);

      if (existing.length > 0) {
        // Güncelle
        await db
          .update(userInfo)
          .set({
            lastName: input.lastName || null,
            birthDate: input.birthDate ? new Date(input.birthDate) : null,
            address: input.address || null,
            phoneNumber: input.phoneNumber || null,
            updatedAt: new Date(),
          })
          .where(eq(userInfo.userId, ctx.session.user.id));
      } else {
        // Yeni oluştur
        await db.insert(userInfo).values({
          id: crypto.randomUUID(),
          userId: ctx.session.user.id,
          lastName: input.lastName || null,
          birthDate: input.birthDate ? new Date(input.birthDate) : null,
          address: input.address || null,
          phoneNumber: input.phoneNumber || null,
        });
      }

      return { success: true };
    }),
});
