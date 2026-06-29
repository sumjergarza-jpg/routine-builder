import { sql, initDb } from './_db';

export default async function handler(req: any, res: any) {
  try {
    await initDb();

    if (req.method === 'GET') {
      const rows = await sql`
        SELECT id, title, description, created_date AS "createdDate", exercises
        FROM routines
        ORDER BY created_date DESC
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { id, title, description, createdDate, exercises } = req.body;
      await sql`
        INSERT INTO routines (id, title, description, created_date, exercises)
        VALUES (${id}, ${title}, ${description || ''}, ${createdDate}, ${JSON.stringify(exercises)}::jsonb)
      `;
      return res.status(201).json({ id, title, description, createdDate, exercises });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
