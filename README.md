# Proyecto Armonía

Plataforma integral para la gestión de conjuntos residenciales, diseñada para facilitar la administración, comunicación y coordinación entre administradores, residentes y personal.

## Características

- Gestión completa de conjuntos residenciales
- Sistema de autenticación y roles
- Módulo financiero para presupuestos, cuotas y pagos
- Sistema de PQR (Peticiones, Quejas y Reclamos)
- Gestión de asambleas y votaciones
- Panel de administrador, residente y personal

## Tecnologías

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Next.js API Routes, Serverless Functions
- **Base de Datos**: PostgreSQL con enfoque multi-tenant basado en esquemas
- **ORM**: Prisma 6.5.0
- **Autenticación**: JWT (JSON Web Tokens)

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

## Configuración

1. Clonar el repositorio

```bash
git clone https://github.com/meciza/Armonia.git
cd Armonia
```

2. Instalar dependencias

```bash
cd frontend
npm install
```

3. Configurar variables de entorno

Copia `.env.example` a `.env` y actualiza las variables según tu configuración:

```bash
cp .env.example .env
```

4. Ejecutar migraciones de base de datos

```bash
npx prisma migrate deploy
```

5. Poblar la base de datos con datos iniciales

```bash
npx prisma db seed
```

6. Iniciar el servidor de desarrollo

```bash
npm run dev
```

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run start`: Inicia el servidor en modo producción
- `npm run lint`: Ejecuta ESLint para verificar el código
- `npm run test`: Ejecuta pruebas unitarias
- `npm run cypress:open`: Abre Cypress para pruebas e2e
- `npm run prisma:generate`: Genera el cliente Prisma
- `npm run prisma:seed`: Ejecuta el script de seed

## Scripts de PowerShell para automatización

- `actualizar-y-ejecutar.ps1`: Actualiza dependencias y ejecuta la aplicación
- `sincronizar-con-github.ps1`: Sincroniza cambios con GitHub
- `ejecutar-pruebas.ps1`: Ejecuta todas las pruebas

## Estructura del Proyecto

```
frontend/
├── prisma/            # Esquema de la base de datos y migraciones
├── public/            # Archivos estáticos
├── src/
│   ├── app/           # Rutas de Next.js App Router
│   ├── components/    # Componentes React reutilizables
│   ├── context/       # Contextos de React
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Utilidades y servicios
│   ├── models/        # Tipos y modelos
│   └── utils/         # Funciones utilitarias
├── .env               # Variables de entorno
└── package.json       # Dependencias y scripts
```

## Documentación

Para más información, consulta los siguientes documentos:

- [Pruebas realizadas](./pruebas-realizadas.md)
- [Informe final](./informe-final.md)

## Licencia

Este proyecto es privado y confidencial.