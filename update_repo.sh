#!/bin/bash

# Función para hacer commit y push de cambios
update_repo() {
    # Añadir todos los cambios
    git add .
    
    # Crear commit con marca de tiempo
    git commit -m "Actualización $(date '+%Y-%m-%d %H:%M:%S')"
    
    # Hacer push
    git push origin main
}

# Verificar si hay cambios
if [[ -n $(git status -s) ]]; then
    echo "Cambios detectados. Actualizando repositorio..."
    update_repo
else
    echo "No hay cambios para actualizar."
fi
