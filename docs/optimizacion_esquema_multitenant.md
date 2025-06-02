# Optimización del Esquema Multi-tenant - Proyecto Armonía

## Resumen Ejecutivo

Este documento presenta el análisis y las recomendaciones para la optimización del esquema multi-tenant del proyecto Armonía, como parte de la Fase 1 del Plan Integral de Desarrollo. El objetivo es mejorar la escalabilidad, rendimiento y mantenibilidad del sistema, asegurando que pueda soportar un crecimiento significativo en el número de conjuntos residenciales (tenants).

## Análisis del Estado Actual

### Arquitectura Multi-tenant

El proyecto Armonía implementa un enfoque multi-tenant basado en esquemas de PostgreSQL, donde:

1. **Esquema `armonia`**: Contiene modelos globales como `ResidentialComplex`, `User` y `Prospect`.
2. **Esquema `tenant`**: Contiene modelos específicos de cada conjunto residencial, con la anotación `@@schema("tenant")`.

### Problemas Identificados

Tras un análisis exhaustivo de los archivos de esquema Prisma y la infraestructura de conexión, se han identificado los siguientes problemas:

1. **Gestión de Conexiones Ineficiente**:
   - El archivo `src/lib/prisma.ts` es un mock para pruebas y no implementa correctamente la lógica multi-tenant.
   - El archivo `src/lib/db.ts` utiliza un único pool de conexiones sin separación por tenant.
   - No existe un mecanismo robusto para cambiar dinámicamente entre esquemas de tenant.

2. **Inconsistencias en Definición de Esquemas**:
   - Algunos modelos tienen la anotación `@@schema("tenant")` pero sus relaciones apuntan a modelos en el esquema `armonia`.
   - Existen duplicidades en la definición de enumeraciones entre diferentes archivos de esquema.

3. **Falta de Optimización para Consultas Frecuentes**:
   - Índices insuficientes para patrones de consulta comunes.
   - Ausencia de estrategias de caché para datos frecuentemente accedidos.

4. **Limitaciones de Escalabilidad**:
   - El enfoque actual no considera la distribución de tenants grandes en múltiples nodos.
   - No hay estrategia para particionamiento de datos históricos.

5. **Problemas de Seguridad en Aislamiento**:
   - Riesgo de filtración de datos entre tenants si las consultas no incluyen correctamente el filtro de tenant.
   - Ausencia de validación a nivel de middleware para asegurar el contexto de tenant.

## Recomendaciones de Optimización

### 1. Implementación de Middleware de Tenant Robusto

```typescript
// src/lib/tenant-middleware.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { PrismaClient } from '@prisma/client';

// Caché de instancias de Prisma por tenant
const prismaClients: Record<string, PrismaClient> = {};

/**
 * Obtiene el esquema de tenant a partir de la solicitud
 */
export async function getTenantSchema(req: NextApiRequest): Promise<string> {
  // Obtener token de autenticación
  const token = await getToken({ req });
  
  if (!token || !token.complexId) {
    throw new Error('Usuario no autenticado o sin conjunto residencial asignado');
  }
  
  // Formato: tenant_cjXXXX donde XXXX es el ID con padding
  const complexId = token.complexId.toString().padStart(4, '0');
  return `tenant_cj${complexId}`;
}

/**
 * Obtiene una instancia de PrismaClient configurada para el esquema especificado
 */
export function getPrismaClient(schema: string): PrismaClient {
  if (!prismaClients[schema]) {
    prismaClients[schema] = new PrismaClient({
      datasources: {
        db: {
          url: `${process.env.DATABASE_URL}?schema=${schema}`
        }
      }
    });
  }
  
  return prismaClients[schema];
}

/**
 * Middleware para establecer el contexto de tenant
 */
export function withTenant(
  handler: (req: NextApiRequest, res: NextApiResponse, prisma: PrismaClient) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const schema = await getTenantSchema(req);
      const prisma = getPrismaClient(schema);
      
      // Añadir el esquema y cliente Prisma al objeto de solicitud
      (req as any).tenantSchema = schema;
      (req as any).prisma = prisma;
      
      // Ejecutar el manejador con el contexto de tenant
      return handler(req, res, prisma);
    } catch (error) {
      console.error('Error en middleware de tenant:', error);
      return res.status(401).json({ error: 'Error de autenticación o tenant' });
    }
  };
}
```

### 2. Consolidación de Esquemas Prisma

Crear un único archivo de esquema principal que importe y consolide todos los modelos:

```typescript
// prisma/schema.prisma
datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  schemas    = ["armonia", "tenant"]
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

// Modelos globales (schema armonia)
model ResidentialComplex {
  id          Int      @id @default(autoincrement())
  name        String
  schemaName  String   @unique  // Nombre del schema en la DB
  totalUnits  Int
  adminEmail  String
  adminName   String
  adminPhone  String?
  address     String?
  city        String?
  state       String?
  country     String?  @default("Colombia")
  propertyTypes Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  users       User[]
  
  // Nuevos campos para optimización
  status      String   @default("active") // active, suspended, deleted
  planType    String   @default("basic")  // basic, standard, premium
  maxUsers    Int      @default(100)      // Límite de usuarios según plan
  
  @@schema("armonia")
}

// Importar modelos específicos de tenant
// ... (resto de modelos)
```

### 3. Optimización de Índices y Consultas

Añadir índices estratégicos para patrones de consulta comunes:

