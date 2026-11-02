---
name: manage-n8n
description: Controla el inicio y detención del servicio de n8n mediante Docker Compose.
category: devops
---

# Manage n8n

Este skill permite gestionar el ciclo de vida del servicio de n8n instalado vía Docker.

## Trigger Conditions
- El usuario solicita "detener n8n".
- El usuario solicita "iniciar n8n".

## Workflows

### Detener n8n
1. Cambiar al directorio de trabajo: `cd ~/n8n-docker/`
2. Ejecutar el comando para detener los contenedores: `docker compose down`

### Iniciar n8n
1. Cambiar al directorio de trabajo: `cd ~/n8n-docker/`
2. Ejecutar el comando para levantar los contenedores en modo detach: `docker compose up -d`

## Verification
- Para verificar el estado, ejecutar `docker compose ps` dentro de `~/n8n-docker/`.
