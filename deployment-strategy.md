# Estrategia de Despliegue en Producción para Armonía

Este documento detalla la estrategia recomendada para el despliegue en producción de la aplicación Armonía, basada en las mejores prácticas actuales para aplicaciones web modernas construidas con Next.js y PostgreSQL.

## Arquitectura de Despliegue

### Enfoque 1: Arquitectura basada en Contenedores (Recomendada)

Este enfoque utiliza Docker y Docker Compose para crear una solución containerizada que ofrece portabilidad, consistencia entre entornos y facilidad de escalado.

#### Componentes

1. **Contenedor de Frontend (Next.js)**
   - Imagen base: Node.js Alpine
   - Construcción de producción con `next build`
   - Ejecución con `next start` en modo producción

2. **Contenedor de Base de Datos (PostgreSQL)**
   - Imagen oficial de PostgreSQL
   - Volumen persistente para datos
   - Variables de entorno configurables

3. **Contenedor de Proxy Inverso (Nginx)**
   - Gestión de SSL/TLS
   - Compresión de respuestas
   - Caché de contenido estático
   - Balanceo de carga (para futura escalabilidad)

4. **Contenedor de Respaldo (pgBackRest)**
   - Respaldos automatizados de la base de datos
   - Retención configurable
   - Almacenamiento externo opcional

#### Ventajas del Enfoque de Contenedores

- **Portabilidad**: Funciona igual en cualquier ambiente que soporte Docker
- **Aislamiento**: Cada componente opera en su propio entorno aislado
- **Escalabilidad**: Fácil de escalar horizontalmente añadiendo más instancias
- **Despliegue**: Proceso simplificado con comandos Docker estándar
- **Mantenimiento**: Actualizaciones y rollbacks sencillos
- **Consistencia**: Elimina problemas de "funciona en mi máquina"

### Enfoque 2: Despliegue Tradicional en Servidores

Este enfoque utiliza servidores virtuales o físicos con instalación directa de componentes.

#### Componentes

1. **Servidor Web (Front-end)**
   - Servidor Ubuntu/Debian
   - Node.js LTS instalado
   - PM2 para gestión de procesos
   - Nginx como proxy inverso

2. **Servidor de Base de Datos**
   - Servidor Ubuntu/Debian
   - PostgreSQL instalado nativamente
   - Configuración de alta disponibilidad opcional

## Infraestructura de Despliegue

### Opción 1: Nube Pública (Recomendada)

Plataformas recomendadas:

1. **AWS**
   - EC2 o ECS para contenedores
   - RDS para PostgreSQL
   - S3 para almacenamiento
   - CloudFront para CDN
   - Route 53 para DNS

2. **Microsoft Azure**
   - Azure Container Instances o AKS
   - Azure Database para PostgreSQL
   - Blob Storage
   - Azure CDN
   - Azure DNS

3. **Google Cloud Platform**
   - GCE o GKE para contenedores
   - Cloud SQL para PostgreSQL
   - Cloud Storage
   - Cloud CDN
   - Cloud DNS

4. **Plataformas Especializadas**
   - Vercel (optimizado para Next.js)
   - Heroku (fácil despliegue)
   - DigitalOcean App Platform o Droplets

### Opción 2: Centro de Datos Propio o Servidor Dedicado

- Servidores físicos o virtuales (VPS)
- Requisitos mínimos recomendados:
  - Frontend: 2 vCPUs, 4GB RAM, 20GB SSD
  - Base de datos: 4 vCPUs, 8GB RAM, 100GB SSD

## Proceso de Despliegue

### 1. Preparación

- **Creación de Imágenes Docker**
  ```bash
  # Construir imágenes
  docker build -t armonia-frontend:latest ./frontend
  ```

- **Configuración de Variables de Entorno**
  - Crear archivos `.env.production` con las configuraciones adecuadas
  - Nunca incluir secretos directamente en la imagen

### 2. Implementación de Infraestructura

- **Con Docker Compose**
  ```bash
  docker-compose -f docker-compose.prod.yml up -d
  ```

- **Con Kubernetes (para escalado avanzado)**
  ```bash
  kubectl apply -f kubernetes/
  ```

