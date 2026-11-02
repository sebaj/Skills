---
name: informe-incidencias
description: "Convierte notas sueltas de una incidencia de calidad en planta (texto pegado, mensajes, apuntes desordenados) en el informe de incidencia de calidad estándar de Alimentaria Ejemplo, S.L., como archivo .docx con los mismos 9 apartados, el mismo orden y el mismo tono que el modelo de referencia. Úsala siempre que el usuario pegue notas de una incidencia de planta, pida un 'informe de incidencia', una 'ficha de incidencia' o un 'acta de no conformidad' de Calidad, o mencione una referencia tipo INC-AAAA-NNN, un lote, una línea de producción o una parada de línea junto con la petición de documentarlo. No la uses para otro tipo de informes ni para incidencias que no sean de calidad/producción."
---

# Informe de incidencia de calidad — Alimentaria Ejemplo

Genera el informe de incidencia de calidad en `.docx` a partir de notas
sueltas (texto pegado, mensajes de planta, apuntes desordenados). El
informe final debe ser indistinguible en estructura y tono del modelo de
referencia (`assets/modelo_informe_incidencia.docx`, incidencia
INC-2026-041): los mismos 9 apartados, en el mismo orden, con el mismo
estilo visual (tablas, colores, tipografía Arial).

Esta skill solo genera el archivo Word. No registra la incidencia en
Drive ni en Notion — eso lo hace el flujo/plugin de Calidad aparte, si el
usuario lo pide explícitamente.

## Flujo de trabajo

1. **Leer las notas** que pega o describe el usuario. Suelen ser
   desordenadas y en primera persona/informal — es tu trabajo
   reorganizarlas, no reproducirlas tal cual.

2. **Extraer los datos** al esquema JSON descrito más abajo. Reescribe todo
   en el registro formal e impersonal del modelo (tercera persona, pasado,
   sin "yo"/"nosotros"), pero sin inventar hechos que las notas no dan.
   Ver `references/ejemplo_extraccion.md` para un ejemplo completo de
   notas → JSON, incluyendo cómo se redacta la descripción y las acciones.

3. **Aplica estas reglas de negocio al construir el JSON:**
   - **Referencia (`INC-AAAA-NNN`)**: solo si el usuario la da. Si no la
     da, no la inventes ni la correlativas — déjala en `null` (el informe
     mostrará "[pendiente]" y el usuario/Calidad la asigna después).
   - **Gravedad**: **Claude propone, Calidad decide.** Nunca la presentes
     como un hecho cerrado. Redáctala en el mismo formato que el modelo
     ("Nivel — justificación breve") y añade siempre, literalmente, el
     sufijo `(propuesta — a confirmar por Calidad)`. Ejemplo:
     `"Alta — riesgo de expedición a cliente (propuesta — a confirmar por Calidad)"`.
   - **Cualquier otro dato que falte** en las notas (cantidad, lote,
     responsable, plazo, etc.): déjalo en `null` en el JSON. El generador
     lo convierte automáticamente en "[pendiente]" en cursiva — no
     escribas tú ese texto ni inventes el dato.
   - **Causa raíz — 5 porqués (apartado 6)**: propón la cadena completa de
     5 niveles a partir del hecho técnico que sí aparece en las notas,
     encadenando hacia atrás hasta una causa raíz de tipo sistémico
     (proceso, mantenimiento, formación, organización), no solo el fallo
     puntual — igual que en el modelo, donde el fallo de una resistencia
     termina en "plan de mantenimiento desactualizado". Si las notas no
     dan pie para completar algún nivel con algo razonable, deja ese nivel
     en `null` en vez de rellenarlo con un tecnicismo inventado.
   - **Fecha de emisión** (apartado 9): es la fecha en la que se genera el
     informe (hoy), no la fecha de detección de la incidencia.
   - **Revisado por** (apartado 9): si las notas no dicen quién revisa,
     usa por defecto "Responsable del Departamento de Calidad", como en el
     modelo.

