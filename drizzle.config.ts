import { type Config } from "drizzle-kit";

import { env } from "@/env";

export default {
  schema: "./src/lib/server/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  out: "./drizzle",
  verbose: true,
  strict: true,
} satisfies Config;
