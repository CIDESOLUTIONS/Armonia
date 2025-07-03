import { Pool } from 'pg';
import { ServerLogger } from './logging/server-logger';

let poolInstance: Pool | null = null;

/**
 * Obtiene una instancia de Pool para conexiones a PostgreSQL
 */
export function getPool(): Pool {
  if (!poolInstance) {
    ServerLogger.info('Creando nueva instancia de Pool para PostgreSQL');
    
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      const error = new Error('DATABASE_URL no está definida en las variables de entorno');
      ServerLogger.error('Error al crear pool de conexiones', error);
      throw error;
    }
    
    poolInstance = new Pool({
      connectionString,
      max: 20, // Limite máximo de conexiones
      idleTimeoutMillis: 30000, // Tiempo de inactividad antes de cerrar conexiones
      connectionTimeoutMillis: 2000, // Tiempo máximo para conectar
    });
    
    // Manejo de errores en el pool
    poolInstance.on('error', (err) => {
      ServerLogger.error('Error inesperado en el pool de conexiones de PostgreSQL', err);
    });
  }
  
  return poolInstance;
}

// Exportar el pool para uso directo
export const pool = getPool();

/**
 * Cierra el pool de conexiones
 */
export async function closePool(): Promise<void> {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
    ServerLogger.info('Pool de conexiones de PostgreSQL cerrado');
  }
}

/**
 * Ejecuta una consulta dentro de una transacción
 */
export async function executeTransaction<T>(callback: (client: unknown) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const _result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    ServerLogger.error('Error en transacción SQL', error);
    throw error;
  } finally {
    client.release();
  }
}
