import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'mysql',
  schema: './src/shared/database/schema.ts',
  out: './src/shared/database/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'mysql://root:@localhost:3306/finmate',
  },
});
