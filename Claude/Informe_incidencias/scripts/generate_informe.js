#!/usr/bin/env node
/**
 * Genera el "Informe de incidencia de calidad" de Alimentaria Ejemplo en formato .docx,
 * replicando exactamente el estilo del modelo (INC-2026-041): fuente Arial,
 * paleta verde-teja corporativa, tablas de 2 y 3 columnas con los mismos anchos.
 *
 * Uso:  node generate_informe.js datos.json salida.docx
 */

const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, AlignmentType, LevelFormat,
  HeightRule, VerticalAlign,
} = require("docx");

const [, , dataPath, outPath] = process.argv;
if (!dataPath || !outPath) {
  console.error("Uso: node generate_informe.js datos.json salida.docx");
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

// ---- Paleta y constantes de estilo (tomadas del modelo) ----
const FONT = "Arial";
const C_TITLE = "16393A";
const C_SUBTITLE = "5C7370";
const C_SECTION = "275D5D";
const C_BORDER_SECTION = "DCE6E2";
const C_LABEL_BG = "F5F1E9";
const C_HEADER_BG = "275D5D";
const PENDING = "5C7370";

const TABLE_WIDTH = 9360; // dxa
const CELL_MARGIN = { top: 80, bottom: 80, left: 120, right: 120 };
const BORDERS_SINGLE = {
  top: { style: BorderStyle.SINGLE, size: 4, color: "auto" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "auto" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "auto" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "auto" },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "auto" },
  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "auto" },
};

// Marca visualmente los campos sin dato ("[pendiente]") para que Calidad los complete.
function isPending(v) {
  return v === null || v === undefined || String(v).trim() === "";
}
function valueRun(v) {
  if (isPending(v)) {
    return new TextRun({ text: "[pendiente]", font: FONT, size: 19, italics: true, color: PENDING });
  }
  return new TextRun({ text: String(v), font: FONT, size: 19 });
}

function titleBlock(referencia) {
  const ref = isPending(referencia) ? "[pendiente]" : referencia;
  return [
    new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: "Informe de incidencia de calidad", font: FONT, bold: true, size: 32, color: C_TITLE })],
    }),
    new Paragraph({
      spacing: { after: 300 },
      children: [new TextRun({
        text: `Alimentaria Ejemplo, S.L. · Departamento de Calidad · Referencia ${ref}`,
        font: FONT, italics: true, size: 20, color: C_SUBTITLE,
      })],
    }),
  ];
}

function sectionHeader(text) {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C_BORDER_SECTION } },
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, font: FONT, bold: true, size: 22, color: C_SECTION })],
  });
}

function bodyParagraph(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 100 },
    children: [new TextRun({ text, font: FONT, size: 20, color: "000000", bold: !!opts.bold })],
  });
}

function bulletParagraph(text) {
  return new Paragraph({
    style: "ListParagraph",
    numbering: { reference: "bullet-list", level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text, font: FONT, size: 20 })],
  });
}

// Tabla de 2 columnas (etiqueta en negrita sobre fondo crema | valor)
function twoColTable(rows) {
  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    borders: BORDERS_SINGLE,
    rows: rows.map(([label, value]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 2900, type: WidthType.DXA },
            shading: { fill: C_LABEL_BG, type: ShadingType.CLEAR, color: "auto" },
            margins: CELL_MARGIN,
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ children: [new TextRun({ text: label, font: FONT, bold: true, size: 19, color: C_TITLE })] })],
          }),
          new TableCell({
            width: { size: 6460, type: WidthType.DXA },
            margins: CELL_MARGIN,
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ children: [valueRun(value)] })],
          }),
        ],
      })
    ),
  });
}

// Tabla de 3 columnas con cabecera oscura (usada en "5 porqués" y "Acciones correctivas")
function threeColTable(headers, rows, colWidths) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) =>
      new TableCell({
        width: { size: colWidths[i], type: WidthType.DXA },
        shading: { fill: C_HEADER_BG, type: ShadingType.CLEAR, color: "auto" },
        margins: CELL_MARGIN,
        children: [new Paragraph({ children: [new TextRun({ text: h, font: FONT, bold: true, size: 18, color: "FFFFFF" })] })],
      })
    ),
  });
  const dataRows = rows.map((r) =>
    new TableRow({
      children: r.map((cellVal, i) =>
        new TableCell({
          width: { size: colWidths[i], type: WidthType.DXA },
          margins: CELL_MARGIN,
          children: [new Paragraph({ children: [isPending(cellVal)
            ? new TextRun({ text: "[pendiente]", font: FONT, size: 18, italics: true, color: PENDING })
            : new TextRun({ text: String(cellVal), font: FONT, size: 18 })] })],
        })
      ),
    })
  );
  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    borders: BORDERS_SINGLE,
    rows: [headerRow, ...dataRows],
  });
}

// ---- Construcción del documento ----
const children = [];

