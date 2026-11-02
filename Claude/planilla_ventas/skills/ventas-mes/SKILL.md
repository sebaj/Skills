---
name: "ventas-mes"
description: "Genera la pestaña de resumen mensual de ventas (kg del mes, € del mes, €/kg, kg 1ª/última semana, Var. %) a partir de una hoja \"ventas\" en un Excel adjunto, entrega el .xlsx para descarga local y sube una copia del resultado como CSV (convertido a Google Sheet) a la carpeta fija de Google Drive de planificación de ventas. Usar esta skill cuando el usuario adjunte un xlsx con una hoja \"ventas\" y pida crear/armar la hoja de un mes (ej. \"armame la hoja de Febrero\", \"genera el resumen mensual de ventas\", \"crea la pestaña de marzo con las fórmulas de siempre\"), incluso si no menciona explícitamente fórmulas, columnas, o Drive."
---

## Qué hace esta skill

A partir de un Excel que el usuario adjunta, con una hoja llamada `ventas` que registra ventas semanales por línea de producto, esta skill crea una nueva hoja (pestaña) con el nombre del mes pedido, resumiendo ese mes por código de línea.

Produce **dos entregables**:

1. El `.xlsx` con la pestaña nueva y **fórmulas vivas**, entregado localmente para que el usuario lo descargue.
2. Un **CSV con los valores ya calculados** de esa pestaña, subido a la carpeta fija de Google Drive y convertido a Google Sheet para consultarlo online.

La hoja `ventas` tiene (en este orden, empezando en fila 2) columnas tipo:
`Mes | Semana | Fecha inicio semana | Código línea | Línea de producto | Unidades vendidas (kg) | Ventas (€)`

Los nombres exactos de columna pueden variar levemente entre archivos — identifícalas por contenido (una columna con nombres de mes tipo "Febrero"/"Marzo", una con números de semana, una con códigos tipo "L01", una con nombres de producto, y dos numéricas de kg y €), no asumas que siempre están en A–G si el archivo adjunto se ve distinto.

## Antes de generar la hoja, necesitás saber

1. **Qué mes** pidió el usuario (debe existir en la columna Mes de `ventas`). Si no lo dijo, preguntáselo.
2. **Nada más** — el número de "última semana" del mes NO se pregunta: se calcula solo, tomando el número de semana más alto que aparece en `ventas` para ese mes (y el más bajo, como "primera semana"). Esto es importante porque el mes puede empezar o terminar a mitad de una semana ISO, así que la numeración de semanas es la que ya está en la hoja, no una semana calendario estándar.

## Reglas críticas de openpyxl (leer antes de escribir código)

Estas dos reglas son la causa histórica del bug "la hoja sale vacía". No las saltees.

- **NUNCA abras con `data_only=True` el workbook que vas a guardar.** `load_workbook(path, data_only=True)` descarta las fórmulas y deja solo valores cacheados; si el archivo no tiene caché (openpyxl nunca la escribe), quedan en `None`, y al guardar **destruís todas las fórmulas de forma permanente**. El workbook que editás y guardás se abre siempre con `openpyxl.load_workbook(path)` a secas.
- **Verificar valores con `data_only=True` sobre el archivo entregable no sirve y es peligroso.** Va a devolver `None` en toda celda con fórmula, y eso es normal, no un error. Para ver los valores reales, recalculá una **copia aparte** (ver paso 8) y leé esa copia. Nunca sobrescribas el entregable con lo que abriste en modo `data_only`.

Si necesitás leer los datos de origen como valores (por ejemplo con pandas), hacelo en una carga separada, en variables, y no reutilices ese objeto workbook para guardar.

## Comprobaciones de datos (evitan resultados en cero)

Antes de escribir las fórmulas, validá contra la hoja `ventas`:

