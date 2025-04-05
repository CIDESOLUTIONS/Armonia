# Plan de Pruebas Manuales - Proyecto Armonía

Este documento detalla las pruebas manuales que deben realizarse para verificar el correcto funcionamiento del proyecto Armonía.

## Instrucciones generales

1. Ejecutar la aplicación en modo desarrollo usando el script:
   ```
   ./actualizar-y-ejecutar.ps1
   ```

2. Acceder a la aplicación en: http://localhost:3000

3. Realizar las pruebas en el orden indicado y marcar los resultados.

## 1. Pruebas de Autenticación

### 1.1 Registro de usuario administrador (si aplica)

- [ ] Acceder a http://localhost:3000/register
- [ ] Completar formulario con datos válidos
- [ ] Verificar redirección al login después del registro exitoso
- [ ] Verificar que se muestre mensaje de error si el email ya está registrado

### 1.2 Login

- [ ] Acceder a http://localhost:3000/login
- [ ] Ingresar credenciales incorrectas y verificar mensaje de error
- [ ] Ingresar credenciales correctas
- [ ] Verificar redirección al dashboard después del login exitoso
- [ ] Verificar que la información del usuario se muestre correctamente en la UI

### 1.3 Persistencia de sesión

- [ ] Después de login exitoso, recargar la página
- [ ] Verificar que la sesión permanezca activa
- [ ] Cerrar y volver a abrir el navegador
- [ ] Verificar que la sesión se mantenga (si se usan cookies)

### 1.4 Logout

- [ ] Hacer clic en el botón de cerrar sesión
- [ ] Verificar redirección al login
- [ ] Intentar acceder a una ruta protegida después del logout
- [ ] Verificar redirección al login nuevamente

### 1.5 Protección de rutas

- [ ] Sin estar autenticado, intentar acceder a http://localhost:3000/dashboard
- [ ] Verificar redirección al login
- [ ] Intentar acceder a otras rutas protegidas (inventario, finanzas, etc.)
- [ ] Verificar redirección al login en todos los casos

## 2. Pruebas de Dashboard

### 2.1 Carga inicial

- [ ] Verificar que el dashboard cargue correctamente después del login
- [ ] Comprobar que se muestren todas las secciones (estadísticas, gráficos, etc.)
- [ ] Verificar que los datos mostrados sean coherentes

### 2.2 Navegación

- [ ] Comprobar funcionamiento de todos los enlaces del menú principal
- [ ] Verificar que la navegación entre secciones mantenga el estado de autenticación
- [ ] Probar el colapso/expansión del menú lateral si existe

### 2.3 Responsive

- [ ] Verificar visualización en dispositivos móviles (usar emulador del navegador)
- [ ] Comprobar funcionamiento del menú en versión móvil
- [ ] Verificar que todos los elementos sean accesibles en pantallas pequeñas

## 3. Pruebas del Módulo PQR

### 3.1 Listado de PQRs

- [ ] Acceder a la sección de PQRs
- [ ] Verificar que se cargue la lista de peticiones
- [ ] Comprobar funcionamiento de la paginación
- [ ] Verificar ordenamiento por columnas si está disponible

### 3.2 Filtros

- [ ] Probar todos los filtros disponibles (estado, prioridad, tipo)
- [ ] Verificar funcionamiento de la búsqueda por texto
- [ ] Comprobar que los resultados sean coherentes con los filtros aplicados
- [ ] Verificar el botón de limpiar filtros

### 3.3 Creación de PQR

- [ ] Hacer clic en "Nueva solicitud"
- [ ] Completar el formulario con datos válidos
- [ ] Verificar validaciones de campos obligatorios
- [ ] Enviar formulario y comprobar que la nueva solicitud aparezca en la lista

### 3.4 Visualización de detalles

- [ ] Hacer clic en una solicitud de la lista
- [ ] Verificar que se muestren todos los detalles correctamente
- [ ] Comprobar que los estados y prioridades se visualicen con los colores adecuados

### 3.5 Actualización de estado (solo admin)

- [ ] Como administrador, cambiar el estado de una solicitud
- [ ] Agregar una respuesta
- [ ] Guardar cambios y verificar actualización en la lista
- [ ] Verificar que los cambios persistan al recargar la página