children.push(...titleBlock(data.referencia));

// 1. Identificación
children.push(sectionHeader("1. Identificación"));
children.push(twoColTable([
  ["Referencia", data.referencia],
  ["Fecha y hora de detección", data.identificacion?.fecha_hora_deteccion],
  ["Detectado por", data.identificacion?.detectado_por],
  ["Turno", data.identificacion?.turno],
  ["Área / línea", data.identificacion?.area_linea],
  ["Clasificación", data.identificacion?.clasificacion],
  ["Gravedad", data.identificacion?.gravedad],
]));

// 2. Producto afectado
children.push(sectionHeader("2. Producto afectado"));
children.push(twoColTable([
  ["Referencia", data.producto?.referencia],
  ["Lote", data.producto?.lote],
  ["Cantidad fabricada", data.producto?.cantidad_fabricada],
  ["Cantidad afectada", data.producto?.cantidad_afectada],
  ["Destino previsto", data.producto?.destino_previsto],
  ["Situación actual", data.producto?.situacion_actual],
]));

// 3. Descripción de la incidencia
children.push(sectionHeader("3. Descripción de la incidencia"));
const descParrafos = (data.descripcion && data.descripcion.length) ? data.descripcion : [null];
descParrafos.forEach((p) => {
  if (isPending(p)) {
    children.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "[pendiente]", font: FONT, size: 20, italics: true, color: PENDING })] }));
  } else {
    children.push(bodyParagraph(p));
  }
});

// 4. Acción inmediata (contención)
children.push(sectionHeader("4. Acción inmediata (contención)"));
const acciones = (data.acciones_inmediatas && data.acciones_inmediatas.length) ? data.acciones_inmediatas : ["[pendiente]"];
acciones.forEach((a) => children.push(bulletParagraph(a)));

// 5. Evaluación del producto afectado
children.push(sectionHeader("5. Evaluación del producto afectado"));
children.push(twoColTable([
  ["Unidades conformes", data.evaluacion?.unidades_conformes],
  ["Unidades no conformes", data.evaluacion?.unidades_no_conformes],
  ["Riesgo para el consumidor", data.evaluacion?.riesgo_consumidor],
  ["Coste estimado", data.evaluacion?.coste_estimado],
]));

// 6. Análisis de causa raíz
children.push(sectionHeader("6. Análisis de causa raíz"));
children.push(bodyParagraph(data.causa_raiz?.metodo || "Método aplicado: cinco porqués."));
const porques = (data.causa_raiz?.porques && data.causa_raiz.porques.length) ? data.causa_raiz.porques : [1, 2, 3, 4, 5].map((n) => ({ nivel: n, pregunta: null, respuesta: null }));
children.push(threeColTable(
  ["Nivel", "Pregunta", "Respuesta"],
  porques.map((p) => [String(p.nivel), p.pregunta, p.respuesta]),
  [900, 3600, 4860]
));
children.push(new Paragraph({
  spacing: { before: 120, after: 100 },
  children: [isPending(data.causa_raiz?.conclusion)
    ? new TextRun({ text: "Causa raíz: [pendiente]", font: FONT, bold: true, size: 20, italics: true, color: PENDING })
    : new TextRun({ text: `Causa raíz: ${data.causa_raiz.conclusion}`, font: FONT, bold: true, size: 20, color: "000000" })],
}));

// 7. Acciones correctivas
children.push(sectionHeader("7. Acciones correctivas"));
const correctivas = (data.acciones_correctivas && data.acciones_correctivas.length) ? data.acciones_correctivas : [{ accion: null, responsable: null, plazo: null }];
children.push(threeColTable(
  ["Acción", "Responsable", "Plazo"],
  correctivas.map((c) => [c.accion, c.responsable, c.plazo]),
  [4600, 2760, 2000]
));

// 8. Verificación de la eficacia
children.push(sectionHeader("8. Verificación de la eficacia"));
if (isPending(data.verificacion_eficacia)) {
  children.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "[pendiente]", font: FONT, size: 20, italics: true, color: PENDING })] }));
} else {
  children.push(bodyParagraph(data.verificacion_eficacia));
}

// 9. Cierre
children.push(sectionHeader("9. Cierre"));
children.push(twoColTable([
  ["Estado", data.cierre?.estado || "Pendiente de verificación de eficacia"],
  ["Redactado por", data.cierre?.redactado_por],
  ["Revisado por", data.cierre?.revisado_por || "Responsable del Departamento de Calidad"],
  ["Fecha de emisión", data.cierre?.fecha_emision],
]));

const doc = new Document({
  numbering: {
    config: [{
      reference: "bullet-list",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "●", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      }],
    }],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838, orientation: "portrait" },
        margin: { top: 1000, right: 1000, bottom: 1000, left: 1000, header: 708, footer: 708 },
      },
    },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(outPath, buf);
  console.log(`Generado: ${outPath}`);
});
