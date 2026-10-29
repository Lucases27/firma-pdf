import { useEffect, useRef, useState } from "react";
import { FIELD_DEFAULTS, type Field } from "../types";
import { FONT_STACK } from "../lib/fonts";

interface Props {
  field: Field;
  /** Escala de render: px DOM = punto PDF * scale */
  scale: number;
  selected: boolean;
  autoFocus: boolean;
  onSelect: () => void;
  onChangeText: (text: string) => void;
  onMove: (x: number, y: number) => void;
  onRemove: () => void;
}

const DRAG_THRESHOLD = 3;

export default function FieldItem({
  field,
  scale,
  selected,
  autoFocus,
  onSelect,
  onChangeText,
  onMove,
  onRemove,
}: Props) {
  const editableRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Contenido inicial: el div es no controlado para no romper el cursor al tipear.
  useEffect(() => {
    const el = editableRef.current;
    if (el && el.textContent !== field.text) el.textContent = field.text;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!autoFocus) return;
    const el = editableRef.current;
    if (!el) return;
    el.focus();
    setIsEditing(true);
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, [autoFocus]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect();
    if (isEditing) return; // ya está en edición: dejamos el cursor nativo

    // Evita que el navegador enfoque/seleccione: decidimos nosotros drag vs click.
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const originX = field.x;
    const originY = field.y;
    let moved = false;

    const onMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!moved && Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
      if (!moved) {
        moved = true;
        setIsDragging(true);
      }
      onMove(Math.max(0, originX + dx / scale), Math.max(0, originY + dy / scale));
    };

    const onMouseUp = (ev: MouseEvent) => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      setIsDragging(false);
      if (moved) return;

      // Click sin arrastre: entramos a editar y ubicamos el cursor donde se clickeó.
      const el = editableRef.current;
      if (!el) return;
      el.focus();
      setIsEditing(true);
      const caret = document.caretRangeFromPoint?.(ev.clientX, ev.clientY);
      if (caret) {
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(caret);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const defaults = FIELD_DEFAULTS[field.type];

  return (
    <div
      className="group absolute"
      style={{ left: field.x * scale, top: field.y * scale }}
      onMouseDown={handleMouseDown}
    >
      <div
        ref={editableRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        data-placeholder={defaults.placeholder}
        onInput={(e) => onChangeText(e.currentTarget.textContent ?? "")}
        onBlur={() => setIsEditing(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "Escape") {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        onPaste={(e) => {
          // Pegar siempre como texto plano, en una sola línea.
          e.preventDefault();
          const plain = e.clipboardData.getData("text/plain").replace(/\s+/g, " ");
          document.execCommand("insertText", false, plain);
        }}
        className={`field-editable whitespace-pre text-black outline-none ${
          isDragging ? "cursor-grabbing" : isEditing ? "cursor-text" : "cursor-grab"
        } ${
          selected
            ? "outline-1 outline-dashed outline-violet-500"
            : "hover:outline-1 hover:outline-dashed hover:outline-violet-400/50"
        }`}
        style={{
          fontFamily: FONT_STACK[field.type],
          fontSize: field.fontSize * scale,
          lineHeight: 1,
          minWidth: 8,
        }}
      />

      {selected && (
        <button
          type="button"
          title="Eliminar campo"
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove();
          }}
          className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow transition hover:bg-red-500"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
