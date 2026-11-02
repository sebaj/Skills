---
name: update-n8n
description: Actualiza la imagen y reinicia el servicio de n8n mediante Docker Compose.
category: devops
---

# Update n8n

Este skill permite actualizar n8n a la última versión disponible en el registro de Docker y reiniciar el servicio.

## Trigger Conditions
- El usuario solicita "actualizar n8n".

## Workflows

### Actualizar n8n
1. **Detener el servicio**: Ejecutar el flujo de detención definido en el skill `manage-n8n` (cambiar a `~/n8n-docker/` y ejecutar `docker compose down`).
2. **Descargar nueva imagen**:
   - Cambiar al directorio de trabajo: `cd ~/n8n-docker/`
   - Ejecutar el comando para descargar las imágenes actualizadas: `docker compose pull`
3. **Iniciar el servicio**: Ejecutar el flujo de inicio definido en el skill `manage-n8n` (cambiar a `~/n8n-docker/` y ejecutar `docker compose up -d`).

## Verification
- Verificar que el servicio esté corriendo con `docker compose ps` en `~/n8n-docker/`.
- Opcionalmente, revisar los logs para confirmar la versión: `docker compose logs -f`.
