import { useCallback, useEffect, useMemo, useState } from "react";
import "./lib/pdfWorker";
import Dropzone from "./components/Dropzone";
import Toolbar from "./components/Toolbar";
import PdfCanvas from "./components/PdfCanvas";
import ResultView from "./components/ResultView";
import { stampPdf } from "./lib/stampPdf";
import { FIELD_DEFAULTS, todayString, type Field, type FieldType } from "./types";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  const [fields, setFields] = useState<Field[]>([]);
  const [tool, setTool] = useState<FieldType>("signature");
  const [fontSize, setFontSize] = useState(FIELD_DEFAULTS.signature.fontSize);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [autoFocusId, setAutoFocusId] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL del PDF original para react-pdf (estable mientras no cambie el archivo)
  const fileUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);
  useEffect(() => {
    return () => {
      if (signedUrl) URL.revokeObjectURL(signedUrl);
    };
  }, [signedUrl]);

  const reset = useCallback(() => {
    setFile(null);
    setSignedUrl(null);
    setFields([]);
    setPage(1);
    setNumPages(0);
    setSelectedId(null);
    setAutoFocusId(null);
    setError(null);
  }, []);

  const handleToolChange = useCallback((t: FieldType) => {
    setTool(t);
    setFontSize(FIELD_DEFAULTS[t].fontSize);
  }, []);

  const addField = useCallback(
    (xPt: number, yPt: number) => {
      const id = crypto.randomUUID();
      setFields((prev) => [
        ...prev,
        {
          id,
          page,
          x: xPt,
          // El click marca el centro vertical del texto.
          y: Math.max(0, yPt - fontSize / 2),
          text: tool === "date" ? todayString() : "",
          fontSize,
          type: tool,
        },
      ]);
      setSelectedId(id);
      setAutoFocusId(id);
    },
    [page, tool, fontSize]
  );

  const updateField = useCallback((id: string, updates: Partial<Field>) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  }, []);

  const removeField = useCallback(
    (id: string) => {
      setFields((prev) => prev.filter((f) => f.id !== id));
      setSelectedId((cur) => (cur === id ? null : cur));
    },
    []
  );

  // Suprimir / Escape sobre el campo seleccionado
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const editing = target?.isContentEditable || target?.tagName === "INPUT";
      if (e.key === "Escape") {
        setSelectedId(null);
        setAutoFocusId(null);
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedId && !editing) {
        e.preventDefault();
        removeField(selectedId);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId, removeField]);

  const handleSign = useCallback(async () => {
    if (!file) return;
    const filled = fields.filter((f) => f.text.trim() !== "");
    if (filled.length === 0) {
      setError("Todos los campos están vacíos. Escribí algo antes de firmar.");
      return;
    }

    setIsSigning(true);
    setError(null);
    try {
      const bytes = await file.arrayBuffer();
      const stamped = await stampPdf(bytes, filled);
      // Se estampa siempre desde los bytes originales, así "Volver a editar" no acumula firmas.
      const blob = new Blob([stamped as unknown as BlobPart], { type: "application/pdf" });
      setSignedUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar el PDF firmado.");
    } finally {
      setIsSigning(false);
    }
  }, [file, fields]);

  const backToEdit = useCallback(() => {
    if (signedUrl) URL.revokeObjectURL(signedUrl);
    setSignedUrl(null);
  }, [signedUrl]);

  if (!file || !fileUrl) return <Dropzone onFile={setFile} />;

  if (signedUrl) {
    return (
      <ResultView
        url={signedUrl}
        fileName={file.name.replace(/\.pdf$/i, "") + "_firmado.pdf"}
        onBack={backToEdit}
        onReset={reset}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Toolbar
        fileName={file.name}
        tool={tool}
        onToolChange={handleToolChange}
        fontSize={fontSize}
        onFontSizeChange={(n) => {
          setFontSize(n);
          if (selectedId) updateField(selectedId, { fontSize: n });
        }}
        page={page}
        numPages={numPages}
        onPageChange={setPage}
        scale={scale}
        onScaleChange={setScale}
        fieldCount={fields.length}
        isSigning={isSigning}
        onSign={handleSign}
        onReset={reset}
      />

      {error && (
        <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
            ✕
          </button>
        </div>
      )}

      <p className="border-b border-slate-800/60 bg-slate-900/40 px-4 py-1.5 text-center text-xs text-slate-500">
        Hacé click sobre el PDF para colocar un campo · arrastralo para moverlo · Supr para borrarlo
      </p>

      <div className="flex-1 overflow-auto bg-slate-950/40">
        <PdfCanvas
          fileUrl={fileUrl}
          page={page}
          scale={scale}
          fields={fields}
          selectedId={selectedId}
          autoFocusId={autoFocusId}
          onLoadSuccess={setNumPages}
          onAddField={addField}
          onSelect={setSelectedId}
          onChangeText={(id, text) => updateField(id, { text })}
          onMove={(id, x, y) => updateField(id, { x, y })}
          onRemove={removeField}
        />
      </div>
    </div>
  );
}
