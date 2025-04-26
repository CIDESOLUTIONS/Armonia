// Script de análisis completo para el proyecto Armonía
// Guarda un registro detallado del estado actual del proyecto para referencia futura
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const fs = require('fs').promises;
const { execSync } = require('child_process');
const os = require('os');

// Configuración del proyecto
const PROJECT_ROOT = 'C:\\Users\\meciz\\Documents\\armonia';
const FRONTEND_ROOT = path.join(PROJECT_ROOT, 'frontend');
const DOCS_ROOT = 'C:\\Users\\meciz\\Documents\\Desarrollos\\Armonia_Info';
const STRUCTURE_DOCS = 'C:\\Users\\meciz\\OneDrive\\Escritorio\\Desarrollos\\Armonia';
const SCRIPTS_ROOT = path.join(PROJECT_ROOT, 'scripts');
const GITHUB_REPO = 'https://github.com/CIDESOLUTIONS/Armonia.git';

// Datos de conexión a la base de datos
// Nota: Estos datos se tomarán del archivo .env en producción
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'armonia',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
};

// Exclusiones para el análisis de directorios
const EXCLUDED_DIRS = [
  'node_modules', '.next', 'dist', '.git', 
  'cypress/downloads', 'cypress/screenshots', 
  'cypress/videos', 'coverage'
];
const EXCLUDED_EXTENSIONS = ['.log', '.pem', '.exe', '.mp4', '.png', '.jpg', '.jpeg', '.gif'];

// Clase para manejar la conexión a PostgreSQL
class DatabaseAnalyzer {
  constructor(config) {
    this.config = config;
    // Importamos pg solo si está disponible
    try {
      this.pg = require('pg');
    } catch (error) {
      console.warn('Módulo pg no encontrado. Instálalo con: npm install pg');
      this.pg = null;
    }
  }

  async connect() {
    if (!this.pg) return null;
    
    try {
      const { Pool } = this.pg;
      this.pool = new Pool(this.config);
      const client = await this.pool.connect();
      console.log('Conexión a la base de datos establecida');
      return client;
    } catch (error) {
      console.error('Error al conectar a la base de datos:', error.message);
      return null;
    }
  }

  async disconnect() {
    if (this.pool) {
      await this.pool.end();
      console.log('Conexión a la base de datos cerrada');
    }
  }

  async queryDatabase(client, query, params = []) {
    if (!client) return [];
    
    try {
      const result = await client.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error al ejecutar consulta:', error.message);
      return [];
    }
  }

  async analyzeDatabase() {
    const client = await this.connect();
    if (!client) {
      return { 
        error: "No se pudo conectar a la base de datos. Verifica la instalación de pg y las credenciales.",
        schemas: [],
        armonia: {},
        tenants: {}
      };
    }

    try {
      // Obtener todos los esquemas
      const schemas = await this.queryDatabase(
        client, 
        "SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')"
      );
      
      // Analizar esquema armonia
      const armoniaTables = await this.analyzeSchema(client, 'armonia');
      
      // Analizar esquemas tenant_*
      const tenantSchemas = schemas
        .filter(s => s.schema_name.startsWith('tenant_'))
        .map(s => s.schema_name);
      
      const tenants = {};
      for (const schema of tenantSchemas) {
        tenants[schema] = await this.analyzeSchema(client, schema);
      }

      return {
        schemas: schemas.map(s => s.schema_name),
        armonia: armoniaTables,
        tenants
      };
    } catch (error) {
      console.error('Error al analizar la base de datos:', error);
      return { error: error.message, schemas: [], armonia: {}, tenants: {} };
    } finally {
      client.release();
      await this.disconnect();
    }
  }

