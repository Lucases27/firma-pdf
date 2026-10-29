import { useCallback, useRef, useState } from "react";

interface Props {
  onFile: (file: File) => void;
}

export default function Dropzone({ onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOver, setIsOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) {
        setError("Ese archivo no es un PDF.");
        return;
      }
      setError(null);
      onFile(file);
    },
    [onFile]
  );

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-100">Firmar PDF</h1>
          <p className="mt-2 text-sm text-slate-400">
            Todo pasa en tu navegador. El archivo no se sube a ningún lado.
          </p>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsOver(true);
          }}
          onDragLeave={() => setIsOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsOver(false);
            accept(e.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed px-8 py-16 transition ${
            isOver
              ? "border-violet-400 bg-violet-500/10"
              : "border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900"
          }`}
        >
          <svg
            className={`h-12 w-12 transition ${isOver ? "text-violet-400" : "text-slate-500"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16.5V9.75m0 0l-3 3m3-3l3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
            />
          </svg>

          <div className="text-center">
            <p className="text-base font-medium text-slate-200">Arrastrá tu PDF acá</p>
            <p className="mt-1 text-sm text-slate-500">o</p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500"
          >
            Seleccionar archivo
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            accept(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
