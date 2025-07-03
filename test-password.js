const bcrypt = require('bcrypt');

const password = 'Admin123';
const hash = '$2b$10$CQKh1uJAyCwTZyDo/q9qm.uK6UTvOJ0iIHJNspzk7Xg6zIAWg3n3u';

console.log('Probando validación de contraseña...');
console.log('Contraseña:', password);
console.log('Hash:', hash);

bcrypt.compare(password, hash, (err, result) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Resultado:', result);
  }
});

// También probar de forma síncrona
try {
  const syncResult = bcrypt.compareSync(password, hash);
  console.log('Resultado síncrono:', syncResult);
} catch (error) {
  console.error('Error síncrono:', error);
}

