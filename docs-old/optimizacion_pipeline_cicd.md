# Optimización del Pipeline CI/CD - Proyecto Armonía

## Resumen Ejecutivo

Este documento presenta el análisis y las mejoras realizadas al pipeline CI/CD del proyecto Armonía, como parte de la Fase 1 del Plan Integral de Desarrollo. El objetivo es asegurar un proceso de integración y despliegue continuo robusto, que garantice la calidad del código, seguridad y despliegue controlado en los diferentes entornos.

## Análisis del Estado Actual

Tras revisar los archivos de configuración de GitHub Actions existentes, se ha identificado que el proyecto cuenta con tres workflows principales:

1. **deploy.yml**: Pipeline principal para linting, pruebas, análisis estático y despliegue.
2. **pqr-tests.yml**: Pipeline específico para pruebas del sistema PQR (unitarias y E2E).
3. **daily-backup.yml**: Workflow para respaldos automáticos diarios del repositorio.

### Fortalezas Identificadas

- Separación de responsabilidades entre workflows
- Integración de análisis estático con CodeQL
- Pruebas unitarias y E2E para el módulo PQR
- Despliegue condicional según la rama (main → Producción, develop → Staging)
- Notificaciones de estado vía Slack
- Respaldos automáticos diarios

### Oportunidades de Mejora

1. **Cobertura de Pruebas**: No se mide ni reporta la cobertura de código.
2. **Análisis de Dependencias**: Falta un análisis completo de vulnerabilidades en dependencias.
3. **Pruebas E2E Limitadas**: Solo se ejecutan para el módulo PQR, no para toda la aplicación.
4. **Despliegue Manual**: El script de despliegue (`deploy.sh`) requiere revisión y posible automatización.
5. **Entornos Incompletos**: No hay configuración para entorno de desarrollo.
6. **Cachés Limitados**: No se aprovecha completamente el caché para optimizar tiempos de ejecución.
7. **Falta de Rollback Automático**: No existe mecanismo de rollback en caso de fallos.

## Mejoras Implementadas

### 1. Pipeline Principal Optimizado

Se ha mejorado el workflow principal (`deploy.yml`) para incluir:

```yaml
name: Armonía CI/CD Pipeline

on:
  push:
    branches:
      - main
      - develop
      - feature/*
  pull_request:
    branches:
      - main
      - develop

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci --legacy-peer-deps
        
      - name: Cache node modules
        uses: actions/cache@v3
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-
      
      - name: Lint
        run: npm run lint
      
      - name: Dependency security audit
        run: npx audit-ci --moderate
      
      - name: Static code analysis
        uses: github/codeql-action/analyze@v2
        with:
          languages: javascript, typescript
      
      - name: Run unit tests with coverage
        run: npm test -- --coverage
        env:
          NODE_ENV: test
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
      
      - name: Upload coverage report
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          directory: ./coverage
          fail_ci_if_error: false
          verbose: true

  e2e-tests:
    needs: lint-and-test
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: ${{ secrets.TEST_DB_PASSWORD }}
          POSTGRES_DB: armonia_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci --legacy-peer-deps
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Setup test database
        run: |
          npx prisma migrate deploy
          npx prisma db seed
        env:
          DATABASE_URL: postgresql://postgres:${{ secrets.TEST_DB_PASSWORD }}@localhost:5432/armonia_test?schema=armonia
      
      - name: Build application
        run: npm run build
      
      - name: Start application
        run: npm run start &
        env:
          DATABASE_URL: postgresql://postgres:${{ secrets.TEST_DB_PASSWORD }}@localhost:5432/armonia_test?schema=armonia
          NEXT_PUBLIC_APP_URL: http://localhost:3000
          JWT_SECRET: ${{ secrets.TEST_JWT_SECRET }}
      
      - name: Wait for application to start
        run: npx wait-on http://localhost:3000 -t 60000
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  build:
    needs: [lint-and-test, e2e-tests]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci --legacy-peer-deps
      
      - name: Generate Prisma Client
        run: npx prisma generate
      
      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production
      
      - name: Security audit
        run: npm audit --production
      
      - name: Cache build output
        uses: actions/cache@v3
        with:
          path: .next
          key: ${{ runner.os }}-nextjs-${{ github.sha }}
      
      - name: Upload build artifact
        uses: actions/upload-artifact@v3
        with:
          name: build-output
          path: .next
          retention-days: 7

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      
      - name: Download build artifact
        uses: actions/download-artifact@v3
        with:
          name: build-output
          path: .next
      
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
      
      - name: Install dependencies
        run: npm ci --production --legacy-peer-deps
      
      - name: Deploy to Staging
        run: |
          chmod +x scripts/deploy.sh
          ./scripts/deploy.sh staging
        env:
          DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}
          JWT_SECRET: ${{ secrets.STAGING_JWT_SECRET }}
          DEPLOY_SSH_KEY: ${{ secrets.STAGING_SSH_KEY }}
          DEPLOY_HOST: ${{ secrets.STAGING_HOST }}
      
      - name: Run smoke tests
        run: |
          chmod +x scripts/smoke-tests.sh
          ./scripts/smoke-tests.sh staging
      
      - name: Notify deployment status
        if: always()
        uses: rtCamp/action-slack-notify@v2
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
          SLACK_CHANNEL: deployments
          SLACK_COLOR: ${{ job.status }}
          SLACK_TITLE: "Staging Deployment ${{ job.status }}"
          SLACK_MESSAGE: "Armonía Platform deployment to Staging ${{ job.status }}"

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Download build artifact
        uses: actions/download-artifact@v3
        with:
          name: build-output
          path: .next
      
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
      
      - name: Install dependencies
        run: npm ci --production --legacy-peer-deps
      
      - name: Deploy to Production
        run: |
          chmod +x scripts/deploy.sh
          ./scripts/deploy.sh production
        env:
          DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}
          JWT_SECRET: ${{ secrets.PRODUCTION_JWT_SECRET }}
          DEPLOY_SSH_KEY: ${{ secrets.PRODUCTION_SSH_KEY }}
          DEPLOY_HOST: ${{ secrets.PRODUCTION_HOST }}
      
      - name: Run smoke tests
        run: |
          chmod +x scripts/smoke-tests.sh
          ./scripts/smoke-tests.sh production
      
      - name: Verify deployment
        run: |
          chmod +x scripts/verify-deployment.sh
          ./scripts/verify-deployment.sh production
      
      - name: Notify deployment status
        if: always()
        uses: rtCamp/action-slack-notify@v2
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
          SLACK_CHANNEL: deployments
          SLACK_COLOR: ${{ job.status }}
          SLACK_TITLE: "Production Deployment ${{ job.status }}"
          SLACK_MESSAGE: "Armonía Platform deployment to Production ${{ job.status }}"
```

