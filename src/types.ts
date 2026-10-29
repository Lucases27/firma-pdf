/** Tipo de campo que se puede estampar sobre el PDF */
export type FieldType = "signature" | "text" | "date";

/** Un campo colocado por el usuario sobre una página del PDF */
export interface Field {
  id: string;
  /** Página (1-indexed) */
  page: number;
  /** X en puntos PDF, desde el borde izquierdo de la página */
  x: number;
  /** Y en puntos PDF, desde el borde SUPERIOR de la página (se invierte al estampar) */
  y: number;
  /** Contenido */
  text: string;
  /** Tamaño de fuente en puntos PDF */
  fontSize: number;
  type: FieldType;
}

export const FIELD_DEFAULTS: Record<FieldType, { fontSize: number; label: string; placeholder: string }> = {
  signature: { fontSize: 26, label: "Firma", placeholder: "Tu firma" },
  text: { fontSize: 12, label: "Texto", placeholder: "Escribí acá" },
  date: { fontSize: 12, label: "Fecha", placeholder: "dd/mm/aaaa" },
};

/** Fecha de hoy en dd/mm/aaaa */
export function todayString(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
