import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  out: './drizzle',
  schema: './src/schema.ts',
  dbCredentials: {
    url: process.env.DB_URL!
  }
})
