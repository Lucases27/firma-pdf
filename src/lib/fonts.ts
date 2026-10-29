import type { FieldType } from "../types";

/** Familia CSS usada para dibujar cada tipo de campo sobre el PDF */
export const FONT_STACK: Record<FieldType, string> = {
  signature: '"Dancing Script", cursive',
  text: "Helvetica, Arial, sans-serif",
  date: "Helvetica, Arial, sans-serif",
};

const FALLBACK: Record<FieldType, number> = { signature: 0.82, text: 0.85, date: 0.85 };
const cache = new Map<string, number>();

/** Tamaño de referencia para medir: cuanto más grande, menos ruido de redondeo. */
const PROBE_SIZE = 400;

/**
 * Distancia (en em) desde el borde superior de la caja del campo hasta la línea base.
 *
 * Los campos se dibujan en el DOM con `line-height: 1`, así que la caja mide 1em y el
 * renglón queda centrado dentro con un medio interlineado que depende de las métricas
 * de la fuente. Acá se mide contra el propio navegador: el DOM da el medio interlineado
 * y la altura del renglón con precisión sub-pixel, y el canvas aporta qué proporción de
 * ese renglón está por encima de la línea base.
 *
 * Medirlo así (y no con las métricas de pdf-lib, que difieren hasta ~2pt para Helvetica)
 * es lo que hace que el PDF firmado quede donde el usuario lo vio en pantalla.
 */
export function baselineRatio(type: FieldType): number {
  const stack = FONT_STACK[type];
  const cached = cache.get(stack);
  if (cached !== undefined) return cached;
  if (typeof document === "undefined") return FALLBACK[type];

  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return FALLBACK[type];

  ctx.font = `${PROBE_SIZE}px ${stack}`;
  const m = ctx.measureText("Hg");
  const sum = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
  if (!sum) return FALLBACK[type];
  const ascentShare = m.fontBoundingBoxAscent / sum;

  const host = document.createElement("div");
  host.style.cssText =
    "position:absolute;top:0;left:0;visibility:hidden;white-space:pre;line-height:1;" +
    `font-family:${stack};font-size:${PROBE_SIZE}px`;
  const span = document.createElement("span");
  span.textContent = "Hg";
  host.appendChild(span);

  document.body.appendChild(host);
  const hostRect = host.getBoundingClientRect();
  const spanRect = span.getBoundingClientRect();
  host.remove();

  if (!spanRect.height) return FALLBACK[type];

  const halfLeading = spanRect.top - hostRect.top;
  const ratio = (halfLeading + ascentShare * spanRect.height) / PROBE_SIZE;
  cache.set(stack, ratio);
  return ratio;
}
