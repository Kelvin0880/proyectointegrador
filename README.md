# Sistema de Inventario UNPHU

Aplicación web para el préstamo de equipos de los departamentos de la UNPHU. Los estudiantes piden equipos y los administradores aprueban, rechazan, registran devoluciones, gestionan el inventario y generan informes en PDF.

Este archivo es un tutorial para que cualquier persona pueda correr el proyecto en su computadora (Windows, Mac o Linux), aunque nunca haya programado. Síguelo en orden.

Documentación completa del proyecto (para la tesis):

- docs/PROYECTO.md: cómo funciona todo el proyecto en general.
- docs/FRONTEND.md: la parte visual.
- docs/BACKEND.md: el servidor y la base de datos.
- docs/screenshots/: capturas de todas las pantallas.

---

## Lo único que necesitas instalar: Node.js

No hace falta instalar MySQL ni ninguna base de datos. El proyecto usa SQLite, que ya viene dentro de Node.js, y la base de datos se crea sola la primera vez.

Necesitas Node.js versión 22.13 o más nueva.

### Paso 1. Ver si ya tienes Node.js

1. Abre una terminal (abajo se explica cómo abrirla en cada sistema).
2. Escribe esto y pulsa Enter:

   ```
   node -v
   ```

3. Mira lo que aparece:
   - Si dice algo como `v22.13.0`, `v22.14.0`, `v24.x.x` o un número mayor, ya lo tienes. Salta al Paso 3.
   - Si dice un número menor (por ejemplo `v18.x.x`, `v20.x.x` o `v22.10.0`), o dice que el comando no se reconoce, sigue con el Paso 2.

### Cómo abrir una terminal

- Windows: pulsa la tecla Windows, escribe `PowerShell` y ábrelo. También sirve "Símbolo del sistema" (cmd).
- Mac: pulsa Cmd + Espacio, escribe `Terminal` y pulsa Enter.
- Linux: pulsa Ctrl + Alt + T.

### Paso 2. Instalar Node.js

Página oficial de descarga (en español): https://nodejs.org/es/download

Descarga la versión que dice LTS (es la estable recomendada).

Enlaces directos, por si prefieres no buscar:

- Windows (instalador .msi, 64 bits): entra a https://nodejs.org/dist/latest-v22.x/ y descarga el archivo que termina en `-x64.msi` (por ejemplo `node-v22.xx.x-x64.msi`).
- Mac (instalador .pkg): entra a https://nodejs.org/dist/latest-v22.x/ y descarga el archivo que termina en `.pkg`.
- Linux: sigue las instrucciones de https://nodejs.org/es/download eligiendo tu distribución, o usa el instalador de paquetes de tu sistema (asegúrate de que la versión sea 22.13 o mayor).

Instalación en Windows y Mac:

1. Abre el archivo descargado.
2. Pulsa "Siguiente" (Next) en todas las pantallas y acepta la licencia. No hace falta cambiar nada.
3. Si en Windows te pregunta por instalar "herramientas para módulos nativos" (Tools for Native Modules), puedes dejarlo sin marcar.
4. Cuando termine, cierra la terminal que tenías abierta y abre una nueva (esto es importante, la terminal vieja no ve el Node recién instalado).
5. Comprueba con `node -v` que ahora aparece la versión 22.13 o mayor.

Node.js trae incluido `npm`, la herramienta que usaremos para instalar y arrancar el proyecto. Puedes comprobarlo con `npm -v`.

---

## Paso 3. Descargar el proyecto

Repositorio: https://github.com/Kelvin0880/proyectointegrador

Tienes dos opciones. Usa la que te resulte más fácil.

### Opción A: descargar el ZIP (la más fácil, no necesitas Git)

1. Descarga este archivo: https://github.com/Kelvin0880/proyectointegrador/archive/refs/heads/main.zip
   (o entra al repositorio, pulsa el botón verde "Code" y luego "Download ZIP").
2. Busca el archivo descargado (normalmente en la carpeta Descargas).
3. Descomprímelo:
   - Windows: clic derecho sobre el ZIP, "Extraer todo", "Extraer".
   - Mac: doble clic sobre el ZIP.
4. Te quedará una carpeta llamada `proyectointegrador-main`. Ese es el proyecto.

Consejo: no lo dejes dentro del ZIP ni en una carpeta de OneDrive o Google Drive sincronizada; a veces eso da problemas. La carpeta Descargas, Documentos o el Escritorio funcionan bien.

### Opción B: clonar con Git (si ya usas Git)

Si no tienes Git y lo quieres: https://git-scm.com/downloads

```
git clone https://github.com/Kelvin0880/proyectointegrador.git
```

Esto crea una carpeta llamada `proyectointegrador`.

---

## Paso 4. Abrir la terminal dentro de la carpeta del proyecto

