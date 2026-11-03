// Verifica que la versión de Node.js soporte el módulo integrado node:sqlite
const [major, minor] = process.versions.node.split('.').map(Number);
const ok = major > 22 || (major === 22 && minor >= 13);

if (!ok) {
  console.error(
    `\n  ✖ Este proyecto necesita Node.js 22.13 o superior (tienes ${process.version}).\n` +
    '    Descarga la versión LTS desde https://nodejs.org e intenta de nuevo.\n'
  );
  process.exit(1);
}
