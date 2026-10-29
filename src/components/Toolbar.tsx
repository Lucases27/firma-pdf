import { FIELD_DEFAULTS, type FieldType } from "../types";

interface Props {
  fileName: string;
  tool: FieldType;
  onToolChange: (t: FieldType) => void;
  fontSize: number;
  onFontSizeChange: (n: number) => void;
  page: number;
  numPages: number;
  onPageChange: (p: number) => void;
  scale: number;
  onScaleChange: (s: number) => void;
  fieldCount: number;
  isSigning: boolean;
  onSign: () => void;
  onReset: () => void;
}

const TOOLS: FieldType[] = ["signature", "text", "date"];

const TOOL_ICONS: Record<FieldType, React.ReactNode> = {
  signature: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 17.5c3.5 0 4-11 7-11s2 9 4.5 9 3-3.5 3-3.5M4.5 21h15"
      />
    </svg>
  ),
  text: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 6.5V5h14v1.5M12 5v14M9.5 19h5" />
    </svg>
  ),
  date: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 5.25h15a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75V6a.75.75 0 01.75-.75z"
      />
    </svg>
  ),
};

export default function Toolbar(props: Props) {
  const {
    fileName,
    tool,
    onToolChange,
    fontSize,
    onFontSizeChange,
    page,
    numPages,
    onPageChange,
    scale,
    onScaleChange,
    fieldCount,
    isSigning,
    onSign,
    onReset,
  } = props;

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-slate-800 bg-slate-900/80 px-4 py-2.5 backdrop-blur">
      <div className="flex min-w-0 items-center gap-2">
        <svg className="h-4 w-4 shrink-0 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5A3.375 3.375 0 0010.125 2.25H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <span className="max-w-[220px] truncate text-sm text-slate-300" title={fileName}>
          {fileName}
        </span>
      </div>

      <div className="h-5 w-px bg-slate-700" />

      {/* Herramienta activa */}
      <div className="flex items-center gap-1 rounded-lg bg-slate-800/70 p-1">
        {TOOLS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onToolChange(t)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
              tool === t ? "bg-violet-600 text-white" : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
            }`}
          >
            {TOOL_ICONS[t]}
            {FIELD_DEFAULTS[t].label}
          </button>
        ))}
      </div>

      {/* Tamaño de fuente */}
      <label className="flex items-center gap-2 text-xs text-slate-400">
        Tamaño
        <input
          type="number"
          min={6}
          max={96}
          value={fontSize}
          onChange={(e) => onFontSizeChange(Math.min(96, Math.max(6, Number(e.target.value) || 12)))}
          className="w-16 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-slate-200 outline-none focus:border-violet-500"
        />
      </label>

      <div className="h-5 w-px bg-slate-700" />

      {/* Páginas */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md border border-slate-700 px-2 py-1 transition hover:bg-slate-800 disabled:opacity-30"
        >
          ←
        </button>
        <span className="tabular-nums">
          {page} / {numPages || "…"}
        </span>
        <button
          type="button"
          disabled={page >= numPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md border border-slate-700 px-2 py-1 transition hover:bg-slate-800 disabled:opacity-30"
        >
          →
        </button>
      </div>

      {/* Zoom */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <button
          type="button"
          onClick={() => onScaleChange(Math.max(0.5, Math.round((scale - 0.15) * 100) / 100))}
          className="rounded-md border border-slate-700 px-2 py-1 transition hover:bg-slate-800"
        >
          −
        </button>
        <span className="w-11 text-center tabular-nums">{Math.round(scale * 100)}%</span>
        <button
          type="button"
          onClick={() => onScaleChange(Math.min(3, Math.round((scale + 0.15) * 100) / 100))}
          className="rounded-md border border-slate-700 px-2 py-1 transition hover:bg-slate-800"
        >
          +
        </button>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800"
        >
          Cambiar PDF
        </button>
        <button
          type="button"
          onClick={onSign}
          disabled={fieldCount === 0 || isSigning}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSigning && (
            <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {isSigning ? "Generando…" : "Firmar PDF"}
        </button>
      </div>
    </header>
  );
}