```prisma
// Ejemplo para modelo PQR
model PQR {
  // ... campos existentes
  
  // Índices optimizados
  @@index([status, priority]) // Para filtrado combinado común
  @@index([createdAt(sort: Desc)]) // Para ordenamiento por fecha
  @@index([assignedToId, status]) // Para consultas de asignación
  @@index([userId, status]) // Para consultas de usuario
  
  @@schema("tenant")
}
```

### 4. Implementación de Estrategia de Caché

```typescript
// src/lib/cache.ts
import NodeCache from 'node-cache';

// Caché con expiración de 5 minutos por defecto
const cache = new NodeCache({ stdTTL: 300 });

/**
 * Obtiene datos de caché o ejecuta función y almacena resultado
 */
export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cachedData = cache.get<T>(key);
  
  if (cachedData !== undefined) {
    return cachedData;
  }
  
  const data = await fetchFn();
  cache.set(key, data, ttl);
  return data;
}

/**
 * Invalida una clave de caché
 */
export function invalidateCache(key: string): void {
  cache.del(key);
}

/**
 * Genera una clave de caché específica para tenant
 */
export function getTenantCacheKey(schema: string, key: string): string {
  return `${schema}:${key}`;
}
```

### 5. Mejora de Seguridad en Aislamiento de Datos

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Verificar rutas protegidas
  if (request.nextUrl.pathname.startsWith('/api/tenant/')) {
    const token = await getToken({ req: request as any });
    
    if (!token || !token.complexId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Añadir encabezado de tenant para uso en API routes
    const response = NextResponse.next();
    response.headers.set('x-tenant-id', `tenant_cj${token.complexId.toString().padStart(4, '0')}`);
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/tenant/:path*'],
};
```

### 6. Estrategia de Particionamiento para Datos Históricos

```sql
-- Ejemplo de particionamiento para tabla de historial de estados PQR
CREATE TABLE tenant.pqr_status_history_partitioned (
  id SERIAL,
  pqr_id INTEGER NOT NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_at TIMESTAMP NOT NULL,
  changed_by_id INTEGER NOT NULL,
  changed_by_name TEXT NOT NULL,
  changed_by_role TEXT NOT NULL,
  comment TEXT,
  time_in_status INTEGER,
  PRIMARY KEY (id, changed_at)
) PARTITION BY RANGE (changed_at);

-- Crear particiones por trimestre
CREATE TABLE tenant.pqr_status_history_y2025q1 PARTITION OF tenant.pqr_status_history_partitioned
  FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
  
CREATE TABLE tenant.pqr_status_history_y2025q2 PARTITION OF tenant.pqr_status_history_partitioned
  FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
  
-- Función para crear particiones automáticamente
CREATE OR REPLACE FUNCTION tenant.create_partition_if_not_exists()
RETURNS TRIGGER AS $$
DECLARE
  partition_name TEXT;
  start_date DATE;
  end_date DATE;
BEGIN
  -- Determinar trimestre
  start_date := DATE_TRUNC('quarter', NEW.changed_at);
  end_date := start_date + INTERVAL '3 months';
  partition_name := 'tenant.pqr_status_history_y' || 
                   TO_CHAR(NEW.changed_at, 'YYYY') || 
                   'q' || TO_CHAR(NEW.changed_at, 'Q');
  
  -- Crear partición si no existe
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = partition_name) THEN
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF tenant.pqr_status_history_partitioned
       FOR VALUES FROM (%L) TO (%L)',
      partition_name, start_date, end_date
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear particiones automáticamente
CREATE TRIGGER create_partition_trigger
  BEFORE INSERT ON tenant.pqr_status_history_partitioned
  FOR EACH ROW EXECUTE FUNCTION tenant.create_partition_if_not_exists();
```

## Plan de Implementación

### Fase 1: Refactorización de la Infraestructura Base

1. Crear el middleware de tenant robusto
2. Consolidar los esquemas Prisma
3. Implementar validaciones de seguridad

### Fase 2: Optimización de Rendimiento

1. Añadir índices estratégicos
2. Implementar sistema de caché
3. Configurar conexiones eficientes

### Fase 3: Preparación para Escalabilidad

1. Implementar estrategia de particionamiento
2. Configurar monitoreo de rendimiento
3. Documentar prácticas recomendadas

## Impacto Esperado

La implementación de estas optimizaciones tendrá los siguientes beneficios:

1. **Mejora de Rendimiento**: Reducción de tiempos de respuesta en consultas frecuentes.
2. **Mayor Escalabilidad**: Capacidad para soportar >1000 tenants sin degradación de rendimiento.
3. **Seguridad Mejorada**: Aislamiento robusto de datos entre tenants.
4. **Mantenibilidad**: Código más limpio y estructura más coherente.
5. **Eficiencia Operativa**: Menor consumo de recursos y mejor utilización de la base de datos.

## Métricas de Éxito

1. Tiempo de respuesta promedio <200ms para consultas frecuentes
2. Capacidad para manejar >100 consultas/segundo por tenant
3. Cero incidentes de filtración de datos entre tenants
4. Reducción del 30% en uso de CPU y memoria para operaciones de base de datos

## Próximos Pasos

1. Implementar los cambios propuestos en el entorno de desarrollo
2. Realizar pruebas de rendimiento comparativas
3. Documentar los resultados y ajustar según sea necesario
4. Desplegar en entorno de pruebas para validación extendida

---

Documento preparado el 2 de junio de 2025 como parte de la Fase 1 del Plan Integral de Desarrollo del proyecto Armonía.