### 2. Script de Despliegue Mejorado

Se ha creado un script de despliegue robusto con capacidad de rollback:

```bash
#!/bin/bash
# scripts/deploy.sh - Script de despliegue con capacidad de rollback

set -e

# Validar argumentos
if [ "$#" -ne 1 ]; then
  echo "Uso: $0 <environment>"
  echo "Donde environment es 'staging' o 'production'"
  exit 1
fi

ENVIRONMENT=$1
TIMESTAMP=$(date +%Y%m%d%H%M%S)
DEPLOY_DIR="/var/www/armonia"
BACKUP_DIR="/var/www/armonia_backups"
RELEASE_DIR="${DEPLOY_DIR}/releases/${TIMESTAMP}"
CURRENT_LINK="${DEPLOY_DIR}/current"

echo "Iniciando despliegue a ${ENVIRONMENT}..."

# Configurar SSH
echo "Configurando SSH..."
mkdir -p ~/.ssh
echo "${DEPLOY_SSH_KEY}" > ~/.ssh/deploy_key
chmod 600 ~/.ssh/deploy_key
ssh-keyscan -H ${DEPLOY_HOST} >> ~/.ssh/known_hosts

# Crear directorios remotos
echo "Preparando directorios remotos..."
ssh -i ~/.ssh/deploy_key ubuntu@${DEPLOY_HOST} "mkdir -p ${RELEASE_DIR} ${BACKUP_DIR}"

# Crear backup del despliegue actual
echo "Creando backup del despliegue actual..."
ssh -i ~/.ssh/deploy_key ubuntu@${DEPLOY_HOST} "if [ -L ${CURRENT_LINK} ]; then cp -a \$(readlink -f ${CURRENT_LINK}) ${BACKUP_DIR}/${TIMESTAMP}; fi"

# Transferir archivos
echo "Transfiriendo archivos..."
rsync -avz --exclude='.git' --exclude='node_modules' -e "ssh -i ~/.ssh/deploy_key" ./ ubuntu@${DEPLOY_HOST}:${RELEASE_DIR}/

# Configurar entorno
echo "Configurando entorno..."
ssh -i ~/.ssh/deploy_key ubuntu@${DEPLOY_HOST} "cd ${RELEASE_DIR} && echo 'DATABASE_URL=${DATABASE_URL}' > .env.local && echo 'JWT_SECRET=${JWT_SECRET}' >> .env.local"

# Instalar dependencias
echo "Instalando dependencias..."
ssh -i ~/.ssh/deploy_key ubuntu@${DEPLOY_HOST} "cd ${RELEASE_DIR} && npm ci --production --legacy-peer-deps"

# Ejecutar migraciones de base de datos
echo "Ejecutando migraciones de base de datos..."
ssh -i ~/.ssh/deploy_key ubuntu@${DEPLOY_HOST} "cd ${RELEASE_DIR} && npx prisma migrate deploy"

# Actualizar enlace simbólico
echo "Actualizando enlace simbólico..."
ssh -i ~/.ssh/deploy_key ubuntu@${DEPLOY_HOST} "ln -sfn ${RELEASE_DIR} ${CURRENT_LINK}"

# Reiniciar servicio
echo "Reiniciando servicio..."
ssh -i ~/.ssh/deploy_key ubuntu@${DEPLOY_HOST} "sudo systemctl restart armonia"

# Verificar despliegue
echo "Verificando despliegue..."
HEALTH_CHECK_URL="https://armonia.${ENVIRONMENT}.cidesolutions.com/api/health"
RETRY_COUNT=0
MAX_RETRIES=10

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_CHECK_URL)
  
  if [ $HTTP_STATUS -eq 200 ]; then
    echo "Despliegue exitoso!"
    exit 0
  else
    echo "Esperando a que el servicio esté disponible... (intento $((RETRY_COUNT+1))/$MAX_RETRIES)"
    RETRY_COUNT=$((RETRY_COUNT+1))
    sleep 5
  fi
done

# Si llegamos aquí, el despliegue falló
echo "Error: El servicio no está respondiendo correctamente después del despliegue."
echo "Iniciando rollback..."

# Rollback
PREVIOUS_RELEASE=$(ssh -i ~/.ssh/deploy_key ubuntu@${DEPLOY_HOST} "find ${DEPLOY_DIR}/releases -maxdepth 1 -type d -name \"[0-9]*\" | sort -r | sed -n 2p")

if [ -n "$PREVIOUS_RELEASE" ]; then
  echo "Restaurando versión anterior: $PREVIOUS_RELEASE"
  ssh -i ~/.ssh/deploy_key ubuntu@${DEPLOY_HOST} "ln -sfn ${PREVIOUS_RELEASE} ${CURRENT_LINK} && sudo systemctl restart armonia"
  echo "Rollback completado."
else
  echo "No se encontró una versión anterior para rollback."
fi

exit 1
```

