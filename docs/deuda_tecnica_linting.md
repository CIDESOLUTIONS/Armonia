# Deuda Técnica: Errores de Linting Persistentes

## Resumen

Este documento registra los errores de linting persistentes en el proyecto Armonía que han sido clasificados como deuda técnica para ser abordados en una fase posterior dedicada a la optimización y refactorización del código.

## Errores Identificados

Los siguientes errores de linting continúan apareciendo en el pipeline CI/CD a pesar de los intentos de corrección:

1. "`require()` style import is forbidden" - En archivos de pruebas
2. "'require' is not defined" - En archivos de pruebas
3. "'__dirname' is not defined" - En archivos de pruebas
4. "'result' is assigned a value but never used" - En archivos de pruebas
5. "'module' is not defined" - En archivos de pruebas

## Archivos Afectados

Los errores se presentan principalmente en:

- Archivos de pruebas en `src/components/reservations/__tests__/`
- Archivos de pruebas en `src/services/__tests__/`
- Archivos de mocks en `src/__mocks__/`

## Intentos de Corrección Realizados

1. Migración de sintaxis CommonJS a ES6 en archivos de pruebas
2. Actualización de mocks para usar sintaxis ES6
3. Corrección de referencias a variables globales

## Causas Probables

1. Incompatibilidad entre la configuración de Jest y ESLint
2. Configuración de ESLint demasiado estricta para archivos de pruebas
3. Posible necesidad de configuración específica para entorno de pruebas

## Plan de Acción Futuro

Se recomienda abordar estos errores en una fase posterior dedicada a la optimización técnica:

1. Revisar y actualizar la configuración de ESLint para permitir sintaxis específica en archivos de pruebas
2. Considerar la creación de un archivo `.eslintrc` específico para directorios de pruebas
3. Evaluar la migración completa del framework de pruebas a una configuración más compatible con las reglas de linting actuales
4. Implementar herramientas de formateo automático de código como Prettier

## Impacto Actual

Estos errores no afectan la funcionalidad del sistema ni la calidad del código de producción, solo generan advertencias en el pipeline CI/CD durante la fase de linting.

## Prioridad Recomendada

**Media-Baja**: Abordar en una fase posterior dedicada a la optimización técnica y refactorización.
