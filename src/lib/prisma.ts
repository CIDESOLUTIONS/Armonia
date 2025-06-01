// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { ServerLogger } from './logging/server-logger';

// Definir tipo para PrismaClient global
declare global {
  var prisma: PrismaClient | undefined;
  var prismaClientsMap: Map<string, PrismaClient> | undefined;
}

// Evitar instancias múltiples de Prisma Client en desarrollo por HMR
if (!global.prisma) {
  global.prisma = new PrismaClient();
  ServerLogger.info('Prisma Client global inicializado');
}

// Inicializar el mapa de clientes si no existe
if (!global.prismaClientsMap) {
  global.prismaClientsMap = new Map<string, PrismaClient>();
  ServerLogger.info('Mapa de clientes Prisma inicializado');
}

// Asegurar que el mapa esté disponible para TypeScript
const prismaClientsMap = global.prismaClientsMap;

// Cliente global de Prisma
export const prisma = global.prisma;

/**
 * Obtiene una instancia de PrismaClient para un schema específico
 * 
 * @param schema Nombre del schema de la base de datos
 * @returns Instancia de PrismaClient configurada para el schema
 */
export function getPrisma(schema?: string): PrismaClient {
  // Si no se especifica schema, usar cliente global
  if (!schema) {
    return prisma!;
  }
  
  try {
    // Si ya existe un cliente para este schema, devolverlo
    if (prismaClientsMap.has(schema)) {
      return prismaClientsMap.get(schema)!;
    }
    
    // Crear una nueva instancia para este schema
    const clientForSchema = new PrismaClient({
      datasources: {
        db: {
          url: `${process.env.DATABASE_URL}?schema=${schema}`
        }
      }
    });
    
    // Almacenar en el mapa para su reutilización
    prismaClientsMap.set(schema, clientForSchema);
    ServerLogger.info(`Nuevo cliente Prisma creado para schema: ${schema}`);
    
    return clientForSchema;
  } catch (error) {
    ServerLogger.error(`Error al crear cliente Prisma para schema ${schema}:`, error);
    // En caso de error, devolver el cliente global como fallback
    return prisma!;
  }
}

/**
 * Establece el schema de tenant para el cliente Prisma
 * 
 * @param schema Nombre del schema del tenant
 */
export function setTenantSchema(schema: string): void {
  if (!schema) {
    throw new Error('El nombre del schema es requerido');
  }
  
  try {
    // Verificar que el schema exista o crearlo si es necesario
    ensureSchemaExists(schema);
    
    // Obtener o crear cliente para este schema
    getPrisma(schema);
    
    ServerLogger.info(`Schema de tenant establecido: ${schema}`);
  } catch (error) {
    ServerLogger.error(`Error al establecer schema de tenant ${schema}:`, error);
    throw error;
  }
}

/**
 * Asegura que un schema exista en la base de datos
 * 
 * @param schema Nombre del schema a verificar/crear
 */
async function ensureSchemaExists(schema: string): Promise<void> {
  try {
    // Verificar si el schema ya existe
    const schemaExists = await prisma!.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.schemata 
        WHERE schema_name = ${schema}
      )
    ` as { exists: boolean }[];
    
    // Si no existe, crearlo
    if (!schemaExists[0].exists) {
      await prisma!.$executeRaw`CREATE SCHEMA IF NOT EXISTS ${schema}`;
      ServerLogger.info(`Schema creado: ${schema}`);
    }
  } catch (error) {
    ServerLogger.error(`Error al verificar/crear schema ${schema}:`, error);
    throw error;
  }
}

/**
 * Limpia los clientes Prisma cuando ya no son necesarios
 * Útil para liberar recursos después de una operación
 */
export async function cleanupPrismaClients(): Promise<void> {
  try {
    // Desconectar los clientes por schema
    for (const [schema, client] of prismaClientsMap.entries()) {
      await client.$disconnect();
      ServerLogger.info(`Cliente Prisma desconectado para schema: ${schema}`);
    }
    
    // Limpiar el mapa
    prismaClientsMap.clear();
    ServerLogger.info('Mapa de clientes Prisma limpiado');
  } catch (error) {
    ServerLogger.error('Error al limpiar clientes Prisma:', error);
  }
}