4. **Construye el JSON** con esta forma exacta (todos los campos aceptan
   `null` salvo que se indique lo contrario):

   ```json
   {
     "referencia": "INC-2026-XXX | null",
     "identificacion": {
       "fecha_hora_deteccion": "DD/MM/AAAA, HH:MM",
       "detectado_por": "string",
       "turno": "string",
       "area_linea": "string",
       "clasificacion": "string",
       "gravedad": "string (con el sufijo de propuesta, ver arriba)"
     },
     "producto": {
       "referencia": "string",
       "lote": "string",
       "cantidad_fabricada": "string",
       "cantidad_afectada": "string",
       "destino_previsto": "string",
       "situacion_actual": "string"
     },
     "descripcion": ["párrafo 1", "párrafo 2 (opcional)"],
     "acciones_inmediatas": ["acción 1", "acción 2", "..."],
     "evaluacion": {
       "unidades_conformes": "string",
       "unidades_no_conformes": "string",
       "riesgo_consumidor": "string",
       "coste_estimado": "string"
     },
     "causa_raiz": {
       "metodo": "Método aplicado: cinco porqués.",
       "porques": [
         {"nivel": 1, "pregunta": "string", "respuesta": "string | null"},
         {"nivel": 2, "pregunta": "string", "respuesta": "string | null"},
         {"nivel": 3, "pregunta": "string", "respuesta": "string | null"},
         {"nivel": 4, "pregunta": "string", "respuesta": "string | null"},
         {"nivel": 5, "pregunta": "string", "respuesta": "string | null"}
       ],
       "conclusion": "string | null (frase de causa raíz, sin el prefijo 'Causa raíz:', el generador lo añade)"
     },
     "acciones_correctivas": [
       {"accion": "string", "responsable": "string | null", "plazo": "DD/MM/AAAA | null"}
     ],
     "verificacion_eficacia": "string | null",
     "cierre": {
       "estado": "string (por defecto 'Pendiente de verificación de eficacia')",
       "redactado_por": "string | null",
       "revisado_por": "string (por defecto 'Responsable del Departamento de Calidad')",
       "fecha_emision": "DD/MM/AAAA"
     }
   }
   ```

5. **Genera el documento.** Guarda el JSON en un archivo temporal y ejecuta:

   ```bash
   node scripts/generate_informe.js datos.json /mnt/user-data/outputs/Informe_Incidencia_<REFERENCIA-o-fecha>.docx
   ```

   El script usa la librería `docx` (npm, ya preinstalada en este entorno;
   si `require('docx')` fallara, instálala con
   `npm install docx --no-save`). Replica exactamente el estilo del
   modelo (Arial, paleta verde-teja, anchos de tabla) — no reconstruyas el
   documento a mano ni cambies el estilo.

6. **Verifica visualmente antes de entregar**, igual que indica la skill
   `docx`:

   ```bash
   python /mnt/skills/public/docx/scripts/office/soffice.py --headless --convert-to pdf salida.docx
   pdftoppm -jpeg -r 100 salida.pdf page
   ```

   Revisa las imágenes: que los 9 apartados estén en orden, que las
   tablas no se corten mal entre páginas y que los "[pendiente]" solo
   aparezcan donde de verdad falta un dato.

7. **Entrega el archivo** con la herramienta de presentar archivos. En tu
   mensaje al usuario, resume en una línea qué campos quedaron
   "[pendiente]" (si los hay) y recuérdale que la gravedad y la causa raíz
   propuesta en el apartado 6 están pendientes de confirmación de Calidad
   — no lo repitas dentro del documento más allá de las marcas ya
   incluidas.

## Notas de estilo

- Español de España, registro técnico-formal, impersonal — igual que el
  modelo. Sin emojis, sin exclamaciones, sin primera persona.
- No añadas apartados, subapartados ni cambies el orden de los 9
  existentes, aunque las notas traigan información extra: si algo no
  encaja en ningún apartado, resúmelo dentro del apartado 3 (Descripción)
  en vez de crear uno nuevo.
- No decidas tú la gravedad final ni la causa raíz definitiva — son
  siempre una propuesta para que Calidad confirme o corrija.
