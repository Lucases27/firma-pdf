import { useCallback, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import type { Field } from "../types";
import FieldItem from "./FieldItem";

interface Props {
  fileUrl: string;
  page: number;
  scale: number;
  fields: Field[];
  selectedId: string | null;
  autoFocusId: string | null;
  onLoadSuccess: (numPages: number) => void;
  onAddField: (xPt: number, yPt: number) => void;
  onSelect: (id: string | null) => void;
  onChangeText: (id: string, text: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
}

const Loader = ({ label }: { label: string }) => (
  <div className="flex h-[700px] w-[560px] flex-col items-center justify-center gap-3 rounded-lg bg-slate-800">
    <svg className="h-7 w-7 animate-spin text-violet-400" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <span className="text-sm text-slate-400">{label}</span>
  </div>
);

export default function PdfCanvas({
  fileUrl,
  page,
  scale,
  fields,
  selectedId,
  autoFocusId,
  onLoadSuccess,
  onAddField,
  onSelect,
  onChangeText,
  onMove,
  onRemove,
}: Props) {
  const layerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  const handlePageLoad = useCallback(
    (p: { width: number; height: number }) => setSize({ width: p.width, height: p.height }),
    []
  );

  const handleLayerClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      const layer = layerRef.current;
      if (!layer) return;
      const rect = layer.getBoundingClientRect();
      onAddField((e.clientX - rect.left) / scale, (e.clientY - rect.top) / scale);
    },
    [onAddField, scale]
  );

  const fieldsOnPage = fields.filter((f) => f.page === page);

  return (
    <div className="flex min-h-full justify-center p-8">
      <div className="relative h-fit rounded-lg bg-white shadow-2xl shadow-black/60">
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => onLoadSuccess(numPages)}
          loading={<Loader label="Cargando PDF…" />}
          error={
            <div className="flex h-[400px] w-[560px] items-center justify-center rounded-lg bg-slate-800 text-sm text-red-400">
              No se pudo abrir el PDF.
            </div>
          }
        >
          <div className="relative">
            <Page
              pageNumber={page}
              scale={scale}
              onLoadSuccess={handlePageLoad}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={<Loader label="Renderizando página…" />}
            />

            {size && (
              <div
                ref={layerRef}
                className="absolute top-0 left-0 cursor-crosshair"
                style={{ width: size.width, height: size.height }}
                onMouseDown={handleLayerClick}
              >
                {fieldsOnPage.map((field) => (
                  <FieldItem
                    key={field.id}
                    field={field}
                    scale={scale}
                    selected={selectedId === field.id}
                    autoFocus={autoFocusId === field.id}
                    onSelect={() => onSelect(field.id)}
                    onChangeText={(text) => onChangeText(field.id, text)}
                    onMove={(x, y) => onMove(field.id, x, y)}
                    onRemove={() => onRemove(field.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </Document>
      </div>
    </div>
  );
}
