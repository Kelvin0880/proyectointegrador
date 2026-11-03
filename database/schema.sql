-- Esquema SQLite del Sistema de Inventario UNPHU
-- (convertido desde el dump de MySQL Dump20250320.sql)
-- Las fechas se guardan en UTC con formato 'YYYY-MM-DD HH:MM:SS'.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS departamentos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      TEXT    NOT NULL UNIQUE,
  descripcion TEXT,
  created_at  TEXT    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TEXT    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  matricula  TEXT    NOT NULL UNIQUE,
  email      TEXT    NOT NULL UNIQUE,
  nombre     TEXT    NOT NULL,
  apellido   TEXT    NOT NULL,
  password   TEXT    NOT NULL,
  rol        TEXT    NOT NULL DEFAULT 'usuario' CHECK (rol IN ('admin', 'usuario')),
  created_at TEXT    DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre              TEXT    NOT NULL,
  descripcion         TEXT,
  departamento_id     INTEGER NOT NULL REFERENCES departamentos (id) ON DELETE CASCADE,
  cantidad_total      INTEGER NOT NULL DEFAULT 0,
  cantidad_disponible INTEGER NOT NULL DEFAULT 0,
  estado              TEXT    NOT NULL DEFAULT 'Disponible'
                      CHECK (estado IN ('Disponible', 'Agotado', 'En mantenimiento')),
  created_at          TEXT    DEFAULT CURRENT_TIMESTAMP,
  updated_at          TEXT    DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_items_departamento ON items (departamento_id);

CREATE TABLE IF NOT EXISTS solicitudes (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id      INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  item_id         INTEGER NOT NULL REFERENCES items (id) ON DELETE CASCADE,
  fecha_solicitud TEXT    DEFAULT CURRENT_TIMESTAMP,
  fecha_uso       TEXT    NOT NULL,  -- 'YYYY-MM-DD'
  hora_inicio     TEXT    NOT NULL,  -- 'HH:MM:SS'
  hora_fin        TEXT    NOT NULL,  -- 'HH:MM:SS'
  motivo          TEXT    NOT NULL,
  estado          TEXT    NOT NULL DEFAULT 'Pendiente'
                  CHECK (estado IN ('Pendiente', 'Aprobada', 'Rechazada', 'Finalizada')),
  comentarios     TEXT,
  created_at      TEXT    DEFAULT CURRENT_TIMESTAMP,
  updated_at      TEXT    DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_solicitudes_usuario ON solicitudes (usuario_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_item ON solicitudes (item_id);

-- Equivalente a "ON UPDATE CURRENT_TIMESTAMP" de MySQL
CREATE TRIGGER IF NOT EXISTS trg_departamentos_updated AFTER UPDATE ON departamentos
WHEN NEW.updated_at IS OLD.updated_at
BEGIN UPDATE departamentos SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS trg_usuarios_updated AFTER UPDATE ON usuarios
WHEN NEW.updated_at IS OLD.updated_at
BEGIN UPDATE usuarios SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS trg_items_updated AFTER UPDATE ON items
WHEN NEW.updated_at IS OLD.updated_at
BEGIN UPDATE items SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS trg_solicitudes_updated AFTER UPDATE ON solicitudes
WHEN NEW.updated_at IS OLD.updated_at
BEGIN UPDATE solicitudes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
