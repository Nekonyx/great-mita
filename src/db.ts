import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

export const client = createClient({
  url: process.env.DB_URL
})

export const db = drizzle({
  client
})
