import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "drizzle/schemas",
  out: "drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL_NON_POOLING!,
  },
  verbose: true,
  strict: false,
});
