import { sql, initDb } from './_db';

export default async function handler(req: any, res: any) {
  try {
    await initDb();

    if (req.method === 'GET') {
      const folders = await sql`SELECT id, name FROM folders ORDER BY id`;
      const memberships = await sql`SELECT folder_id AS "folderId", routine_id AS "routineId" FROM folder_routines`;
      const result = folders.map((f: any) => ({
        ...f,
        routineIds: memberships.filter((m: any) => m.folderId === f.id).map((m: any) => m.routineId),
      }));
      return res.status(200).json(result);
    }

    if (req.method === 'POST') {
      const { id, name } = req.body;
      await sql`INSERT INTO folders (id, name) VALUES (${id}, ${name})`;
      return res.status(201).json({ id, name, routineIds: [] });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
