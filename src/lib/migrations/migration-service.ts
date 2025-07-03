// src/lib/migrations/migration-service.ts
import { PrismaClient } from '@prisma/client';
import { ServerLogger } from '../logging/server-logger';
import { getPrisma } from '../prisma';

/**
 * Servicio para gestionar migraciones de base de datos
 * Permite ejecutar migraciones y seeds para desarrollo y producción
 */
export class MigrationService {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = getPrisma();
  }
  
  /**
   * Ejecuta migraciones para un schema específico
   * @param schemaName Nombre del schema para migrar
   */
  async migrateSchema(schemaName: string): Promise<void> {
    try {
      ServerLogger.info(`[MigrationService] Iniciando migración para schema: ${schemaName}`);
      
      // Asegurar que el schema existe
      await this.createSchemaIfNotExists(schemaName);
      
      // Ejecutar migraciones básicas
      await this.createMigrationTables(schemaName);
      await this.createBasicTables(schemaName);
      
      ServerLogger.info(`[MigrationService] Migración completada para schema: ${schemaName}`);
    } catch (error) {
      ServerLogger.error(`[MigrationService] Error en migración para schema ${schemaName}:`, error);
      throw error;
    }
  }
  
  /**
   * Crea un schema si no existe
   * @param schemaName Nombre del schema a crear
   */
  private async createSchemaIfNotExists(schemaName: string): Promise<void> {
    try {
      // Verificar si el schema ya existe
      const schemaExists = await this.prisma.$queryRaw`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.schemata 
          WHERE schema_name = ${schemaName}
        )
      ` as { exists: boolean }[];
      
      // Si no existe, crearlo
      if (!schemaExists[0].exists) {
        // Construir la consulta SQL como string para evitar problemas con identificadores dinámicos
        const query = `CREATE SCHEMA IF NOT EXISTS "${schemaName}"`;
        await this.prisma.$executeRawUnsafe(query);
        ServerLogger.info(`[MigrationService] Schema creado: ${schemaName}`);
      }
    } catch (error) {
      ServerLogger.error(`[MigrationService] Error al crear schema ${schemaName}:`, error);
      throw error;
    }
  }
  
  /**
   * Crea tablas de control de migraciones
   * @param schemaName Nombre del schema
   */
  private async createMigrationTables(schemaName: string): Promise<void> {
    try {
      // Crear tabla de migraciones si no existe
      // Construir la consulta SQL como string para evitar problemas con identificadores dinámicos
      const query = `
        CREATE TABLE IF NOT EXISTS "${schemaName}"."_Migration" (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          applied_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `;
      
      await this.prisma.$executeRawUnsafe(query);
      
      ServerLogger.info(`[MigrationService] Tabla de migraciones creada en schema: ${schemaName}`);
    } catch (error) {
      ServerLogger.error(`[MigrationService] Error al crear tabla de migraciones:`, error);
      throw error;
    }
  }
  
  /**
   * Crea tablas básicas necesarias para el funcionamiento del sistema
   * @param schemaName Nombre del schema
   */
  private async createBasicTables(schemaName: string): Promise<void> {
    try {
      // Crear tablas básicas si no existen
      // Construir las consultas SQL como strings para evitar problemas con identificadores dinámicos
      const userTableQuery = `
        CREATE TABLE IF NOT EXISTS "${schemaName}"."User" (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'USER',
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `;
      
      const complexTableQuery = `
        CREATE TABLE IF NOT EXISTS "${schemaName}"."Complex" (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          address VARCHAR(255) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `;
      
      // Ejecutar las consultas usando $executeRawUnsafe para permitir identificadores dinámicos
      await this.prisma.$executeRawUnsafe(userTableQuery);
      await this.prisma.$executeRawUnsafe(complexTableQuery);
      
      ServerLogger.info(`[MigrationService] Tablas básicas creadas en schema: ${schemaName}`);
    } catch (error) {
      ServerLogger.error(`[MigrationService] Error al crear tablas básicas:`, error);
      throw error;
    }
  }
  
  /**
   * Ejecuta seeds para desarrollo en un schema específico
   * @param schemaName Nombre del schema para sembrar datos
   */
  async seedDevelopmentData(schemaName: string): Promise<void> {
    try {
      ServerLogger.info(`[MigrationService] Iniciando seed de datos para desarrollo en schema: ${schemaName}`);
      
      // Verificar si ya existen datos
      const usersExist = await this.checkIfDataExists(schemaName, 'User');
      
      if (!usersExist) {
        // Crear usuario administrador de prueba
        // Construir las consultas SQL como strings para evitar problemas con identificadores dinámicos
        const userInsertQuery = `
          INSERT INTO "${schemaName}"."User" (name, email, password, role)
          VALUES ('Admin', 'admin@example.com', '$2b$10$dGQI8Ot5QEKuSMG1U6GQT.MKAj.qdNzDt.Ue9JUZ.Oi9JjGWU5vKe', 'ADMIN')
        `;
        
        const complexInsertQuery = `
          INSERT INTO "${schemaName}"."Complex" (name, address)
          VALUES ('Conjunto Residencial Prueba', 'Calle Principal #123')
        `;
        
        // Ejecutar las consultas usando $executeRawUnsafe para permitir identificadores dinámicos
        await this.prisma.$executeRawUnsafe(userInsertQuery);
        await this.prisma.$executeRawUnsafe(complexInsertQuery);
        
        ServerLogger.info(`[MigrationService] Datos de desarrollo sembrados en schema: ${schemaName}`);
      } else {
        ServerLogger.info(`[MigrationService] Los datos de desarrollo ya existen en schema: ${schemaName}`);
      }
    } catch (error) {
      ServerLogger.error(`[MigrationService] Error al sembrar datos de desarrollo:`, error);
      throw error;
    }
  }
  
  /**
   * Verifica si ya existen datos en una tabla
   * @param schemaName Nombre del schema
   * @param tableName Nombre de la tabla a verificar
   * @returns true si existen datos, false en caso contrario
   */
  private async checkIfDataExists(schemaName: string, tableName: string): Promise<boolean> {
    try {
      // Construir la consulta SQL como string para evitar problemas con identificadores dinámicos
      const query = `
        SELECT EXISTS (
          SELECT 1 FROM "${schemaName}"."${tableName}" LIMIT 1
        )
      `;
      
      const result = await this.prisma.$queryRawUnsafe(query) as { exists: boolean }[];
      
      return result[0].exists;
    } catch (error) {
      ServerLogger.error(`[MigrationService] Error al verificar existencia de datos:`, error);
      throw error;
    }
  }
}
