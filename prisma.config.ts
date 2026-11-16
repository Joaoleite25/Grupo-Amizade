import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // process.env em vez de env(): assim `npm install` (prisma generate) funciona
    // mesmo antes de existir o .env.
    url: process.env.DATABASE_URL,
  },
});
