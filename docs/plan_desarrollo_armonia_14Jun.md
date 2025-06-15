# Plan de Desarrollo Final y Roadmap a Producción – Proyecto Armonía

**Fecha:** 2025-06-15  
**Versión:** 3.0 
**Autor:** Mario

## 1. Introducción

Este documento establece el plan de desarrollo definitivo y la hoja de ruta para llevar el proyecto Armonía a un estado de producción en un cronograma acelerado. Basado en un análisis técnico exhaustivo del código, este plan se enfoca exclusivamente en remediar los bloqueadores críticos identificados, en lugar de en el desarrollo de nuevas funcionalidades. El objetivo es capitalizar el avanzado estado de desarrollo actual (~85% completado) y asegurar un lanzamiento seguro, estable y exitoso.

## 2. Estado Actual del Proyecto (Resumen)

Armonía es una plataforma robusta y funcionalmente rica, con una arquitectura sólida y un desarrollo avanzado en todas las áreas clave:

*   **Base de Datos:** 16 esquemas Prisma especializados que modelan dominios complejos.
*   **Backend:** Lógica de negocio avanzada en servicios como `BillingEngine`, `AssemblyAdvancedService`, `CameraService`, etc.
*   **Frontend:** Interfaz de usuario rica e interactiva construida con componentes, hooks y contextos especializados.
*   **Funcionalidades Core Completas:** Módulos de Finanzas, Asambleas, Seguridad, PQR, Reservas, Comunicaciones e Inventario están implementados y funcionales a nivel de código.

### Bloqueadores Críticos para Producción

Este plan se centra en la eliminación de los siguientes tres problemas de alta prioridad que impiden el lanzamiento:

1.  **🔴 Vulnerabilidad de Seguridad Crítica:** La persistencia de consultas SQL crudas (`$queryRawUnsafe`) en módulos clave presenta un riesgo inaceptable de inyección SQL.
2.  **🔴 Cobertura de Pruebas E2E Insuficiente:** La falta de pruebas automatizadas de extremo a extremo para los flujos de usuario críticos deja la aplicación vulnerable a regresiones y errores en producción.
3.  **🔴 Ausencia de Automatización (CI/CD):** La falta de un pipeline de Integración y Despliegue Continuo (CI/CD) hace que el proceso de prueba y lanzamiento sea manual, lento y propenso a errores.

## 3. Plan de Acción Acelerado a Producción (2-3 Semanas)

Este plan está estructurado en dos fases intensivas de una semana cada una, seguidas de una fase final de lanzamiento.

---

### **Fase 1: Remediación Crítica y Fortalecimiento (Semana 1)**

**Objetivo:** Eliminar toda la deuda técnica crítica y establecer una base sólida de pruebas y automatización.

#### **Track 1: Seguridad - Cero Tolerancia a `$queryRawUnsafe` (Prioridad Absoluta)**
*   **Tarea 1.1: Identificación y Mapeo (1 Día)**
    *   **Acción:** Ejecutar un `grep` exhaustivo en todo el codebase (`grep -r '$queryRawUnsafe' src/`) para localizar y catalogar cada instancia de la vulnerabilidad. Crear un checklist detallado (ej. en un `TODO.md`) para seguimiento.
*   **Tarea 1.2: Refactorización Intensiva (3 Días)**
    *   **Acción:** Asignar recursos de desarrollo para reemplazar sistemáticamente cada llamada a `$queryRawUnsafe` con su equivalente seguro y tipado del Prisma Client (ej. `findUnique`, `findMany`, `create`, `update`, `delete`, `$transaction`).
    *   **Validación:** Después de cada refactorización, ejecutar las pruebas unitarias y de integración existentes (`npm test`) para asegurar que no se ha introducido ninguna regresión funcional.
*   **Tarea 1.3: Verificación Final (1 Día)**
    *   **Acción:** Ejecutar un `grep` final para confirmar que no quedan instancias de `$queryRawUnsafe`. Realizar una revisión de código cruzada (peer review) de todos los cambios.

#### **Track 2: Pruebas End-to-End - Automatización de Flujos Críticos**
*   **Tarea 1.4: Desarrollo de la Suite de Pruebas E2E con Playwright (Trabajo en Paralelo - 4 Días)**
    *   **Estrategia:** Crear pruebas E2E para los flujos de usuario más críticos que simulen la interacción real.
    *   **Flujos a Cubrir:**
        1.  **Onboarding:** Registro de un nuevo conjunto residencial y su administrador.
        2.  **Finanzas:** Creación de una factura, registro de un pago por un residente y verificación del estado de cuenta.
        3.  **Asambleas:** Creación de una asamblea, emisión de un voto en tiempo real y consulta de resultados.
        4.  **Seguridad:** Registro de una minuta digital por un guardia y consulta por el administrador.
        5.  **Reservas:** Creación y pago de una reserva de un área común por un residente.

