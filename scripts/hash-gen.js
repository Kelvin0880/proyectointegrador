const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'admin123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  
  console.log('Password:', password);
  console.log('Generated hash:', hash);
  

  const isValid = await bcrypt.compare(password, hash);
  console.log('Is valid:', isValid);
  
  console.log('\nSQL para actualizar:');
  console.log(`UPDATE usuarios SET password = '${hash}' WHERE matricula = 'superadmin';`);
}

generateHash();