Los comandos tienen que ejecutarse dentro de la carpeta del proyecto (la que tiene el archivo `package.json`).

Forma fácil:

- Windows: abre la carpeta del proyecto en el Explorador de archivos, haz clic en la barra de direcciones de arriba, escribe `powershell` y pulsa Enter. Se abre una terminal ya ubicada en esa carpeta. (En Windows 11 también puedes hacer clic derecho dentro de la carpeta y elegir "Abrir en Terminal".)
- Mac: abre Terminal, escribe `cd ` (con un espacio al final), arrastra la carpeta del proyecto a la ventana de la terminal y pulsa Enter.
- Linux: clic derecho dentro de la carpeta y "Abrir en una terminal".

Forma con comandos (ejemplo si está en Descargas):

```
cd Downloads/proyectointegrador-main
```

Para comprobar que estás en el lugar correcto, escribe `dir` (Windows) o `ls` (Mac y Linux). Debes ver `package.json`, `src`, `database` y otros.

Si usas Visual Studio Code: menú Archivo, Abrir carpeta, elige la carpeta del proyecto y luego menú Terminal, Nueva terminal.

---

## Paso 5. Instalar las dependencias (solo la primera vez)

En la terminal, dentro de la carpeta del proyecto, escribe:

```
npm install
```

Espera a que termine (puede tardar de 1 a 5 minutos según tu internet). Descarga todas las bibliotecas que usa el proyecto en una carpeta llamada `node_modules`.

Es normal ver mensajes de "warn" o avisos de "vulnerabilities"; no impiden que funcione. Solo importa que no termine con un "ERR!".

Esto solo se hace una vez. No hay que repetirlo cada vez que quieras abrir el sistema.

---

## Paso 6. Arrancar el sistema

```
npm run dev
```

Espera unos segundos hasta que aparezca algo como:

```
▲ Next.js 15.2.3
- Local:        http://localhost:3000
✓ Ready
```

La primera vez también verás un mensaje diciendo que la base de datos se creó con los datos iniciales. Es normal.

Deja esa terminal abierta mientras uses el sistema. Si la cierras, el sistema se apaga.

---

## Paso 7. Abrir el sistema en el navegador

Abre Chrome, Edge o Firefox y entra a:

http://localhost:3000

La primera vez que abres cada página puede tardar unos segundos en cargar, porque se está preparando. Después va rápido.

### Cuentas para probar

| Tipo de cuenta | Matrícula (usuario) | Contraseña |
|---|---|---|
| Administrador | admin | admin123 |
| Administrador | superadmin | admin123 |

En la pantalla de inicio de sesión escribe solo la matrícula (por ejemplo `admin`), no el correo.

Para probar como estudiante, pulsa "Crear cuenta" y regístrate con cualquier matrícula inventada (por ejemplo `ab24-0001`) y una contraseña de al menos 6 caracteres. Las cuentas nuevas siempre son de estudiante. Un administrador puede convertirlas en administrador desde la sección Usuarios.

### Prueba rápida sugerida

1. Crea una cuenta de estudiante y pide un equipo en "Nueva solicitud".
2. Cierra sesión (menú de arriba a la derecha) y entra como `admin`.
3. Aprueba la solicitud desde el inicio o desde "Solicitudes" y mira cómo baja la cantidad disponible en "Inventario".
4. Registra la devolución y mira cómo vuelve a subir.
5. Ve a "Informes" y descarga el PDF.

---

## Paso 8. Apagar el sistema

En la terminal donde está corriendo, pulsa Ctrl + C. Si pregunta "¿Desea terminar el trabajo por lotes (S/N)?", escribe `S` y pulsa Enter.

Los datos no se pierden al apagar. Quedan guardados en el archivo `database/unphu.db`.

## Volver a abrirlo otro día

Solo tienes que repetir el Paso 4 (abrir la terminal en la carpeta) y el Paso 6 (`npm run dev`), y entrar a http://localhost:3000. No hace falta volver a hacer `npm install`.

---

## Comandos disponibles

Todos se ejecutan en la terminal, dentro de la carpeta del proyecto.

| Comando | Qué hace |
|---|---|
| `npm install` | Instala las dependencias (solo la primera vez, o si cambia `package.json`) |
| `npm run dev` | Arranca el sistema en http://localhost:3000 |
| `npm run db:reset` | Borra todos los datos y deja la base de datos como nueva, con los datos iniciales. Apaga antes el sistema con Ctrl + C |
| `npm run build` | Prepara la versión optimizada (producción) |
| `npm start` | Arranca la versión optimizada (después de `npm run build`) |
| `npm test` | Ejecuta las pruebas automáticas de lógica, componentes y API (93 pruebas) |
| `npm run test:e2e` | Ejecuta las pruebas en un navegador real (36 pruebas) y actualiza las capturas en `docs/screenshots` |
| `npm run lint` | Revisa el código en busca de errores |
| `node scripts/hash-gen.js micontraseña` | Muestra la versión protegida (hash) de una contraseña |