#### **Track 3: Automatización - Pipeline de Integración Continua (CI)**
*   **Tarea 1.5: Configuración de GitHub Actions (1 Día)**
    *   **Acción:** Crear el workflow `.github/workflows/ci.yml`.
    *   **Pasos del Workflow:**
        *   **Disparador:** `on: [push, pull_request]` para las ramas `main` y `develop`.
        *   **Jobs:**
            1.  `lint`: Ejecutar `eslint` para análisis estático.
            2.  `build`: Ejecutar `npm run build` para verificar que el proyecto compila.
            3.  `test-unit`: Ejecutar `npm test` para correr toda la suite de Jest (pruebas unitarias y de integración).

---

### **Fase 2: Estabilización y Preparación para Despliegue (Semana 2)**

**Objetivo:** Asegurar que la plataforma es estable, robusta, desplegable y está lista para los usuarios.

#### **Track 1: Calidad y UX**
*   **Tarea 2.1: Ejecución y Depuración de Pruebas E2E (2 Días)**
    *   **Acción:** Ejecutar la suite completa de E2E desarrollada en la Fase 1 contra un entorno de `staging`. Identificar, priorizar y corregir todos los bugs encontrados.
*   **Tarea 2.2: Optimizaciones Menores de UX (1 Día)**
    *   **Acción:** Realizar un recorrido por los flujos principales probados en E2E para identificar y corregir problemas evidentes de usabilidad (low-hanging fruit).

#### **Track 2: DevOps - Pipeline de Despliegue Continuo (CD)**
*   **Tarea 2.3: Extensión del Pipeline de CI/CD (2 Días)**
    *   **Acción:** Mejorar el workflow `ci.yml`.
    *   **Pasos Adicionales:**
        *   Añadir un job `test-e2e` que se ejecute después de `test-unit` y corra las pruebas de Playwright.
        *   Crear un workflow `deploy.yml` separado para los despliegues.
        *   **Deploy a Staging:** Configurar un job que despliegue automáticamente a un entorno de `staging` en cada merge a la rama `develop`.
        *   **Deploy a Producción:** Configurar un job de despliegue a producción que se dispare manualmente o al crear un `tag` en la rama `main`.
*   **Tarea 2.4: Preparación y Documentación de Entornos (En Paralelo)**
    *   **Acción:** Documentar todas las variables de entorno necesarias para `staging` y `producción`. Crear scripts para facilitar la configuración inicial de la base de datos.

#### **Track 3: Documentación Final**
*   **Tarea 2.5: Creación de Guías de Usuario Esenciales (2 Días)**
    *   **Acción:** Redactar guías de inicio rápido en formato Markdown para los roles de **Administrador** y **Residente**, cubriendo las funcionalidades más importantes.

---

### **Fase 3: Lanzamiento (Inicio Semana 3)**

**Objetivo:** Realizar el despliegue final a producción.

*   **Tarea 3.1: Go/No-Go Meeting (1/2 Día)**
    *   **Acción:** Revisar el checklist de completitud de las Fases 1 y 2. Tomar la decisión final de lanzar.
*   **Tarea 3.2: Despliegue a Producción (1/2 Día)**
    *   **Acción:** Ejecutar el pipeline de despliegue a producción.
*   **Tarea 3.3: Monitoreo Post-Lanzamiento**
    *   **Acción:** Monitorear activamente los logs, el rendimiento de la aplicación y el feedback inicial de los usuarios.

## 4. Roadmap Post-Lanzamiento

*   **Inmediato:** Soporte a los primeros usuarios y corrección de bugs urgentes.
*   **Próximo Mes:**
    *   Realizar una auditoría de seguridad formal con un tercero.
    *   Expandir la documentación de usuario.
    *   Recopilar feedback para priorizar el desarrollo de futuras funcionalidades o mejoras.
*   **Próximo Trimestre:**
    *   Implementar las optimizaciones de UX más complejas.
    *   Planificar el desarrollo de nuevas funcionalidades basadas en la demanda del mercado.

Este plan de desarrollo intensivo y enfocado permitirá que Armonía pase de su estado actual a un producto lanzado y seguro en un tiempo récord, mitigando los riesgos críticos y construyendo sobre su ya impresionante base de funcionalidades.
