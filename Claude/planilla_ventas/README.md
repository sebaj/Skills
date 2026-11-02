# Ventas planificación

Plugin con dos skills para el cierre mensual de ventas a partir de un Excel con hoja `ventas`.

| Skill | Qué hace | Destino |
|---|---|---|
| `ventas-mes` | Crea la pestaña del mes con fórmulas vivas y la verifica recalculando una copia con LibreOffice headless | `.xlsx` local + CSV en Google Drive (carpeta `ID_CARPETA`) |
| `ventas-mes-informe` | Redacta el informe narrativo del mes | Página hija de "TEST VENTAS" en Notion, título `<Mes> <Año>` |

## Conectores

- **Google Drive** — subida del CSV (se convierte a Google Sheet).
- **Notion** — creación de la página del informe.

## Decisiones deliberadas

- A Drive se sube CSV, no el `.xlsx`: el binario viaja en base64 como texto y se trunca (ZIP corrupto).
- Nunca se abre con `openpyxl` en `data_only=True` el workbook que se guarda; la verificación se hace sobre una copia recalculada con LibreOffice.
- La página de Notion cuelga de una página normal (`parent.page_id`), no de una base de datos.
