// Borra la base de datos local y la vuelve a crear con los datos iniciales.
// Uso: npm run db:reset
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const root = process.cwd();
const dbPath = process.env.DATABASE_FILE
  ? path.resolve(root, process.env.DATABASE_FILE)
  : path.join(root, 'database', 'unphu.db');

for (const suffix of ['', '-wal', '-shm']) {
  fs.rmSync(dbPath + suffix, { force: true });
}

const db = new DatabaseSync(dbPath);
db.exec(fs.readFileSync(path.join(root, 'database', 'schema.sql'), 'utf8'));
db.exec(fs.readFileSync(path.join(root, 'database', 'seed.sql'), 'utf8'));

const count = (t) => db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n;
console.log(`Base de datos creada en ${dbPath}`);
console.log(
  `  departamentos: ${count('departamentos')}, usuarios: ${count('usuarios')}, ` +
  `items: ${count('items')}, solicitudes: ${count('solicitudes')}`
);
console.log('  Administrador: matrícula admin / contraseña admin123');
db.close();
