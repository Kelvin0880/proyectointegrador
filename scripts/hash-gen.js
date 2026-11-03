// Genera el hash bcrypt de una contraseña.
// Uso: node scripts/hash-gen.js [contraseña]   (por defecto: admin123)
const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'admin123';
const hash = bcrypt.hashSync(password, 10);

console.log('Password:', password);
console.log('Generated hash:', hash);
console.log('Is valid:', bcrypt.compareSync(password, hash));
console.log('\nSQL para actualizar:');
console.log(`UPDATE usuarios SET password = '${hash}' WHERE matricula = 'superadmin';`);
