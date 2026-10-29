import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { Field } from "../types";
import { baselineRatio } from "./fonts";

let cursiveBytesPromise: Promise<ArrayBuffer> | null = null;

/** Carga (una sola vez) la fuente cursiva desde /public */
function loadCursiveFont(): Promise<ArrayBuffer> {
  if (!cursiveBytesPromise) {
    cursiveBytesPromise = fetch("/fonts/DancingScript-Regular.ttf").then((r) => {
      if (!r.ok) throw new Error("No se pudo cargar la fuente cursiva");
      return r.arrayBuffer();
    });
  }
  return cursiveBytesPromise;
}

/**
 * Estampa los campos sobre el PDF original y devuelve los bytes del PDF resultante.
 *
 * Los campos llegan con coordenadas en puntos PDF pero con origen arriba-izquierda
 * (que es como los posiciona el DOM). Acá se invierte el eje Y usando la altura real
 * de cada página, y se baja el punto de dibujo hasta la línea base del texto.
 */
export async function stampPdf(originalBytes: ArrayBuffer, fields: Field[]): Promise<Uint8Array> {
  // Las fuentes tienen que estar cargadas antes de medir la línea base con el canvas.
  await document.fonts.ready;

  const pdfDoc = await PDFDocument.load(originalBytes);
  pdfDoc.registerFontkit(fontkit);

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const dancingScript = await pdfDoc.embedFont(await loadCursiveFont());

  for (const field of fields) {
    const text = field.text.trim();
    if (!text) continue;

    const pageIndex = field.page - 1;
    if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) continue;

    const page = pdfDoc.getPage(pageIndex);
    const { height: pageHeight } = page.getSize();

    const font = field.type === "signature" ? dancingScript : helvetica;

    // drawText posiciona la línea base; field.y es el borde superior de la caja del campo.
    const baselineY = pageHeight - field.y - baselineRatio(field.type) * field.fontSize;

    page.drawText(text, {
      x: field.x,
      y: baselineY,
      size: field.fontSize,
      font,
      color: rgb(0, 0, 0),
    });
  }

  return pdfDoc.save();
}
