import { pdfjs } from "react-pdf";
// Worker local (sin CDN): la app funciona 100% offline.
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
