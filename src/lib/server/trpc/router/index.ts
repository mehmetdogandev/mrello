import { createTRPCRouter } from "@/lib/server/trpc/trpc";
import { boardRouter } from "@/lib/server/trpc/router/board";
import { listRouter } from "@/lib/server/trpc/router/list";
import { cardRouter } from "@/lib/server/trpc/router/card";
import { workspaceRouter } from "@/lib/server/trpc/router/workspace";
import { authRouter } from "@/lib/server/trpc/router/auth";

export const appRouter = createTRPCRouter({
  workspace: workspaceRouter,
  list: listRouter,
  card: cardRouter,
  board: boardRouter,
  auth: authRouter,
});