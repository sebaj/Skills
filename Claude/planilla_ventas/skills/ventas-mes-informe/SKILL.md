---
name: "ventas-mes-informe"
description: "Genera una página en Notion con el resumen narrativo del resultado de ventas de un mes elegido — kg y € totales, €/kg, líneas más y menos vendidas, y variación semanal — creada dentro de la página \"Test ventas\". Usar esta skill cuando el usuario pida un informe, resumen o reporte de ventas de un mes (ej. \"hazme un informe de ventas de Febrero\", \"quiero un resumen del mes\", \"redactame un reporte de cómo vino marzo\"), a diferencia de la skill `ventas-mes` que arma la hoja de cálculo con fórmulas — esta genera un documento de texto con el análisis."
---

## Qué hace esta skill

A partir de un Excel adjunto con una hoja `ventas` (o de la pestaña mensual ya generada por la skill `ventas-mes` si el usuario la adjunta o ya existe en el mismo archivo), esta skill redacta un informe en prosa sobre el resultado de ventas de un mes elegido, y lo publica como una página nueva en Notion, dentro de la página `Test ventas`.

No genera fórmulas ni hojas de cálculo — el resultado es un documento de texto legible, pensado para compartir o leer rápido, no para seguir editando en Excel.

## Antes de generar el informe, necesitás saber

1. **Qué mes** pidió el usuario. Si no lo dijo, preguntáselo.
2. Si el Excel adjunto ya tiene una pestaña con el nombre de ese mes (generada previamente por `ventas-mes`), usá esos datos como base en vez de recalcular todo desde cero — es más simple y consistente. Si no existe esa pestaña, calculá vos mismo los números necesarios directamente desde la hoja `ventas` (mismo criterio de detección de columnas que usa `ventas-mes`: Mes, Semana, Código de línea, Producto, kg, €).

## Cómo calcular los datos del informe

Con pandas (para hacer los cálculos numéricos reales, no fórmulas — acá sí calculás los valores porque el resultado es texto, no una celda viva):

1. Filtrá las filas de `ventas` del mes pedido.
2. Calculá:
   - **kg totales** y **€ totales** del mes (suma de todas las líneas).
   - **€/kg promedio** del mes (€ totales / kg totales).
   - **Línea con más kg vendidos** y **línea con más € vendidos** (puede ser la misma o no).
   - **Línea con menos kg vendidos** (de las que tuvieron ventas > 0 ese mes).
   - `min_week` (primera semana del mes) y `max_week` (última semana), igual que en `ventas-mes`.
   - Por cada línea: kg en `min_week` vs kg en `max_week`, y la variación % entre ambas — para identificar las 2-3 líneas con mayor suba y mayor baja dentro del mes.
   - Si el archivo tiene datos de meses anteriores, calculá también la variación de kg y € totales respecto al mes inmediatamente anterior (mismo año), si ese mes está presente en los datos. Si no está, omití esa comparación sin inventar el dato.

## Cómo redactar el informe

Escribí en español, tono profesional y directo, como un informe interno breve — no un chat. Estructura sugerida (podés ajustar el orden si el contenido lo pide, pero cubrí todos los puntos). No incluyas un título dentro del contenido: el título es el de la página de Notion.

1. **Resumen ejecutivo** (1 párrafo): kg y € totales del mes, €/kg promedio, y comparación con el mes anterior si está disponible.
2. **Líneas destacadas**: qué línea de producto lideró en volumen y en facturación, y cuál tuvo el desempeño más bajo.
3. **Evolución dentro del mes**: qué líneas subieron o bajaron más entre la primera y la última semana del mes, con los números concretos.
4. **Cierre breve** (opcional, 1-2 frases): algún patrón u observación relevante si surge de los datos (por ejemplo, concentración de ventas en pocas líneas, caída generalizada, etc.) — no inventes conclusiones que los números no respalden.

No hace falta usar viñetas para todo el documento; un informe de este tipo se lee mejor en párrafos, con como mucho una lista corta para el ranking de líneas si ayuda a la claridad.

## Publicación en Notion

El informe se publica como una **página nueva de Notion**, hija de esta página fija:

- Página padre: `Test ventas`
- ID de la página padre (usar como `page_id` en `parent`): `ID_PAGINA`
- URL: `https://app.notion.com/p/ID_PAGINA`

Es una página normal (no una base de datos), así que el parent es de tipo `page_id` y la única propiedad admitida es `title`.

### Título de la página

El título es **el mes y el año**, en formato `<Mes> <Año>` — por ejemplo `Febrero 2026`.

El año no se pregunta si se puede deducir: sacalo de la columna de fecha de inicio de semana (`Fecha inicio semana`) de las filas del mes pedido. Si esa columna no existe, o si el mismo mes aparece con más de un año en los datos, preguntale al usuario de qué año es el informe antes de crear la página.

### Pasos

1. Redactá el contenido en **Notion-flavored Markdown**. `##` para los encabezados de sección, párrafos normales, y como mucho una lista corta para el ranking de líneas. Los números en **negrita** ayudan a que el informe se escanee rápido.
2. **No repitas el título dentro del contenido** — Notion ya lo muestra como encabezado de la página. El contenido arranca directamente en el resumen ejecutivo.
3. Llamá a la herramienta de Notion `notion-create-pages` con:
   - `parent`: `{"page_id": "ID_PAGINA"}`
   - `pages`: un solo elemento, con
     - `properties`: `{"title": "<Mes> <Año>"}`
     - `content`: el texto del informe en Markdown
     - `icon`: `"📊"`
4. Si ya existe una página con ese mismo título dentro de `Test ventas`, preguntale al usuario si quiere que cree una segunda (Notion permite duplicados) o que actualice la existente con `notion-update-page`. No borres nada sin preguntar.
5. Si la herramienta de Notion no está disponible o falla (conector no conectado, sin permisos sobre la página), avisale al usuario claramente que necesita conectar el conector de Notion y dar acceso a la página `Test ventas` — pero **mostrale igual el texto completo del informe en el chat**, no bloquees la entrega por esto.
6. Si la creación fue exitosa, confirmalo en una frase breve e incluí el link de la página nueva que devuelve la herramienta.

## Entrega

Compartí un resumen breve del informe en el chat (no hace falta pegar el documento entero si ya se publicó en Notion) y confirmá la publicación con el link de la página, como se indica arriba.
