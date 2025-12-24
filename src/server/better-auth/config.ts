import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "@/env";
import { db } from "@/server/db";

const isProd = env.NODE_ENV === "production";

const githubEnabled =
  isProd &&
  env.BETTER_AUTH_GITHUB_CLIENT_ID &&
  env.BETTER_AUTH_GITHUB_CLIENT_SECRET;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: githubEnabled
    ? {
        github: {
          clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID!,
          clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET!,
          redirectURI:
            "https://your-domain.com/api/auth/callback/github",
        },
      }
    : {},
});
