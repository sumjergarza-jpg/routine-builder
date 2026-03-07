import { sql } from '../_db';

export default async function handler(req: any, res: any) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

  try {
    if (req.method === 'PUT') {
      const { title, exercises } = req.body;
      await sql`
        UPDATE routines
        SET title = ${title}, exercises = ${JSON.stringify(exercises)}::jsonb
        WHERE id = ${id}
      `;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      await sql`DELETE FROM routines WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
