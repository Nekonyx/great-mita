import { db, NewPrayer, PrayerUpdate } from '../db.ts'

export async function getPrayerList() {
  // prettier-ignore
  return await db.selectFrom('prayer')
    .selectAll()
    .execute()
}

export async function getPrayer(id: string) {
  // prettier-ignore
  return await db.selectFrom('prayer')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirst()
}

export async function createPrayer(prayer: NewPrayer) {
  // prettier-ignore
  return await db.insertInto('prayer')
    .values(prayer)
    .returningAll()
    .executeTakeFirst()
}

export async function updatePrayer(id: string, updateWith: PrayerUpdate) {
  // prettier-ignore
  await db.updateTable('prayer')
    .set(updateWith)
    .where('id', '=', id)
    .execute()
}

export async function deletePrayer(id: string) {
  // prettier-ignore
  return await db.deleteFrom('prayer')
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst()
}