- **Columna Mes**: si los valores son fechas o `datetime` en vez del texto del mes, `SUMIFS(...,"Febrero")` da 0 en silencio. Si detectás fechas, avisá al usuario y usá un criterio por rango de fechas, o pedile que normalice la columna.
- **Columna Semana**: si los números de semana están guardados como **texto** (`"1"` en vez de `1`), el criterio numérico no matchea y las columnas "kg 1ª sem" / "kg últ. sem" dan 0. Detectalo con `isinstance(valor, str)` y, si es así, escribí el criterio entrecomillado (`"1"`) en las fórmulas de F y G.
- **Nombre de la hoja**: si la hoja no se llama exactamente `ventas`, usá el nombre real en las fórmulas. Si el nombre **contiene espacios o caracteres especiales**, hay que envolverlo en comillas simples: `='Ventas 2026'!$F$2:$F$500`. Sin las comillas, Excel marca el archivo como dañado.
- Si tras las validaciones el mes pedido no aparece en la columna Mes, avisá y no generes la hoja.

## Cómo construir la hoja nueva

Usa Python con `openpyxl`. No calcules los valores en Python para la hoja: escribí fórmulas de Excel reales para que quede viva si el usuario edita `ventas` después.

Pasos:

1. Cargá el workbook adjunto con `openpyxl.load_workbook(path)` (sin `data_only`).
2. Ubicá la hoja `ventas` (o la que tenga esa estructura si el nombre difiere) y detectá el índice de columna (letra) de: Mes, Semana, Código de línea, Nombre de producto, kg vendidos, € vendidos. Corré las comprobaciones de datos de la sección anterior.
3. Filtrá las filas de esa hoja donde Mes == mes pedido. De ahí sacá:
   - Lista de códigos de línea únicos, en orden de primera aparición.
   - `min_week` = número de semana mínimo entre esas filas.
   - `max_week` = número de semana máximo entre esas filas.
   - `last_row` = última fila con datos en `ventas`; usá `ws.max_row` o cubrí de sobra (por ejemplo hasta la fila 500) para que las fórmulas sigan sirviendo si se agregan más meses después.
4. Creá una hoja nueva con el nombre del mes (`wb.create_sheet(mes)`). Si ya existe una hoja con ese nombre, preguntale al usuario si la reemplaza o la deja con sufijo.
5. Escribí la fila de encabezados (fila 1):
   `Código de Línea | Producto | kg del mes | € del mes | €/kg | kg 1ª sem | kg últ. sem | Var. %`
6. Para cada código único, en la fila `i` (empezando en 2):
   - Columna A: el código (valor literal, ej. `L01`).
   - Columna B (Producto): `=INDEX(ventas!$<colE>$2:$<colE>$<last_row>,MATCH($A<i>,ventas!$<colD>$2:$<colD>$<last_row>,0))`
   - Columna C (kg del mes): `=SUMIFS(ventas!$<colKg>$2:$<colKg>$<last_row>,ventas!$<colMes>$2:$<colMes>$<last_row>,"<mes>",ventas!$<colD>$2:$<colD>$<last_row>,$A<i>)`
   - Columna D (€ del mes): igual que C pero sumando la columna de €.
   - Columna E (€/kg): `=IF(C<i>=0,"",ROUND(D<i>/C<i>,2))`
   - Columna F (kg 1ª sem): igual que C pero agregando el criterio `ventas!$<colSemana>$2:$<colSemana>$<last_row>,<min_week>`
   - Columna G (kg últ. sem): igual que F pero con `<max_week>` en vez de `<min_week>`.
   - Columna H (Var. %): `=IF(F<i>=0,"",ROUND((G<i>-F<i>)/F<i>*100,1))`

   (Sustituí `<colX>` por la letra de columna real detectada en el paso 2, y `<last_row>` / `<mes>` / `<min_week>` / `<max_week>` por los valores calculados.)

7. Guardá el archivo como `<nombre_original>_<mes>.xlsx` en `/mnt/user-data/outputs/`. Este es el entregable local.

8. **Verificación por recálculo (en copia, nunca sobre el entregable).** openpyxl no calcula nada, así que para confirmar que las fórmulas dan números reales:

   ```bash
   mkdir -p /tmp/recalc
   cp /mnt/user-data/outputs/<archivo>.xlsx /tmp/recalc/copia.xlsx
   cd /tmp/recalc && soffice --headless --convert-to xlsx --outdir calc copia.xlsx
   ```

   Después leé `/tmp/recalc/calc/copia.xlsx` con `openpyxl.load_workbook(..., data_only=True)` — ahí sí vienen los valores calculados. Si salen todos en 0 o `None`, algo falló en las comprobaciones de datos: volvé a la sección anterior antes de entregar.

   Guardá esos valores en memoria: son los que van al CSV del paso siguiente.

