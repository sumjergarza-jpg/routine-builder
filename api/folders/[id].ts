import { sql } from '../_db.js';

export default async function handler(req: any, res: any) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

  try {
    if (req.method === 'PUT') {
      const { name } = req.body;
      await sql`UPDATE folders SET name = ${name} WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      await sql`DELETE FROM folders WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'POST') {
      const { routineId, action } = req.body;
      if (action === 'add') {
        await sql`INSERT INTO folder_routines (folder_id, routine_id) VALUES (${id}, ${routineId}) ON CONFLICT DO NOTHING`;
      } else if (action === 'remove') {
        await sql`DELETE FROM folder_routines WHERE folder_id = ${id} AND routine_id = ${routineId}`;
      }
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
