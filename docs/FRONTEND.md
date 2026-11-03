# El frontend del Sistema de Inventario UNPHU

Este documento explica, con palabras sencillas, todo lo que tiene que ver con la parte visual del sistema: lo que el usuario ve, toca y usa en el navegador. La idea es que cualquier persona, aunque no sea programadora, pueda entender cómo está hecho, por qué se tomaron ciertas decisiones y cómo se conecta cada pantalla con el resto del proyecto, para poder explicarlo en la tesis.

Documentos relacionados:

- [BACKEND.md](BACKEND.md): la parte del servidor, la base de datos y las reglas del negocio.
- [PROYECTO.md](PROYECTO.md): la visión general de todo el proyecto, de principio a fin.

---

## Índice

1. [Qué es el frontend](#1-qué-es-el-frontend)
2. [Herramientas que usamos y por qué](#2-herramientas-que-usamos-y-por-qué)
3. [Cómo está organizada la carpeta del frontend](#3-cómo-está-organizada-la-carpeta-del-frontend)
4. [Identidad visual: colores, letra, logo e íconos](#4-identidad-visual-colores-letra-logo-e-íconos)
5. [El sistema de diseño: piezas reutilizables](#5-el-sistema-de-diseño-piezas-reutilizables)
6. [Componentes del dominio (propios del negocio)](#6-componentes-del-dominio-propios-del-negocio)
7. [La estructura general de las pantallas](#7-la-estructura-general-de-las-pantallas)
8. [Todas las pantallas, una por una](#8-todas-las-pantallas-una-por-una)
9. [Cómo el frontend habla con el servidor](#9-cómo-el-frontend-habla-con-el-servidor)
10. [Inicio de sesión y permisos en la parte visual](#10-inicio-de-sesión-y-permisos-en-la-parte-visual)
11. [Validación de formularios](#11-validación-de-formularios)
12. [Estados de carga, vacíos y errores](#12-estados-de-carga-vacíos-y-errores)
13. [Diseño responsivo: computadora, tableta y celular](#13-diseño-responsivo-computadora-tableta-y-celular)
14. [Accesibilidad](#14-accesibilidad)
15. [Gráficos e informes en PDF](#15-gráficos-e-informes-en-pdf)
16. [Pruebas del frontend y capturas de pantalla](#16-pruebas-del-frontend-y-capturas-de-pantalla)
17. [Cómo agregar algo nuevo sin romper nada](#17-cómo-agregar-algo-nuevo-sin-romper-nada)
18. [Glosario](#18-glosario)

---

## 1. Qué es el frontend

Una aplicación web tiene dos grandes partes:

- **El frontend** es todo lo que se ve en el navegador: botones, formularios, tablas, menús, colores, mensajes. Es la "cara" del sistema.
- **El backend** es lo que pasa "detrás": guardar datos, verificar contraseñas, decidir quién puede hacer qué, descontar equipos del inventario.

Una buena comparación es un restaurante. El frontend es el salón: las mesas, el menú y el mesero que te atiende. El backend es la cocina, donde se preparan los platos y se controla qué ingredientes quedan. El cliente nunca entra a la cocina; pide a través del mesero. De la misma forma, el frontend nunca toca la base de datos directamente: le pide las cosas al backend y muestra la respuesta.

En este proyecto el frontend permite a dos tipos de personas trabajar con el sistema:

- **Estudiantes (rol "usuario")**: crean su cuenta, piden equipos prestados (un proyector, un cable HDMI, etc.), ven el estado de sus solicitudes y pueden cancelarlas mientras estén pendientes.
- **Administradores (rol "admin")**: además de todo lo anterior, revisan las solicitudes de todos, las aprueban o rechazan, registran cuando se devuelve un equipo, gestionan el inventario, los departamentos y los usuarios, y generan informes en PDF.

---

## 2. Herramientas que usamos y por qué

| Herramienta | Qué es, en palabras simples | Para qué la usamos |
|---|---|---|
| **Next.js 15** | Un "marco de trabajo" construido sobre React que organiza la aplicación en páginas y se encarga de muchas cosas automáticamente. | Es la base de todo el proyecto: crea las páginas a partir de carpetas, sirve la aplicación y también aloja el backend (las rutas de la API). |
| **React 19** | Una biblioteca para construir interfaces dividiéndolas en piezas pequeñas llamadas *componentes*. | Cada botón, tarjeta, tabla o formulario es un componente que se reutiliza en muchas pantallas. |
| **Tailwind CSS 4** | Una forma de dar estilo (colores, tamaños, espacios) escribiendo clases cortas directamente en cada elemento. | Todo el diseño visual. Permite que el estilo sea consistente y fácil de cambiar desde un solo lugar. |
| **Lucide React** | Una colección de más de mil íconos de líneas, limpios y profesionales. | Todos los íconos del sistema. No se usa ningún emoji en ninguna parte. |
| **Headless UI** | Piezas de interfaz "sin estilo" pero con el comportamiento difícil ya resuelto (abrir, cerrar, teclado, foco). | Las ventanas emergentes (modales), el menú del usuario y el menú lateral del celular. |
| **NextAuth** | Una biblioteca para manejar inicio de sesión. | Saber quién está conectado y qué rol tiene, desde cualquier pantalla. |
| **React PDF** (`@react-pdf/renderer`) | Una herramienta que genera documentos PDF usando componentes de React. | Los informes descargables con el logo de la UNPHU. |
| **Geist** | Un tipo de letra moderno y muy legible, incluido en el proyecto (no depende de internet). | Toda la tipografía de la aplicación. |

### Por qué estas decisiones

- **Next.js y React** son de las tecnologías más usadas en la industria, tienen mucha documentación y permiten tener frontend y backend en un solo proyecto, lo que simplifica instalarlo.
- **Tailwind** evita tener cientos de archivos de estilos que se contradicen. Los colores de la universidad se definen una sola vez y todas las pantallas los usan.
- **Los íconos de Lucide** se ven iguales en cualquier computadora o celular. Los emojis cambian de aspecto según el sistema operativo y no se ven profesionales en un sistema institucional.
- **La letra viene incluida en el proyecto**, así que se ve igual aunque la computadora no tenga internet.

---

## 3. Cómo está organizada la carpeta del frontend

Todo el código está dentro de la carpeta `src/`. La parte visual se reparte así:

```
src/
  app/                    Las páginas. Cada carpeta es una dirección (URL) del sitio.
    page.js               Portada pública (http://localhost:3000/)
    not-found.js          Página de "no encontrado" (error 404)
    layout.js             Marco común a todo el sitio (idioma, letra, proveedores)
    providers.js          Activa la sesión y las notificaciones en toda la app
    globals.css           Colores institucionales y estilos base
    icon.png              Ícono de la pestaña del navegador (logo UNPHU)
    auth/
      login/              Pantalla de inicio de sesión
      register/           Pantalla de registro
    dashboard/            El panel (solo con sesión iniciada)
      page.js             Inicio del panel (cambia según el rol)
      nueva-solicitud/    Formulario para pedir un equipo
      solicitudes/        Mis solicitudes y el detalle de cada una
      perfil/             Mis datos y cambio de contraseña
      admin/              Secciones exclusivas del administrador
        solicitudes/      Revisar todas las solicitudes
        inventario/       Lista, nuevo equipo y edición de equipos
        departamentos/    Gestión de departamentos
        usuarios/         Gestión de usuarios y roles
        informes/         Informes con gráfico y PDF

  components/             Piezas reutilizables
    ui/                   Sistema de diseño (botones, tarjetas, tablas, formularios...)
    domain/               Piezas propias del negocio (insignias de estado, formulario de equipo...)
    layout/               Estructura de pantallas (menú lateral, encabezado público)
    dashboard/            Contenido del inicio del panel (estudiante y administrador)
    informes/             Gráfico de ranking y documento PDF

  hooks/                  Funciones reutilizables para cargar datos y leer filtros de la URL
  lib/                    Utilidades compartidas (formato de fechas, validaciones, constantes)
```

La regla de organización es sencilla:

- **`app/`** solo decide *qué* se muestra en cada dirección.
- **`components/`** decide *cómo* se ve cada pieza.
- **`lib/`** y **`hooks/`** tienen la lógica que se repite en muchos lugares.

Gracias a esta separación, cambiar el aspecto de un botón se hace en un solo archivo y se actualiza en todas las pantallas a la vez.

---

## 4. Identidad visual: colores, letra, logo e íconos

### Colores

Los colores están definidos una única vez en `src/app/globals.css`. Se mantuvieron los verdes originales del proyecto y se organizaron en una escala de 11 tonos, del más claro al más oscuro:

| Nombre | Color | Uso principal |
|---|---|---|
| brand-50 | `#f0f9f3` | Fondos muy suaves, resaltado de filas |
| brand-100 / 200 | `#dcf1e3` / `#bbe3c9` | Fondos de insignias, selección de texto |
| brand-300 / 400 | `#8bcea5` / `#56b07b` | Detalles e íconos sobre fondo oscuro |
| brand-500 | `#33945c` | Acentos |
| **brand-600** | **`#227747`** | **Verde principal: botones, enlaces, foco del teclado** |
| brand-700 | `#1b6a3d` | Botones al pasar el mouse |
| brand-800 / 900 | `#175232` / `#13432a` | Menú lateral, panel del inicio de sesión |
| brand-950 | `#092517` | Pie de página |

Además hay dos colores tomados del escudo de la universidad, el **rojo UNPHU** (`#d7262f`) y el **azul UNPHU** (`#1f2a9c`), que se usan como acentos. Para el texto se usan grises neutros (la escala "slate").

Los colores de **estado** siguen siempre el mismo significado en todo el sistema:

- **Ámbar**: pendiente o en mantenimiento (algo en espera).
- **Verde**: aprobada o disponible (todo bien).
- **Rojo**: rechazada o agotado (problema o no disponible).
- **Azul**: finalizada (proceso terminado).

Además del color, cada estado lleva un ícono y su nombre escrito. Así una persona con dificultad para distinguir colores también entiende el estado.

### Letra

Se usa **Geist**, una letra moderna sin adornos, muy legible en pantallas pequeñas. Los números de las tablas usan "cifras tabulares" (todas del mismo ancho) para que las columnas queden alineadas.

### Logo

El logo oficial de la UNPHU está en `public/logo-unphu.png` y aparece en:

- el encabezado de la portada y su pie de página;
- el panel verde de las pantallas de inicio de sesión y registro (y arriba del formulario en el celular);
- el menú lateral del panel y la barra superior en el celular;
- la página de error 404;
- el ícono de la pestaña del navegador;
- el encabezado de los informes PDF.

El componente `Logo` (en `components/ui/Brand.js`) muestra el escudo junto al nombre "UNPHU Inventario". Tiene una versión clara para fondos oscuros y una oscura para fondos claros.

### Íconos

Todos los íconos vienen de **Lucide**. Algunos ejemplos: una caja para el inventario, un portapapeles con un signo de suma para "nueva solicitud", un edificio para departamentos, un reloj de arena para "pendiente" y un círculo con una marca de verificación para "aprobada". **No hay ningún emoji** en el código ni en las pantallas, y una prueba automática lo comprueba en cada página.

---

## 5. El sistema de diseño: piezas reutilizables

Un *sistema de diseño* es un conjunto de piezas visuales básicas que se combinan para construir todas las pantallas, como los bloques de un juego de construcción. En este proyecto viven en `src/components/ui/` y se importan todas desde un solo lugar:

```js
import { Button, Card, DataTable, Modal } from '@/components/ui';
```

### Lista de piezas

| Pieza | Archivo | Qué hace |
|---|---|---|
| **Button** (botón) | `Button.js` | Botón con varias variantes: *primary* (verde, acción principal), *secondary* (blanco con borde), *soft* (verde suave), *danger* (rojo, para eliminar), *ghost* (sin fondo), entre otras. Tiene tres tamaños, puede llevar un ícono, muestra un indicador de "cargando" mientras espera y, si recibe un enlace, funciona como enlace. |
| **Card** (tarjeta) | `Card.js` | Caja blanca con borde y esquinas redondeadas para agrupar contenido. Tiene encabezado (con título, descripción, ícono y acciones), cuerpo y pie. |
| **Badge** (insignia) | `Badge.js` | Etiqueta pequeña de color con ícono opcional, usada para estados y roles. |
| **Field, Input, PasswordInput, Select, Textarea** | `Form.js` | Campos de formulario. `Field` pone la etiqueta, el texto de ayuda y el mensaje de error, y los conecta con el campo para los lectores de pantalla. `PasswordInput` tiene un botón para mostrar u ocultar la contraseña. `CharCount` cuenta los caracteres escritos. |
| **Modal** | `Modal.js` | Ventana emergente sobre la página, con fondo oscurecido. Se cierra con la tecla Escape o haciendo clic fuera. |
| **ConfirmDialog** | `ConfirmDialog.js` | Ventana que pregunta "¿Seguro?" antes de una acción delicada, como eliminar o cancelar. |
| **Alert, Spinner, PageLoader, Skeleton, EmptyState, ErrorState** | `Feedback.js` | Mensajes y estados: avisos de colores; indicador de carga; "esqueletos" grises que imitan el contenido mientras carga; pantalla de "no hay datos"; y pantalla de error con botón de "Reintentar". |
| **PageHeader, StatCard, ProgressBar, DescriptionList** | `Layout.js` | El título de cada página con su descripción y botones; las tarjetas de indicadores (por ejemplo, "3 pendientes"); barras de progreso para existencias; y listas de "dato: valor" para detalles. |
| **DataTable** | `DataTable.js` | Tabla de datos. En la computadora se ve como tabla y en el celular se transforma automáticamente en tarjetas una debajo de otra. |
| **FilterTabs, SearchInput** | `Filters.js` | Pestañas para filtrar (por ejemplo, Pendientes, Aprobadas...) y un buscador que espera a que el usuario deje de escribir antes de buscar, para no hacer búsquedas innecesarias. |
| **Logo, LogoMark, Avatar** | `Brand.js` | El logo con nombre, solo el escudo, y un círculo con las iniciales del usuario. |
| **ToastProvider, useToast** | `Toast.js` | Notificaciones pequeñas que aparecen en una esquina ("Solicitud enviada", "Equipo eliminado") y desaparecen solas. |

### Por qué importa para la tesis

- **Reutilizable**: un mismo botón se usa en más de 50 lugares. Si se cambia su estilo, cambia en todas partes.
- **Consistente**: todas las pantallas tienen el mismo aspecto porque usan las mismas piezas.
- **Escalable**: una pantalla nueva se arma combinando piezas que ya existen y ya están probadas.
- **Modular**: cada pieza está en su propio archivo y hace una sola cosa.

---

## 6. Componentes del dominio (propios del negocio)

Además de las piezas genéricas, hay componentes que solo tienen sentido en este sistema. Están en `src/components/domain/`:

| Componente | Qué hace |
|---|---|
| **StatusBadges** | Define en un solo lugar el color, el ícono y el texto de cada estado de solicitud (Pendiente, Aprobada, Rechazada, Finalizada), de cada estado de equipo (Disponible, Agotado, En mantenimiento) y de cada rol. Así un estado se ve igual en todas las pantallas. |
| **SolicitudDetails** | Muestra toda la información de una solicitud (equipo, departamento, fecha, horario, motivo, solicitante) y una **línea de tiempo** con los pasos: enviada, revisada (aprobada o rechazada) y devuelta. |
| **SolicitudDecisionModal** | La ventana donde el administrador aprueba, rechaza o finaliza una solicitud. Para rechazar es **obligatorio** escribir el motivo, para que el estudiante sepa por qué. |
| **ItemForm** | El formulario de un equipo, usado tanto para crear uno nuevo como para editarlo. Valida los campos y muestra cuántas unidades están prestadas en ese momento. |

En `src/components/dashboard/` están las dos versiones del inicio del panel:

- **UserOverview** (estudiante): saludo, indicadores de sus solicitudes, sus solicitudes recientes y accesos rápidos.
- **AdminOverview** (administrador): indicadores generales, la cola de solicitudes pendientes con botones para aprobar o rechazar ahí mismo, los equipos con pocas existencias y el resumen por departamento.

En `src/components/informes/` están el gráfico de ranking (`RankingChart`), el documento PDF (`InformePDF`) y el botón que lo descarga (`PdfDownloadButton`).

---

## 7. La estructura general de las pantallas

Hay dos "marcos" de pantalla:

### Marco público (`components/layout/PublicLayout.js`)

Se usa en la portada y en las pantallas de inicio de sesión y registro.

- **Encabezado** con el logo y los botones "Iniciar sesión" y "Crear cuenta". En el celular solo se muestra "Crear cuenta" para ahorrar espacio.
- **Pie de página** verde oscuro con el escudo, el nombre de la universidad y el año actual.
- **AuthLayout**: la pantalla dividida del inicio de sesión. A la izquierda hay un panel verde con el logo y tres beneficios del sistema, y a la derecha el formulario. En el celular el panel verde se oculta y el logo aparece arriba del formulario.

### Marco del panel (`components/layout/AppShell.js`)

Se usa en todas las pantallas de `/dashboard`.

- **Menú lateral verde** a la izquierda, fijo en la computadora. Está dividido en secciones: *General* (Inicio, Nueva solicitud, Mis solicitudes), *Administración* (solo para administradores) y *Cuenta* (Mi perfil). La sección activa se resalta en blanco.
- **Contador de pendientes**: junto a "Solicitudes" aparece un número ámbar con las solicitudes que esperan revisión, para que el administrador lo vea desde cualquier pantalla.
- **Barra superior** con el menú del usuario: su avatar con iniciales, nombre, matrícula, correo, rol, un enlace al perfil y el botón "Cerrar sesión".
- **En el celular** el menú lateral se esconde y aparece un botón de tres líneas que lo abre como un cajón deslizante desde la izquierda. Se cierra al elegir una opción, al tocar fuera o con la X.

Los elementos del menú están definidos en un solo archivo, `components/layout/navigation.js`. **Para agregar una sección nueva basta con añadir una línea ahí**: el menú de la computadora, el del celular y el resaltado de la sección activa se actualizan solos.

---

## 8. Todas las pantallas, una por una

Las capturas de pantalla de cada una están en [docs/screenshots/](screenshots/).

### Pantallas públicas (sin iniciar sesión)

#### Portada — `/`
Presenta el sistema con un mensaje principal, botones para crear cuenta o iniciar sesión, seis tarjetas de características (inventario centralizado, solicitudes en línea, aprobación y seguimiento, informes en PDF, acceso seguro y estado en tiempo real) y una sección de "cómo funciona" en tres pasos. Si la persona ya inició sesión, se la lleva directo al panel.
*Captura: `publico-01-portada.png`*

#### Iniciar sesión — `/auth/login`
Se escribe la matrícula (por ejemplo `ab24-0001`) y la contraseña. La contraseña se puede mostrar u ocultar. Si los datos son incorrectos aparece un mensaje claro. Si la persona intentó entrar a una página protegida, después de iniciar sesión vuelve a esa página. Si viene de registrarse, aparece un aviso verde de "Cuenta creada".
*Capturas: `publico-02-login.png`, `auth-03-login-error.png`*

#### Crear cuenta — `/auth/register`
Pide matrícula, nombre, apellido, contraseña y la confirmación de la contraseña. Muestra cómo quedará el correo institucional (`matrícula@unphu.edu.do`). Valida todo antes de enviar y muestra los errores junto a cada campo.
*Capturas: `publico-03-registro.png`, `auth-01-registro-validacion.png`, `auth-02-registro-exitoso.png`*

#### Página no encontrada — cualquier dirección que no existe
Muestra el logo, el mensaje "Página no encontrada" y botones para volver.
*Captura: `publico-04-404.png`*

### Pantallas del estudiante

#### Inicio del panel — `/dashboard`
Saluda por el nombre y muestra cuatro indicadores (pendientes, aprobadas, finalizadas y total), sus solicitudes más recientes y accesos rápidos. Si todavía no tiene solicitudes, muestra una invitación a crear la primera.
*Capturas: `usuario-01-panel-vacio.png`, `usuario-06-panel.png`*

#### Nueva solicitud — `/dashboard/nueva-solicitud`
Está organizada en dos pasos y un resumen:

1. **Selecciona el equipo**: tarjetas de equipos con su estado y unidades disponibles. Se pueden filtrar por departamento con pestañas y buscar por nombre. Los equipos agotados o en mantenimiento aparecen atenuados y no se pueden elegir.
2. **Fecha, horario y motivo**: fecha de uso (no se permiten fechas pasadas), hora de inicio y de fin (el fin debe ser después del inicio) y el motivo, con un contador de caracteres (máximo 500).
3. **Resumen** a la derecha, que se actualiza mientras se llena el formulario y tiene el botón "Enviar solicitud". En la computadora este resumen se queda fijo al bajar.

Al enviar, aparece una notificación y se abre el detalle de la solicitud recién creada. Desde otras pantallas se puede llegar con un equipo ya elegido (por ejemplo, desde el inventario).
*Captura: `usuario-02-nueva-solicitud.png`*

#### Mis solicitudes — `/dashboard/solicitudes`
Lista todas las solicitudes del estudiante con pestañas para filtrar por estado; cada pestaña muestra cuántas hay. El filtro se guarda en la dirección de la página, así que al recargar o compartir el enlace se mantiene. Las solicitudes pendientes tienen un botón para cancelarlas, que pide confirmación.
*Capturas: `usuario-04-mis-solicitudes.png`, `usuario-05-confirmar-cancelacion.png`*

#### Detalle de una solicitud — `/dashboard/solicitudes/[número]`
Toda la información de la solicitud, su línea de tiempo y, si fue rechazada, el comentario del administrador. Si está pendiente, se puede cancelar. Un estudiante solo puede ver sus propias solicitudes.
*Captura: `usuario-03-detalle-solicitud.png`*

#### Mi perfil — `/dashboard/perfil`
Muestra la matrícula, el correo, el rol y la fecha de registro, junto con su actividad. Permite cambiar el nombre y el apellido, y cambiar la contraseña indicando la actual. El nombre nuevo aparece al momento en el menú del usuario.
*Captura: `usuario-07-perfil.png`*

### Pantallas del administrador

#### Inicio del administrador — `/dashboard`
- Indicadores: solicitudes pendientes, préstamos activos, unidades disponibles del total y cantidad de usuarios.
- **Cola de revisión**: las solicitudes pendientes más antiguas, con botones para aprobar o rechazar sin salir de la pantalla.
- **Existencias bajas**: equipos con menos del 20 % de unidades disponibles, con barra de progreso.
- **Departamentos**: unidades disponibles de cada departamento.
*Capturas: `admin-01-panel.png`, `admin-02-aprobar.png`*

#### Gestión de solicitudes — `/dashboard/admin/solicitudes`
Todas las solicitudes del sistema. Se pueden filtrar por estado con pestañas y buscar por equipo, nombre del estudiante, matrícula o motivo. Las pendientes aparecen primero. Desde cada fila se puede:

- **Aprobar**: descuenta una unidad del inventario.
- **Rechazar**: pide el motivo obligatoriamente.
- **Registrar devolución** (finalizar): devuelve la unidad al inventario.
- **Ver el detalle** completo.
*Capturas: `admin-03-solicitudes.png`, `admin-04-detalle-solicitud.png`*

#### Inventario — `/dashboard/admin/inventario`
Tabla de equipos con su departamento, una barra de existencias (disponibles de un total) y su estado. Filtros por departamento y por estado, y un buscador. Botones para crear, editar y eliminar. Al eliminar un equipo que tiene historial, el sistema no lo borra: lo marca como agotado para no perder los registros, y lo avisa.
*Captura: `admin-05-inventario.png`*

#### Nuevo equipo y editar equipo — `/dashboard/admin/inventario/nuevo` y `/editar/[número]`
El mismo formulario (`ItemForm`) con nombre, descripción, departamento, cantidad total, cantidad disponible y estado. Al editar se muestra cuántas unidades están prestadas, y no se permite poner un total menor que esa cantidad.
*Capturas: `admin-06-nuevo-equipo.png`, `admin-07-editar-equipo.png`*

#### Departamentos — `/dashboard/admin/departamentos`
Tarjetas con cada departamento: cantidad de equipos, unidades disponibles y una barra de disponibilidad. Se crean y editan en una ventana emergente. No se puede eliminar un departamento que todavía tiene equipos.
*Captura: `admin-08-departamentos.png`*

#### Usuarios — `/dashboard/admin/usuarios`
Lista de todas las cuentas con su rol, la cantidad de solicitudes y los préstamos activos. Se puede buscar y filtrar por rol, y convertir a un usuario en administrador o quitarle ese permiso. El sistema impide que un administrador se quite el permiso a sí mismo y que el sistema se quede sin administradores.
*Captura: `admin-09-usuarios.png`*

#### Informes — `/dashboard/admin/informes`
Se elige el periodo (últimas 24 horas, 5 días, 15 días, un mes, 6 meses o un año) y el tipo de informe (equipos más solicitados, usuarios más activos o completo). Muestra:

- Un resumen por estado (cuántas pendientes, aprobadas, etc.).
- **Gráfico de barras** del ranking, con el número al final de cada barra y un recuadro con detalles al pasar el mouse.
- Un botón para ver los mismos datos en **tabla**.
- El botón **Descargar PDF**, que genera el informe con el logo, la fecha y las tablas.
*Captura: `admin-10-informes.png`*

---

## 9. Cómo el frontend habla con el servidor

El frontend pide y envía datos al backend mediante **peticiones HTTP** a direcciones que empiezan con `/api/` (por ejemplo, `/api/items` para el inventario). Las respuestas vienen en **JSON**, un formato de texto que organiza los datos como una lista de campos y valores.

Para no repetir el mismo código en cada pantalla hay tres herramientas:

### `lib/api-client.js` — el mensajero

Tiene una función, `apiFetch`, que envía la petición y revisa la respuesta. Si algo sale mal, lanza un error con el mensaje en español que dio el servidor (por ejemplo, "Este equipo no tiene unidades disponibles"), y la pantalla lo muestra tal cual. Si no hay conexión, muestra "No se pudo conectar con el servidor". Para que el código se lea fácil, se usa así:

```js
api.get('/api/items')
api.post('/api/solicitudes', datos)
api.patch('/api/items/5', cambios)
api.delete('/api/solicitudes/3')
```

También tiene `withQuery`, que arma direcciones con filtros, por ejemplo `/api/items?departamento_id=1&q=hdmi`.

### `hooks/useApi.js` — cargar datos en una pantalla

Un *hook* es una función reutilizable de React. `useApi('/api/items')` hace la petición automáticamente y le entrega a la pantalla tres cosas: los **datos**, si está **cargando** y si hubo un **error**. Cuando cambia un filtro, vuelve a pedir los datos y descarta las respuestas viejas, para que no aparezcan resultados de una búsqueda anterior. También tiene `refetch` para recargar después de un cambio, por ejemplo después de aprobar una solicitud.

`useAsyncAction` envuelve acciones como guardar o eliminar, y avisa cuándo están en curso para que el botón muestre "cargando" y no se pueda pulsar dos veces.

### `hooks/useQueryParam.js` — filtros en la dirección

Guarda los filtros en la dirección de la página (por ejemplo, `/dashboard/solicitudes?estado=Pendiente`). Así, si el usuario recarga la página, comparte el enlace o vuelve atrás, el filtro se mantiene.

### Ejemplo completo: enviar una solicitud

1. El estudiante llena el formulario y pulsa "Enviar solicitud".
2. El frontend revisa los datos con las mismas reglas que usa el servidor. Si hay errores, los muestra y no envía nada.
3. Si todo está bien, el botón muestra "cargando" y se envía `api.post('/api/solicitudes', datos)`.
4. El servidor vuelve a validar, comprueba que haya unidades disponibles y guarda la solicitud.
5. El frontend muestra la notificación "Solicitud enviada" y abre el detalle de la solicitud.
6. Si el servidor responde con un error (por ejemplo, alguien se llevó la última unidad), se muestra el mensaje y se recarga la lista de equipos.

---

## 10. Inicio de sesión y permisos en la parte visual

- **`app/providers.js`** activa la sesión (NextAuth) y las notificaciones en toda la aplicación.
- Cualquier pantalla puede saber quién está conectado con `useSession()`: su nombre, matrícula, correo y rol.
- El **inicio del panel** muestra una versión distinta según el rol: `AdminOverview` para administradores y `UserOverview` para estudiantes.
- El **menú lateral** solo muestra la sección "Administración" a los administradores.
- **La protección real no depende del frontend.** Antes de mostrar cualquier página del panel, un guardia del servidor (el *middleware*, explicado en [BACKEND.md](BACKEND.md)) comprueba la sesión:
  - sin sesión, envía a la persona al inicio de sesión;
  - si un estudiante intenta entrar a `/dashboard/admin`, lo devuelve a su inicio;
  - con la sesión ya iniciada, las páginas de inicio de sesión y registro llevan directo al panel.

  Además, cada ruta de la API vuelve a verificar los permisos. Aunque alguien modificara el frontend, no podría hacer acciones de administrador.
- **Cerrar sesión** está en el menú del usuario y lleva de vuelta a la pantalla de inicio de sesión.

---

## 11. Validación de formularios

Todas las reglas están en un solo archivo, `src/lib/validation.js`, y **las usan tanto el frontend como el servidor**. Así nunca hay diferencias entre lo que el formulario acepta y lo que el servidor acepta.

Reglas principales:

| Formulario | Reglas |
|---|---|
| Registro | Matrícula de 3 a 20 caracteres (letras, números, punto o guion); nombre y apellido obligatorios, máximo 100 caracteres; contraseña de 6 a 72 caracteres; la confirmación debe coincidir. Si alguien escribe el correo completo, se toma solo la parte antes de la @. |
| Solicitud | Equipo obligatorio; fecha de uso obligatoria y no en el pasado; horas válidas y la de fin después de la de inicio; motivo de 5 a 500 caracteres. |
| Equipo | Nombre obligatorio (máximo 100), descripción obligatoria, departamento obligatorio, cantidad total entera mayor que 0, disponibles entre 0 y el total. |
| Departamento | Nombre obligatorio, máximo 100 caracteres y sin repetir. |
| Contraseña | La actual es obligatoria y la nueva debe ser distinta y tener de 6 a 72 caracteres. |

Cómo se le muestra al usuario:

- El campo con error se pone con borde rojo, y debajo aparece el mensaje con un ícono de alerta.
- Al empezar a corregir un campo, su error desaparece.
- Arriba o junto al botón aparece un resumen del primer error.
- Los campos obligatorios llevan un asterisco rojo.

---

## 12. Estados de carga, vacíos y errores

Ninguna pantalla se queda en blanco ni muestra un error técnico. Siempre hay una respuesta visual:

- **Mientras carga**: se muestran "esqueletos", bloques grises animados con la forma del contenido que va a aparecer. Se siente más rápido que un simple "cargando".
- **Cuando no hay datos**: un mensaje amable con un ícono y, si tiene sentido, un botón de acción (por ejemplo, "No tienes solicitudes" con "Crear solicitud").
- **Cuando algo falla**: un recuadro con el mensaje del problema y un botón de "Reintentar".
- **Botones ocupados**: mientras se guarda algo, el botón muestra un círculo girando y se desactiva para evitar envíos dobles.
- **Confirmaciones**: eliminar, cancelar o rechazar siempre piden confirmación en una ventana.
- **Notificaciones**: cada acción exitosa o fallida muestra un aviso breve en la esquina.

---

## 13. Diseño responsivo: computadora, tableta y celular

*Responsivo* significa que la página se adapta al tamaño de la pantalla. El sistema se diseñó para funcionar desde un celular de 390 píxeles de ancho hasta monitores grandes:

- **Menú lateral**: fijo en la computadora; en el celular se convierte en un cajón que se abre con un botón.
- **Tablas**: en el celular cada fila se convierte en una tarjeta con la información apilada, porque una tabla ancha no cabe en una pantalla pequeña.
- **Cuadrículas**: los indicadores y las tarjetas pasan de 4 columnas a 2 o a 1 según el ancho.
- **Formulario de solicitud**: en la computadora el resumen queda a la derecha y fijo; en el celular aparece debajo.
- **Pantalla de inicio de sesión**: en la computadora está dividida en dos; en el celular solo se muestra el formulario con el logo arriba.
- **Textos largos**: se recortan con puntos suspensivos para que nada se salga de la pantalla.

Una prueba automática recorre las pantallas con el tamaño de un celular y falla si algo se desborda hacia los lados. Esta prueba encontró y permitió corregir dos problemas reales durante el desarrollo.

*Capturas: todas las que empiezan con `movil-` en [docs/screenshots/](screenshots/).*

---

## 14. Accesibilidad

La accesibilidad es lograr que el sistema lo puedan usar todas las personas, incluidas las que usan lectores de pantalla o solo el teclado.

- **Idioma** de la página declarado como español, para que los lectores de pantalla pronuncien bien.
- **Etiquetas conectadas**: cada campo de formulario está enlazado con su etiqueta, su ayuda y su mensaje de error.
- **Navegación con teclado**: todo se puede usar con Tab y Enter, y el elemento seleccionado muestra un contorno verde visible.
- **Ventanas emergentes**: al abrirse, el foco se queda dentro de ellas, y se cierran con Escape.
- **Textos alternativos**: todas las imágenes tienen descripción (una prueba lo verifica).
- **Íconos decorativos** ocultos para los lectores de pantalla, para que no lean cosas sin sentido.
- **Botones con solo ícono** con su nombre (por ejemplo, "Abrir menú" o "Mostrar contraseña").
- **Estados que no dependen solo del color**: siempre llevan ícono y texto.
- **Movimiento reducido**: si la persona tiene activada en su sistema la opción de reducir animaciones, el sistema la respeta.
- **Página activa marcada** en el menú para tecnologías de asistencia.

---

## 15. Gráficos e informes en PDF

### El gráfico de ranking (`RankingChart.js`)

Muestra los equipos más solicitados o los usuarios más activos. Se siguieron buenas prácticas de visualización de datos:

- **Barras horizontales de un solo color** (el verde institucional). Como todas las barras miden lo mismo (cantidad de solicitudes), no hace falta un color distinto para cada una.
- **El número al final de cada barra**, para leer el valor sin adivinar.
- **Un recuadro con detalles al pasar el mouse** (nombre, departamento o matrícula, y total).
- **Vista de tabla** como alternativa, útil para quien prefiere los números o usa un lector de pantalla.
- **Líneas y ejes discretos**, para que lo importante sean los datos.

### El informe PDF (`InformePDF.js` y `PdfDownloadButton.js`)

Se genera directamente en el navegador, sin enviar nada a internet. Incluye el logo y el nombre de la universidad, el título del informe, el periodo, la fecha en que se generó, un resumen por estado y las tablas de ranking. El botón de descarga se carga solo cuando hace falta, para que la página de informes abra rápido.

---

## 16. Pruebas del frontend y capturas de pantalla

Se hicieron pruebas automáticas para comprobar que todo funciona. Hay de dos tipos:

### Pruebas de componentes (Vitest + Testing Library)

Están en `tests/components/ui.test.jsx`. Prueban las piezas por separado, sin abrir el navegador. Por ejemplo, que el botón muestre "cargando" y se desactive, que un campo con error muestre su mensaje, que la tabla muestre el estado vacío, que las insignias usen el color correcto o que la línea de tiempo marque bien los pasos. También hay pruebas de las funciones de formato de fechas, validaciones y del mensajero `api-client` (en `tests/unit/`).

### Pruebas de punta a punta (Playwright)

Están en `tests/e2e/`. Un navegador real (Chromium) abre la aplicación y hace lo mismo que haría una persona: hace clic, escribe, navega y comprueba lo que aparece en pantalla.

| Archivo | Qué recorre |
|---|---|
| `01-publico.spec.js` | Portada, inicio de sesión, registro, protección de páginas, página 404 y la redirección de una dirección antigua. |
| `02-autenticacion.spec.js` | Registro con validaciones, matrícula repetida, error de credenciales, mostrar u ocultar la contraseña, iniciar y cerrar sesión, y volver a la página pedida. |
| `03-usuario.spec.js` | Todo el flujo del estudiante: panel vacío, prohibición de entrar a la administración, crear solicitudes, filtrar, cancelar, ver estadísticas, editar el perfil y cambiar la contraseña. |
| `04-administrador.spec.js` | Todo el flujo del administrador: aprobar desde el panel, gestionar solicitudes, rechazar con motivo, registrar la devolución, crear, editar y eliminar equipos y departamentos, cambiar roles y generar el PDF. |
| `05-calidad.spec.js` | Recorre todas las pantallas y verifica que no haya errores en la consola, que no haya emojis y que todas las imágenes tengan texto alternativo. En tamaño celular verifica que nada se desborde, que el menú desplegable funcione y que las tablas se conviertan en tarjetas. |

Mientras se ejecutan, estas pruebas **toman capturas de pantalla** y las guardan en [docs/screenshots/](screenshots/). Así las imágenes de la tesis siempre muestran la versión actual del sistema.

Resultados actuales: **93 pruebas de unidad, componentes y API** y **36 pruebas de punta a punta**, todas aprobadas. Cómo ejecutarlas está en el [README](../README.md).

---

## 17. Cómo agregar algo nuevo sin romper nada

- **Una pantalla nueva**: crear una carpeta dentro de `src/app/dashboard/` con un archivo `page.js`, armarla con piezas de `@/components/ui` y añadir el enlace en `components/layout/navigation.js`.
- **Un estado nuevo**: añadirlo en `lib/constants.js` y darle color e ícono en `components/domain/StatusBadges.js`.
- **Cambiar los colores**: editar solo el bloque `@theme` de `src/app/globals.css`.
- **Una regla de validación nueva**: añadirla en `lib/validation.js`, y se aplicará a la vez en el formulario y en el servidor.
- **Después de cualquier cambio**: ejecutar `npm test` y `npm run test:e2e` para confirmar que todo sigue funcionando.

---

## 18. Glosario

| Término | Significado |
|---|---|
| **Componente** | Una pieza de la interfaz (un botón, una tarjeta) que se puede reutilizar. |
| **Página / ruta** | Una dirección del sitio, como `/dashboard/perfil`. |
| **Hook** | Una función reutilizable de React que da "superpoderes" a un componente, como cargar datos. |
| **API** | El conjunto de direcciones que ofrece el servidor para pedir o guardar datos. |
| **JSON** | Un formato de texto para intercambiar datos entre el frontend y el backend. |
| **Sesión** | El registro de que una persona inició sesión, guardado de forma segura en el navegador. |
| **Rol** | El tipo de usuario: "usuario" (estudiante) o "admin" (administrador). |
| **Responsivo** | Que se adapta a cualquier tamaño de pantalla. |
| **Modal** | Una ventana emergente sobre la página. |
| **Toast** | Una notificación pequeña y temporal. |
| **Skeleton (esqueleto)** | Bloques grises que imitan el contenido mientras carga. |
| **Middleware** | Un guardia que revisa cada visita antes de mostrar la página. |
| **Prueba de punta a punta (E2E)** | Una prueba que usa un navegador real como lo haría una persona. |
