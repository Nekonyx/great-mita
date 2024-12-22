import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const prayersTable = sqliteTable('prayers', {
  id: text().primaryKey(),

  createdAt: int({ mode: 'timestamp' })
    .notNull()
    .$default(() => new Date()),

  updatedAt: int({ mode: 'timestamp' })
    .notNull()
    .$default(() => new Date())
})

export type Prayer = typeof prayersTable.$inferSelect
export type NewPrayer = typeof prayersTable.$inferInsert
