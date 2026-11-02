---
name: system-reboot
description: Reinicia de forma segura la Raspberry Pi utilizando el script pi-safe-reboot.sh.
category: devops
---

# System Reboot

Este skill permite reiniciar el sistema de manera segura.

## Trigger
Cuando el usuario solicita reiniciar la Raspberry Pi o el sistema.

## Pasos
1. **Confirmación**: Solicitar confirmación explícita al usuario antes de proceder con el reinicio.
2. **Ejecución**: Ejecutar el siguiente comando exactamente:
   ```bash
   sudo /usr/local/sbin/pi-safe-reboot.sh
   ```

## Detalles Técnicos
- El script ya cuenta con configuración `NOPASSWD` en sudoers.
- El comando inicia un proceso de reinicio con una demora de **1 minuto**.
- Para cancelar el reinicio durante ese minuto, ejecutar:
  ```bash
  sudo shutdown -c
  ```

## Pitfalls
- **NO** utilizar comandos genéricos como `sudo reboot` o `sudo shutdown -r now`. Debe usarse exclusivamente el script especificado.
- No añadir argumentos adicionales al script.
