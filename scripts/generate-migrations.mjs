import { readdir, readFile, writeFile } from 'node:fs/promises';

const files = (await readdir('db')).filter(name => /^\d{4}_[a-z0-9_-]+\.sql$/.test(name)).sort();
if (!files.length) throw new Error('No numbered SQL migrations found in db/');
const migrations = await Promise.all(files.map(async id => ({ id, sql: (await readFile(`db/${id}`, 'utf8')).replace(/\r\n?/g, '\n') })));
const runtime = `
const initialized = new WeakMap();
const run = (db, sql, ...args) => db.prepare(sql).bind(...args).run();
const first = (db, sql, ...args) => db.prepare(sql).bind(...args).first();

async function apply(db) {
  await run(db, 'CREATE TABLE IF NOT EXISTS _sites_migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)');
  const applied = new Set(((await db.prepare('SELECT id FROM _sites_migrations').all()).results || []).map(r => r.id));
  for (const migration of migrations) {
    if (applied.has(migration.id)) continue;
    const statements = migration.sql.split(';').map(sql => sql.trim()).filter(Boolean);
    if (!statements.length) continue;
    const batch = [...statements.map(sql => db.prepare(sql)), db.prepare('INSERT INTO _sites_migrations(id) VALUES (?)').bind(migration.id)];
    try {
      await db.batch(batch);
    } catch (error) {
      if (!(await first(db, 'SELECT id FROM _sites_migrations WHERE id=?', migration.id))) throw error;
    }
  }
  return migrations.map(({ id }) => id);
}

export function ensureMigrations(db) {
  let pending = initialized.get(db);
  if (!pending) {
    pending = apply(db).catch(error => {
      initialized.delete(db);
      throw error;
    });
    initialized.set(db, pending);
  }
  return pending;
}
`;
await writeFile('worker/migrations.js', `// Generated from db/*.sql by scripts/generate-migrations.mjs. Do not edit by hand.\nexport const migrations = ${JSON.stringify(migrations)};\n${runtime}`);
