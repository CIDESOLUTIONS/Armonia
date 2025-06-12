# 🏗️ PLAN DE REORGANIZACIÓN ESTRUCTURAL - PORTALES ARMONÍA

## 📋 ESTRUCTURA PROPUESTA

```
src/app/
├── (public)/              # Portal Público
│   ├── layout.tsx         # Layout público
│   ├── page.tsx          # Landing page
│   ├── login/            # Autenticación
│   ├── register-complex/ # Registro de complejos
│   ├── checkout/         # Proceso de pago
│   └── portal-selector/  # Selector de portal
│
├── (admin)/              # Portal de Administración
│   ├── layout.tsx        # Layout administrativo
│   ├── page.tsx         # Dashboard principal admin
│   ├── dashboard/       # Dashboards específicos
│   ├── assemblies/      # Gestión de asambleas
│   ├── finances/        # Gestión financiera
│   ├── pqr/            # Gestión PQR
│   ├── inventory/       # Gestión de inventario
│   ├── residents/       # Gestión de residentes
│   ├── communications/ # Comunicaciones
│   ├── reports/        # Reportes administrativos
│   └── settings/       # Configuraciones
│
├── (resident)/          # Portal de Residentes
│   ├── layout.tsx       # Layout residentes
│   ├── page.tsx        # Dashboard residente
│   ├── dashboard/      # Dashboard principal
│   ├── pqr/           # Crear/ver PQR
│   ├── assemblies/    # Participar en asambleas
│   ├── payments/      # Pagos y finanzas
│   ├── reservations/  # Reservas áreas comunes
│   ├── communications/ # Anuncios y mensajes
│   ├── profile/       # Perfil y configuración
│   └── documents/     # Documentos personales
│
├── (reception)/         # Portal de Recepción
│   ├── layout.tsx      # Layout recepción
│   ├── page.tsx       # Dashboard recepción
│   ├── dashboard/     # Dashboard principal
│   ├── visitors/      # Gestión de visitantes
│   ├── intercom/      # Sistema de intercomunicación
│   ├── packages/      # Gestión de paquetes
│   ├── cameras/       # Monitoreo de cámaras
│   ├── incidents/     # Registro de incidentes
│   └── access-control/ # Control de accesos
│
└── api/                # APIs (sin cambios)
    ├── auth/
    ├── pqr/
    ├── payments/
    └── ...
```

## 🔄 MIGRACIÓN POR FASES

### **FASE 1: Crear Nuevas Estructuras**
- [ ] Crear carpetas `(admin)/`, `(resident)/`, `(reception)/`
- [ ] Crear layouts específicos para cada portal
- [ ] Definir rutas principales de cada portal

### **FASE 2: Migrar Portal de Administración**
- [ ] Mover `src/app/admin/` → `src/app/(admin)/`
- [ ] Reorganizar componentes administrativos
- [ ] Actualizar imports y referencias

### **FASE 3: Migrar Portal de Residentes**
- [ ] Mover `src/app/dashboard/` → `src/app/(resident)/`
- [ ] Consolidar funcionalidades de residentes
- [ ] Crear navegación específica

### **FASE 4: Migrar Portal de Recepción**
- [ ] Mover `src/app/reception/` → `src/app/(reception)/`
- [ ] Consolidar funcionalidades de recepción
- [ ] Integrar módulos de visitantes e intercom

### **FASE 5: Actualizar Referencias**
- [ ] Actualizar todos los imports
- [ ] Corregir rutas en middleware
- [ ] Actualizar tests y configuraciones

## 🎯 VENTAJAS TÉCNICAS

1. **Routing Groups**: Next.js 13+ permite agrupar sin afectar URLs
2. **Layouts Específicos**: Cada portal puede tener su propio layout
3. **Separación de Responsabilidades**: Código mejor organizado
4. **Mantenimiento**: Más fácil localizar y mantener código
5. **Escalabilidad**: Agregar funciones por portal es más simple

## 🚨 CONSIDERACIONES IMPORTANTES

- **No afecta URLs**: Los grupos `()` no cambian las rutas públicas
- **Backwards Compatibility**: Mantener compatibilidad durante migración
- **Middleware**: Actualizar rutas de autenticación y autorización
- **Testing**: Actualizar tests después de cada migración
- **Documentación**: Actualizar documentación técnica

## 📅 TIMELINE ESTIMADO

- **Fase 1**: 1 día
- **Fase 2**: 2 días  
- **Fase 3**: 2 días
- **Fase 4**: 1 día
- **Fase 5**: 1 día
- **Total**: 7 días de trabajo

## ✅ CRITERIOS DE ÉXITO

- [ ] Cada portal tiene su estructura independiente
- [ ] Navegación clara y específica por portal
- [ ] Layouts optimizados para cada tipo de usuario
- [ ] Funcionalidades agrupadas lógicamente
- [ ] Mantenimiento simplificado
- [ ] Tests actualizados y funcionando
