# Firmar PDF

Firma de PDFs sin restricciones, 100% en el navegador. No hay backend, no hay base de datos
y el archivo nunca sale de la máquina.

## Uso

```bash
npm install
npm run dev
```

Abre en http://localhost:5180.

1. Arrastrá un PDF a la zona punteada, o usá **Seleccionar archivo**.
2. Elegí el tipo de campo (**Firma** en cursiva, **Texto** libre, **Fecha**) y hacé click
   sobre el PDF donde lo quieras. Escribís directo sobre el documento.
3. **Firmar PDF** genera el resultado. Desde ahí lo ves firmado y lo descargás,
   o volvés a editar.

## Atajos e interacción

| Acción | Cómo |
| --- | --- |
| Colocar campo | Click sobre el PDF |
| Editar texto | Click sobre el campo |
| Mover | Arrastrar el campo |
| Borrar | Botón rojo, o `Supr` / `Backspace` con el campo seleccionado |
| Salir de edición | `Enter` o `Esc` |
| Cambiar tamaño de fuente | Campo *Tamaño* en la barra (afecta al campo seleccionado) |

Los campos se pueden poner en cualquier página y en cualquier posición: no hay zonas fijas
ni validaciones.

## Cómo funciona

- **Ver**: `react-pdf` (pdf.js) con el worker servido localmente, así que funciona offline.
- **Firmar**: `pdf-lib` + `@pdf-lib/fontkit` estampan el texto sobre el PDF original.
  La cursiva es *Dancing Script*, embebida desde `public/fonts/`; el texto y las fechas
  usan Helvetica.
- **Coordenadas**: los campos se guardan en puntos PDF con origen arriba-izquierda.
  Al estampar se invierte el eje Y con la altura real de la página y se baja hasta la
  línea base del texto. Ese desplazamiento se mide contra el propio navegador
  (`src/lib/fonts.ts`) en vez de estimarlo con las métricas de pdf-lib, que para Helvetica
  difieren hasta ~2pt. Verificado: la posición horizontal es exacta y la línea base
  queda dentro de 0,1pt de lo que se ve en pantalla.

## Fuentes

`public/fonts/DancingScript-Regular.ttf` es [Dancing Script](https://fonts.google.com/specimen/Dancing+Script),
distribuida bajo la SIL Open Font License 1.1.

## Estructura

```
src/
  App.tsx                 estado general y las tres vistas (cargar → editar → resultado)
  components/
    Dropzone.tsx          drag & drop + selector de archivo
    Toolbar.tsx           tipo de campo, tamaño, páginas, zoom, firmar
    PdfCanvas.tsx         render de la página + capa donde se colocan los campos
    FieldItem.tsx         campo editable, arrastrable y borrable
    ResultView.tsx        PDF firmado + descarga
  lib/
    stampPdf.ts           estampado con pdf-lib
    fonts.ts              familias CSS y medición de la línea base
    pdfWorker.ts          worker local de pdf.js
```
