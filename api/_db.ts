import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL!);

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS routines (
      id           TEXT        PRIMARY KEY,
      title        TEXT        NOT NULL,
      created_date TIMESTAMPTZ NOT NULL,
      exercises    JSONB       NOT NULL DEFAULT '[]'
    )
  `;
}
