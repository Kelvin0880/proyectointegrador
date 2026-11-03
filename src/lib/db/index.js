// Capa de acceso a datos con SQLite (módulo integrado de Node.js: node:sqlite).
// No requiere instalar ningún servidor de base de datos: los datos se guardan
// en el archivo database/unphu.db, que se crea automáticamente la primera vez.
import fs from 'node:fs';
import path from 'node:path';

const DB_DIR = path.join(process.cwd(), 'database');
const DB_PATH = process.env.DATABASE_FILE
  ? path.resolve(process.cwd(), process.env.DATABASE_FILE)
  : path.join(DB_DIR, 'unphu.db');

function loadSqlite() {
  // getBuiltinModule evita que el bundler de Next intente empaquetar node:sqlite
  const sqlite = process.getBuiltinModule?.('node:sqlite');
  if (!sqlite) {
    throw new Error(
      `Este proyecto necesita Node.js 22.13 o superior (tienes ${process.version}). ` +
      'Descarga la versión LTS en https://nodejs.org'
    );
  }
  return sqlite;
}

function initialize(db) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const exists = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'usuarios'")
      .get();
    db.exec(fs.readFileSync(path.join(DB_DIR, 'schema.sql'), 'utf8'));
    if (!exists) {
      db.exec(fs.readFileSync(path.join(DB_DIR, 'seed.sql'), 'utf8'));
      console.log(`[db] Base de datos creada con datos iniciales en ${DB_PATH}`);
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function getDb() {
  // Se guarda en globalThis para reutilizar la conexión entre recargas en desarrollo
  if (!globalThis.__unphuDb) {
    const { DatabaseSync } = loadSqlite();
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON;');
    initialize(db);
    globalThis.__unphuDb = db;
  }
  return globalThis.__unphuDb;
}

// SQLite solo acepta null, números, texto y buffers como parámetros
function normalizeParam(value) {
  if (value === undefined) return null;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value instanceof Date) return value.toISOString().slice(0, 19).replace('T', ' ');
  return value;
}

const TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Devuelve las fechas en el mismo formato que devolvía MySQL al serializarse a JSON,
// para que el frontend las interprete correctamente con new Date(...)
function normalizeRow(row) {
  const out = {};
  for (const [key, value] of Object.entries(row)) {
    if (typeof value === 'string' && TIMESTAMP_RE.test(value)) {
      out[key] = value.replace(' ', 'T') + 'Z'; // guardadas en UTC
    } else if (key === 'fecha_uso' && typeof value === 'string' && DATE_RE.test(value)) {
      out[key] = `${value}T00:00:00`; // fecha local, sin desfase de zona horaria
    } else {
      out[key] = value;
    }
  }
  return out;
}

const READ_RE = /^\s*(SELECT|WITH|PRAGMA)\b|\bRETURNING\b/i;

/**
 * Ejecuta una consulta SQL con parámetros "?".
 * - SELECT: devuelve un arreglo de filas.
 * - INSERT/UPDATE/DELETE: devuelve { insertId, affectedRows } (igual que mysql2).
 */
export async function query(sql, params = []) {
  try {
    const stmt = getDb().prepare(sql);
    const values = params.map(normalizeParam);
    if (READ_RE.test(sql)) {
      return stmt.all(...values).map(normalizeRow);
    }
    const result = stmt.run(...values);
    return {
      insertId: Number(result.lastInsertRowid),
      affectedRows: Number(result.changes),
    };
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error.message, '\nSQL:', sql);
    throw error;
  }
}
