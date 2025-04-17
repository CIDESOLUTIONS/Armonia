# Proyecto Armonía

Armonía es una plataforma integral para la gestión de conjuntos residenciales, diseñada para facilitar la administración, comunicación y coordinación entre administradores, residentes y personal.

## Características Principales

- Gestión completa de propiedades y residentes
- Sistema de asambleas y votaciones
- Reserva y administración de áreas comunes
- Gestión financiera y de pagos
- Sistema de PQR (Peticiones, Quejas y Reclamos)
- Portal para residentes
- Portal para recepción y vigilancia

## Estructura del Proyecto

El proyecto está organizado en la siguiente estructura:

- `frontend/`: Aplicación Next.js (React + API Routes)
- `prisma/`: Modelos y esquemas de base de datos
- `cypress/`: Pruebas automatizadas con Cypress
- Scripts de automatización para pruebas y despliegue

## Requisitos

- Node.js 18.x o superior
- PostgreSQL 14.x o superior
- Docker (opcional, para despliegue)

## Configuración del Entorno de Desarrollo

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/CIDESOLUTIONS/Armonia.git
   cd armonia
   ```

2. Instalar dependencias:
   ```bash
   ./install-dependencies.ps1
   ```

3. Configurar variables de entorno:
   ```bash
   cp frontend/.env.example frontend/.env
   # Editar .env con tus configuraciones
   ```

4. Inicializar la base de datos:
   ```bash
   ./initialize-database.ps1
   ```

5. Iniciar el servidor de desarrollo:
   ```bash
   cd frontend
   npm run dev
   ```

## Scripts de Automatización

El proyecto incluye varios scripts para facilitar el desarrollo, pruebas y despliegue:

### Scripts para Pruebas

- `fix-test-credentials.ps1`: Asegura que las credenciales de prueba sean correctas
- `validate-initial-tests.ps1`: Verifica las pruebas básicas (landing page y login)
- `run-sequential-tests.ps1`: Ejecuta todas las pruebas en secuencia
- `run-cypress-headless.ps1`: Ejecuta todas las pruebas en modo headless
- `clean-test-files.ps1`: Limpia archivos de prueba antiguos o duplicados
- `generate-report.ps1`: Genera un informe sobre el estado del proyecto

### Scripts para Base de Datos

- `initialize-database.ps1`: Inicializa la base de datos con schema y datos de prueba
- `check-credentials.ps1`: Verifica las credenciales de usuarios en la base de datos

### Scripts para Despliegue

- `test-and-deploy.ps1`: Script maestro para verificar pruebas y desplegar actualizaciones
- `sync-with-github.ps1`: Sincroniza cambios con el repositorio GitHub

## Pruebas Automatizadas

### Ejecutar Pruebas Básicas

```powershell
./validate-initial-tests.ps1
```

### Ejecutar Todas las Pruebas

```powershell
./run-sequential-tests.ps1
```

### Ejecutar Pruebas en Modo Headless

```powershell
./run-cypress-headless.ps1
```

## Despliegue a Producción

Para preparar el proyecto para producción, consulte el archivo `ESTRATEGIA_DESPLIEGUE.md` que contiene instrucciones detalladas sobre:

1. Preparación para producción
2. Arquitectura recomendada (basada en contenedores Docker)
3. Opciones de infraestructura en la nube
4. Configuración de Docker y Docker Compose
5. Proceso de CI/CD
6. Monitoreo y mantenimiento
7. Consideraciones de seguridad
8. Escalabilidad

### Uso del Script Maestro para Despliegue

```powershell
./test-and-deploy.ps1
```

Este script guía a través del proceso completo:
1. Limpieza de archivos de prueba
2. Arreglo de credenciales
3. Verificación de cambios en el repositorio
4. Ejecución de pruebas
5. Sincronización con GitHub (opcional)
6. Instrucciones para despliegue en producción

## Generación de Informes

Para generar un informe del estado actual del proyecto:

```powershell
./generate-report.ps1
```

Este informe incluye:
- Estado del repositorio
- Estado de la aplicación
- Estadísticas de pruebas
- Próximos pasos recomendados

## Usuarios de Prueba

### Usuario Administrador
- Email: admin@armonia.com
- Contraseña: Admin123

### Usuario Residente
- Email: residente@test.com
- Contraseña: Residente123

### Usuario Recepción
- Email: recepcion@test.com
- Contraseña: Recepcion123

## Conjuntos Residenciales de Prueba

El sistema incluye tres conjuntos residenciales de prueba:

1. **Conjunto Residencial Casas del Bosque**
   - 8 casas
   - 32 residentes
   - Servicios: salón comunal, piscina, cancha de tenis, BBQ

2. **Conjunto Residencial Villa del Mar**
   - 10 casas
   - 40 residentes
   - Servicios: salón comunal, piscina, cancha de tenis, BBQ

3. **Conjunto Residencial Torres del Parque**
   - 12 apartamentos
   - 48 residentes
   - Servicios: salón comunal, piscina, cancha de tenis, BBQ

## Modelo de Negocio

La aplicación sigue un modelo Freemium con los siguientes planes:

- **Plan Básico (Gratuito)**
  - Hasta 30 unidades residenciales
  - Gestión de propiedades y residentes
  - Portal básico de comunicaciones
  - Limitado a 1 año de históricos

- **Plan Estándar ($USD 25/mes por conjunto)**
  - Hasta 50 unidades residenciales
  - $USD 1/mes por unidad residencial adicional
  - Todas las funcionalidades básicas
  - Gestión completa de asambleas y votaciones
  - Sistema de PQR avanzado
  - Históricos de hasta 3 años

- **Plan Premium ($USD 50/mes por conjunto)**
  - Hasta 120 unidades residenciales
  - $USD 1/mes por unidad residencial adicional
  - Todas las funcionalidades estándar
  - Módulo financiero avanzado con generación automática de recibos
  - Personalización de la plataforma con logo y colores corporativos
  - Históricos completos e ilimitados
  - API para integración con otros sistemas
  - Soporte prioritario 24/7

## Contribución

### Flujo de Trabajo Git

1. Crear una rama para la nueva funcionalidad:
   ```bash
   git checkout -b feature/nombre-funcionalidad
   ```

2. Realizar cambios y hacer commit:
   ```bash
   git add .
   git commit -m "Descripción de los cambios"
   ```

3. Enviar cambios a GitHub:
   ```bash
   git push origin feature/nombre-funcionalidad
   ```

4. Crear un Pull Request para revisión.

### Convenciones de Código

- Archivos: PascalCase para componentes React (.tsx), camelCase para utilidades (.ts)
- Funciones: camelCase (ej. getUserData)
- Componentes React: PascalCase (ej. UserProfile)
- Variables: camelCase (ej. userData)
- Constantes: UPPER_SNAKE_CASE (ej. API_BASE_URL)
- Interfaces/Types: PascalCase con prefijo I para interfaces (ej. IUserData)
- Endpoints API: kebab-case (ej. /api/user-profile)

## Licencia

Este proyecto es propiedad de CIDE Solutions. Todos los derechos reservados.