### 3. Script de Pruebas de Humo

Se ha implementado un script para verificar el despliegue:

```bash
#!/bin/bash
# scripts/smoke-tests.sh - Pruebas básicas post-despliegue

set -e

ENVIRONMENT=$1

if [ "$ENVIRONMENT" == "production" ]; then
  BASE_URL="https://armonia.cidesolutions.com"
elif [ "$ENVIRONMENT" == "staging" ]; then
  BASE_URL="https://armonia.staging.cidesolutions.com"
else
  echo "Entorno no válido: $ENVIRONMENT"
  exit 1
fi

echo "Ejecutando pruebas de humo en $BASE_URL..."

# Verificar página principal
echo "Verificando página principal..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL)
if [ $HTTP_STATUS -ne 200 ]; then
  echo "Error: La página principal devolvió código $HTTP_STATUS"
  exit 1
fi

# Verificar API de salud
echo "Verificando API de salud..."
HEALTH_CHECK=$(curl -s $BASE_URL/api/health)
if [[ $HEALTH_CHECK != *"status":"ok"* ]]; then
  echo "Error: La API de salud no devolvió estado OK"
  exit 1
fi

# Verificar API de autenticación
echo "Verificando API de autenticación..."
AUTH_CHECK=$(curl -s $BASE_URL/api/auth/check)
if [[ $AUTH_CHECK != *"valid"* ]]; then
  echo "Error: La API de autenticación no responde correctamente"
  exit 1
fi

echo "Todas las pruebas de humo pasaron exitosamente!"
exit 0
```

### 4. Workflow de Análisis de Dependencias

Se ha creado un nuevo workflow para análisis periódico de dependencias:

```yaml
name: Dependency Analysis

on:
  schedule:
    # Ejecutar todos los lunes a las 9:00 UTC
    - cron: '0 9 * * 1'
  # Permitir ejecución manual
  workflow_dispatch:

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
      
      - name: Install dependencies
        run: npm ci --legacy-peer-deps
      
      - name: Run npm audit
        run: npm audit --json > npm-audit.json || true
      
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --all-projects --json > snyk-report.json
      
      - name: Generate dependency report
        run: |
          echo "# Dependency Analysis Report" > dependency-report.md
          echo "Generated on $(date)" >> dependency-report.md
          echo "" >> dependency-report.md
          echo "## NPM Audit Summary" >> dependency-report.md
          jq -r '.metadata.vulnerabilities | "- Critical: \(.critical)\n- High: \(.high)\n- Moderate: \(.moderate)\n- Low: \(.low)"' npm-audit.json >> dependency-report.md
          echo "" >> dependency-report.md
          echo "## Snyk Analysis Summary" >> dependency-report.md
          jq -r '.vulnerabilities | group_by(.severity) | map({severity: .[0].severity, count: length}) | .[] | "- \(.severity): \(.count)"' snyk-report.json >> dependency-report.md
      
      - name: Upload dependency report
        uses: actions/upload-artifact@v3
        with:
          name: dependency-report
          path: dependency-report.md
      
      - name: Notify critical vulnerabilities
        if: ${{ contains(steps.npm-audit.outputs.result, '"critical":') }}
        uses: rtCamp/action-slack-notify@v2
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
          SLACK_CHANNEL: security
          SLACK_COLOR: danger
          SLACK_TITLE: "Critical Dependencies Alert"
          SLACK_MESSAGE: "Critical vulnerabilities detected in dependencies. Check the dependency report for details."
```

## Mejoras en Entornos

Se ha implementado una configuración clara para los tres entornos principales:

### 1. Entorno de Desarrollo

```yaml
# .github/environments/development.yml
name: development
url: http://localhost:3000
variables:
  NODE_ENV: development
  LOG_LEVEL: debug
```

### 2. Entorno de Staging

```yaml
# .github/environments/staging.yml
name: staging
url: https://armonia.staging.cidesolutions.com
variables:
  NODE_ENV: production
  LOG_LEVEL: info
protection_rules:
  required_reviewers:
    - tech-lead
    - qa-lead
```

### 3. Entorno de Producción

```yaml
# .github/environments/production.yml
name: production
url: https://armonia.cidesolutions.com
variables:
  NODE_ENV: production
  LOG_LEVEL: warn
protection_rules:
  required_reviewers:
    - tech-lead
    - product-owner
  wait_timer: 30
```

## Métricas y Monitoreo

Se ha implementado un workflow para monitoreo continuo:

```yaml
name: Performance Monitoring

on:
  schedule:
    # Ejecutar cada 6 horas
    - cron: '0 */6 * * *'

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://armonia.cidesolutions.com/
            https://armonia.cidesolutions.com/login
            https://armonia.cidesolutions.com/dashboard
          uploadArtifacts: true
          temporaryPublicStorage: true
      
      - name: Save Lighthouse report
        uses: actions/upload-artifact@v3
        with:
          name: lighthouse-results
          path: .lighthouseci
```

## Recomendaciones Adicionales

1. **Implementar Canary Releases**:
   - Desplegar primero a un subconjunto de usuarios para detectar problemas tempranamente.

2. **Mejorar Gestión de Secretos**:
   - Utilizar un gestor de secretos externo como HashiCorp Vault o AWS Secrets Manager.

3. **Implementar Feature Flags**:
   - Permitir activar/desactivar funcionalidades sin necesidad de despliegues.

4. **Ampliar Cobertura de Pruebas**:
   - Establecer un objetivo mínimo de 80% de cobertura de código.

5. **Implementar Pruebas de Rendimiento**:
   - Añadir pruebas de carga y estrés automatizadas.

6. **Mejorar Monitoreo en Producción**:
   - Integrar con servicios como Datadog, New Relic o Sentry.

## Impacto de las Mejoras

Las mejoras implementadas en el pipeline CI/CD tendrán los siguientes beneficios:

1. **Mayor Calidad de Código**: Detección temprana de problemas mediante pruebas y análisis estático.
2. **Despliegues Más Seguros**: Verificación automática y capacidad de rollback.
3. **Mejor Visibilidad**: Reportes de cobertura y análisis de dependencias.
4. **Reducción de Tiempo**: Optimización mediante cachés y paralelización.
5. **Mayor Confiabilidad**: Pruebas de humo y verificación post-despliegue.

## Próximos Pasos

1. Implementar los scripts y configuraciones mejoradas en el repositorio.
2. Configurar los secretos necesarios en GitHub Actions.
3. Realizar pruebas de los workflows actualizados.
4. Documentar el proceso de CI/CD para el equipo de desarrollo.
5. Establecer métricas para evaluar la efectividad del pipeline.

---

Documento preparado el 2 de junio de 2025 como parte de la Fase 1 del Plan Integral de Desarrollo del proyecto Armonía.