  async analyzeSchema(client, schemaName) {
    // Obtener todas las tablas del esquema
    const tables = await this.queryDatabase(
      client,
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = $1 AND table_type = 'BASE TABLE'`,
      [schemaName]
    );

    const result = {};
    for (const table of tables) {
      const tableName = table.table_name;
      
      // Obtener columnas
      const columns = await this.queryDatabase(
        client,
        `SELECT column_name, data_type, character_maximum_length, is_nullable
         FROM information_schema.columns
         WHERE table_schema = $1 AND table_name = $2
         ORDER BY ordinal_position`,
        [schemaName, tableName]
      );
      
      // Obtener índices
      const indices = await this.queryDatabase(
        client,
        `SELECT indexname, indexdef
         FROM pg_indexes
         WHERE schemaname = $1 AND tablename = $2`,
        [schemaName, tableName]
      );
      
      // Obtener restricciones
      const constraints = await this.queryDatabase(
        client,
        `SELECT conname, contype, pg_get_constraintdef(c.oid)
         FROM pg_constraint c
         JOIN pg_namespace n ON n.oid = c.connamespace
         JOIN pg_class cl ON cl.oid = c.conrelid
         WHERE n.nspname = $1 AND cl.relname = $2`,
        [schemaName, tableName]
      );
      
      // Contar registros
      const countResult = await this.queryDatabase(
        client,
        `SELECT COUNT(*) FROM "${schemaName}"."${tableName}"`
      );
      
      const recordCount = countResult.length > 0 ? parseInt(countResult[0].count) : 0;
      
      result[tableName] = { columns, indices, constraints, recordCount };
    }
    
    return result;
  }
}

// Función para analizar la estructura de directorios
async function analyzeDirectory(dirPath, basePath = '', depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return { type: 'directory', note: `Profundidad máxima (${maxDepth}) alcanzada` };
  
  const result = { type: 'directory', children: {} };
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.join(basePath, entry.name);
      
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRS.some(excluded => relativePath.includes(excluded))) {
          result.children[entry.name] = await analyzeDirectory(
            fullPath, 
            relativePath, 
            depth + 1, 
            maxDepth
          );
        } else {
          result.children[entry.name] = { type: 'excluded-directory' };
        }
      } else {
        const ext = path.extname(entry.name);
        if (!EXCLUDED_EXTENSIONS.includes(ext)) {
          let fileInfo = { type: 'file', extension: ext };
          
          // Incluir tamaño si no es demasiado grande
          try {
            const stats = await fs.stat(fullPath);
            fileInfo.size = stats.size;
            fileInfo.modified = stats.mtime.toISOString();
            
            // Analizar ciertos archivos importantes
            if (
              entry.name === 'package.json' || 
              entry.name === '.env' ||
              entry.name.endsWith('.sql') ||
              entry.name === 'next.config.js' ||
              entry.name === 'tsconfig.json'
            ) {
              if (stats.size < 1024 * 500) { // Solo archivos menores a 500KB
                const content = await fs.readFile(fullPath, 'utf8');
                if (entry.name === 'package.json') {
                  try {
                    const packageInfo = JSON.parse(content);
                    fileInfo.content = {
                      name: packageInfo.name,
                      version: packageInfo.version,
                      dependencies: Object.keys(packageInfo.dependencies || {}).length,
                      devDependencies: Object.keys(packageInfo.devDependencies || {}).length,
                      scripts: Object.keys(packageInfo.scripts || {})
                    };
                  } catch (e) {
                    fileInfo.error = 'Error parsing JSON';
                  }
                } else {
                  // Para otros archivos, solo incluimos un fragmento
                  fileInfo.preview = content.slice(0, 500) + (content.length > 500 ? '...' : '');
                }
              }
            }
          } catch (statError) {
            fileInfo.error = `Error accediendo al archivo: ${statError.message}`;
          }
          
          result.children[entry.name] = fileInfo;
        }
      }
    }
  } catch (error) {
    return { 
      type: 'directory', 
      error: `Error analizando ${dirPath}: ${error.message}`,
      path: dirPath
    };
  }
  return result;
}

// Función para analizar los scripts en el proyecto
async function analyzeScripts() {
  const result = {
    availableScripts: [],
    categorizedScripts: {
      database: [],
      testing: [],
      deployment: [],
      maintenance: [],
      other: []
    }
  };
  
  try {
    if (!await pathExists(SCRIPTS_ROOT)) {
      return { error: `Directorio de scripts no encontrado: ${SCRIPTS_ROOT}` };
    }
    
    const entries = await fs.readdir(SCRIPTS_ROOT, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        const script = entry.name;
        result.availableScripts.push(script);
        
        // Categorizar por nombre/propósito
        if (script.includes('database') || script.includes('db') || script.includes('.sql')) {
          result.categorizedScripts.database.push(script);
        } else if (script.includes('test') || script.includes('cypress')) {
          result.categorizedScripts.testing.push(script);
        } else if (script.includes('deploy') || script.includes('production')) {
          result.categorizedScripts.deployment.push(script);
        } else if (script.includes('clean') || script.includes('reset') || script.includes('fix')) {
          result.categorizedScripts.maintenance.push(script);
        } else {
          result.categorizedScripts.other.push(script);
        }
      }
    }
  } catch (error) {
    result.error = `Error analizando scripts: ${error.message}`;
  }
  
  return result;
}

// Función para analizar proyecto NextJS
async function analyzeNextJSProject() {
  const result = { components: {}, pages: {}, api: {} };
  
  try {
    // Analizar componentes
    const componentsPath = path.join(FRONTEND_ROOT, 'components');
    if (await pathExists(componentsPath)) {
      const components = await listFilesRecursively(componentsPath, ['.jsx', '.tsx']);
      result.components.count = components.length;
      result.components.list = components.map(file => path.relative(FRONTEND_ROOT, file));
    }
    
    // Analizar páginas
    const pagesPath = path.join(FRONTEND_ROOT, 'pages');
    if (await pathExists(pagesPath)) {
      const pages = await listFilesRecursively(pagesPath, ['.jsx', '.tsx', '.js', '.ts']);
      result.pages.count = pages.length;
      result.pages.list = pages.map(file => path.relative(FRONTEND_ROOT, file));
      
      // Analizar rutas API
      const apiPages = pages.filter(file => file.includes('pages/api/'));
      result.api.count = apiPages.length;
      result.api.list = apiPages.map(file => path.relative(FRONTEND_ROOT, file));
    }
    
    // Analizar app directory (Next.js 13+)
    const appPath = path.join(FRONTEND_ROOT, 'app');
    if (await pathExists(appPath)) {
      const appFiles = await listFilesRecursively(appPath, ['.jsx', '.tsx', '.js', '.ts']);
      result.app = {
        count: appFiles.length,
        list: appFiles.map(file => path.relative(FRONTEND_ROOT, file))
      };
    }
    
    // Analizar configuración de Next.js
    const nextConfigPath = path.join(FRONTEND_ROOT, 'next.config.js');
    if (await pathExists(nextConfigPath)) {
      const configContent = await fs.readFile(nextConfigPath, 'utf8');
      result.config = {
        path: nextConfigPath,
        preview: configContent.slice(0, 500) + (configContent.length > 500 ? '...' : '')
      };
    }
  } catch (error) {
    result.error = `Error analizando proyecto Next.js: ${error.message}`;
  }
  
  return result;
}

// Función para revisar la instalación de dependencias
async function checkDependenciesInstallation() {
  const result = { status: 'unknown', nodeModules: false, packageLock: false };
  
  try {
    // Verificar si node_modules existe
    const nodeModulesPath = path.join(PROJECT_ROOT, 'node_modules');
    result.nodeModules = await pathExists(nodeModulesPath);
    
    // Verificar si package-lock.json existe
    const packageLockPath = path.join(PROJECT_ROOT, 'package-lock.json');
    result.packageLock = await pathExists(packageLockPath);
    
    // Verificar si yarn.lock existe
    const yarnLockPath = path.join(PROJECT_ROOT, 'yarn.lock');
    result.yarnLock = await pathExists(yarnLockPath);
    
    if (result.nodeModules && (result.packageLock || result.yarnLock)) {
      result.status = 'installed';
    } else if (!result.nodeModules && (result.packageLock || result.yarnLock)) {
      result.status = 'dependencies-missing';
    } else if (!result.nodeModules && !result.packageLock && !result.yarnLock) {
      result.status = 'never-installed';
    }
  } catch (error) {
    result.error = `Error verificando instalación de dependencias: ${error.message}`;
  }
  
  return result;
}

// Función para analizar el .env y variables de configuración
async function analyzeEnvironmentConfig() {
  const result = { exists: false, variables: [] };
  
  try {
    const envPath = path.join(PROJECT_ROOT, '.env');
    if (await pathExists(envPath)) {
      result.exists = true;
      const envContent = await fs.readFile(envPath, 'utf8');
      
      // Extraer variables sin mostrar valores sensibles
      const lines = envContent.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const match = trimmedLine.match(/^([^=]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            // Ocultar valores potencialmente sensibles
            let value = match[2];
            if (
              key.includes('KEY') || 
              key.includes('SECRET') || 
              key.includes('PASSWORD') || 
              key.includes('TOKEN')
            ) {
              value = '************';
            }
            result.variables.push({ key, value: value.length > 0 ? '[configurado]' : '[vacío]' });
          }
        }
      }
    }
  } catch (error) {
    result.error = `Error analizando configuración de ambiente: ${error.message}`;
  }
  
  return result;
}

// Función para analizar el estado del repositorio Git
async function analyzeGitStatus() {
  const result = { initialized: false };
  
  try {
    const gitPath = path.join(PROJECT_ROOT, '.git');
    const isGitRepo = await pathExists(gitPath);
    result.initialized = isGitRepo;
    
    if (isGitRepo) {
      try {
        // Obtener commit actual
        result.currentCommit = execSync('git -C ' + PROJECT_ROOT + ' rev-parse HEAD').toString().trim();
        result.currentBranch = execSync('git -C ' + PROJECT_ROOT + ' branch --show-current').toString().trim();
        
        // Verificar si hay cambios sin commitear
        const status = execSync('git -C ' + PROJECT_ROOT + ' status --porcelain').toString();
        result.hasUncommittedChanges = status.length > 0;
        
        // Obtener origen remoto
        const remoteOutput = execSync('git -C ' + PROJECT_ROOT + ' remote -v').toString();
        const remoteMatch = remoteOutput.match(/origin\s+([^\s]+)/);
        result.remoteOrigin = remoteMatch ? remoteMatch[1] : 'No remote found';
        
        // Obtener últimos 5 commits
        const gitLog = execSync('git -C ' + PROJECT_ROOT + ' log -5 --pretty=format:"%h|%an|%ad|%s"').toString();
        result.recentCommits = gitLog.split('\n').map(line => {
          const [hash, author, date, message] = line.split('|');
          return { hash, author, date, message };
        });
      } catch (execError) {
        result.error = `Error ejecutando comandos Git: ${execError.message}`;
      }
    }
  } catch (error) {
    result.error = `Error analizando estado de Git: ${error.message}`;
  }
  
  return result;
}

// Función para analizar package.json y dependencias
async function analyzePackageJson() {
  const result = { exists: false };
  
  try {
    const packagePath = path.join(PROJECT_ROOT, 'package.json');
    if (await pathExists(packagePath)) {
      result.exists = true;
      const content = await fs.readFile(packagePath, 'utf8');
      
      try {
        const packageJson = JSON.parse(content);
        result.name = packageJson.name;
        result.version = packageJson.version;
        result.private = packageJson.private;
        result.scripts = packageJson.scripts || {};
        
        if (packageJson.dependencies) {
          result.dependencies = Object.entries(packageJson.dependencies).map(([name, version]) => ({
            name, version
          }));
        }
        
        if (packageJson.devDependencies) {
          result.devDependencies = Object.entries(packageJson.devDependencies).map(([name, version]) => ({
            name, version
          }));
        }
        
        // Lista de principales frameworks/bibliotecas
        const mainDeps = [
          'react', 'next', 'express', 'prisma', 'tailwindcss', 
          '@prisma/client', 'typescript', 'postgres'
        ];
        
        result.mainTechnologies = {};
        for (const dep of mainDeps) {
          if (packageJson.dependencies && packageJson.dependencies[dep]) {
            result.mainTechnologies[dep] = packageJson.dependencies[dep];
          } else if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
            result.mainTechnologies[dep] = packageJson.devDependencies[dep];
          }
        }
      } catch (jsonError) {
        result.error = `Error analizando package.json: ${jsonError.message}`;
      }
    }
  } catch (error) {
    result.error = `Error leyendo package.json: ${error.message}`;
  }
  
  return result;
}

// Funciones auxiliares
async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

async function listFilesRecursively(dir, extensions = []) {
  let results = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !EXCLUDED_DIRS.some(excluded => fullPath.includes(excluded))) {
        results = results.concat(await listFilesRecursively(fullPath, extensions));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.length === 0 || extensions.includes(ext)) {
          results.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error listando archivos en ${dir}:`, error);
  }
  
