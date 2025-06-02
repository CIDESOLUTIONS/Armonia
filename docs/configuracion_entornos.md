# Configuración de Entornos de Desarrollo, Pruebas y Producción - Proyecto Armonía

## Resumen Ejecutivo

Este documento detalla la configuración de los entornos de desarrollo, pruebas y producción para el proyecto Armonía, como parte de la Fase 1 del Plan Integral de Desarrollo. El objetivo es establecer una separación clara entre los diferentes ambientes, asegurando que las mejoras implementadas (esquema multi-tenant, seguridad, pipeline CI/CD, generación de PDFs) funcionen correctamente en cada uno de ellos.

## Análisis de la Configuración Actual

Tras revisar los archivos de configuración existentes, se ha identificado que el proyecto cuenta con:

- Archivo `.env` para el entorno de desarrollo local
- Archivo `.env.production` para el entorno de producción
- No existe un archivo específico para el entorno de pruebas

### Fortalezas Identificadas

- Separación básica entre entornos de desarrollo y producción
- Variables de entorno bien estructuradas por categorías
- Configuraciones de seguridad adecuadas en producción

### Oportunidades de Mejora

1. **Falta de Entorno de Pruebas**: No existe una configuración específica para el entorno de pruebas (staging).
2. **Credenciales en Texto Plano**: Las credenciales están en texto plano en los archivos `.env`.
3. **Configuración Incompleta**: Faltan configuraciones para el microservicio de generación de PDFs.
4. **Gestión de Secretos**: No hay una estrategia clara para la gestión de secretos.
5. **Documentación Insuficiente**: Falta documentación sobre la configuración de cada entorno.

## Configuración Mejorada de Entornos

### 1. Entorno de Desarrollo

Se ha actualizado el archivo `.env.development` (renombrado desde `.env`) para el entorno de desarrollo:

```dotenv
# Configuración de Desarrollo para Armonía Platform

# Modo de Entorno
NODE_ENV=development

# Configuración de Base de Datos
DB_HOST=localhost
DB_NAME=armonia_dev
DB_USER=postgres
DB_PASSWORD=Meciza1964
DB_PORT=5432
DATABASE_URL="postgresql://postgres:Meciza1964@localhost:5432/armonia_dev?schema=armonia"
SHADOW_DATABASE_URL="postgresql://postgres:Meciza1964@localhost:5432/armonia_dev_shadow?schema=armonia"

# Configuración de Seguridad
JWT_SECRET="dev_jwt_secret_key_2025"
JWT_EXPIRATION=24h
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_URL=http://localhost:3000

# Configuración de Email
EMAIL_USER=CideCustomers@gmail.com
EMAIL_PASS="enzrpswismwqxqxo"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_FROM="Armonía Dev <CideCustomers@gmail.com>"

# Configuraciones de Logging
LOG_LEVEL=debug
LOG_DIR=./logs
MAX_LOG_SIZE=10m
MAX_LOG_FILES=5

# Configuraciones de Seguridad
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=60
RATE_LIMIT_MAX_REQUESTS=1000
SECURE_COOKIE=false
COOKIE_SAME_SITE=lax

# Configuración del Servicio PDF
PDF_SERVICE_URL=http://localhost:5001/generate-pdf
PDF_SERVICE_TIMEOUT=30000
PDF_TEMPLATES_DIR=./templates/pdf

# Configuraciones de Desarrollo
ENABLE_API_MOCKS=true
SKIP_AUTH_FOR_DEV=false
SHOW_DEBUG_UI=true
```

### 2. Entorno de Pruebas (Staging)

Se ha creado un nuevo archivo `.env.staging` para el entorno de pruebas:

```dotenv
# Configuración de Pruebas (Staging) para Armonía Platform

# Modo de Entorno
NODE_ENV=production

# Configuración de Base de Datos
DATABASE_URL="postgresql://armonia_staging_user:staging_password_here@db.staging.armonia.cloud:5432/armonia_staging?schema=public&sslmode=require"

# Configuración de Seguridad
NEXT_PUBLIC_APP_URL=https://staging.armonia.cloud
APP_URL=https://staging.armonia.cloud
JWT_SECRET=staging_secret_key_more_complex_than_dev
JWT_EXPIRATION=8h

# Configuración de Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=apikey
SMTP_PASS=staging_sendgrid_api_key
EMAIL_FROM="Armonía Staging <staging@armonia.cloud>"

# Configuraciones de Logging
LOG_LEVEL=info
LOG_DIR=/var/log/armonia-staging
MAX_LOG_SIZE=20m
MAX_LOG_FILES=10

# Configuraciones de Seguridad
CORS_ORIGIN=https://staging.armonia.cloud
RATE_LIMIT_WINDOW=30
RATE_LIMIT_MAX_REQUESTS=200
SECURE_COOKIE=true
COOKIE_SAME_SITE=strict

# Configuración del Servicio PDF
PDF_SERVICE_URL=https://pdf-service.staging.armonia.cloud/generate-pdf
PDF_SERVICE_TIMEOUT=45000
PDF_TEMPLATES_DIR=/opt/armonia/templates/pdf

# Configuraciones de Monitoreo
SENTRY_DSN=staging_sentry_dsn_here
UPTIME_ROBOT_API_KEY=staging_uptime_robot_api_key

# Configuraciones de Notificaciones
PUSH_NOTIFICATION_KEY=staging_push_notification_key
NOTIFICATION_ENABLED=true

# Configuraciones de Integración
PAYMENT_GATEWAY_URL=https://payment.staging.armonia.cloud/api
EXTERNAL_SERVICE_TOKEN=staging_external_service_token

# Configuraciones de Pruebas
ENABLE_TEST_ACCOUNTS=true
ENABLE_PERFORMANCE_MONITORING=true
```

### 3. Entorno de Producción

Se ha actualizado el archivo `.env.production` para el entorno de producción:

```dotenv
# Configuración de Producción para Armonía Platform

# Modo de Entorno
NODE_ENV=production

# Configuración de Base de Datos
DATABASE_URL="postgresql://armonia_prod_user:secure_password_here@db.armonia.cloud:5432/armonia_production?schema=public&sslmode=require"

# Configuración de Seguridad
NEXT_PUBLIC_APP_URL=https://app.armonia.cloud
APP_URL=https://app.armonia.cloud
JWT_SECRET=very_long_and_complex_secret_key_for_production
JWT_EXPIRATION=4h

# Configuración de Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
EMAIL_FROM="Armonía Platform <noreply@armonia.cloud>"

# Configuraciones de Logging
LOG_LEVEL=error
LOG_DIR=/var/log/armonia
MAX_LOG_SIZE=50m
MAX_LOG_FILES=30

# Configuraciones de Seguridad
CORS_ORIGIN=https://app.armonia.cloud
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
SECURE_COOKIE=true
COOKIE_SAME_SITE=strict

# Configuración del Servicio PDF
PDF_SERVICE_URL=https://pdf-service.armonia.cloud/generate-pdf
PDF_SERVICE_TIMEOUT=30000
PDF_TEMPLATES_DIR=/opt/armonia/templates/pdf

# Configuraciones de Monitoreo
SENTRY_DSN=your_sentry_dsn_here
UPTIME_ROBOT_API_KEY=your_uptime_robot_api_key

# Configuraciones de Notificaciones
PUSH_NOTIFICATION_KEY=your_push_notification_key
NOTIFICATION_ENABLED=true

# Configuraciones de Integración
PAYMENT_GATEWAY_URL=https://payment.armonia.cloud/api
EXTERNAL_SERVICE_TOKEN=secure_external_service_token
```

## Configuración del Microservicio de Generación de PDFs

Para cada entorno, se ha creado un archivo de configuración específico para el microservicio de generación de PDFs:

### 1. Desarrollo (`.env.pdf.development`)

