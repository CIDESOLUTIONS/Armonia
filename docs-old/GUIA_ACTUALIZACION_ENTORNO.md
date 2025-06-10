# Guía de Actualización del Entorno de Desarrollo para Armonía

## Introducción

Este documento proporciona instrucciones detalladas para que todos los desarrolladores actualicen sus entornos de desarrollo a la nueva línea base del proyecto Armonía, que incluye:

- PostgreSQL 17.5 (actualizado desde 14.x)
- Next.js 15.3.3 (actualizado desde 14.2.24)
- React 19.1.0 (actualizado desde 18.2.0)
- Otras dependencias actualizadas

## Recomendación Importante

**Se recomienda realizar un nuevo clon del repositorio** en lugar de actualizar el existente, para evitar conflictos con archivos generados, caché y configuraciones previas que podrían causar problemas durante la migración.

## Paso a Paso para Actualizar el Entorno

### 1. Clonar el Repositorio (Recomendado)

```bash
# Crear un directorio nuevo para el proyecto
mkdir -p ~/nuevo-armonia
cd ~/nuevo-armonia

# Clonar el repositorio
git clone https://github.com/CIDESOLUTIONS/Armonia.git .

# Si necesitas autenticación, usa el token proporcionado
git clone https://[TOKEN]@github.com/CIDESOLUTIONS/Armonia.git .
```

### 2. Instalar PostgreSQL 17

```bash
# Actualizar repositorios
sudo apt update
sudo apt install -y wget gnupg lsb-release

# Añadir repositorio oficial de PostgreSQL
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Actualizar e instalar PostgreSQL 17
sudo apt update
sudo apt install -y postgresql-17 postgresql-contrib-17

# Crear cluster si es necesario
sudo pg_createcluster 17 main

# Iniciar el servicio
sudo systemctl start postgresql@17-main
```

### 3. Configurar la Base de Datos

```bash
# Crear usuario y base de datos
sudo -u postgres psql -c "CREATE USER [tu_usuario] WITH PASSWORD 'password' SUPERUSER;"
sudo -u postgres psql -c "CREATE DATABASE armonia OWNER [tu_usuario];"

# Verificar que el servicio esté funcionando
sudo systemctl status postgresql@17-main
```

### 4. Configurar Variables de Entorno

Asegúrate de que tu archivo `.env` tenga la configuración correcta para PostgreSQL 17:

```
DB_HOST=localhost
DB_PORT=5433  # PostgreSQL 17 usa el puerto 5433 por defecto
DB_USER=[tu_usuario]
DB_PASSWORD=password
DB_NAME=armonia
```

### 5. Instalar Dependencias del Proyecto

```bash
# Instalar dependencias con flag legacy-peer-deps para resolver conflictos
npm install --legacy-peer-deps
```

### 6. Sincronizar la Estructura de la Base de Datos

```bash
# Generar cliente Prisma y aplicar migraciones
npx prisma generate
npx prisma migrate dev
```

### 7. Verificar la Instalación

```bash
# Construir el proyecto
npm run build

# Iniciar el servidor de desarrollo
npm run dev
```

## Solución de Problemas Comunes

### Errores de Sintaxis en JSX

La actualización a React 19 y Next.js 15 puede causar errores de sintaxis en componentes JSX. Revisa estos patrones comunes:

1. **Entidades HTML en strings**: Reemplaza `&quot;` por comillas reales `"`.
2. **Props vacías**: Asegúrate de que todas las props tengan valores (`currency={}` debe ser `currency={currency}`).
3. **Referencias incorrectas**: Verifica que no haya referencias a variables no declaradas (como `uage` en lugar de `language`).

### Conflictos de Babel/SWC

Next.js 15 usa SWC por defecto, pero puede haber conflictos con configuraciones personalizadas de Babel:

```bash
# Si encuentras errores relacionados con SWC y Babel, actualiza next.config.js
# Reemplaza 'serverComponentsExternalPackages' por 'serverExternalPackages'
# Elimina 'swcMinify' si está presente
```

### Módulos Faltantes

Si encuentras errores de módulos no encontrados, instálalos con:

```bash
npm install [nombre-del-modulo] --legacy-peer-deps
```

## Buenas Prácticas para Evitar Problemas de Lint

1. **Usa comillas dobles** para strings en JSX y TSX, no entidades HTML.
2. **Evita props vacías** en componentes React.
3. **Declara todas las variables** antes de usarlas.
4. **Usa tipado explícito** para parámetros de funciones y componentes.
5. **Evita bloques try/catch anidados** o mal formados.
6. **Actualiza rutas de API** para usar el nuevo formato App Router de Next.js 15.
7. **Usa el operador de encadenamiento opcional** (`?.`) en lugar de verificaciones anidadas.
8. **Usa `const` en lugar de `let`** para variables que no se reasignan.
9. **Evita variables no utilizadas** o renómbralas con prefijo `_` si son necesarias para la estructura.
10. **Importa todos los componentes** que utilizas en tus archivos, especialmente los iconos de Lucide React.

## Estructura de Rutas en Next.js 15

Next.js 15 prioriza el App Router sobre el Pages Router. La estructura recomendada es:

```
src/
  app/            # Nuevas rutas usando App Router (prioridad)
    api/          # API routes usando App Router
    (auth)/       # Rutas agrupadas por contexto
    (public)/     # Rutas públicas
    layout.tsx    # Layout principal
  pages/          # Legacy Pages Router (solo para compatibilidad)
  components/     # Componentes compartidos
  lib/            # Utilidades y servicios
```

## Próximos Pasos

Se continuará trabajando en la corrección de errores adicionales y la optimización del código. Mantente atento a actualizaciones en el repositorio y asegúrate de hacer pull regularmente.

## Contacto

Si encuentras problemas durante la actualización, contacta al equipo de desarrollo a través del canal de Slack #armonia-dev.
