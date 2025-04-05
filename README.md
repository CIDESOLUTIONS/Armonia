# Proyecto Armonía 👥🏢

Plataforma integral para la gestión de conjuntos residenciales. Facilita la administración, comunicación y coordinación entre administradores, residentes y personal.

## Características Principales 🌟

- **Gestión de Asambleas**: Programación, convocatorias, quórum, votaciones y actas.
- **Gestión de Inventario**: Propiedades, propietarios, residentes, vehículos y áreas comunes.
- **Gestión Financiera**: Presupuestos, cuotas, pagos y reportes.
- **Sistema PQR**: Peticiones, quejas y reclamos con seguimiento completo.
- **Comunicaciones**: Anuncios, mensajería y notificaciones.
- **Panel Residente**: Estado de cuenta, reservas y participación en asambleas.
- **Panel Administrativo**: Configuración, métricas y reportes.

## Requisitos Técnicos 🔧

- Node.js 18.x o superior
- PostgreSQL 14.x o superior
- npm 9.x o superior

## Instalación 🚀

### 1. Clonar el repositorio

```bash
git clone https://github.com/YOUR_USERNAME/Armonia.git
cd Armonia
```

### 2. Configurar la base de datos

1. Crear una base de datos PostgreSQL llamada `armonia`
2. Ejecutar los scripts de configuración inicial:

```bash
cd frontend
npx prisma db push
npx prisma db seed
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo `.env.example` a `.env`:

```bash
cp frontend/.env.example frontend/.env
```

Edita el archivo `.env` con tus configuraciones:

```
# Database Configuration
DB_HOST=localhost
DB_NAME=armonia
DB_USER=tu_usuario_db
DB_PASSWORD=tu_password_db
DB_PORT=5432

# Prisma Connection URL
DATABASE_URL="postgresql://tu_usuario_db:tu_password_db@localhost:5432/armonia?schema=public"

# JWT Secret
JWT_SECRET="tu_jwt_secret_seguro"

# Email Configuration (opcional)
EMAIL_USER=tu_email@ejemplo.com
EMAIL_PASS=tu_password_email
```

### 4. Instalar dependencias

```bash
cd frontend
npm install
```

### 5. Ejecutar migraciones de la base de datos

```bash
npx prisma migrate dev
```

### 6. Ejecutar en modo desarrollo

```bash
npm run dev
```

## Scripts Disponibles 📜

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Construye la aplicación para producción.
- `npm run start`: Inicia la aplicación en modo producción.
- `npm run lint`: Ejecuta el linter para detectar problemas de código.
- `npm test`: Ejecuta las pruebas unitarias.
- `npx prisma studio`: Abre una interfaz para explorar la base de datos.

## Scripts de Utilidad 🛠️

- `./ejecutar-pruebas.ps1`: Script PowerShell para ejecutar todas las pruebas del proyecto.
- `./sincronizar-con-github.ps1`: Script PowerShell para sincronizar cambios locales con GitHub.
- `./actualizar-y-ejecutar.ps1`: Script PowerShell para actualizar dependencias y ejecutar la aplicación.

## Estructura del Proyecto 📁

```
frontend/
├── prisma/               # Esquema y migraciones de Prisma
├── public/               # Archivos estáticos
├── src/
│   ├── app/              # Rutas y páginas de Next.js
│   │   ├── (auth)/       # Rutas protegidas (dashboard, admin)
│   │   ├── (public)/     # Rutas públicas (landing, login)
│   │   └── api/          # API Routes de Next.js
│   ├── components/       # Componentes React reutilizables
│   ├── context/          # Contextos de React (Auth, Theme)
│   ├── hooks/            # Hooks personalizados
│   ├── lib/              # Utilidades y servicios
│   │   ├── api/          # Cliente HTTP para API
│   │   ├── logging/      # Utilidades de logging
│   │   └── services/     # Servicios para diferentes módulos
│   ├── models/           # Definiciones de tipos y modelos
│   └── utils/            # Funciones utilitarias
└── tailwind.config.js    # Configuración de Tailwind CSS
```

## Modelo Multi-tenant 🏢

La aplicación está diseñada con una arquitectura multi-tenant basada en esquemas de PostgreSQL:

- Esquema `armonia`: Tablas globales como usuarios y conjuntos residenciales
- Esquema `tenant_cjXXXX`: Esquema dedicado para cada conjunto residencial (donde XXXX es el ID del conjunto)

## Convenciones de Código 📝

- **Archivos**: PascalCase para componentes React (.tsx), camelCase para utilidades (.ts)
- **Funciones**: camelCase (ej. getUserData)
- **Componentes React**: PascalCase (ej. UserProfile)
- **Variables**: camelCase (ej. userData)
- **Constantes**: UPPER_SNAKE_CASE (ej. API_BASE_URL)
- **Interfaces/Types**: PascalCase con prefijo I para interfaces (ej. IUserData)
- **Endpoints API**: kebab-case (ej. /api/user-profile)

## Despliegue 🚀

Para desplegar en producción:

1. Construir la aplicación:
```bash
npm run build
```

2. Iniciar el servidor:
```bash
npm start
```

Para despliegue con Docker, consulta el archivo `Dockerfile` en la raíz del proyecto.

## Licencia 📄

Este proyecto está bajo Licencia Privada - ver el archivo LICENSE.md para detalles.

## Contacto 📧

Para preguntas o soporte, contacta a: [email@ejemplo.com]
