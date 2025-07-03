# CI/CD Configuration - Armonía

## 🚀 Despliegue Automático Configurado

### ✅ Estado Actual
- **URL de Producción:** https://e5h6i7c0mde6.manus.space
- **CI/CD:** Configurado con GitHub Actions
- **Despliegue:** Automático en cada push a `main`

### 🔄 Flujo de Trabajo

1. **Push a main** → Trigger automático
2. **Build** → Construcción de la aplicación
3. **Deploy** → Actualización automática en producción

### 📁 Archivos de Configuración

- `.github/workflows/deploy.yml` - Workflow de GitHub Actions
- `deploy.sh` - Script de despliegue
- `server.js` - Servidor de producción
- `requirements.txt` - Dependencias Python

### 🛠️ Comandos Manuales

```bash
# Despliegue manual
./deploy.sh

# Verificar estado
npm run build
```

### 📝 Notas Importantes

- Los cambios en `main` se despliegan automáticamente
- El build debe pasar sin errores
- La base de datos se mantiene persistente
- Los logs están disponibles en GitHub Actions

### 🔧 Configuración Adicional

Para habilitar webhooks automáticos:
1. Configurar secrets en GitHub
2. Agregar webhook URL de Manus
3. Activar notificaciones de despliegue