## 4. Pruebas del Módulo Financiero

### 4.1 Listado de cuotas

- [ ] Acceder a la sección financiera
- [ ] Verificar carga del listado de cuotas
- [ ] Comprobar funcionamiento de filtros
- [ ] Verificar visualización de estados (pagado, pendiente, etc.)

### 4.2 Generación de cuotas (admin)

- [ ] Como administrador, crear una nueva cuota
- [ ] Verificar validaciones del formulario
- [ ] Comprobar que la nueva cuota aparezca en el listado

### 4.3 Registro de pagos (admin)

- [ ] Registrar un pago para una cuota pendiente
- [ ] Verificar actualización del estado
- [ ] Comprobar generación de recibo si aplica

### 4.4 Reportes financieros

- [ ] Generar reportes disponibles
- [ ] Verificar que los datos sean coherentes
- [ ] Comprobar opciones de exportación si existen

## 5. Pruebas del Módulo de Asambleas

### 5.1 Listado de asambleas

- [ ] Acceder a la sección de asambleas
- [ ] Verificar carga del listado
- [ ] Comprobar visualización de estados (programada, completada, etc.)

### 5.2 Creación de asamblea (admin)

- [ ] Como administrador, crear una nueva asamblea
- [ ] Completar todos los campos requeridos
- [ ] Verificar que la nueva asamblea aparezca en el listado

### 5.3 Gestión de votaciones

- [ ] Crear una votación para una asamblea
- [ ] Configurar opciones de votación
- [ ] Verificar estado de la votación
- [ ] Emitir votos (si aplica)
- [ ] Cerrar votación y verificar resultados

### 5.4 Generación de actas

- [ ] Generar acta de una asamblea completada
- [ ] Verificar que incluya toda la información relevante
- [ ] Comprobar opciones de descarga/impresión

## 6. Pruebas del Módulo de Inventario

### 6.1 Listado de propiedades

- [ ] Acceder a la sección de inventario
- [ ] Verificar carga del listado de propiedades
- [ ] Comprobar funcionamiento de filtros
- [ ] Verificar visualización de detalles

### 6.2 Gestión de propiedades (admin)

- [ ] Crear una nueva propiedad
- [ ] Editar una propiedad existente
- [ ] Verificar que los cambios se reflejen correctamente

### 6.3 Gestión de residentes

- [ ] Agregar un residente a una propiedad
- [ ] Editar información de un residente
- [ ] Eliminar un residente
- [ ] Verificar que los cambios persistan

### 6.4 Gestión de vehículos

- [ ] Agregar vehículo a una propiedad
- [ ] Editar detalles de un vehículo
- [ ] Eliminar un vehículo
- [ ] Verificar que los cambios se reflejen correctamente

## 7. Pruebas generales de UI/UX

### 7.1 Consistencia visual

- [ ] Verificar consistencia en colores, tipografía y espaciado
- [ ] Comprobar que los iconos sean coherentes
- [ ] Verificar el correcto funcionamiento del tema oscuro/claro si existe

### 7.2 Mensajes de feedback

- [ ] Verificar que se muestren mensajes al realizar acciones (éxito, error)
- [ ] Comprobar que los mensajes sean claros y descriptivos
- [ ] Verificar que los mensajes de error proporcionen información útil

### 7.3 Rendimiento

- [ ] Verificar tiempos de carga de las diferentes secciones
- [ ] Comprobar fluidez en la navegación
- [ ] Verificar funcionamiento con datos masivos (muchas propiedades, PQRs, etc.)

### 7.4 Accesibilidad

- [ ] Verificar contraste de colores
- [ ] Comprobar navegación por teclado
- [ ] Verificar etiquetas para lectores de pantalla

## Reporte de problemas

Para cada problema encontrado, documentar:

1. Sección o módulo donde ocurre
2. Pasos para reproducir
3. Comportamiento esperado vs. comportamiento actual
4. Capturas de pantalla si aplica
5. Información del navegador/dispositivo

## Resultados finales

Después de completar todas las pruebas, resumir los hallazgos:

- Número total de pruebas realizadas
- Número de pruebas exitosas
- Número de pruebas fallidas
- Problemas críticos encontrados
- Problemas menores
- Recomendaciones generales
