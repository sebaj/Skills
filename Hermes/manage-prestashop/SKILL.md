---
name: manage-prestashop
description: Controla el inicio y detención del servicio de PrestaShop mediante Docker Compose.
category: devops
---

# Manage PrestaShop

Este skill permite gestionar el ciclo de vida del servicio de PrestaShop instalado vía Docker.

## Trigger Conditions
- El usuario solicita "detener prestashop".
- El usuario solicita "iniciar prestashop".

## Workflows

### Detener PrestaShop
1. Cambiar al directorio de trabajo: `cd ~/prestashop/`
2. Ejecutar el comando para detener los contenedores: `docker compose down`

### Iniciar PrestaShop
1. Cambiar al directorio de trabajo: `cd ~/prestashop/`
2. Ejecutar el comando para levantar los contenedores en modo detach: `docker compose up -d`

## Verification
- Para verificar el estado, ejecutar `docker compose ps` dentro de `~/prestashop/`.
