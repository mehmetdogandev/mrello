import { createTRPCRouter } from "@/server/trpc/trpc";
import { boardRouter } from "@/server/trpc/router/board";
import { listRouter } from "@/server/trpc/router/list";
import { cardRouter } from "@/server/trpc/router/card";
import { workspaceRouter } from "@/server/trpc/router/workspace";



export const appRouter = createTRPCRouter({
  workspace: workspaceRouter,
  list: listRouter,
  card: cardRouter,
  board: boardRouter,
});