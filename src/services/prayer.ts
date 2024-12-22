import { eq } from 'drizzle-orm'
import { db } from '../db.js'
import { type NewPrayer, type Prayer, prayersTable } from '../schema.js'

export async function getPrayerList(): Promise<Prayer[]> {
  return db.select().from(prayersTable)
}

export async function getPrayer(id: string): Promise<Prayer | undefined> {
  const rows = await db.select().from(prayersTable).where(eq(prayersTable.id, id))

  return rows.at(0)
}

export async function createPrayer(prayer: NewPrayer): Promise<Prayer> {
  const rows = await db.insert(prayersTable).values(prayer).returning()

  return rows.at(0)!
}

export async function updatePrayer(id: string, updateWith: Partial<Prayer>): Promise<Prayer> {
  const rows = await db
    .update(prayersTable)
    .set(updateWith)
    .where(eq(prayersTable.id, id))
    .returning()

  return rows.at(0)!
}

export async function deletePrayer(id: string): Promise<Prayer> {
  const rows = await db.delete(prayersTable).where(eq(prayersTable.id, id)).returning()

  return rows.at(0)!
}