### 3. Configuración de Dominio y SSL

- Adquirir un dominio (ej: armonia.com)
- Configurar registros DNS apropiados
- Obtener certificado SSL con Let's Encrypt
- Configurar Nginx/proxy para usar HTTPS

### 4. Pruebas Post-Despliegue

- Ejecutar pruebas de integración
- Verificar respuestas HTTP y HTTPS
- Comprobar el rendimiento de la aplicación
- Validar funcionalidades críticas

### 5. Monitoreo y Logging

- Implementar Prometheus y Grafana para monitoreo
- Configurar alertas para eventos críticos
- Centralizar logs con ELK Stack o similar
- Monitorizar rendimiento de la base de datos

## CI/CD (Integración Continua/Despliegue Continuo)

### Flujo de CI/CD Recomendado

1. **Desarrollo**
   - Los desarrolladores trabajan en ramas de características
   - Pruebas unitarias y linting automatizados
   - Pull Requests para revisión de código

2. **Pruebas**
   - Construcción automática al fusionar con rama develop
   - Ejecución de pruebas unitarias e integración
   - Análisis estático de código

3. **Staging**
   - Despliegue automático en ambiente de staging
   - Pruebas de aceptación automatizadas
   - Pruebas de rendimiento

4. **Producción**
   - Aprobación manual para despliegue a producción
   - Despliegue con estrategia de rolling update
   - Monitoreo post-despliegue

### Plataformas de CI/CD Recomendadas

- **GitHub Actions**: Integración nativa con GitHub
- **GitLab CI/CD**: Solución completa si se usa GitLab
- **Jenkins**: Mayor personalización pero requiere más mantenimiento
- **Circle CI**: Buena integración con múltiples plataformas

## Configuración de Docker para Producción

A continuación, se presentan los archivos de configuración Docker para el entorno de producción:

### Dockerfile para el Frontend

```dockerfile
# Etapa de construcción
FROM node:18-alpine AS builder
WORKDIR /app

# Instalar dependencias
COPY frontend/package*.json ./
RUN npm ci

# Copiar el código fuente
COPY frontend/ .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Copiar dependencias y archivos de compilación
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

# Exponer puerto y definir comando de inicio
EXPOSE 3000
CMD ["npm", "start"]
```

### docker-compose.prod.yml

```yaml
version: '3.8'

services:
  frontend:
    image: armonia-frontend:latest
    restart: always
    depends_on:
      - db
    env_file:
      - .env.production
    ports:
      - "3000:3000"
    networks:
      - armonia-network

  db:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - armonia-network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/nginx/ssl
      - ./frontend/public:/var/www/public
    depends_on:
      - frontend
    networks:
      - armonia-network

  backup:
    image: pgbackrest/pgbackrest
    restart: always
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - backup-data:/var/lib/pgbackrest
    depends_on:
      - db
    networks:
      - armonia-network
    command: ["backup", "--stanza=armonia", "--type=incr"]

networks:
  armonia-network:
    driver: bridge

volumes:
  postgres-data:
  backup-data:
```

## Mantenimiento

### Actualizaciones

- Programar ventanas de mantenimiento para actualizaciones mayores
- Implementar actualizaciones menores con zero-downtime
- Mantener el sistema operativo y paquetes actualizados

### Respaldos

- Respaldos diarios completos de la base de datos
- Respaldos incrementales cada 6 horas
- Pruebas de restauración periódicas
- Almacenamiento externo de respaldos (preferiblemente cifrados)

### Monitoreo

- Verificación de salud de los servicios
- Monitoreo de uso de recursos (CPU, memoria, disco)
- Alertas para umbrales críticos
- Análisis de logs para detección proactiva de problemas

## Conclusión

La arquitectura basada en contenedores Docker es la estrategia recomendada para el despliegue de Armonía en producción debido a su facilidad de implementación, portabilidad y escalabilidad. Esta arquitectura permite una clara separación de componentes, facilita las actualizaciones y ofrece una base sólida para futuras expansiones del sistema.

Para organizaciones con requisitos muy específicos de control o integraciones complejas con sistemas existentes, el despliegue tradicional en servidores también es una opción viable pero requerirá mayor configuración manual y mantenimiento.
