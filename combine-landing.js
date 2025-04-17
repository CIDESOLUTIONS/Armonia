
const fs = require('fs');
const path = require('path');

// Función para leer un archivo
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// Rutas de los archivos
const pageFilePath = path.join(__dirname, 'frontend', 'src', 'app', '(public)', 'page.tsx');
const footerContactFilePath = path.join(__dirname, 'frontend', 'src', 'app', '(public)', 'footer-contact.tsx');

// Leer los archivos
let pageContent = readFile(pageFilePath);
const footerContactContent = readFile(footerContactFilePath);

// Encontrar la última sección completa del archivo page.tsx
const lastSectionIndex = pageContent.lastIndexOf('<div className=');

// Si encontramos el índice, tomar todo hasta ese punto
if (lastSectionIndex !== -1) {
  // Encontrar el cierre del último div completo
  const lastFullSectionEnd = pageContent.indexOf('</div>', lastSectionIndex);
  if (lastFullSectionEnd !== -1) {
    // Cortar el contenido hasta el último div completo
    pageContent = pageContent.substring(0, lastFullSectionEnd + 6);
    
    // Añadir el contenido del footer y contacto
    const combinedContent = pageContent + '\n' + footerContactContent;
    
    // Guardar el archivo combinado
    fs.writeFileSync(pageFilePath, combinedContent, 'utf8');
    console.log('Archivo combinado exitosamente.');
  } else {
    console.error('No se pudo encontrar el cierre del último div.');
  }
} else {
  console.error('No se pudo encontrar un punto adecuado para combinar los archivos.');
}
