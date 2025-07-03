# CodeViz Research Context

> **Note**: This file contains research context from CodeViz. Most recent contexts are at the bottom.

---

## Research Query

muestreme los diferentes flujos de la aplicación armonia

*Session: a7f35acc801bf9fe79789a2f1561ae72 | Generated: 3/7/2025, 17:02:36*

### Analysis Summary

# Flujos de la Aplicación Armonía

La aplicación Armonía está estructurada para manejar diferentes roles de usuario y funcionalidades, lo que se refleja en sus distintos flujos de trabajo. A continuación, se detallan los principales flujos identificados, desde una perspectiva de alto nivel hasta componentes específicos.

## Arquitectura de Alto Nivel

Armonía sigue una arquitectura que separa la lógica de presentación (Next.js) de la lógica de negocio y acceso a datos (API Routes, servicios, Prisma). La aplicación se organiza en torno a roles de usuario y funcionalidades clave.

*   **Frontend (Next.js):** Maneja la interfaz de usuario y la interacción del cliente. Las rutas principales se definen en [src/app](src/app).
*   **Backend (Next.js API Routes):** Proporciona los endpoints de la API para la comunicación con la base de datos y la lógica de negocio. Ubicados en [src/app/api](src/app/api).
*   **Middleware:** Gestiona la autenticación y autorización a nivel de ruta, definido en [middleware.ts](middleware.ts).
*   **Base de Datos (Prisma):** Define los esquemas de datos y las migraciones, con múltiples esquemas para diferentes módulos en [prisma/](prisma/).

## Flujos Principales de la Aplicación

### 1. Flujo de Autenticación y Autorización

Este flujo es fundamental para el acceso seguro a la aplicación y la gestión de sesiones de usuario.

*   **Propósito:** Permitir a los usuarios iniciar sesión, registrarse y mantener sesiones seguras, así como proteger rutas basadas en roles.
*   **Partes Internas:**
    *   **Páginas de Autenticación:** Las interfaces de usuario para el inicio de sesión y registro se encuentran en [src/app/(auth)](src/app/auth).
    *   **API de Autenticación:** Los endpoints para el manejo de credenciales, tokens y sesiones están en [src/app/api/auth](src/app/api/auth).
    *   **Middleware de Autenticación:** [middleware.ts](middleware.ts) intercepta las solicitudes para verificar la autenticación y los permisos antes de acceder a las rutas protegidas.
    *   **Servicios de Autenticación:** Lógica de negocio relacionada con la autenticación, posiblemente en [src/services/auth](src/services/auth) o similar.
*   **Relaciones Externas:** Interactúa con la base de datos (a través de Prisma) para verificar credenciales y almacenar información de usuario.

### 2. Flujo de Navegación y Roles de Usuario

Armonía segrega la experiencia del usuario basada en roles (administrador, residente, recepción, público).

*   **Propósito:** Dirigir a los usuarios a las secciones apropiadas de la aplicación según su rol y permisos.
*   **Partes Internas:**
    *   **Rutas de Administrador:** Definidas en [src/app/(admin)](src/app/admin).
    *   **Rutas de Residente:** Definidas en [src/app/(resident)](src/app/resident).
    *   **Rutas de Recepción:** Definidas en [src/app/(reception)](src/app/reception).
    *   **Rutas Públicas:** Contenido accesible sin autenticación, como la página de inicio, en [src/app/(public)](src/app/public).
    *   **Componentes de Navegación:** Componentes de UI que adaptan las opciones de menú según el rol del usuario, posiblemente en [src/components/common/navbar.tsx](src/components/common/navbar.tsx) o similar.
*   **Relaciones Externas:** Depende del flujo de autenticación para determinar el rol del usuario y del middleware para aplicar las restricciones de acceso.

### 3. Flujos de Gestión de Módulos (Ej. Asambleas, Finanzas, Inventario)

La aplicación incluye varios módulos funcionales, cada uno con sus propios flujos de creación, lectura, actualización y eliminación (CRUD) de datos.

