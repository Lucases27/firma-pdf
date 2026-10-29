import { useState } from "react";
import { Document, Page } from "react-pdf";

interface Props {
  url: string;
  fileName: string;
  onBack: () => void;
  onReset: () => void;
}

export default function ResultView({ url, fileName, onBack, onReset }: Props) {
  const [numPages, setNumPages] = useState(0);

  const download = () => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b border-slate-800 bg-slate-900/80 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-2 text-sm text-emerald-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          PDF firmado
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800"
          >
            Volver a editar
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800"
          >
            Otro PDF
          </button>
          <button
            type="button"
            onClick={download}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-500"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Descargar
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto bg-slate-950/40">
        <div className="flex flex-col items-center gap-6 p-8">
          <Document
            file={url}
            onLoadSuccess={({ numPages: n }) => setNumPages(n)}
            loading={<span className="text-sm text-slate-400">Cargando…</span>}
          >
            {Array.from({ length: numPages }, (_, i) => (
              <div key={i} className="mb-6 rounded-lg bg-white shadow-2xl shadow-black/60">
                <Page pageNumber={i + 1} scale={1.2} renderTextLayer={false} renderAnnotationLayer={false} />
              </div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}
