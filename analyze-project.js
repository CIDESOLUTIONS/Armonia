// Importaciones en el orden correcto
const path = require('path'); // Primero definimos path
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Luego usamos dotenv
const fs = require('fs').promises;
const { ManualPrismaClient } = require('./src/lib/manual-prisma-client.ts');

const PROJECT_ROOT = 'C:\\Users\\meciz\\Documents\\armonia\\frontend';
const EXCLUDED_DIRS = ['node_modules', '.next', 'dist', '.git', 'cypress/downloads', 'cypress/screenshots'];
const EXCLUDED_EXTENSIONS = ['.log', '.pem', '.exe'];

const prisma = new ManualPrismaClient('armonia');

async function analyzeDirectory(dirPath, basePath = '') {
  const result = {};
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.join(basePath, entry.name);
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRS.some(excluded => relativePath.includes(excluded))) {
          result[entry.name] = await analyzeDirectory(fullPath, relativePath);
        }
      } else if (!EXCLUDED_EXTENSIONS.includes(path.extname(entry.name))) {
        result[entry.name] = 'file';
      }
    }
  } catch (error) {
    console.error(`Error analizando ${dirPath}:`, error);
  }
  return result;
}

async function analyzePackageJson(dir) {
  const packagePath = path.join(dir, 'package.json');
  try {
    const content = await fs.readFile(packagePath, 'utf8');
    const packageJson = JSON.parse(content);
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const unused = await detectUnusedDependencies(dir, dependencies);
    return { ...packageJson, unusedDependencies: unused };
  } catch (error) {
    console.error(`Error leyendo package.json en ${dir}:`, error);
    return null;
  }
}

async function detectUnusedDependencies(dir, dependencies) {
  const unused = {};
  const files = await getAllFiles(dir, ['.ts', '.tsx', '.js']);
  const fileContents = await Promise.all(files.map(file => fs.readFile(file, 'utf8')));
  const combinedContent = fileContents.join('\n');

  for (const [dep] of Object.entries(dependencies)) {
    if (!combinedContent.includes(dep)) {
      unused[dep] = 'potentially unused';
    }
  }
  return unused;
}

async function getAllFiles(dir, extensions) {
  let results = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !EXCLUDED_DIRS.some(excluded => fullPath.includes(excluded))) {
      results = results.concat(await getAllFiles(fullPath, extensions));
    } else if (extensions.includes(path.extname(entry.name))) {
      results.push(fullPath);
    }
  }
  return results;
}

async function analyzeDatabase() {
  try {
    // Analizar tablas en el esquema 'armonia'
    const armoniaTables = await prisma.$queryRaw`
      SELECT table_name, 
             (SELECT json_agg(json_build_object(
               'column_name', column_name,
               'data_type', data_type,
               'character_maximum_length', character_maximum_length,
               'is_nullable', is_nullable
             ))
              FROM information_schema.columns
              WHERE table_name = t.table_name AND table_schema = 'armonia') as columns
      FROM information_schema.tables t
      WHERE table_schema = 'armonia' AND table_type = 'BASE TABLE'
    `;

    // Analizar esquemas tenant_*
    const tenantSchemas = await prisma.$queryRaw`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name LIKE 'tenant_%'
    `;
    const tenantTables = {};
    for (const schema of tenantSchemas) {
      const schemaName = schema.schema_name;
      const tenantPrisma = new ManualPrismaClient(schemaName);
      const tables = await tenantPrisma.$queryRawUnsafe(`
        SELECT table_name, 
               (SELECT json_agg(json_build_object(
                 'column_name', column_name,
                 'data_type', data_type,
                 'character_maximum_length', character_maximum_length,
                 'is_nullable', is_nullable
               ))
                FROM information_schema.columns
                WHERE table_name = t.table_name AND table_schema = '${schemaName}') as columns
        FROM information_schema.tables t
        WHERE table_schema = '${schemaName}' AND table_type = 'BASE TABLE'
      `);
      tenantTables[schemaName] = {};
      tables.forEach(row => {
        tenantTables[schemaName][row.table_name] = row.columns;
      });
      await tenantPrisma.$disconnect();
    }

    const groupedTables = {};
    armoniaTables.forEach(row => {
      groupedTables[row.table_name] = row.columns;
    });

    return { armonia: groupedTables, tenants: tenantTables };
  } catch (error) {
    console.error('Error al consultar la base de datos:', error);
    return { armonia: {}, tenants: {} };
  } finally {
    await prisma.$disconnect();
  }
}

async function analyzeProject() {
  console.log('Iniciando análisis del proyecto...');
  const analysis = {
    lastAnalyzed: new Date().toISOString(),
    projectRoot: PROJECT_ROOT,
    structure: {},
    packages: {},
    database: { tables: { armonia: {}, tenants: {} } },
    potentialCleanup: [],
    notes: [
      "Recuerda revisar los archivos de configuración y las dependencias no utilizadas.",
    ],
  };

  console.log('Analizando estructura de directorios...');
  analysis.structure.root = await analyzeDirectory(PROJECT_ROOT);

  console.log('Analizando package.json...');
  analysis.packages.root = await analyzePackageJson(PROJECT_ROOT);

  console.log('Analizando base de datos...');
  analysis.database.tables = await analyzeDatabase();

  console.log('Buscando código sobrante...');
  const allFiles = await getAllFiles(PROJECT_ROOT, ['.js', '.ts', '.tsx', '.sql']);
  allFiles.forEach(file => {
    const relativePath = path.relative(PROJECT_ROOT, file);
    if (
      relativePath.includes('migrations/V1_') ||
      relativePath.endsWith('123.js') ||
      relativePath.includes('backend/') && !relativePath.includes('server.ts')
    ) {
      analysis.potentialCleanup.push(relativePath);
    }
  });

  const outputPath = path.join(PROJECT_ROOT, 'project-analysis.json');
  await fs.writeFile(outputPath, JSON.stringify(analysis, null, 2), 'utf-8');
  console.log(`Análisis guardado en ${outputPath}`);
  return analysis;
}

analyzeProject()
  .then(() => console.log('Análisis completado'))
  .catch(error => console.error('Error en el análisis:', error));