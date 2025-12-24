import { createCallerFactory } from "@/lib/server/trpc/trpc";
import { appRouter } from "@/lib/server/trpc/router/index";

/**
 * Main tRPC router for the application.
 * 
 * All routers are combined here. To add a new router:
 * 1. Create it in the router/ directory
 * 2. Import it in router/index.ts
 * 3. Add it to the appRouter object
 */
export { appRouter };

/**
 * Type definition of the API router.
 * Used for type inference on the client side.
 */
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * 
 * @example
 * ```ts
 * const trpc = createCaller(createContext);
 * const boards = await trpc.board.all();
 * ```
 */
export const createCaller = createCallerFactory(appRouter);

