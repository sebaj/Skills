# Ejemplo de extracción: notas sueltas → datos del informe

Este ejemplo calibra cómo pasar de notas informales a los datos estructurados
que consume `scripts/generate_informe.js`. El resultado completo está en
`ejemplo_datos.json` (corresponde al informe modelo INC-2026-041).

## Notas tal como podrían llegar

> lote L26-2138, pollo asado entero atm protegida 1100g, se fabricaron 820
> uds. esta mañana en la envasadora 2 detectamos bandejas sin vacío, primer
> palé. lo vio M. Ferrer a las 7:40. miramos 60 bandejas más y había 12 con
> sellado malo en el lado derecho, todas fabricadas entre las 5:10 y las
> 6:05. paramos la línea a las 7:45, se avisó a producción, bloqueamos todo
> el lote con etiqueta roja y separamos las 146 unidades para inspección al
> 100%. revisamos L26-2135 y L26-2136 por si acaso, esas bien. al final 674
> uds ok que ya salieron, 146 van a destrucción. no salió nada malo a
> cliente. coste aprox 1240€. mantenimiento miró la termoselladora: una de
> las resistencias de la mordaza de arriba está desgastada y no llega a
> temperatura en ese lado. van a cambiar las dos resistencias hoy mismo.
> parece que el plan de mantenimiento no se actualizó cuando se cambió la
> máquina en marzo. hay que actualizar el plan (mant/calidad, antes del
> 24/09), meter una verificación de sellado en el control de inicio de
> turno (calidad en planta, 15/09) y dar una formación rápida a la línea
> (calidad en planta, 30/09). destino era la plataforma del cliente
> nacional, estaba bloqueado en CAM-01.

## Cómo se traduce

- **Identificación / Producto**: los datos concretos (lote, cantidades,
  hora, línea, producto) se copian tal cual, normalizando el formato de
  fecha y unidades al del modelo ("820 unidades", "10/09/2026, 07:40").
- **Gravedad**: las notas no traen una gravedad explícita. Se propone una
  a partir del contexto (producto retenido, sin expedición a cliente) y se
  marca siempre como propuesta — nunca se presenta como decidida:
  `"Media — producto retenido antes de expedición (propuesta — a confirmar por Calidad)"`.
- **Descripción**: un párrafo narrativo en pasado, tono técnico e
  impersonal (evitar "yo", "nosotros"), que ordena cronológicamente lo que
  cuentan las notas.
- **Acción inmediata**: cada frase de contención de las notas se convierte
  en una viñeta corta en infinitivo/sustantivo, como en el modelo
  ("Parada de la línea 2 a las 07:45...").
- **Causa raíz (5 porqués)**: las notas rara vez traen los 5 niveles ya
  encadenados. A partir del hecho técnico que sí aparece (resistencia
  desgastada, plan sin actualizar), se reconstruye la cadena causal
  completa hacia atrás, terminando en una causa raíz de tipo sistémico
  (proceso/organización), no solo el fallo puntual. Si las notas no dan
  para completar algún nivel, ese nivel se deja `null` (→ "[pendiente]")
  en vez de inventar un tecnicismo no mencionado.
- **Acciones correctivas**: se listan solo las acciones que las notas
  atribuyen a un responsable y un plazo; si falta uno de los dos datos, ese
  campo queda `null`.
- **Cierre**: "Redactado por" es quien firma las notas si se identifica;
  "Revisado por" se deja como el valor por defecto del modelo
  ("Responsable del Departamento de Calidad") salvo que las notas digan
  otra cosa. "Fecha de emisión" es la fecha en que se genera el informe,
  no la de detección.

Ver `ejemplo_datos.json` para el JSON completo resultante.
