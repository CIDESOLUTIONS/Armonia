# Proyecto Armonía

![Armonía Logo](./frontend/public/logo.png)

## Descripción

Armonía es una plataforma integral para la gestión de conjuntos residenciales, diseñada para facilitar la administración, comunicación y coordinación entre administradores, residentes y personal administrativo. La plataforma permite gestionar eficientemente todos los aspectos de la vida en comunidad, desde asambleas y administración de espacios comunes, hasta la gestión de finanzas y solicitudes.

## Características Principales

### Dashboard
- Panel principal con indicadores y estadísticas clave
- Visualización gráfica de estado financiero
- Resumen de actividades y eventos próximos

### Gestión de Inventario
- **Propiedades**: Registro y administración de inmuebles
- **Vehículos**: Control de vehículos registrados en el conjunto
- **Mascotas**: Registro de mascotas por unidad residencial
- **Servicios Comunes**: Administración de zonas y servicios del conjunto

### Gestión de Asambleas
- Programación y convocatoria de asambleas
- Control de asistencia y cálculo de quórum
- Sistema de votaciones en tiempo real
- Gestión de actas y documentos asociados

### Gestión Financiera
- Presupuestos anuales y seguimiento
- Cuotas ordinarias y extraordinarias
- Registro y seguimiento de pagos
- Generación de recibos y facturas
- Reportes financieros personalizables

### Gestión de Residentes
- Registro de propietarios y arrendatarios
- Asociación de residentes a inmuebles
- Control de residentes principales
- Directorio de residentes

### Sistema de PQR (Peticiones, Quejas y Reclamos)
- Creación y seguimiento de solicitudes
- Categorización por tipo y prioridad
- Asignación de responsables
- Historial de comunicaciones

### Módulo de Comunicaciones
- Tablón de anuncios
- Mensajería interna
- Notificaciones por correo electrónico
- Comunicados oficiales

### Configuración del Sistema
- Personalización de la plataforma
- Integración con pasarelas de pago
- Conexión a cámaras de seguridad
- Integración con WhatsApp

## Tecnologías Utilizadas

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Shadcn/UI
- Recharts (visualización de datos)

### Backend
- Next.js API Routes
- Serverless Functions
- Prisma ORM
- JWT (autenticación)
- Zod (validación)

### Base de Datos
- PostgreSQL con enfoque multi-tenant

## Modelos de Suscripción

La plataforma ofrece tres planes de suscripción:

### Plan Básico (Gratuito)
- Hasta 30 unidades residenciales
- Gestión de propiedades y residentes
- Portal básico de comunicaciones
- Históricos limitados a 1 año

### Plan Estándar ($USD 25/mes)
- Hasta 50 unidades residenciales
- Todas las funcionalidades básicas
- Gestión completa de asambleas y votaciones
- Sistema de PQR avanzado
- Históricos de hasta 3 años

### Plan Premium ($USD 50/mes)
- Hasta 120 unidades residenciales
- Todas las funcionalidades estándar
- Módulo financiero avanzado
- Personalización de la plataforma
- Históricos completos e ilimitados
- API para integración con otros sistemas
- Soporte prioritario 24/7

## Instalación y Configuración

### Requisitos Previos
- Node.js 18 o superior
- PostgreSQL 14 o superior
- npm o yarn

### Pasos de Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/CIDESOLUTIONS/Armonia.git
cd Armonia/frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

4. Configurar variables de entorno (edita el archivo `.env`):
```
DATABASE_URL=postgresql://username:password@localhost:5432/armonia
JWT_SECRET=your_secret_key
```

5. Ejecutar migraciones de base de datos:
```bash
npx prisma migrate dev
```

6. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

7. Acceder a la aplicación en [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

```
frontend/
├── prisma/           # Esquema y migraciones de Prisma
├── public/           # Archivos estáticos
├── src/
│   ├── app/          # Rutas y páginas (Next.js App Router)
│   │   ├── (auth)/   # Rutas protegidas
│   │   ├── (public)/ # Rutas públicas
│   │   └── api/      # API Routes
│   ├── components/   # Componentes React
│   ├── context/      # Contextos de React
│   ├── hooks/        # Custom hooks
│   ├── lib/          # Utilidades y servicios
│   ├── styles/       # Estilos globales
│   └── types/        # Definiciones de tipos
└── tests/            # Pruebas
```

## Licencia

Este proyecto está bajo licencia privada. Todos los derechos reservados.

## Contacto

Para obtener más información, contactar a través de:
- Email: custumers@cidesolutions.com
- Web: [CIDE Solutions](https://cidesas.com)
