---
name: manage-tvguide
description: Controla el inicio y detención del servicio de Tv Guide mediante Docker Compose.
category: devops
---

# Manage Tv Guide

Este skill permite gestionar el ciclo de vida del servicio de Tv Guide instalado vía Docker.

## Trigger Conditions
- El usuario solicita "detener tvguide".
- El usuario solicita "iniciar tvguide".

## Workflows

### Detener Tv Guide
1. Cambiar al directorio de trabajo: `cd ~/tv-shows/`
2. Ejecutar el comando para detener los contenedores: `docker compose down`

### Iniciar Tv Guide
1. Cambiar al directorio de trabajo: `cd ~/tv-shows/`
2. Ejecutar el comando para levantar los contenedores en modo detach: `docker compose up -d`

## Verification
- Para verificar el estado, ejecutar `docker compose ps` dentro de `~/tv-shows/`.
