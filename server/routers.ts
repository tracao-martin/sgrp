import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { authRouter } from "./routers/auth";
import { crmRouter } from "./routers/crm";
import { expertRouter } from "./routers/expert";
import { adminRouter } from "./routers/admin";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: authRouter,
  crm: crmRouter,
  expert: expertRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
