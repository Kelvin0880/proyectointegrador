# Sistema de Inventario y Préstamo de Equipos UNPHU: visión general del proyecto

Este documento explica el proyecto completo de principio a fin: qué problema resuelve, quién lo usa, cómo funciona cada flujo, qué tecnologías usa y por qué, cómo está organizado, cómo se probó y cómo se ejecuta. Está escrito en un lenguaje sencillo para que cualquier persona pueda entenderlo y explicarlo en la tesis.

Para entrar en detalle en cada parte:

- [FRONTEND.md](FRONTEND.md): todo sobre la parte visual (pantallas, diseño, componentes).
- [BACKEND.md](BACKEND.md): todo sobre el servidor, la base de datos y las reglas del negocio.
- [README.md](../README.md): el tutorial paso a paso para instalarlo y correrlo en cualquier computadora.

---

## Índice

1. [Resumen en un párrafo](#1-resumen-en-un-párrafo)
2. [El problema que resuelve](#2-el-problema-que-resuelve)
3. [Objetivos del sistema](#3-objetivos-del-sistema)
4. [Quién usa el sistema](#4-quién-usa-el-sistema)
5. [Qué puede hacer el sistema (funcionalidades)](#5-qué-puede-hacer-el-sistema-funcionalidades)
6. [Cómo funciona por dentro: la arquitectura](#6-cómo-funciona-por-dentro-la-arquitectura)
7. [Las tecnologías, explicadas una por una](#7-las-tecnologías-explicadas-una-por-una)
8. [Los flujos completos, paso a paso](#8-los-flujos-completos-paso-a-paso)
9. [Los datos: qué se guarda y cómo se relaciona](#9-los-datos-qué-se-guarda-y-cómo-se-relaciona)
10. [Reglas del negocio](#10-reglas-del-negocio)
11. [Seguridad](#11-seguridad)
12. [Calidad: cómo se probó el sistema](#12-calidad-cómo-se-probó-el-sistema)
13. [Organización de las carpetas](#13-organización-de-las-carpetas)
14. [Cómo se ejecuta](#14-cómo-se-ejecuta)
15. [Principios de diseño que se siguieron](#15-principios-de-diseño-que-se-siguieron)
16. [Evolución del proyecto: qué se mejoró](#16-evolución-del-proyecto-qué-se-mejoró)
17. [Limitaciones y trabajo futuro](#17-limitaciones-y-trabajo-futuro)
18. [Preguntas frecuentes para la defensa](#18-preguntas-frecuentes-para-la-defensa)
19. [Glosario general](#19-glosario-general)

---

## 1. Resumen en un párrafo

El **Sistema de Inventario UNPHU** es una aplicación web que digitaliza el préstamo de equipos (proyectores, cables, adaptadores, pizarras, etc.) de los departamentos de la Universidad Nacional Pedro Henríquez Ureña. Los estudiantes crean una cuenta con su matrícula, eligen el equipo que necesitan, indican la fecha, el horario y el motivo, y siguen en tiempo real el estado de su solicitud. Los administradores revisan las solicitudes, las aprueban o rechazan, registran las devoluciones, mantienen el inventario, los departamentos y los usuarios, y generan informes en PDF. El sistema lleva el control automático de las existencias para que nunca se preste un equipo que no está disponible. Está construido con **Next.js y React**, guarda los datos en **SQLite** (incluido en Node.js, sin instalaciones adicionales), y fue verificado con **129 pruebas automáticas**.

---

## 2. El problema que resuelve

Sin un sistema, el préstamo de equipos suele hacerse en papel, por mensajes o en persona. Eso trae varios problemas:

- **No se sabe con certeza qué hay disponible**: hay que preguntar o ir al departamento.
- **Se pierde información**: no queda registro claro de quién pidió qué, cuándo y para qué.
- **Hay errores de inventario**: se presta un equipo que ya estaba prestado, o no se registra la devolución.
- **No hay seguimiento**: el estudiante no sabe si su pedido fue aceptado.
- **No hay datos para decidir**: es difícil saber qué equipos se piden más o si hace falta comprar más unidades.

El sistema resuelve todo esto centralizando la información en un solo lugar, accesible desde cualquier computadora o celular.

---

## 3. Objetivos del sistema

**Objetivo general:** digitalizar y controlar el proceso de préstamo de equipos de los departamentos de la UNPHU.

**Objetivos específicos:**

1. Permitir que los estudiantes soliciten equipos en línea, indicando la fecha, el horario y el motivo.
2. Permitir que los administradores aprueben, rechacen y finalicen solicitudes, dejando registro de cada decisión.
3. Mantener el inventario actualizado automáticamente con cada préstamo y devolución.
4. Organizar los equipos por departamento.
5. Controlar el acceso según el rol de cada usuario.
6. Generar informes de uso por periodo, descargables en PDF.
7. Ofrecer una interfaz moderna, clara, accesible y usable desde cualquier dispositivo.
8. Ser fácil de instalar y ejecutar en cualquier computadora.

---

## 4. Quién usa el sistema

### Estudiante (rol "usuario")

Cualquier estudiante que crea su cuenta. Puede:

- ver los equipos disponibles por departamento;
- crear solicitudes de préstamo;
- ver el estado y el detalle de sus solicitudes;
- cancelar una solicitud mientras está pendiente;
- editar su nombre y cambiar su contraseña.

### Administrador (rol "admin")

El personal encargado de los equipos. Puede hacer todo lo del estudiante y además:

- ver y gestionar todas las solicitudes (aprobar, rechazar, registrar la devolución, eliminar);
- gestionar el inventario (crear, editar, eliminar equipos y ponerlos en mantenimiento);
- gestionar los departamentos;
- ver los usuarios y darles o quitarles permisos de administrador;
- ver los indicadores generales y generar informes en PDF.

Las cuentas de administrador que vienen de fábrica son `admin` y `superadmin`, ambas con la contraseña `admin123`. Una cuenta nueva siempre se crea como estudiante, y un administrador puede convertirla en administrador desde la sección Usuarios.

---

## 5. Qué puede hacer el sistema (funcionalidades)

| Módulo | Funcionalidades |
|---|---|
| **Acceso** | Registro con matrícula; correo institucional generado automáticamente; inicio de sesión; cerrar sesión; volver a la página solicitada después de iniciar sesión; protección de páginas según el rol. |
| **Panel del estudiante** | Indicadores de sus solicitudes; solicitudes recientes; accesos rápidos. |
| **Nueva solicitud** | Catálogo de equipos con filtro por departamento y buscador; solo se pueden elegir equipos disponibles; fecha, horario y motivo validados; resumen en vivo. |
| **Mis solicitudes** | Listado con filtro por estado y contador por estado; detalle con línea de tiempo; cancelar las pendientes. |
| **Panel del administrador** | Indicadores generales; cola de pendientes con aprobación rápida; alerta de existencias bajas; resumen por departamento; contador de pendientes en el menú. |
| **Gestión de solicitudes** | Todas las solicitudes con filtros y búsqueda; aprobar; rechazar con motivo obligatorio; registrar la devolución; eliminar. |
| **Inventario** | Listado con barra de existencias; filtros por departamento y estado; buscador; crear, editar y eliminar (con baja lógica si tiene historial); estado de mantenimiento. |
| **Departamentos** | Tarjetas con equipos y disponibilidad; crear, editar y eliminar (solo si no tiene equipos). |
| **Usuarios** | Listado con actividad; búsqueda y filtro por rol; dar o quitar permisos de administrador con protecciones. |
| **Perfil** | Ver los datos y la actividad de la cuenta; cambiar el nombre; cambiar la contraseña. |
| **Informes** | Seis periodos; tres tipos de informe; resumen por estado; gráfico de barras; vista de tabla; descarga en PDF con el logo. |

---

## 6. Cómo funciona por dentro: la arquitectura

### La idea general: cliente y servidor

El sistema sigue el modelo **cliente-servidor**:

- El **cliente** es el navegador (Chrome, Edge, Firefox, el celular). Muestra las pantallas y envía lo que el usuario hace.
- El **servidor** es el programa que corre en la computadora donde se instaló el proyecto. Recibe las peticiones, aplica las reglas, consulta la base de datos y responde.

Una analogía: en un banco, el cliente llena un formulario en la ventanilla (frontend), el cajero lo revisa y consulta el sistema interno (backend), y el sistema interno guarda los saldos (base de datos). El cliente nunca toca la bóveda directamente.

### Las capas del sistema

```
┌──────────────────────────────────────────────────────────────────────┐
│  NAVEGADOR (cliente)                                                  │
│  Pantallas hechas con React + Tailwind                                │
│  Portada · Inicio de sesión · Panel · Solicitudes · Inventario · ...  │
└───────────────┬──────────────────────────────────────────────▲───────┘
                │ peticiones HTTP con datos en JSON             │ respuestas JSON
                ▼                                               │
┌──────────────────────────────────────────────────────────────────────┐
│  SERVIDOR NEXT.JS (en Node.js)                                        │
│                                                                       │
│  1. Middleware ─ guardia: ¿tiene sesión? ¿tiene el rol necesario?     │
│  2. NextAuth   ─ inicio de sesión, contraseñas (bcrypt), carné JWT    │
│  3. Rutas API  ─ /api/items, /api/solicitudes, /api/informes, ...     │
│                  validan los datos y aplican las reglas del negocio   │
│  4. Capa de datos (lib/db) ─ consultas seguras y transacciones        │
└───────────────┬──────────────────────────────────────────────▲───────┘
                │ consultas SQL                                 │ filas
                ▼                                               │
┌──────────────────────────────────────────────────────────────────────┐
│  BASE DE DATOS SQLite ─ archivo database/unphu.db                     │
│  departamentos · usuarios · items · solicitudes                       │
└──────────────────────────────────────────────────────────────────────┘
```

### Por qué todo está en un solo proyecto

Next.js permite tener las pantallas y la API en el mismo proyecto. Las ventajas son:

- **Una sola instalación** y **un solo comando** para arrancar todo.
- **Código compartido**: las reglas de validación, las constantes (estados, roles) y el formato de fechas se escriben una vez y los usan el frontend y el backend.
- **Sin problemas de comunicación** entre servidores distintos.

### Un recorrido completo, de un clic a la base de datos

Cuando un administrador pulsa "Aprobar":

1. **Navegador**: la ventana de confirmación envía `PATCH /api/solicitudes/12` con `{ "estado": "Aprobada" }`.
2. **NextAuth** lee la cookie con el carné digital y confirma quién es.
3. **La ruta** verifica que sea administrador (si no, responde 403) y que el número 12 sea válido.
4. **La regla de estados** confirma que se puede pasar de Pendiente a Aprobada.
5. **La transacción** comprueba que haya unidades, descuenta una, recalcula el estado del equipo y guarda el nuevo estado de la solicitud, todo como un solo bloque.
6. **La respuesta** vuelve con el mensaje "Solicitud aprobada correctamente" y la solicitud actualizada.
7. **Navegador**: muestra la notificación, actualiza la lista y baja el contador de pendientes del menú.

---

## 7. Las tecnologías, explicadas una por una

### Lenguaje y entorno

| Tecnología | Qué es | Por qué se eligió |
|---|---|---|
| **JavaScript** | El lenguaje de programación de la web. | Se usa tanto en el navegador como en el servidor, así que todo el proyecto está en un solo lenguaje. |
| **Node.js 22.13 o superior** | El programa que ejecuta JavaScript en una computadora. | Es el estándar de la industria y ya trae SQLite incluido. |
| **npm** | El administrador de paquetes de Node.js; viene con él. | Instala todas las bibliotecas con un solo comando (`npm install`). |

### Frontend (lo visual)

| Tecnología | Qué es | Para qué se usa |
|---|---|---|
| **React 19** | Biblioteca para construir interfaces con componentes reutilizables. | Todas las pantallas. |
| **Next.js 15** | Marco de trabajo sobre React. | Las páginas a partir de carpetas, la navegación, la optimización de imágenes y letras, y la API. |
| **Tailwind CSS 4** | Sistema de estilos con clases cortas. | El diseño visual, con los colores institucionales definidos en un solo lugar. |
| **Lucide React** | Colección de íconos de líneas. | Todos los íconos (sin emojis). |
| **Headless UI** | Componentes con el comportamiento accesible ya resuelto. | Ventanas emergentes, menú del usuario y cajón del celular. |
| **React PDF** | Generador de PDF con componentes. | Los informes descargables. |
| **Geist** | Tipo de letra. | La tipografía de toda la aplicación, incluida en el proyecto. |

### Backend (el servidor)

| Tecnología | Qué es | Para qué se usa |
|---|---|---|
| **Rutas de la API de Next.js** | Direcciones del servidor que responden con datos. | Todas las operaciones del sistema. |
| **SQLite (`node:sqlite`)** | Base de datos en un solo archivo, incluida en Node.js. | Guardar toda la información. |
| **NextAuth 4** | Biblioteca de inicio de sesión. | Sesiones con carné digital (JWT). |
| **bcryptjs** | Protección de contraseñas. | Guardar las contraseñas de forma irreversible. |

### Pruebas y calidad

| Tecnología | Qué es | Para qué se usa |
|---|---|---|
| **Vitest** | Herramienta para ejecutar pruebas automáticas. | Pruebas de unidad, de componentes y de la API. |
| **Testing Library + jsdom** | Simulan un navegador para probar componentes. | Las pruebas de componentes. |
| **Playwright** | Controla un navegador real de forma automática. | Las pruebas de punta a punta y las capturas de pantalla. |
| **ESLint** | Revisor automático del código. | Detectar errores y malas prácticas. |

### Control de versiones

| Tecnología | Qué es | Para qué se usa |
|---|---|---|
| **Git** | Sistema que guarda el historial de cambios del código. | Saber qué cambió, cuándo y por qué. |
| **GitHub** | Sitio web donde se guarda el repositorio. | Compartir el proyecto: <https://github.com/Kelvin0880/proyectointegrador> |

---

## 8. Los flujos completos, paso a paso

### Flujo 1: un estudiante nuevo crea su cuenta

1. Entra a la portada y pulsa **Crear cuenta**.
2. Escribe su matrícula, nombre, apellido y contraseña dos veces. El formulario le muestra cómo quedará su correo (`matrícula@unphu.edu.do`).
3. El formulario valida los datos al instante. Si algo falla, marca el campo en rojo.
4. El servidor vuelve a validar, comprueba que la matrícula no exista, protege la contraseña y crea la cuenta con el rol de estudiante.
5. Se le lleva al inicio de sesión con el aviso "Cuenta creada".

### Flujo 2: iniciar sesión

1. Escribe su matrícula y su contraseña.
2. El servidor compara la contraseña con la versión protegida.
3. Si es correcta, crea el carné digital (JWT) en una cookie segura y lo lleva al panel, o a la página que intentaba abrir.
4. Si no es correcta, le muestra un mensaje sin decir cuál de los dos datos falló.

### Flujo 3: pedir un equipo

1. En **Nueva solicitud**, filtra por departamento o busca el equipo.
2. Elige un equipo; solo puede elegir los que tienen unidades y no están en mantenimiento.
3. Indica la fecha (hoy o después), la hora de inicio, la hora de fin y el motivo.
4. Revisa el resumen y pulsa **Enviar solicitud**.
5. El servidor valida, comprueba la disponibilidad y guarda la solicitud como **Pendiente**. Todavía **no** se descuenta ninguna unidad.
6. Ve el detalle de su solicitud con la línea de tiempo en "Enviada".
7. El contador de pendientes del menú del administrador sube en uno.

### Flujo 4: el administrador revisa

1. Ve la solicitud en la cola de su panel o en **Gestión de solicitudes**, con el contador de pendientes en el menú.
2. Revisa el equipo, el horario, el motivo y quién lo pide.
3. Tiene dos opciones:
   - **Aprobar**: el sistema comprueba que haya unidades, descuenta una y la solicitud pasa a **Aprobada**. Si ya no quedaban unidades, se le avisa y no se aprueba.
   - **Rechazar**: debe escribir el motivo. La solicitud pasa a **Rechazada** y el estudiante ve el comentario.

### Flujo 5: préstamo y devolución

1. Con la solicitud aprobada, el estudiante retira el equipo en el departamento.
2. Al devolverlo, el administrador pulsa **Registrar devolución**.
3. La solicitud pasa a **Finalizada** y la unidad vuelve al inventario.
4. Si el equipo estaba agotado, vuelve a aparecer como **Disponible**.

### Flujo 6: el estudiante cancela

1. En **Mis solicitudes** o en el detalle, pulsa **Cancelar** en una solicitud pendiente.
2. Confirma en la ventana emergente.
3. La solicitud se elimina. Como no estaba aprobada, no hay unidades que devolver.

### Flujo 7: gestionar el inventario

1. En **Inventario** el administrador ve todos los equipos con sus existencias.
2. **Nuevo equipo**: llena el nombre, la descripción, el departamento, el total, los disponibles y el estado.
3. **Editar**: ve cuántas unidades están prestadas y no puede poner un total menor. Puede poner el equipo **En mantenimiento** para que nadie lo pida.
4. **Eliminar**: si tiene solicitudes activas, no se permite; si tiene historial, se marca como agotado; si nunca se usó, se borra.

### Flujo 8: gestionar departamentos y usuarios

- **Departamentos**: crear, renombrar y eliminar (solo si están vacíos).
- **Usuarios**: buscar, filtrar y convertir a alguien en administrador o devolverlo a estudiante. El cambio se aplica al instante en la sesión de esa persona.

### Flujo 9: generar un informe

1. En **Informes** elige el periodo y el tipo.
2. Ve el resumen por estado, el gráfico de barras y, si quiere, la tabla.
3. Pulsa **Descargar PDF** y obtiene el informe con el logo, el periodo, la fecha y las tablas.

### Diagrama del ciclo de vida de una solicitud

```
 Estudiante crea   ──>  PENDIENTE  ──(admin aprueba: -1 unidad)──>  APROBADA
                           │                                          │
                           │                                          ├──(devuelve: +1 unidad)──> FINALIZADA
                           │                                          │
                (admin rechaza con motivo)                (admin anula: +1 unidad)
                           │                                          │
                           ▼                                          ▼
                       RECHAZADA  <────────────────────────────────────┘

 Estudiante cancela (solo si está PENDIENTE) ──> la solicitud se elimina
```

---

## 9. Los datos: qué se guarda y cómo se relaciona

La base de datos tiene cuatro tablas:

```
┌───────────────┐        ┌───────────────┐        ┌───────────────┐        ┌───────────────┐
│ DEPARTAMENTOS │ 1    N │    ITEMS      │ 1    N │  SOLICITUDES  │ N    1 │   USUARIOS    │
│───────────────│────────│───────────────│────────│───────────────│────────│───────────────│
│ id            │        │ id            │        │ id            │        │ id            │
│ nombre        │        │ nombre        │        │ usuario_id    │        │ matricula     │
│ descripcion   │        │ descripcion   │        │ item_id       │        │ email         │
│               │        │ departamento_id        │ fecha_uso     │        │ nombre        │
│               │        │ cantidad_total│        │ hora_inicio   │        │ apellido      │
│               │        │ cantidad_disponible    │ hora_fin      │        │ password      │
│               │        │ estado        │        │ motivo        │        │ rol           │
│               │        │               │        │ estado        │        │               │
│               │        │               │        │ comentarios   │        │               │
└───────────────┘        └───────────────┘        └───────────────┘        └───────────────┘
```

- Un **departamento** tiene muchos **equipos**.
- Un **equipo** puede estar en muchas **solicitudes**.
- Un **usuario** puede hacer muchas **solicitudes**.
- Cada **solicitud** une a un usuario con un equipo, en una fecha y un horario.

Todas las tablas guardan además la fecha de creación y de última modificación. El detalle de cada columna está en [BACKEND.md](BACKEND.md#4-la-base-de-datos).

---

## 10. Reglas del negocio

Estas son las reglas que el sistema hace cumplir siempre, sin importar desde dónde llegue la petición:

**Cuentas**
1. La matrícula y el correo son únicos.
2. Toda cuenta nueva es de estudiante.
3. La contraseña tiene entre 6 y 72 caracteres.
4. Siempre debe existir al menos un administrador, y ninguno puede quitarse el permiso a sí mismo.

**Solicitudes**
5. Solo se pueden pedir equipos con unidades disponibles y que no estén en mantenimiento.
6. La fecha de uso no puede estar en el pasado, y la hora de fin debe ser posterior a la de inicio.
7. El motivo es obligatorio (de 5 a 500 caracteres).
8. Los estados siguen un orden fijo: Pendiente a Aprobada o Rechazada; Aprobada a Finalizada o Rechazada; Rechazada y Finalizada son finales.
9. Rechazar exige un comentario.
10. El estudiante solo ve sus propias solicitudes y solo puede cancelar las pendientes.

**Inventario**
11. Al aprobar se descuenta una unidad; al finalizar o anular una aprobada se devuelve.
12. Las existencias nunca son negativas ni superan el total.
13. El estado del equipo se calcula solo (Disponible o Agotado), salvo el mantenimiento, que lo decide el administrador.
14. El total de un equipo no puede ser menor que las unidades prestadas.
15. Un equipo con historial no se borra, se da de baja.
16. Un departamento con equipos no se puede eliminar, y sus nombres no se repiten.

---

## 11. Seguridad

En resumen (el detalle está en [BACKEND.md](BACKEND.md#15-seguridad)):

- **Contraseñas protegidas** con bcrypt; nunca se guardan ni se muestran tal cual.
- **Sesiones firmadas** (JWT) que no se pueden falsificar.
- **Doble protección**: el guardia de las páginas (middleware) y la verificación en cada ruta de la API.
- **Permisos por rol** y por propiedad de los datos.
- **Consultas seguras** contra la inyección SQL.
- **Transacciones** que evitan inventarios descuadrados.
- **Mensajes de error que no revelan información interna.**
- Se eliminaron una ruta de depuración expuesta y un acceso directo que permitía entrar sin contraseña, presentes en la versión original.

---

## 12. Calidad: cómo se probó el sistema

Se usaron tres niveles de pruebas automáticas, como una pirámide: muchas pruebas pequeñas y rápidas en la base, y menos pruebas grandes y completas arriba.

```
            ┌─────────────────────────────┐
            │  36 pruebas de punta a punta │  navegador real, flujos completos
            ├─────────────────────────────┤
            │  41 pruebas de la API        │  cada ruta, permisos y reglas
            ├─────────────────────────────┤
            │  52 pruebas de unidad y      │  validaciones, fechas, componentes
            │     componentes              │
            └─────────────────────────────┘
```

| Nivel | Herramienta | Qué verifica | Cantidad |
|---|---|---|---|
| Unidad | Vitest | Validaciones, formato de fechas y números, cliente de la API | Incluidas en las 93 |
| Componentes | Vitest + Testing Library | Botones, formularios, tablas, insignias, ventanas, línea de tiempo | Incluidas en las 93 |
| API | Vitest con base de datos temporal | Cada ruta, permisos, reglas de inventario y estados, informes | 41 (incluidas en las 93) |
| Punta a punta | Playwright (Chromium) | Flujos completos del estudiante y del administrador, en computadora y celular | 36 |

**Las 129 pruebas pasan.**

Las pruebas de punta a punta también verifican la calidad general en todas las pantallas:

- que no haya errores en la consola del navegador;
- que no aparezca ningún emoji;
- que todas las imágenes tengan texto alternativo;
- que en el celular nada se desborde hacia los lados;
- que el menú desplegable funcione y que las tablas se conviertan en tarjetas.

Además, **toman 34 capturas de pantalla** que se guardan en [docs/screenshots/](screenshots/) y pueden usarse directamente en la tesis.

Gracias a estas pruebas se encontraron y corrigieron errores reales, por ejemplo un desborde horizontal en el panel del celular y un botón que debía ocultarse en la portada móvil.

También se verificó que el código pase el revisor automático (ESLint) sin advertencias y que la versión de producción compile correctamente.

---

## 13. Organización de las carpetas

```
proyectointegrador/
├── database/            Esquema, datos iniciales y el archivo de la base de datos
├── docs/                Esta documentación y las capturas de pantalla
│   ├── PROYECTO.md
│   ├── FRONTEND.md
│   ├── BACKEND.md
│   └── screenshots/
├── public/              Archivos públicos (logo de la UNPHU)
├── scripts/             Comandos de ayuda (reiniciar la base de datos, verificar Node)
├── src/
│   ├── app/             Páginas y rutas de la API
│   ├── components/      Piezas visuales reutilizables
│   ├── hooks/           Funciones reutilizables de React
│   ├── lib/             Lógica compartida (base de datos, validación, sesión, formato)
│   └── middleware.js    Guardia de las páginas
├── tests/               Pruebas automáticas (unidad, componentes, API y punta a punta)
├── .env.example         Ejemplo de configuración (opcional)
├── package.json         Lista de dependencias y comandos
└── README.md            Tutorial de instalación
```

---

## 14. Cómo se ejecuta

El tutorial completo, paso a paso y para cualquier computadora, está en el [README](../README.md). En resumen:

1. Instalar **Node.js 22.13 o superior** (versión LTS) desde <https://nodejs.org/es/download>.
2. Descargar el proyecto desde GitHub.
3. Abrir una terminal en la carpeta del proyecto.
4. Ejecutar `npm install`.
5. Ejecutar `npm run dev`.
6. Abrir <http://localhost:3000> e iniciar sesión con `admin` / `admin123`.

No hace falta instalar ninguna base de datos: se crea sola la primera vez.

---

## 15. Principios de diseño que se siguieron

- **Modularidad**: cada archivo hace una sola cosa (una pieza visual, una ruta, una regla).
- **Reutilización**: el sistema de diseño, las consultas comunes, las validaciones y las constantes se escriben una vez y se usan en muchos lugares.
- **Escalabilidad**: agregar una pantalla, una ruta o un estado no obliga a reescribir lo existente. Por ejemplo, una sección nueva del menú es una sola línea.
- **Una sola fuente de verdad**: los estados, los roles, las reglas de validación y los colores están definidos en un único lugar.
- **Defensa en profundidad**: las reglas se verifican en el formulario, en la API y en la propia base de datos.
- **Diseño centrado en el usuario**: mensajes claros en español, confirmaciones antes de acciones delicadas, estados de carga, vacíos y errores siempre visibles.
- **Accesibilidad e inclusión**: navegación con teclado, compatibilidad con lectores de pantalla y estados que no dependen solo del color.
- **Responsivo desde el inicio**: cada pantalla se diseñó para computadora y para celular.
- **Facilidad de instalación**: sin servicios externos, sin configuración obligatoria, con mensajes de ayuda si falta algo.

---

## 16. Evolución del proyecto: qué se mejoró

El proyecto partió de una versión inicial funcional que se renovó por completo:

| Aspecto | Versión inicial | Versión actual |
|---|---|---|
| Base de datos | MySQL (había que instalarlo y configurarlo) | SQLite incluido en Node.js, se crea solo |
| Instalación | Varios pasos manuales | `npm install` y `npm run dev` |
| Diseño | Pantallas con estilos sueltos | Sistema de diseño unificado con los colores institucionales |
| Íconos | Sin un estilo unificado | Íconos profesionales de Lucide, sin ningún emoji |
| Navegación | Básica | Menú lateral por secciones, cajón en el celular y contador de pendientes |
| Celular | Parcial | Totalmente responsivo, con tablas que se convierten en tarjetas |
| Funciones | Solicitudes e inventario básicos | Más gestión de departamentos, gestión de usuarios y roles, perfil, búsqueda y filtros, línea de tiempo, panel con indicadores e informes con gráfico |
| Inventario | Se podía descontar dos veces o quedar en negativo | Transacciones y reglas de estado que lo impiden |
| Seguridad | Ruta de depuración expuesta y acceso sin contraseña | Eliminados; doble protección por rol |
| Validación | Solo en algunos formularios | Las mismas reglas en el formulario y en el servidor |
| Pruebas | Ninguna | 129 pruebas automáticas y 34 capturas |
| Documentación | Mínima | README tutorial y tres documentos completos |

---

## 17. Limitaciones y trabajo futuro

Ninguna herramienta lo resuelve todo. Estas son las limitaciones conocidas y las ideas para el futuro:

**Limitaciones actuales**

- No envía notificaciones por correo; el estudiante consulta el estado dentro del sistema.
- No revisa si dos solicitudes aprobadas del mismo equipo coinciden en horario. Controla la cantidad de unidades, no un calendario por hora.
- No hay recuperación de contraseña por correo; un administrador tendría que restablecerla.
- SQLite es ideal para una instalación en un solo servidor; para muchos servidores a la vez convendría PostgreSQL o MySQL.

**Trabajo futuro**

- Notificaciones por correo institucional al aprobar o rechazar.
- Calendario de reservas por horario y equipo.
- Recuperación de contraseña.
- Historial de cambios (auditoría) de cada equipo.
- Código QR en cada equipo para registrar el préstamo y la devolución.
- Exportar informes a Excel.
- Publicarlo en un servidor de la universidad con un dominio propio.

---

## 18. Preguntas frecuentes para la defensa

**¿Por qué una aplicación web y no una de escritorio?**
Porque funciona en cualquier dispositivo con navegador (computadora, tableta o celular) sin instalar nada en él, y todos ven la misma información al momento.

**¿Por qué Next.js?**
Porque permite hacer las pantallas y el servidor en un mismo proyecto y con un mismo lenguaje, es muy usado en la industria y tiene mucha documentación.

**¿Por qué SQLite y no MySQL?**
Porque viene incluido en Node.js, no requiere instalar ni configurar un servidor de base de datos, se crea solo y es más que suficiente para el volumen de datos del sistema. Además facilita que cualquiera pueda correr el proyecto.

**¿Cómo se evita que se preste un equipo que no hay?**
Se descuenta una unidad solo al aprobar, dentro de una transacción que primero comprueba que haya unidades. Si dos administradores aprueban la última unidad al mismo tiempo, solo uno lo logra.

**¿Por qué no se descuenta la unidad al crear la solicitud?**
Porque una solicitud pendiente puede ser rechazada. Si se descontara al pedir, los equipos quedarían "bloqueados" por pedidos que tal vez nunca se aprueben.

**¿Cómo se protegen las contraseñas?**
Con bcrypt, que las transforma de forma irreversible. Al iniciar sesión se compara la versión transformada, nunca la original.

**¿Qué pasa si un estudiante intenta entrar a una página de administrador?**
El guardia de las páginas lo devuelve a su inicio. Y aunque intentara usar la API directamente, cada ruta verifica el rol y le respondería "prohibido" (403).

**¿Cómo se sabe que el sistema funciona?**
Con 129 pruebas automáticas que se pueden ejecutar en cualquier momento, incluidas 36 que usan un navegador real para recorrer todos los flujos como lo haría una persona.

**¿Qué pasa con el historial si se elimina un equipo?**
Si el equipo tiene solicitudes anteriores, no se borra: se marca como agotado (baja lógica), así los registros y los informes se conservan.

**¿Se puede usar en el celular?**
Sí. Todas las pantallas se adaptan, y hay pruebas automáticas que lo verifican en el tamaño de un celular.

**¿Es difícil de instalar?**
No. Basta con instalar Node.js, descargar el proyecto y ejecutar dos comandos. El README lo explica paso a paso.

---

## 19. Glosario general

| Término | Significado |
|---|---|
| **Aplicación web** | Un programa que se usa desde el navegador. |
| **Frontend** | La parte visual que ve el usuario. |
| **Backend** | La parte del servidor que procesa y guarda los datos. |
| **Cliente / servidor** | El navegador que pide y el programa que responde. |
| **API** | Las direcciones del servidor para leer y modificar datos. |
| **Base de datos** | El lugar donde se guarda la información de forma organizada. |
| **SQLite** | Una base de datos que se guarda en un solo archivo. |
| **Componente** | Una pieza reutilizable de la interfaz. |
| **Sistema de diseño** | El conjunto de piezas y estilos comunes de toda la aplicación. |
| **Responsivo** | Que se adapta a cualquier tamaño de pantalla. |
| **Rol** | El tipo de usuario (estudiante o administrador). |
| **Autenticación** | Comprobar quién es el usuario. |
| **Autorización** | Decidir qué puede hacer el usuario. |
| **JWT** | Un carné digital firmado que identifica la sesión. |
| **bcrypt** | Un método para proteger contraseñas. |
| **Transacción** | Varias operaciones que se guardan todas juntas o ninguna. |
| **Baja lógica** | Desactivar un registro sin borrarlo. |
| **Prueba automática** | Un programa que comprueba que otro programa funciona bien. |
| **Prueba de punta a punta (E2E)** | Una prueba que usa un navegador real como lo haría una persona. |
| **Repositorio** | El lugar donde se guarda el código con su historial (GitHub). |
| **Node.js** | El programa que ejecuta JavaScript en la computadora. |
| **npm** | La herramienta que instala las bibliotecas del proyecto. |
| **Terminal** | La ventana donde se escriben comandos. |
| **localhost** | La dirección de la propia computadora. |
