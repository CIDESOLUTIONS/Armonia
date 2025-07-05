#!/bin/bash

# Script para sincronización manual con el repositorio oficial
# Este script debe ejecutarse manualmente al final de cada sesión de desarrollo

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando sincronización con el repositorio oficial...${NC}"

# Verificar si el remoto está configurado correctamente
CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
TARGET_REMOTE="https://github.com/CIDESOLUTIONS/Armonia.git"

if [[ "$CURRENT_REMOTE" != "$TARGET_REMOTE" ]]; then
  echo -e "${YELLOW}Configurando remoto al repositorio oficial...${NC}"
  git remote remove origin 2>/dev/null || true
  git remote add origin $TARGET_REMOTE
  echo -e "${GREEN}Remoto configurado correctamente.${NC}"
else
  echo -e "${GREEN}Remoto ya configurado correctamente.${NC}"
fi

# Configurar información de usuario si no está configurada
if [[ -z $(git config user.name) ]]; then
  echo -e "${YELLOW}Configurando nombre de usuario para Git...${NC}"
  git config user.name "Desarrollador Armonía"
fi

if [[ -z $(git config user.email) ]]; then
  echo -e "${YELLOW}Configurando email para Git...${NC}"
  git config user.email "dev@armonia.com"
fi

# Verificar si hay cambios
if [[ -n $(git status -s) ]]; then
  echo -e "${YELLOW}Cambios detectados. Preparando para commit...${NC}"
  
  # Mostrar los cambios
  git status
  
  # Solicitar mensaje de commit (con valor por defecto)
  read -t 10 -p "Ingrese un mensaje para el commit (o presione Enter para usar mensaje por defecto): " commit_msg || commit_msg=""
  
  if [[ -z "$commit_msg" ]]; then
    commit_msg="Actualización manual $(date '+%Y-%m-%d %H:%M:%S')"
  fi
  
  # Añadir y hacer commit de los cambios
  git add .
  git commit -m "$commit_msg"
  
  # Intentar hacer push
  echo -e "${YELLOW}Enviando cambios al repositorio...${NC}"
  if git push origin main; then
    echo -e "${GREEN}Sincronización completada exitosamente.${NC}"
  else
    echo -e "${RED}Error al enviar cambios. Puede que necesite credenciales o resolver conflictos.${NC}"
    echo -e "${YELLOW}Intente ejecutar 'git push origin main' manualmente.${NC}"
  fi
else
  echo -e "${GREEN}No hay cambios para sincronizar.${NC}"
fi

echo -e "${GREEN}Proceso de sincronización finalizado.${NC}"
