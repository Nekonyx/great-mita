import { Database as SQLite } from '@db/sqlite'
import { DenoSqlite3Dialect } from '@soapbox/kysely-deno-sqlite'
import { ColumnType, Insertable, Kysely, Selectable, Updateable } from 'kysely'

export interface IPrayerTable {
  id: string
  created_at: ColumnType<Date>
  updated_at: ColumnType<Date>
}

export type Prayer = Selectable<IPrayerTable>
export type NewPrayer = Insertable<IPrayerTable>
export type PrayerUpdate = Updateable<IPrayerTable>

export interface IDatabase {
  prayer: IPrayerTable
}

export const db = new Kysely<IDatabase>({
  dialect: new DenoSqlite3Dialect({
    database: new SQLite('data.db')
  })
})

// Create tables
// prettier-ignore
await db.schema.createTable('prayer')
  .addColumn('id', 'varchar')
  .addColumn('created_at', 'datetime')
  .addColumn('updated_at', 'datetime')
  .addPrimaryKeyConstraint('pk', ['id'])
  .execute()
