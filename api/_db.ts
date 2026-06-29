import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL!);

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS routines (
      id           TEXT        PRIMARY KEY,
      title        TEXT        NOT NULL,
      description  TEXT        NOT NULL DEFAULT '',
      created_date TIMESTAMPTZ NOT NULL,
      exercises    JSONB       NOT NULL DEFAULT '[]'
    )
  `;
  await sql`
    ALTER TABLE routines ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT ''
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS folders (
      id   TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS folder_routines (
      folder_id  TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
      routine_id TEXT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
      PRIMARY KEY (folder_id, routine_id)
    )
  `;
}
