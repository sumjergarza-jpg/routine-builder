import { sql, initDb } from './_db.js';

export default async function handler(req: any, res: any) {
  try {
    await initDb();

    if (req.method === 'GET') {
      const rows = await sql`
        SELECT id, name, equipment, position, difficulty, focus, contraindications, description
        FROM exercises
        ORDER BY id
      `;
      return res.status(200).json(rows);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