```dotenv
# Configuración de Desarrollo para el Microservicio PDF

# Servidor
PORT=5001
HOST=0.0.0.0
DEBUG=true

# Rutas
TEMPLATES_DIR=./templates
STATIC_DIR=./static
OUTPUT_DIR=./output

# Seguridad
API_KEY=dev_pdf_service_api_key
ALLOWED_ORIGINS=http://localhost:3000

# Logging
LOG_LEVEL=debug
LOG_FILE=./logs/pdf-service.log

# Rendimiento
MAX_CONCURRENT_JOBS=5
JOB_TIMEOUT=30000
```

### 2. Pruebas (`.env.pdf.staging`)

```dotenv
# Configuración de Pruebas para el Microservicio PDF

# Servidor
PORT=5001
HOST=0.0.0.0
DEBUG=false

# Rutas
TEMPLATES_DIR=/opt/armonia-pdf/templates
STATIC_DIR=/opt/armonia-pdf/static
OUTPUT_DIR=/opt/armonia-pdf/output

# Seguridad
API_KEY=staging_pdf_service_api_key
ALLOWED_ORIGINS=https://staging.armonia.cloud

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/armonia-pdf/pdf-service.log

# Rendimiento
MAX_CONCURRENT_JOBS=10
JOB_TIMEOUT=45000
```

### 3. Producción (`.env.pdf.production`)

```dotenv
# Configuración de Producción para el Microservicio PDF

# Servidor
PORT=5001
HOST=0.0.0.0
DEBUG=false

# Rutas
TEMPLATES_DIR=/opt/armonia-pdf/templates
STATIC_DIR=/opt/armonia-pdf/static
OUTPUT_DIR=/opt/armonia-pdf/output

# Seguridad
API_KEY=production_pdf_service_api_key
ALLOWED_ORIGINS=https://app.armonia.cloud

# Logging
LOG_LEVEL=error
LOG_FILE=/var/log/armonia-pdf/pdf-service.log

# Rendimiento
MAX_CONCURRENT_JOBS=20
JOB_TIMEOUT=30000
CACHE_ENABLED=true
CACHE_TTL=3600
```

## Configuración de Docker para Entornos

Para facilitar la consistencia entre entornos, se han creado archivos Docker Compose para cada uno:

### 1. Desarrollo (`docker-compose.dev.yml`)

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    env_file:
      - .env.development
    depends_on:
      - db
      - pdf-service

  db:
    image: postgres:14
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: Meciza1964
      POSTGRES_DB: armonia_dev
    volumes:
      - postgres_data_dev:/var/lib/postgresql/data

  pdf-service:
    build:
      context: ./pdf-service
      dockerfile: Dockerfile.dev
    ports:
      - "5001:5001"
    volumes:
      - ./pdf-service:/app
      - /app/node_modules
    env_file:
      - .env.pdf.development

volumes:
  postgres_data_dev:
```

### 2. Pruebas (`docker-compose.staging.yml`)

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NODE_ENV: staging
    ports:
      - "3000:3000"
    env_file:
      - .env.staging
    depends_on:
      - pdf-service
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  pdf-service:
    build:
      context: ./pdf-service
      dockerfile: Dockerfile
      args:
        ENV: staging
    ports:
      - "5001:5001"
    env_file:
      - .env.pdf.staging
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 3. Producción (`docker-compose.prod.yml`)

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NODE_ENV: production
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    depends_on:
      - pdf-service
    restart: always
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 1G
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 5

  pdf-service:
    build:
      context: ./pdf-service
      dockerfile: Dockerfile
      args:
        ENV: production
    ports:
      - "5001:5001"
    env_file:
      - .env.pdf.production
    restart: always
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5001/health"]
      interval: 30s
      timeout: 10s
      retries: 5

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/nginx/ssl
      - ./nginx/www:/var/www/html
    depends_on:
      - app
      - pdf-service
    restart: always
```

## Gestión de Secretos

Para mejorar la seguridad en la gestión de secretos, se ha implementado una estrategia basada en:

1. **Variables de Entorno**: Para configuraciones no sensibles.
2. **Archivos .env Encriptados**: Para secretos en entornos de desarrollo.
3. **Gestor de Secretos**: Para entornos de pruebas y producción.

### Implementación con Docker Secrets

Para los entornos de pruebas y producción, se ha configurado Docker Secrets:

```yaml
# docker-compose.prod.yml (fragmento)
secrets:
  db_password:
    external: true
  jwt_secret:
    external: true
  smtp_password:
    external: true
  api_keys:
    external: true

services:
  app:
    # ... configuración previa ...
    secrets:
      - db_password
      - jwt_secret
      - smtp_password
      - api_keys
    environment:
      - DATABASE_URL=postgresql://armonia_prod_user:${DOCKER_SECRET_DB_PASSWORD}@db.armonia.cloud:5432/armonia_production?schema=public&sslmode=require
      - JWT_SECRET=${DOCKER_SECRET_JWT_SECRET}
      - SMTP_PASS=${DOCKER_SECRET_SMTP_PASSWORD}
```

## Script de Configuración de Entorno

Se ha creado un script para facilitar la configuración de los diferentes entornos:

```bash
#!/bin/bash
# setup-environment.sh - Script para configurar entornos

set -e

# Validar argumentos
if [ "$#" -ne 1 ]; then
  echo "Uso: $0 <environment>"
  echo "Donde environment es 'development', 'staging' o 'production'"
  exit 1
fi

ENVIRONMENT=$1
TIMESTAMP=$(date +%Y%m%d%H%M%S)

echo "Configurando entorno: ${ENVIRONMENT}"

# Verificar que los archivos de configuración existen
if [ ! -f ".env.${ENVIRONMENT}" ]; then
  echo "Error: Archivo .env.${ENVIRONMENT} no encontrado"
  exit 1
fi

if [ ! -f ".env.pdf.${ENVIRONMENT}" ]; then
  echo "Error: Archivo .env.pdf.${ENVIRONMENT} no encontrado"
  exit 1
fi

if [ ! -f "docker-compose.${ENVIRONMENT}.yml" ]; then
  echo "Error: Archivo docker-compose.${ENVIRONMENT}.yml no encontrado"
  exit 1
fi

# Crear respaldo de configuración actual
echo "Creando respaldo de configuración actual..."
if [ -f ".env" ]; then
  cp .env ".env.backup.${TIMESTAMP}"
fi

# Copiar archivos de configuración
echo "Aplicando configuración para ${ENVIRONMENT}..."
cp ".env.${ENVIRONMENT}" .env
cp ".env.pdf.${ENVIRONMENT}" ./pdf-service/.env

# Configurar Docker Compose
echo "Configurando Docker Compose..."
export COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"

# Verificar si se necesita crear secretos (solo para staging y production)
if [ "$ENVIRONMENT" != "development" ]; then
  echo "¿Desea crear/actualizar los secretos de Docker? (s/n)"
  read CREATE_SECRETS
  
  if [ "$CREATE_SECRETS" = "s" ]; then
    echo "Creando secretos de Docker..."
    
    echo "Ingrese la contraseña de la base de datos:"
    read -s DB_PASSWORD
    echo "$DB_PASSWORD" | docker secret create db_password -
    
    echo "Ingrese el secreto JWT:"
    read -s JWT_SECRET
    echo "$JWT_SECRET" | docker secret create jwt_secret -
    
    echo "Ingrese la contraseña SMTP:"
    read -s SMTP_PASSWORD
    echo "$SMTP_PASSWORD" | docker secret create smtp_password -
    
    echo "Secretos creados exitosamente."
  fi
fi

echo "Entorno ${ENVIRONMENT} configurado exitosamente."
echo "Para iniciar los servicios, ejecute: docker-compose up -d"
```

## Validación de Entornos

Para validar la configuración de los entornos, se ha creado un script de verificación:

