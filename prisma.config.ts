import "dotenv/config";
import { defineConfig } from "prisma/config";

// For migrations, use DIRECT_URL to avoid PgBouncer transaction mode limitations
const isMigration = process.argv.some(arg => 
  arg.includes('migrate') || arg.includes('db push') || arg.includes('db pull')
);
const databaseUrl = isMigration && process.env["DIRECT_URL"]
  ? process.env["DIRECT_URL"]
  : process.env["DATABASE_URL"];

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
