# Sistema de Inventario UNPHU

Aplicación web (Next.js) para gestionar el préstamo de equipos de los departamentos de la UNPHU: los estudiantes solicitan equipos y los administradores aprueban, rechazan y finalizan las solicitudes, gestionan el inventario y generan informes en PDF.

## Requisitos

- **Node.js 22.13 o superior** (recomendado: la versión LTS de <https://nodejs.org>).
  Compruébalo con `node -v`.

No hace falta instalar MySQL ni ninguna otra base de datos: el proyecto usa **SQLite**, que viene integrado en Node.js. Los datos se guardan en el archivo `database/unphu.db`, que se crea solo la primera vez que arrancas la aplicación.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>.

## Cuentas de prueba

| Rol | Usuario (matrícula) | Contraseña |
|---|---|---|
| Administrador | `admin` | `admin123` |
| Administrador | `superadmin` | `admin123` |

En la pantalla de inicio de sesión escribe solo la matrícula (por ejemplo `admin`). Para probar como estudiante, crea una cuenta nueva desde **Registrarse**.

## Comandos útiles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo en <http://localhost:3000> |
| `npm run db:reset` | Borra la base de datos y la vuelve a crear con los datos iniciales (detén antes `npm run dev`) |
| `npm run build` y luego `npm start` | Compila y ejecuta la versión de producción |
| `node scripts/hash-gen.js <contraseña>` | Genera el hash bcrypt de una contraseña |

## Configuración (opcional)

El proyecto funciona sin archivo `.env`. Si quieres cambiar algún valor, copia `.env.example` como `.env` y edítalo:

- `NEXTAUTH_SECRET`: secreto para firmar las sesiones.
- `NEXTAUTH_URL`: URL de la aplicación (por defecto `http://localhost:3000`).
- `DATABASE_FILE`: ruta del archivo SQLite (por defecto `database/unphu.db`).

## Estructura

```
database/
  schema.sql                 Tablas, índices y triggers (SQLite)
  seed.sql                   Datos iniciales (departamentos, equipos, usuarios, solicitudes)
  mysql-dump-original.sql    Dump original de MySQL, solo como referencia
scripts/                     db-reset, verificación de versión de Node y generador de hashes
src/lib/db/index.js          Conexión a SQLite y función query()
src/app/api/                 Rutas de la API (auth, departamentos, items, solicitudes, informes)
src/app/dashboard/           Pantallas de estudiante y de administrador
```

## Problemas comunes

- **"Este proyecto necesita Node.js 22.13 o superior"**: actualiza Node.js desde <https://nodejs.org>.
- **Aviso `ExperimentalWarning: SQLite is an experimental feature`** en la consola: es normal y no afecta al funcionamiento.
- **Quiero empezar con los datos limpios**: detén el servidor y ejecuta `npm run db:reset`.
- **El puerto 3000 está ocupado**: usa `npm run dev -- -p 3001`.