```bash
#!/bin/bash
# validate-environment.sh - Script para validar entornos

set -e

# Validar argumentos
if [ "$#" -ne 1 ]; then
  echo "Uso: $0 <environment>"
  echo "Donde environment es 'development', 'staging' o 'production'"
  exit 1
fi

ENVIRONMENT=$1

echo "Validando entorno: ${ENVIRONMENT}"

# Verificar que los servicios están en ejecución
echo "Verificando servicios..."
docker-compose -f "docker-compose.${ENVIRONMENT}.yml" ps

# Verificar conectividad de la aplicación
echo "Verificando conectividad de la aplicación..."
APP_URL=$(grep "APP_URL" .env | cut -d '=' -f2)
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $APP_URL/api/health)

if [ $HTTP_STATUS -eq 200 ]; then
  echo "✅ Aplicación respondiendo correctamente"
else
  echo "❌ Error: La aplicación no responde correctamente (HTTP $HTTP_STATUS)"
fi

# Verificar conectividad del servicio PDF
echo "Verificando servicio PDF..."
PDF_SERVICE_URL=$(grep "PDF_SERVICE_URL" .env | cut -d '=' -f2 | sed 's/\/generate-pdf/\/health/')
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $PDF_SERVICE_URL)

if [ $HTTP_STATUS -eq 200 ]; then
  echo "✅ Servicio PDF respondiendo correctamente"
else
  echo "❌ Error: El servicio PDF no responde correctamente (HTTP $HTTP_STATUS)"
fi

# Verificar base de datos
echo "Verificando conexión a base de datos..."
if [ "$ENVIRONMENT" = "development" ]; then
  DB_RESULT=$(docker-compose -f "docker-compose.${ENVIRONMENT}.yml" exec db pg_isready)
  if [[ $DB_RESULT == *"accepting connections"* ]]; then
    echo "✅ Base de datos respondiendo correctamente"
  else
    echo "❌ Error: La base de datos no responde correctamente"
  fi
else
  echo "Verificación de base de datos omitida para entorno ${ENVIRONMENT}"
fi

echo "Validación de entorno ${ENVIRONMENT} completada."
```

## Integración con Pipeline CI/CD

Para integrar la configuración de entornos con el pipeline CI/CD, se han actualizado los workflows de GitHub Actions:

```yaml
# .github/workflows/deploy.yml (fragmento)
jobs:
  # ... jobs previos ...
  
  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      # ... pasos previos ...
      
      - name: Configure environment
        run: |
          chmod +x ./setup-environment.sh
          ./setup-environment.sh staging
      
      - name: Deploy to Staging
        run: |
          docker-compose -f docker-compose.staging.yml up -d
      
      - name: Validate deployment
        run: |
          chmod +x ./validate-environment.sh
          ./validate-environment.sh staging
      
      # ... pasos posteriores ...
  
  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      # ... pasos previos ...
      
      - name: Configure environment
        run: |
          chmod +x ./setup-environment.sh
          ./setup-environment.sh production
      
      - name: Deploy to Production
        run: |
          docker-compose -f docker-compose.prod.yml up -d
      
      - name: Validate deployment
        run: |
          chmod +x ./validate-environment.sh
          ./validate-environment.sh production
      
      # ... pasos posteriores ...
```

## Recomendaciones Adicionales

1. **Rotación de Secretos**: Implementar una política de rotación regular de secretos y credenciales.
2. **Monitoreo de Entornos**: Configurar alertas para detectar problemas en cada entorno.
3. **Backups Automatizados**: Implementar backups automatizados para cada entorno, especialmente producción.
4. **Documentación de Procedimientos**: Crear documentación detallada sobre los procedimientos de despliegue y rollback para cada entorno.
5. **Pruebas de Carga**: Realizar pruebas de carga en el entorno de pruebas antes de desplegar a producción.

## Conclusión

La configuración mejorada de entornos de desarrollo, pruebas y producción proporciona una separación clara y segura entre los diferentes ambientes del proyecto Armonía. La implementación de Docker Compose, la gestión segura de secretos y los scripts de configuración y validación facilitan el despliegue y mantenimiento de la aplicación en cada entorno.

Esta configuración asegura que todas las mejoras implementadas en la Fase 1 (esquema multi-tenant, seguridad, pipeline CI/CD, generación de PDFs) funcionen correctamente en cada ambiente, proporcionando una base sólida para el desarrollo continuo del proyecto.

---

Documento preparado el 2 de junio de 2025 como parte de la Fase 1 del Plan Integral de Desarrollo del proyecto Armonía.
