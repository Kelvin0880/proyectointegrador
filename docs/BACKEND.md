# El backend del Sistema de Inventario UNPHU

Este documento explica, con palabras sencillas, todo lo que pasa "detrás de la pantalla": dónde se guardan los datos, cómo se verifica quién es cada persona, qué reglas se aplican al pedir, aprobar y devolver un equipo, y cómo responde el servidor a cada acción. Está escrito para entender el proyecto a fondo y poder explicarlo en la tesis sin necesidad de ser experto en programación.

Documentos relacionados:

- [FRONTEND.md](FRONTEND.md): la parte visual.
- [PROYECTO.md](PROYECTO.md): la visión general de todo el proyecto.

---

## Índice

1. [Qué es el backend](#1-qué-es-el-backend)
2. [Herramientas que usamos y por qué](#2-herramientas-que-usamos-y-por-qué)
3. [Dónde está cada cosa](#3-dónde-está-cada-cosa)
4. [La base de datos](#4-la-base-de-datos)
5. [Cómo el código habla con la base de datos](#5-cómo-el-código-habla-con-la-base-de-datos)
6. [Autenticación: cómo se inicia sesión](#6-autenticación-cómo-se-inicia-sesión)
7. [Autorización: quién puede hacer qué](#7-autorización-quién-puede-hacer-qué)
8. [Cómo está construida cada ruta de la API](#8-cómo-está-construida-cada-ruta-de-la-api)
9. [Todas las rutas de la API, una por una](#9-todas-las-rutas-de-la-api-una-por-una)
10. [El ciclo de vida de una solicitud](#10-el-ciclo-de-vida-de-una-solicitud)
11. [El control del inventario](#11-el-control-del-inventario)
12. [Validaciones del servidor](#12-validaciones-del-servidor)
13. [Manejo de errores y códigos de respuesta](#13-manejo-de-errores-y-códigos-de-respuesta)
14. [Informes y estadísticas](#14-informes-y-estadísticas)
15. [Seguridad](#15-seguridad)
16. [Configuración y scripts](#16-configuración-y-scripts)
17. [Pruebas del backend](#17-pruebas-del-backend)
18. [Por qué cambiamos de MySQL a SQLite](#18-por-qué-cambiamos-de-mysql-a-sqlite)
19. [Cómo extender el backend](#19-cómo-extender-el-backend)
20. [Glosario](#20-glosario)

---

## 1. Qué es el backend

El backend es la parte del sistema que el usuario no ve. Siguiendo la comparación del restaurante: si el frontend es el salón con el mesero, el backend es la cocina. Recibe los pedidos, revisa que se puedan cumplir, prepara la respuesta y lleva el control de lo que hay en la despensa.

En este proyecto el backend se encarga de:

- **Guardar y leer los datos**: usuarios, departamentos, equipos y solicitudes.
- **Verificar la identidad** de quien inicia sesión.
- **Decidir quién puede hacer qué**: un estudiante no puede aprobar solicitudes y un administrador sí.
- **Aplicar las reglas del negocio**: no prestar un equipo agotado, descontar una unidad al aprobar, devolverla al finalizar, no dejar el sistema sin administradores, etc.
- **Generar los datos de los informes**: rankings y conteos por periodo.
- **Responder con mensajes claros en español** cuando algo no se puede hacer.

---

## 2. Herramientas que usamos y por qué

| Herramienta | Qué es, en palabras simples | Para qué la usamos |
|---|---|---|
| **Node.js (22.13 o superior)** | El programa que permite ejecutar JavaScript fuera del navegador, en una computadora o servidor. | Es el motor que ejecuta todo el sistema. |
| **Next.js 15, rutas de la API** | Además de páginas, Next.js permite crear "direcciones de servidor" que reciben peticiones y responden con datos. | Todas las operaciones del sistema (crear, leer, actualizar y eliminar). |
| **SQLite** (módulo `node:sqlite`) | Una base de datos completa que se guarda en un solo archivo y **ya viene incluida en Node.js**. | Guardar toda la información. No hay que instalar ningún programa adicional. |
| **NextAuth** | Una biblioteca especializada en inicio de sesión. | Verificar la contraseña, crear la sesión y protegerla. |
| **bcryptjs** | Una herramienta para "triturar" contraseñas de forma que no se puedan leer. | Guardar las contraseñas de forma segura y comprobarlas al iniciar sesión. |
| **JWT** (JSON Web Token) | Un "carné digital" firmado que el navegador guarda y presenta en cada visita. | Saber quién es el usuario sin pedirle la contraseña cada vez. |

---

## 3. Dónde está cada cosa

```
database/
  schema.sql                  Define las tablas, sus reglas, índices y disparadores
  seed.sql                    Datos iniciales (departamentos, equipos, usuarios de ejemplo)
  mysql-dump-original.sql     Copia del respaldo original de MySQL, solo como referencia
  unphu.db                    El archivo de la base de datos (se crea solo; no se sube a GitHub)

src/
  middleware.js               Guardia que protege las páginas antes de mostrarlas
  lib/
    db/index.js               Conexión con la base de datos y funciones para consultarla
    auth-options.js           Configuración del inicio de sesión (NextAuth)
    auth-secret.js            La clave secreta que firma las sesiones
    session.js                Obtiene la sesión actual desde el servidor
    validation.js             Reglas de validación (las mismas del frontend)
    constants.js              Valores fijos: roles, estados, periodos de informe
    server/
      http.js                 Herramientas comunes de las rutas: respuestas, permisos, errores
      queries.js              Consultas SQL que se reutilizan en varias rutas
  app/api/                    Todas las rutas de la API (una carpeta por recurso)

scripts/
  db-reset.mjs                Borra y vuelve a crear la base de datos con los datos iniciales
  check-node.mjs              Verifica que la versión de Node.js sea compatible
  hash-gen.js                 Genera la versión protegida (hash) de una contraseña
```

---

## 4. La base de datos

### Qué es una base de datos relacional

Es un conjunto de **tablas**, parecidas a hojas de Excel. Cada tabla guarda un tipo de cosa (usuarios, equipos...); cada **fila** es un registro y cada **columna** es un dato. Las tablas se **relacionan** entre sí mediante números de identificación (*id*). Por ejemplo, una solicitud no copia el nombre del estudiante: guarda su número de usuario, y desde ahí se busca el resto.

### Las cuatro tablas

```
 departamentos  1 ────< N  items  1 ────< N  solicitudes  N >──── 1  usuarios
```

Se lee así: un departamento tiene muchos equipos; un equipo puede aparecer en muchas solicitudes; un usuario puede hacer muchas solicitudes.

#### `departamentos`
Las áreas que prestan equipos (por ejemplo, Audiovisual y Tecnología).

| Columna | Qué guarda |
|---|---|
| id | Número único, asignado automáticamente |
| nombre | Nombre del departamento (no se puede repetir) |
| descripcion | Descripción opcional |
| created_at / updated_at | Fecha de creación y de última modificación |

#### `usuarios`
Las personas que usan el sistema.

| Columna | Qué guarda |
|---|---|
| id | Número único |
| matricula | Matrícula del estudiante; es el usuario para iniciar sesión (no se repite) |
| email | Correo institucional, `matrícula@unphu.edu.do` (no se repite) |
| nombre / apellido | Nombre y apellido |
| password | La contraseña **protegida con bcrypt**, nunca la contraseña real |
| rol | Solo puede ser `admin` o `usuario` (por defecto `usuario`) |
| created_at / updated_at | Fechas de registro y de modificación |

#### `items` (equipos)
Los equipos del inventario.

| Columna | Qué guarda |
|---|---|
| id | Número único |
| nombre / descripcion | Nombre y descripción del equipo |
| departamento_id | A qué departamento pertenece |
| cantidad_total | Cuántas unidades tiene la universidad en total |
| cantidad_disponible | Cuántas están disponibles ahora mismo (no prestadas) |
| estado | Solo puede ser `Disponible`, `Agotado` o `En mantenimiento` |
| created_at / updated_at | Fechas |

#### `solicitudes`
Cada pedido de préstamo.

| Columna | Qué guarda |
|---|---|
| id | Número único |
| usuario_id | Quién lo pidió |
| item_id | Qué equipo pidió |
| fecha_solicitud | Cuándo se hizo el pedido (automático) |
| fecha_uso | Día en que se usará el equipo |
| hora_inicio / hora_fin | Horario de uso |
| motivo | Para qué se necesita |
| estado | Solo puede ser `Pendiente`, `Aprobada`, `Rechazada` o `Finalizada` |
| comentarios | Comentario del administrador (obligatorio al rechazar) |
| created_at / updated_at | Fechas |

### Reglas que la propia base de datos hace cumplir

Aunque el código tenga sus validaciones, la base de datos tiene sus propias reglas como segunda barrera:

- **Valores únicos**: no puede haber dos usuarios con la misma matrícula o correo, ni dos departamentos con el mismo nombre.
- **Valores permitidos** (restricciones `CHECK`): el rol, el estado del equipo y el estado de la solicitud solo aceptan los valores de la lista. Si por error se intentara guardar "Aprobadísima", la base de datos lo rechaza.
- **Relaciones obligatorias** (claves foráneas): no se puede crear una solicitud de un equipo o usuario que no existe.
- **Índices**: hacen más rápidas las búsquedas de equipos por departamento y de solicitudes por usuario o por equipo. Funcionan como el índice de un libro.
- **Disparadores** (*triggers*): cada vez que se modifica un registro, la fecha `updated_at` se actualiza sola.

### Datos iniciales

Cuando la base de datos se crea por primera vez, se cargan los datos de `database/seed.sql`:

- 2 departamentos: **Audiovisual** y **Tecnología**.
- 9 equipos: cables HDMI y VGA, adaptadores, pizarra móvil, etc.
- 4 usuarios: dos administradores (`admin` y `superadmin`, ambos con la contraseña `admin123`) y dos estudiantes de ejemplo.
- 1 solicitud histórica de ejemplo.

### Dónde vive el archivo

Por defecto, en `database/unphu.db`. Junto a él pueden aparecer los archivos `unphu.db-wal` y `unphu.db-shm`, que SQLite usa de forma temporal para escribir con seguridad; son normales. Ninguno de ellos se sube a GitHub, así que cada persona que descarga el proyecto empieza con su propia base de datos limpia.

---

## 5. Cómo el código habla con la base de datos

Todo pasa por un único archivo: `src/lib/db/index.js`. Ninguna otra parte del sistema abre la base de datos por su cuenta.

### La conexión

La función `getDb()` hace lo siguiente la primera vez que se necesita:

1. Comprueba que Node.js tenga el módulo de SQLite. Si la versión es antigua, muestra un mensaje claro diciendo qué versión instalar.
2. Abre (o crea) el archivo `database/unphu.db`.
3. Activa tres opciones:
   - **WAL**: un modo de escritura más seguro y rápido.
   - **Tiempo de espera de 5 segundos**: si dos operaciones coinciden, la segunda espera en lugar de fallar.
   - **Claves foráneas**: hace cumplir las relaciones entre tablas.
4. Si las tablas no existen, ejecuta `schema.sql` y carga `seed.sql`. **Por eso no hay que crear la base de datos a mano.**
5. Guarda la conexión para reutilizarla, en lugar de abrir una nueva en cada petición.

### Las funciones de consulta

| Función | Qué hace |
|---|---|
| `query(sql, parámetros)` | Ejecuta una consulta. Si es de lectura (`SELECT`), devuelve una lista de filas. Si es de escritura, devuelve el número del registro creado (`insertId`) y cuántas filas cambiaron (`affectedRows`). |
| `queryOne(sql, parámetros)` | Igual, pero devuelve solo la primera fila, o nada si no encuentra. |
| `transaction(función)` | Ejecuta varias operaciones como **un solo bloque**: o se guardan todas, o no se guarda ninguna. |

**Los parámetros nunca se pegan directamente al texto de la consulta.** Se escriben signos `?` en la consulta y los valores se pasan aparte:

```js
query('SELECT * FROM usuarios WHERE matricula = ?', [matricula]);
```

Esto impide un ataque conocido como **inyección SQL**, en el que alguien escribe código malicioso en un formulario para manipular la base de datos.

### Fechas

SQLite guarda las fechas como texto. El archivo convierte automáticamente las fechas al formato internacional (ISO) en hora universal, para que el navegador las muestre bien en la hora local de República Dominicana. La fecha de uso de una solicitud se trata como fecha local, para que no se corra un día por la diferencia horaria.

### Transacciones: por qué son importantes

Al aprobar una solicitud pasan varias cosas: se revisa que haya unidades, se descuenta una, se actualiza el estado del equipo y se cambia el estado de la solicitud. Si el sistema fallara a la mitad, el inventario quedaría descuadrado. Con una transacción, si cualquiera de los pasos falla, **todo se deshace** como si no hubiera pasado nada. Además, la transacción "aparta" la base de datos mientras trabaja (`BEGIN IMMEDIATE`), así que si dos administradores aprueban al mismo tiempo la última unidad, solo uno lo consigue y el otro recibe un aviso.

---

## 6. Autenticación: cómo se inicia sesión

*Autenticación* es comprobar **quién eres**. Se configura en `src/lib/auth-options.js` con NextAuth.

### Registro (crear cuenta)

1. El formulario envía matrícula, nombre, apellido y contraseña a `POST /api/auth/register`.
2. El servidor valida los datos con las reglas compartidas.
3. Normaliza la matrícula (minúsculas, sin espacios y sin la parte de `@unphu.edu.do` si la escribieron) y arma el correo institucional.
4. Comprueba que la matrícula no esté registrada.
5. **Protege la contraseña con bcrypt** (10 rondas) y guarda el usuario con el rol `usuario`.

### Inicio de sesión

1. La persona escribe su matrícula y su contraseña.
2. NextAuth busca al usuario por matrícula, sin importar mayúsculas o minúsculas.
3. **bcrypt compara** la contraseña escrita con la versión protegida. La contraseña real nunca se guarda ni se puede recuperar.
4. Si coincide, se crea un **JWT**: un carné digital firmado con una clave secreta, con el número de usuario, nombre, matrícula, correo y rol. Se guarda en una *cookie* segura del navegador y dura 30 días.
5. Si no coincide, se muestra un error genérico ("Matrícula o contraseña incorrecta"), sin decir cuál de los dos datos falló, para no dar pistas.

### La sesión se mantiene actualizada

Cada vez que se consulta la sesión, el servidor vuelve a leer de la base de datos el nombre y el rol del usuario. Así:

- si un administrador le da permisos a alguien, ese cambio se aplica **sin que tenga que cerrar sesión**;
- si el usuario cambia su nombre en el perfil, se ve al instante;
- si un usuario fuera eliminado, su sesión deja de ser válida.

### Cerrar sesión

Borra la cookie con el carné y lleva a la pantalla de inicio de sesión.

---

## 7. Autorización: quién puede hacer qué

*Autorización* es decidir **qué puedes hacer** una vez que se sabe quién eres. Hay dos niveles de protección.

### Nivel 1: el guardia de las páginas (`src/middleware.js`)

Revisa cada visita a `/dashboard/...` y `/auth/...` **antes** de mostrar la página:

| Situación | Qué hace |
|---|---|
| Visita `/dashboard/...` sin sesión | Envía al inicio de sesión y recuerda la página pedida para volver después |
| Un estudiante visita `/dashboard/admin/...` | Lo devuelve a `/dashboard` |
| Alguien con sesión visita `/auth/login` o `/auth/register` | Lo lleva al panel |

### Nivel 2: cada ruta de la API

Aunque alguien se saltara el frontend y enviara peticiones directamente, **cada ruta de la API comprueba los permisos por su cuenta**:

- `requireUser()`: exige haber iniciado sesión. Si no, responde **401**.
- `requireAdmin()`: exige ser administrador. Si no, responde **403**.
- Reglas de propiedad: un estudiante solo puede ver y cancelar **sus propias** solicitudes.

### Tabla de permisos

| Acción | Estudiante | Administrador |
|---|:-:|:-:|
| Ver equipos y departamentos | Sí | Sí |
| Crear una solicitud | Sí | Sí |
| Ver sus propias solicitudes | Sí | Sí |
| Cancelar su solicitud pendiente | Sí | Sí |
| Ver las solicitudes de otros | No | Sí |
| Aprobar, rechazar o finalizar | No | Sí |
| Eliminar cualquier solicitud | No | Sí |
| Crear, editar o eliminar equipos | No | Sí |
| Crear, editar o eliminar departamentos | No | Sí |
| Ver usuarios y cambiar roles | No | Sí |
| Ver el resumen y los informes | No | Sí |
| Editar su perfil y su contraseña | Sí | Sí |

---

## 8. Cómo está construida cada ruta de la API

### Qué es una ruta de la API

Es una dirección del servidor que responde a una acción. Las acciones se indican con un **método HTTP**:

| Método | Significado | Ejemplo |
|---|---|---|
| GET | Leer | `GET /api/items` lista los equipos |
| POST | Crear | `POST /api/solicitudes` crea una solicitud |
| PATCH | Modificar | `PATCH /api/items/5` edita el equipo 5 |
| DELETE | Eliminar | `DELETE /api/departamentos/3` elimina el departamento 3 |

En Next.js, cada ruta es un archivo `route.js` dentro de `src/app/api/`. La carpeta indica la dirección; por ejemplo, `src/app/api/items/[id]/route.js` atiende `/api/items/1`, `/api/items/2`, etc.

### El mismo patrón en todas las rutas

Todas las rutas siguen la misma estructura, gracias a las herramientas de `src/lib/server/http.js`:

```js
export const PATCH = handler(async (req, { params }) => {
  await requireAdmin();                 // 1. ¿Tiene permiso?
  const id = parseId((await params).id); // 2. ¿El número es válido?
  const body = await readJson(req);      // 3. Leer los datos enviados
  const errors = validateItem(body);     // 4. ¿Los datos son correctos?
  if (hasErrors(errors)) throw badRequest(firstError(errors), errors);
  await query('UPDATE ...', [...]);      // 5. Guardar
  return ok({ message: 'Equipo actualizado correctamente' }); // 6. Responder
});
```

- **`handler`** envuelve la ruta y atrapa cualquier error. Si es un error previsto (permiso, validación, no encontrado), responde con su código y su mensaje en español. Si es inesperado, lo registra en la consola del servidor y responde con un mensaje genérico, sin mostrar detalles internos.
- **`parseId`** revisa que el número de la dirección sea un entero positivo.
- **`readJson`** lee los datos y avisa si no tienen el formato correcto.
- **`badRequest`, `notFound`, `forbidden`, `unauthorized`** crean los errores con su código.

Las consultas que se usan en varias rutas (como la que une una solicitud con su equipo, departamento y usuario) están en `src/lib/server/queries.js`, para escribirlas una sola vez.

---

## 9. Todas las rutas de la API, una por una

### Autenticación

| Método y dirección | Quién | Qué hace |
|---|---|---|
| `POST /api/auth/register` | Cualquiera | Crea una cuenta nueva con rol de usuario. Responde 201 si sale bien, o 400 si los datos son inválidos o la matrícula ya existe. |
| `/api/auth/...` (NextAuth) | Cualquiera | Inicio y cierre de sesión, y consulta de la sesión. Lo maneja NextAuth automáticamente. |

### Departamentos

| Método y dirección | Quién | Qué hace |
|---|---|---|
| `GET /api/departamentos` | Con sesión | Lista los departamentos con su cantidad de equipos, unidades totales y unidades disponibles. |
| `POST /api/departamentos` | Admin | Crea un departamento. No permite nombres repetidos (sin importar mayúsculas). |
| `GET /api/departamentos/[id]` | Con sesión | Devuelve un departamento. |
| `PATCH /api/departamentos/[id]` | Admin | Cambia el nombre o la descripción. |
| `DELETE /api/departamentos/[id]` | Admin | Elimina un departamento, **solo si no tiene equipos**. |
| `GET /api/departamentos/[id]/items` | Con sesión | Lista los equipos de ese departamento. |

### Equipos (inventario)

| Método y dirección | Quién | Qué hace |
|---|---|---|
| `GET /api/items` | Con sesión | Lista los equipos. Filtros opcionales: `departamento_id`, `estado`, `q` (busca en nombre y descripción) y `disponibles=1` (solo los que se pueden pedir). |
| `POST /api/items` | Admin | Crea un equipo. Si no se indica cuántos hay disponibles, se toma el total. El estado se calcula solo: Disponible si hay unidades, Agotado si no, o En mantenimiento si se eligió así. |
| `GET /api/items/[id]` | Con sesión | Devuelve un equipo e indica cuántas unidades están prestadas ahora mismo. |
| `PATCH /api/items/[id]` | Admin | Edita un equipo. No permite que el total sea menor que las unidades prestadas. Recalcula el estado. |
| `DELETE /api/items/[id]` | Admin | Si tiene solicitudes pendientes o aprobadas, **no se puede eliminar**. Si tiene historial, se hace una **baja lógica**: se marca como Agotado con 0 disponibles para conservar los registros. Si nunca se usó, se borra. |

### Solicitudes

| Método y dirección | Quién | Qué hace |
|---|---|---|
| `GET /api/solicitudes` | Con sesión | Las solicitudes **del usuario conectado**, de la más reciente a la más antigua. Filtro opcional: `estado`. |
| `POST /api/solicitudes` | Con sesión | Crea una solicitud. Valida los datos, comprueba que el equipo exista, que no esté en mantenimiento y que tenga unidades disponibles. Queda como Pendiente. |
| `GET /api/solicitudes/[id]` | Dueño o admin | Detalle completo de una solicitud. |
| `PATCH /api/solicitudes/[id]` | Admin | Cambia el estado (aprobar, rechazar o finalizar) y ajusta el inventario dentro de una transacción. Se explica en detalle en la sección 10. |
| `DELETE /api/solicitudes/[id]` | Dueño o admin | El dueño puede **cancelar** su solicitud solo si está pendiente. El administrador puede eliminar cualquiera; si estaba aprobada, la unidad vuelve al inventario. |
| `GET /api/solicitudes/admin` | Admin | Todas las solicitudes del sistema. Filtros: `estado` y `q` (busca por equipo, nombre, apellido, matrícula o motivo). Las pendientes aparecen primero, luego las aprobadas y después el resto. |
| `GET /api/solicitudes/stats` | Con sesión | Cuántas solicitudes tiene el usuario en cada estado y el total. |

### Usuarios y perfil

| Método y dirección | Quién | Qué hace |
|---|---|---|
| `GET /api/usuarios` | Admin | Lista los usuarios con su cantidad de solicitudes y préstamos activos. Filtros: `q` y `rol`. **Nunca devuelve contraseñas.** |
| `PATCH /api/usuarios/[id]` | Admin | Cambia el rol. Un administrador no puede quitarse el permiso a sí mismo, y siempre debe quedar al menos un administrador. |
| `GET /api/perfil` | Con sesión | Los datos de la cuenta conectada. |
| `PATCH /api/perfil` | Con sesión | Cambia el nombre y el apellido. |
| `PATCH /api/perfil/password` | Con sesión | Cambia la contraseña. Exige la contraseña actual correcta, y la nueva debe ser válida y distinta. |

### Administración e informes

| Método y dirección | Quién | Qué hace |
|---|---|---|
| `GET /api/admin/resumen` | Admin | Todo lo que muestra el inicio del administrador: conteo de solicitudes por estado, resumen del inventario (equipos, unidades, agotados, en mantenimiento), usuarios y administradores, resumen por departamento, las 5 solicitudes pendientes más antiguas y los 5 equipos con menos existencias. |
| `GET /api/informes` | Admin | Datos del informe. Parámetros: `periodo` (`24h`, `5d`, `15d`, `1m`, `6m`, `1y`) y `tipo` (`equipos`, `usuarios`, `completo`). Se explica en la sección 14. |

---

## 10. El ciclo de vida de una solicitud

Una solicitud pasa por estados, como un trámite. Solo se permiten estos cambios:

```
                 ┌──────────── Rechazada (fin)
                 │
  Pendiente ─────┤
                 │
                 └──> Aprobada ───> Finalizada (fin)
                         │
                         └────────> Rechazada (fin)
```

| Estado actual | Puede pasar a | Qué significa |
|---|---|---|
| Pendiente | Aprobada o Rechazada | El administrador revisa el pedido |
| Aprobada | Finalizada o Rechazada | El equipo está prestado; se finaliza al devolverlo (o se anula) |
| Rechazada | (ninguno) | Estado final |
| Finalizada | (ninguno) | Estado final: el equipo fue devuelto |

Si se intenta un cambio no permitido (por ejemplo, de Finalizada a Aprobada), el servidor responde con un error claro: "No se puede cambiar una solicitud finalizada a aprobada".

### Qué pasa en cada cambio (`PATCH /api/solicitudes/[id]`)

Todo ocurre dentro de **una sola transacción**:

1. Se lee la solicitud y se verifica que el cambio esté permitido.
2. **Si se aprueba**:
   - se comprueba que el equipo tenga al menos una unidad disponible y que no esté en mantenimiento; si no, responde **409 (conflicto)** con el motivo;
   - se **descuenta una unidad** del inventario.
3. **Si la solicitud estaba aprobada** y pasa a Finalizada o Rechazada, se **devuelve una unidad** (sin pasar nunca del total).
4. Se **recalcula el estado del equipo**: Agotado si se quedó sin unidades, Disponible si tiene alguna. Si estaba En mantenimiento, se respeta.
5. Se guarda el nuevo estado y el comentario del administrador.

Si cualquier paso falla, no se guarda nada.

### Cancelar o eliminar (`DELETE /api/solicitudes/[id]`)

- El **estudiante** puede cancelar solo si su solicitud sigue **Pendiente** (todavía no se descontó nada).
- El **administrador** puede eliminar cualquier solicitud. Si estaba **Aprobada**, la unidad vuelve al inventario dentro de una transacción.

---

## 11. El control del inventario

Cada equipo tiene dos números: **total** (cuántas unidades tiene la universidad) y **disponible** (cuántas no están prestadas). Las reglas que mantienen el inventario correcto son:

- **Solo se descuenta al aprobar**, no al pedir. Así las solicitudes pendientes no "bloquean" equipos que tal vez no se aprueben.
- **Se devuelve al finalizar o al anular una aprobación**, y nunca se supera el total.
- **Nunca queda en negativo**: no se puede aprobar si no hay unidades.
- **No se descuenta dos veces**: la regla de estados impide aprobar algo que ya está aprobado.
- **El estado se calcula solo** a partir de las unidades disponibles, excepto "En mantenimiento", que lo decide el administrador. Un equipo en mantenimiento no se puede pedir ni aprobar.
- **Al editar** un equipo, el total no puede ser menor que las unidades prestadas en ese momento.
- **No se pierde historial**: un equipo con solicitudes anteriores no se borra, se da de baja (Agotado, 0 disponibles).
- **Existencias bajas**: el resumen del administrador avisa de los equipos con un 20 % o menos de unidades disponibles (o con una unidad o ninguna).

---

## 12. Validaciones del servidor

El servidor **nunca confía** en lo que envía el navegador, aunque el formulario ya haya validado. Usa las mismas reglas del archivo `src/lib/validation.js` (detalladas en [FRONTEND.md](FRONTEND.md#11-validación-de-formularios)) y además comprueba cosas que solo él puede saber:

- que la matrícula, el nombre del departamento o el correo no estén repetidos;
- que el equipo y el departamento existan;
- que el equipo tenga unidades y no esté en mantenimiento;
- que la contraseña actual sea correcta;
- que el cambio de estado esté permitido;
- que los números de la dirección sean válidos;
- que el comentario no supere los 500 caracteres.

Cuando hay errores de validación, la respuesta incluye un mensaje general y el detalle por campo. Por ejemplo:

```json
{
  "error": "La hora de fin debe ser posterior a la de inicio",
  "details": { "hora_fin": "La hora de fin debe ser posterior a la de inicio" }
}
```

El frontend usa ese detalle para marcar en rojo exactamente el campo con el problema.

---

## 13. Manejo de errores y códigos de respuesta

Cada respuesta lleva un **código** que indica cómo salió la operación:

| Código | Nombre | Cuándo se usa en este sistema |
|---|---|---|
| **200** | OK | La operación salió bien |
| **201** | Creado | Se creó un usuario, equipo, departamento o solicitud |
| **400** | Petición incorrecta | Datos inválidos, cambio de estado no permitido o regla del negocio incumplida |
| **401** | No autenticado | No ha iniciado sesión |
| **403** | Prohibido | Inició sesión pero no tiene permiso (por ejemplo, un estudiante intentando aprobar) |
| **404** | No encontrado | El equipo, la solicitud o el departamento no existe |
| **409** | Conflicto | Se intenta aprobar y ya no quedan unidades, o el equipo está en mantenimiento |
| **500** | Error interno | Algo inesperado; se registra en la consola del servidor y al usuario solo se le muestra un mensaje genérico |

Todos los mensajes están en español y pensados para el usuario final, por ejemplo "Este equipo no tiene unidades disponibles".

---

## 14. Informes y estadísticas

### `GET /api/informes`

1. Calcula la **fecha de inicio** según el periodo: 24 horas, 5 días, 15 días, 1 mes, 6 meses o 1 año hacia atrás desde ahora.
2. Según el tipo, consulta:
   - **Equipos más solicitados**: los 10 equipos con más solicitudes en el periodo, con su departamento.
   - **Usuarios más activos**: los 10 usuarios con más solicitudes, con su matrícula.
   - **Completo**: las dos cosas.
3. Siempre agrega un **resumen por estado** (cuántas pendientes, aprobadas, rechazadas y finalizadas hubo) y el total.
4. Devuelve los **datos del informe** (periodo, su nombre en español, el tipo y las fechas de inicio y fin), que el PDF usa en su encabezado.
5. Si no hubo actividad, agrega un mensaje explicándolo.

Si se envía un periodo o tipo desconocido, se usan los valores por defecto (24 horas, completo) en lugar de fallar.

### `GET /api/solicitudes/stats` y `GET /api/admin/resumen`

Alimentan los indicadores de los paneles del estudiante y del administrador. Usan consultas de agrupación (`GROUP BY`) y sumas (`SUM`) para que la base de datos haga los cálculos de una sola vez, en lugar de traer todos los registros y contarlos uno a uno.

---

## 15. Seguridad

| Riesgo | Cómo se protege el sistema |
|---|---|
| Robo de contraseñas | Se guardan protegidas con **bcrypt**; ni siquiera el administrador puede verlas. La API nunca devuelve el campo de contraseña. |
| Suplantar a otro usuario | La sesión es un **JWT firmado** con una clave secreta; si alguien lo modifica, la firma deja de coincidir y se rechaza. |
| Entrar a páginas sin permiso | El **middleware** bloquea antes de mostrar la página. |
| Usar la API saltándose la interfaz | **Cada ruta verifica la sesión y el rol** por su cuenta. |
| Ver solicitudes ajenas | Comprobación de que la solicitud pertenezca al usuario. |
| Inyección SQL | Todas las consultas usan **parámetros `?`**; los textos de búsqueda además se "escapan" para que los símbolos `%` y `_` no tengan efecto especial. |
| Quedarse sin administradores | El sistema impide quitar el último administrador y quitarse el permiso a uno mismo. |
| Dar pistas a un atacante | El error de inicio de sesión no dice si falló la matrícula o la contraseña. Los errores internos no muestran detalles técnicos. |
| Datos corruptos | Transacciones, restricciones `CHECK`, claves foráneas y valores únicos en la base de datos. |
| Cambios de permisos sin efecto | El rol se vuelve a leer de la base de datos en cada consulta de sesión. |

Se eliminaron dos problemas de seguridad del código original: una ruta de depuración que exponía información, y un "acceso directo" que permitía entrar como superadministrador sin verificar la contraseña.

**Recomendación para producción:** cambiar la clave `NEXTAUTH_SECRET` por un texto largo y aleatorio en el archivo `.env`.

---

## 16. Configuración y scripts

### Variables de entorno (archivo `.env`, opcional)

El proyecto funciona **sin** archivo `.env` porque todo tiene valores por defecto. Si se quiere cambiar algo, se copia `.env.example` como `.env`:

| Variable | Para qué sirve | Valor por defecto |
|---|---|---|
| `NEXTAUTH_SECRET` | Clave para firmar las sesiones | `unphuInventarioSecretKey` |
| `NEXTAUTH_URL` | Dirección de la aplicación | `http://localhost:3000` |
| `DATABASE_FILE` | Dónde guardar la base de datos | `database/unphu.db` |

### Scripts (comandos)

| Comando | Qué hace |
|---|---|
| `npm run dev` | Comprueba la versión de Node.js e inicia el servidor de desarrollo |
| `npm run build` y `npm start` | Compila y ejecuta la versión optimizada (producción) |
| `npm run db:reset` | Borra la base de datos y la vuelve a crear con los datos iniciales |
| `node scripts/hash-gen.js <contraseña>` | Muestra la versión protegida de una contraseña, por si se necesita cargar un usuario a mano |
| `npm test` | Pruebas unitarias, de componentes y de la API |
| `npm run test:e2e` | Pruebas en un navegador real |

---

## 17. Pruebas del backend

Las pruebas de la API están en `tests/api/api.test.js`, con herramientas de ayuda en `tests/api/helpers.js`. Funcionan así:

- Usan una **base de datos temporal**, distinta de la real, que se crea desde cero en cada ejecución. Así las pruebas nunca tocan los datos de verdad.
- **Simulan la sesión** de distintos usuarios (administrador, estudiante, sin sesión) para comprobar los permisos.
- Llaman a las rutas directamente, sin levantar el servidor, así que son muy rápidas (alrededor de un segundo).

Qué se comprueba, entre otras cosas:

- que la base de datos se crea con los datos iniciales, que las transacciones se deshacen ante un error y que las fechas salen en el formato correcto;
- el registro, incluidos los datos inválidos y las matrículas repetidas;
- que un estudiante reciba 403 en todas las rutas de administrador y que sin sesión se reciba 401;
- crear, editar, filtrar y eliminar equipos, incluida la baja lógica;
- crear solicitudes y que cada usuario solo vea las suyas;
- aprobar descuenta una unidad, finalizar la devuelve, y no se puede aprobar sin existencias (409);
- los cambios de estado no permitidos se rechazan;
- cancelar solo se puede si está pendiente, y eliminar una aprobada devuelve la unidad;
- los departamentos no se repiten y no se borran si tienen equipos;
- las protecciones de roles (no quitarse el permiso a uno mismo, siempre al menos un administrador);
- editar el perfil y cambiar la contraseña verificando la actual;
- los informes por periodo y tipo, y el resumen del administrador.

En total hay **93 pruebas** entre unidad, componentes y API, más **36 pruebas de punta a punta** que también ejercitan el backend a través del navegador. Todas pasan.

---

## 18. Por qué cambiamos de MySQL a SQLite

El proyecto original usaba **MySQL**, una base de datos que funciona como un programa aparte. Para correr el proyecto había que instalar MySQL, crear un usuario, crear la base de datos e importar el respaldo, y cada compañero tenía que repetir todo eso en su computadora.

Se cambió a **SQLite** porque:

- **Ya viene incluida en Node.js** (desde la versión 22.13): no hay que instalar nada más.
- **Es un solo archivo**: la base de datos se crea sola la primera vez que se arranca el sistema.
- **Se reinicia con un comando**: `npm run db:reset`.
- **Es muy confiable**: es la base de datos más usada del mundo (está en todos los celulares y navegadores) y soporta transacciones y relaciones igual que MySQL.
- **Es suficiente para el caso**: el volumen de un sistema de préstamos de una universidad está muy por debajo de sus límites.

La migración conservó la misma estructura de tablas y los mismos datos del respaldo original (`database/mysql-dump-original.sql`). Las funciones de consulta devuelven los resultados en el mismo formato que la biblioteca de MySQL, así que el resto del código no tuvo que cambiar de lógica. Si en el futuro se quisiera volver a un servidor como MySQL o PostgreSQL, solo habría que modificar `src/lib/db/index.js`.

---

## 19. Cómo extender el backend

- **Una ruta nueva**: crear `src/app/api/<nombre>/route.js`, envolver cada método con `handler(...)`, verificar permisos con `requireUser()` o `requireAdmin()`, validar con funciones de `lib/validation.js` y responder con `ok(...)`.
- **Una columna o tabla nueva**: añadirla en `database/schema.sql` (y sus datos en `seed.sql` si hace falta), y luego ejecutar `npm run db:reset`.
- **Un estado nuevo de solicitud**: añadirlo en la restricción `CHECK` del esquema, en `SOLICITUD_ESTADOS` (`lib/constants.js`) y en las transiciones permitidas (`lib/server/queries.js`).
- **Siempre**: agregar una prueba en `tests/api/api.test.js` y ejecutar `npm test`.

---

## 20. Glosario

| Término | Significado |
|---|---|
| **Servidor** | El programa que recibe las peticiones y responde. |
| **API** | El conjunto de direcciones que el servidor ofrece para leer y modificar datos. |
| **Endpoint / ruta** | Una dirección concreta de la API, como `/api/items`. |
| **Método HTTP** | El tipo de acción: GET (leer), POST (crear), PATCH (modificar), DELETE (eliminar). |
| **JSON** | El formato de texto con el que viajan los datos. |
| **Base de datos relacional** | Datos organizados en tablas que se relacionan entre sí. |
| **SQL** | El lenguaje para consultar y modificar la base de datos. |
| **Clave foránea** | Una columna que apunta a un registro de otra tabla (por ejemplo, `usuario_id`). |
| **Índice** | Una estructura que acelera las búsquedas, como el índice de un libro. |
| **Trigger (disparador)** | Una acción automática de la base de datos ante un cambio. |
| **Transacción** | Un grupo de operaciones que se guardan todas juntas o no se guarda ninguna. |
| **Hash / bcrypt** | Transformar una contraseña en un texto que no se puede revertir. |
| **JWT** | Un "carné digital" firmado que identifica al usuario en cada visita. |
| **Cookie** | Un pequeño dato que el navegador guarda y envía al servidor en cada visita. |
| **Middleware** | Un guardia que revisa cada visita antes de mostrar la página. |
| **Autenticación** | Comprobar quién eres. |
| **Autorización** | Decidir qué puedes hacer. |
| **Baja lógica** | Marcar un registro como inactivo en lugar de borrarlo, para conservar su historial. |
| **Inyección SQL** | Un ataque que intenta colar código en las consultas a la base de datos. |