## CSV a Google Drive

El binario `.xlsx` **no se sube a Drive**: el conector recibe el contenido como argumento de texto, y un xlsx en base64 son decenas de miles de caracteres que se truncan y llegan como ZIP corrupto. Se sube el CSV, que es texto y viaja íntegro.

- Carpeta: `Ventas Planificación`
- URL: `https://drive.google.com/drive/folders/ID_CARPETA`
- ID de carpeta (usar como `parentId`): `ID_CARPETA`

Pasos:

1. Construí el texto CSV a partir de los **valores recalculados** del paso 8 (nunca a partir de las fórmulas: un CSV con `=SUMIFS(ventas!...)` se rompe en Drive porque ahí no existe la hoja `ventas`).
2. Formato del CSV:
   - Delimitador coma, misma fila de encabezados que la pestaña.
   - Punto como separador decimal, máximo 2 decimales. No pongas símbolos `€` ni separadores de miles dentro de los números.
   - Entrecomillá los campos de texto (usá el módulo `csv` de Python, no concatenes strings a mano): los nombres de producto pueden llevar comas.
   - Celdas vacías (las que en Excel dan `""`) van vacías en el CSV.
3. Llamá a la herramienta de Drive `create_file` con:
   - `title`: `<nombre_original>_<mes>.csv`
   - `parentId`: `ID_CARPETA`
   - `textContent`: el texto CSV completo
   - `contentMimeType`: `text/csv`
   - **No** pases `disableConversionToGoogleType`: dejando el default, Drive lo convierte en Google Sheet nativo y queda legible online.
4. Si la herramienta de Drive no está disponible o falla (conector no conectado, sin permisos), avisale al usuario claramente y decile que necesita conectar el conector de Google Drive — pero **igual entregá el .xlsx local**, no bloquees la entrega por esto.
5. Si la subida fue exitosa, confirmalo en una frase breve con el link de la carpeta.

Nota de locale: si el workspace de Google está en español, puede interpretar el punto decimal como separador de miles. Si el usuario lo reporta, la solución es cambiar el locale del Sheet en Archivo → Configuración, no cambiar el CSV.

## Entrega

1. Llamá a `present_files` con la ruta del `.xlsx` en `/mnt/user-data/outputs/` para que el usuario lo descargue.
2. Confirmá en una línea que el CSV quedó en Drive, con el link de la carpeta.
3. No expliques cada fórmula a menos que el usuario pregunte.

## Ejemplo de fórmulas generadas (mes "Febrero", last_row=51, min_week=1, max_week=5, columnas ventas: A=Mes, B=Semana, C=Fecha, D=Código, E=Producto, F=kg, G=€)

```
B2: =INDEX(ventas!$E$2:$E$51,MATCH($A2,ventas!$D$2:$D$51,0))
C2: =SUMIFS(ventas!$F$2:$F$51,ventas!$A$2:$A$51,"Febrero",ventas!$D$2:$D$51,$A2)
D2: =SUMIFS(ventas!$G$2:$G$51,ventas!$A$2:$A$51,"Febrero",ventas!$D$2:$D$51,$A2)
E2: =IF(C2=0,"",ROUND(D2/C2,2))
F2: =SUMIFS(ventas!$F$2:$F$51,ventas!$A$2:$A$51,"Febrero",ventas!$D$2:$D$51,$A2,ventas!$B$2:$B$51,1)
G2: =SUMIFS(ventas!$F$2:$F$51,ventas!$A$2:$A$51,"Febrero",ventas!$D$2:$D$51,$A2,ventas!$B$2:$B$51,5)
H2: =IF(F2=0,"",ROUND((G2-F2)/F2*100,1))
```

## Ejemplo de CSV resultante

```
Código de Línea,Producto,kg del mes,€ del mes,€/kg,kg 1ª sem,kg últ. sem,Var. %
L01,Chorizo,515,2545,4.94,101,105,4.0
L02,Salchichón,565,2795,4.95,111,115,3.6
L03,Lomo,615,3045,4.95,121,125,3.3
```