  return results;
}

// Función principal
async function analyzeProject() {
  console.log('Iniciando análisis completo del proyecto Armonía...');
  
  // Información del sistema
  const systemInfo = {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    userInfo: os.userInfo().username,
    timestamp: new Date().toISOString()
  };
  
  // Evaluar si todas las dependencias están instaladas
  let missingDependencies = [];
  try {
    require('pg');
  } catch (error) {
    missingDependencies.push('pg');
  }
  
  const analysis = {
    metadata: {
      projectName: 'Armonía',
      analyzedAt: new Date().toISOString(),
      systemInfo,
      missingDependencies
    },
    projectRoot: PROJECT_ROOT,
    frontendRoot: FRONTEND_ROOT,
    docsRoot: DOCS_ROOT,
    structureDocsRoot: STRUCTURE_DOCS,
    githubRepo: GITHUB_REPO
  };
  
  console.log('Analizando estructura de archivos...');
  analysis.structure = await analyzeDirectory(PROJECT_ROOT);
  
  console.log('Analizando configuración de ambiente...');
  analysis.environment = await analyzeEnvironmentConfig();
  
  console.log('Analizando package.json...');
  analysis.packageJson = await analyzePackageJson();
  
  console.log('Verificando instalación de dependencias...');
  analysis.dependencies = await checkDependenciesInstallation();
  
  console.log('Analizando proyecto Next.js...');
  analysis.nextjs = await analyzeNextJSProject();
  
  console.log('Analizando scripts disponibles...');
  analysis.scripts = await analyzeScripts();
  
  console.log('Analizando estado del repositorio Git...');
  analysis.git = await analyzeGitStatus();
  
  console.log('Analizando base de datos...');
  const dbAnalyzer = new DatabaseAnalyzer(DB_CONFIG);
  analysis.database = await dbAnalyzer.analyzeDatabase();
  
  // Recomendaciones basadas en el análisis
  analysis.recommendations = [];
  
  if (analysis.dependencies.status !== 'installed') {
    analysis.recommendations.push({
      priority: 'alta',
      message: 'Las dependencias no están instaladas. Ejecuta "npm install" o "yarn" en el directorio del proyecto.'
    });
  }
  
  if (analysis.database.error) {
    analysis.recommendations.push({
      priority: 'alta',
      message: `Problema con la base de datos: ${analysis.database.error}`
    });
  }
  
  if (analysis.git.hasUncommittedChanges) {
    analysis.recommendations.push({
      priority: 'media',
      message: 'Hay cambios sin commitear en el repositorio Git.'
    });
  }
  
  // Estado general del proyecto
  analysis.projectStatus = {
    frontend: analysis.structure && analysis.nextjs && !analysis.nextjs.error ? 'OK' : 'Con problemas',
    backend: analysis.database && !analysis.database.error ? 'OK' : 'Con problemas',
    environment: analysis.environment && analysis.environment.exists ? 'OK' : 'Falta configuración',
    git: analysis.git && analysis.git.initialized ? 'OK' : 'No inicializado'
  };
  
  // Guardar análisis
  const outputPath = path.join(PROJECT_ROOT, 'armonia-analysis.json');
  await fs.writeFile(outputPath, JSON.stringify(analysis, null, 2), 'utf-8');
  console.log(`Análisis guardado en ${outputPath}`);
  
  // También guardar una versión en la carpeta de trabajo
  const workingDir = process.cwd();
  const workingDirOutputPath = path.join(workingDir, 'armonia-analysis.json');
  await fs.writeFile(workingDirOutputPath, JSON.stringify(analysis, null, 2), 'utf-8');
  console.log(`Copia del análisis guardada en ${workingDirOutputPath}`);
  
  return {
    success: true,
    outputPath,
    workingDirOutputPath,
    projectStatus: analysis.projectStatus,
    recommendations: analysis.recommendations
  };
}

// Si se ejecuta directamente
if (require.main === module) {
  analyzeProject()
    .then(result => {
      console.log('\nAnálisis completado con éxito!');
      console.log('Estado del proyecto:');
      console.table(result.projectStatus);
      
      if (result.recommendations.length > 0) {
        console.log('\nRecomendaciones:');
        result.recommendations.forEach((rec, i) => {
          console.log(`${i+1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
        });
      }
      
      console.log(`\nPara iniciar un chat con este análisis, sube el archivo: ${result.workingDirOutputPath}`);
    })
    .catch(error => {
      console.error('Error al completar el análisis:', error);
      process.exit(1);
    });
}

module.exports = { analyzeProject };