*   **Propósito:** Permitir a los usuarios interactuar con datos específicos de cada módulo (ej. crear una asamblea, registrar una transacción financiera, gestionar inventario).
*   **Partes Internas (Ejemplo: Módulo de Asambleas):**
    *   **Páginas de Asambleas:** Interfaces de usuario para listar, crear, editar y ver detalles de asambleas, ubicadas en [src/app/(admin)/assemblies](src/app/admin/assemblies) o [src/app/(resident)/assemblies](src/app/resident/assemblies).
    *   **API de Asambleas:** Endpoints para la gestión de asambleas, como [src/app/api/assemblies](src/app/api/assemblies).
    *   **Esquema Prisma:** [prisma/schema_assembly.prisma](prisma/schema_assembly.prisma) define la estructura de datos para las asambleas.
    *   **Componentes de UI:** Componentes reutilizables para formularios, tablas, etc., en [src/components/assemblies](src/components/assemblies) o [src/components/assembly](src/components/assembly).
    *   **Tests E2E:** Los tests en [e2e/assemblies.spec.ts](e2e/assemblies.spec.ts) describen el flujo de usuario completo para este módulo.
*   **Relaciones Externas:** Cada módulo interactúa con sus respectivos endpoints de API, que a su vez utilizan Prisma para interactuar con la base de datos.

Otros módulos con flujos similares incluyen:

*   **Finanzas:** [e2e/finances.spec.ts](e2e/finances.spec.ts), [prisma/schema_financial.prisma](prisma/schema_financial.prisma)
*   **Inventario:** [e2e/inventory.spec.ts](e2e/inventory.spec.ts)
*   **PQR (Peticiones, Quejas, Reclamos):** [e2e/pqr-enhanced.spec.ts](e2e/pqr-enhanced.spec.ts), [prisma/schema_pqr_advanced.prisma](prisma/schema_pqr_advanced.prisma)
*   **Reservas:** [e2e/reservations.spec.ts](e2e/reservations.spec.ts), [prisma/schema_reservations.prisma](prisma/schema_reservations.prisma)
*   **Seguridad:** [e2e/security.spec.ts](e2e/security.spec.ts), [prisma/schema_security.prisma](prisma/schema_security.prisma)

### 4. Flujo de Comunicación (WebSockets)

La aplicación parece tener un módulo de comunicación que utiliza WebSockets.

*   **Propósito:** Habilitar la comunicación en tiempo real dentro de la aplicación.
*   **Partes Internas:**
    *   **Servicio WebSocket:** [src/communications/websocket-service.js](src/communications/websocket-service.js) es el punto central para la gestión de conexiones WebSocket.
    *   **Integraciones:** [src/communications/integrations](src/communications/integrations) podría contener lógica para integrar el servicio WebSocket con otras partes de la aplicación o servicios externos.
*   **Relaciones Externas:** Se conecta a un servidor WebSocket (no directamente visible en la estructura de archivos proporcionada, pero implícito por el servicio).

### 5. Flujo de Onboarding

Existe un flujo específico para el proceso de onboarding de nuevos usuarios o entidades.

*   **Propósito:** Guiar a los nuevos usuarios a través de los pasos iniciales de configuración o registro.
*   **Partes Internas:**
    *   **Tests E2E:** [e2e/onboarding.spec.ts](e2e/onboarding.spec.ts) detalla los pasos de este flujo.
*   **Relaciones Externas:** Probablemente interactúa con los servicios de usuario y base de datos para almacenar la información de onboarding.

### 6. Flujo de Navegación Completa (End-to-End)

Un flujo que abarca la navegación general a través de múltiples secciones de la aplicación.

*   **Propósito:** Verificar la coherencia y funcionalidad de la navegación entre diferentes módulos y roles.
*   **Partes Internas:**
    *   **Tests E2E:** [e2e/complete-navigation.spec.ts](e2e/complete-navigation.spec.ts) simula un recorrido completo por la aplicación.
*   **Relaciones Externas:** Depende de la correcta implementación de todos los flujos individuales y la lógica de enrutamiento de Next.js.