### Para ejecutar las pruebas en el navegador (opcional)

La primera vez hay que descargar el navegador de pruebas:

```
npx playwright install chromium
```

Luego, con el sistema apagado (Ctrl + C en la terminal de `npm run dev`):

```
npm run test:e2e
```

Las pruebas usan su propia base de datos (`database/e2e.db`), así que no tocan tus datos.

---

## Configuración (opcional)

El proyecto funciona sin configurar nada. Si quieres cambiar algo, copia el archivo `.env.example`, renombra la copia como `.env` y edítala:

- `NEXTAUTH_SECRET`: clave secreta de las sesiones. Si vas a publicar el sistema en un servidor, cámbiala por un texto largo y aleatorio.
- `NEXTAUTH_URL`: dirección de la aplicación (por defecto http://localhost:3000).
- `DATABASE_FILE`: dónde se guarda la base de datos (por defecto `database/unphu.db`).

---

## Problemas comunes y cómo resolverlos

### "node" o "npm" no se reconoce como un comando

Node.js no está instalado o la terminal se abrió antes de instalarlo. Instálalo (Paso 2), cierra todas las terminales y abre una nueva. En Windows, si sigue fallando, reinicia la computadora.

### "Este proyecto necesita Node.js 22.13 o superior"

Tu versión de Node.js es antigua. Instala la versión LTS desde https://nodejs.org/es/download y abre una terminal nueva. Comprueba con `node -v`.

Si usas nvm (administrador de versiones de Node), ejecuta `nvm install 22` y luego `nvm use 22`.

### En Windows: "la ejecución de scripts está deshabilitada en este sistema" (npm.ps1)

Es una protección de PowerShell. Tienes dos soluciones:

- Usar "Símbolo del sistema" (cmd) en lugar de PowerShell, o
- en PowerShell, ejecutar una vez este comando y responder `S`:

  ```
  Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
  ```

### "npm ERR!" al hacer npm install

- Revisa que tengas internet.
- Revisa que estés dentro de la carpeta del proyecto (debe tener `package.json`).
- Borra la carpeta `node_modules` (si existe) y vuelve a ejecutar `npm install`.
- Si estás en una red de la universidad o empresa que bloquea descargas, prueba con otra red.

### "Port 3000 is in use" o el sistema abre en el puerto 3001

Ya hay algo usando el puerto 3000, normalmente otra terminal con el sistema abierto. Ciérrala con Ctrl + C, o simplemente entra a la dirección que aparece en la terminal (por ejemplo http://localhost:3001). También puedes elegir otro puerto:

```
npm run dev -- -p 3001
```

### Aparece "ExperimentalWarning: SQLite is an experimental feature"

Es solo un aviso de Node.js. No afecta en nada al funcionamiento.

### La página dice "Internal Server Error" o se queda en blanco

1. Apaga el sistema con Ctrl + C.
2. Borra la carpeta `.next` dentro del proyecto (es una carpeta temporal; se vuelve a crear sola).
3. Vuelve a ejecutar `npm run dev`.

### Olvidé la contraseña o quiero empezar con los datos limpios

Apaga el sistema y ejecuta:

```
npm run db:reset
```

La base de datos vuelve al estado inicial y puedes entrar otra vez con `admin` / `admin123`. Ojo: se borran todas las cuentas, solicitudes y cambios que hayas hecho.

### "database is locked"

Hay otro proceso usando la base de datos (por ejemplo dos terminales con `npm run dev`, o `npm run db:reset` con el sistema encendido). Cierra todas las terminales del proyecto y vuelve a arrancar solo una.

### Quiero entrar desde mi celular

El celular debe estar conectado a la misma red wifi que la computadora. En la terminal, al arrancar, aparece una línea "Network" con una dirección como `http://192.168.1.11:3000`. Escríbela en el navegador del celular. Si no carga, puede que el firewall de la computadora lo esté bloqueando.

---

## Tecnologías

Next.js 15, React 19, Tailwind CSS 4, NextAuth, SQLite (incluido en Node.js), bcryptjs, Lucide (íconos), Headless UI, React PDF, Vitest y Playwright. La explicación de cada una está en docs/PROYECTO.md.

## Estructura de carpetas

```
database/      Esquema de la base de datos, datos iniciales y el archivo unphu.db
docs/          Documentación y capturas de pantalla
public/        Logo de la UNPHU
scripts/       Reiniciar la base de datos, verificar Node, generar hashes
src/app/       Pantallas y rutas de la API
src/components Piezas visuales reutilizables
src/lib/       Base de datos, validaciones, sesión y utilidades
tests/         Pruebas automáticas
```
