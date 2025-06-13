// scripts/fix-lint-comprehensive.js
// Script para corrección integral de errores de lint

const fs = require('fs');
const path = require('path');

console.log('🔧 Iniciando corrección integral de errores de lint...');

// 1. Corregir archivos de pruebas con require() -> import
const testFileWithRequire = '/workspace/Armonia/src/__tests__/financial/billing-engine.test.ts';

if (fs.existsSync(testFileWithRequire)) {
  let content = fs.readFileSync(testFileWithRequire, 'utf8');
  
  // Reemplazar require() con import dinámico para mocks
  content = content.replace(
    /const { getPrisma } = require\('@\/lib\/prisma'\);/g, 
    "// Importación dinámica en lugar de require\nconst mockPrisma = () => require('@/lib/prisma').getPrisma();"
  );
  
  content = content.replace(
    /const mockPrisma = getPrisma\(\);/g,
    'const mockPrisma = mockPrisma();'
  );
  
  // Actualizar el patrón de mock para usar importación
  content = content.replace(
    /const { getPrisma } = require\('@\/lib\/prisma'\);\s*const mockPrisma = mockPrisma\(\);/g,
    'import type { getPrisma } from "@/lib/prisma";\n\n// Mock implementation\nconst mockPrismaClient = {\n  residentialComplex: { findUnique: jest.fn() },\n  property: { findMany: jest.fn() },\n  fee: { findMany: jest.fn() },\n  bill: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },\n  payment: { create: jest.fn() },\n  $transaction: jest.fn((callback) => callback({\n    bill: { create: jest.fn(), update: jest.fn() },\n    payment: { create: jest.fn() }\n  }))\n};'
  );
  
  fs.writeFileSync(testFileWithRequire, content);
  console.log('✅ Corregido billing-engine.test.ts');
}

// 2. Actualizar configuración ESLint para Jest
const eslintConfig = `/workspace/Armonia/eslint.config.mjs`;
if (fs.existsSync(eslintConfig)) {
  let content = fs.readFileSync(eslintConfig, 'utf8');
  
  // Agregar configuración para archivos Jest
  if (!content.includes('jest.config.js')) {
    content = content.replace(
      /export default \[/,
      `export default [
  // Jest configuration files
  {
    files: ["**/*.config.js", "**/jest.*.js", "**/__mocks__/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
        jest: "readonly",
        global: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly"
      }
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "no-undef": "off"
    }
  },`
    );
  }
  
  fs.writeFileSync(eslintConfig, content);
  console.log('✅ Actualizada configuración ESLint');
}

// 3. Limpiar variables no utilizadas en archivos específicos
const filesToClean = [
  '/workspace/Armonia/src/app/(admin)/page.tsx',
  '/workspace/Armonia/src/app/(public)/checkout/page.tsx',
  '/workspace/Armonia/src/app/(public)/login/page.tsx'
];

filesToClean.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remover imports no utilizados más comunes
    content = content.replace(/import\s+\{[^}]*,\s*useEffect\s*,?[^}]*\}\s+from\s+['"']react['"][;\n]/g, 
      (match) => match.replace(/,?\s*useEffect\s*,?/, '').replace(/\{\s*,/, '{').replace(/,\s*\}/, '}'));
    
    // Remover declaraciones de variables no utilizadas
    content = content.replace(/^\s*const\s+_\w+.*?;\s*$/gm, '');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Limpiado ${path.basename(filePath)}`);
  }
});

// 4. Crear archivo .eslintignore alternativo en eslint.config.mjs
const eslintConfigPath = '/workspace/Armonia/eslint.config.mjs';
if (fs.existsSync(eslintConfigPath)) {
  let content = fs.readFileSync(eslintConfigPath, 'utf8');
  
  if (!content.includes('ignores:')) {
    content = content.replace(
      /export default \[/,
      `export default [
  {
    ignores: [
      "**/node_modules/**", 
      "**/dist/**", 
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/coverage/**",
      "**/*.d.ts",
      "**/public/**"
    ]
  },`
    );
    
    fs.writeFileSync(eslintConfigPath, content);
    console.log('✅ Agregadas reglas de ignore a ESLint config');
  }
}

console.log('🎉 Corrección de lint completada');
