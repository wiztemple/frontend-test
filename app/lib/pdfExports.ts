import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Annotation } from "../types/annotation";

export async function exportAnnotatedPdf(
  pdfFile: File,
  annotations: Annotation[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(await pdfFile.arrayBuffer());
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const annotation of annotations) {
    const page = pages[annotation.pageNumber - 1];
    const { height } = page.getSize();

    switch (annotation.type) {
      case "highlight": {
        const [r, g, b] = hexToRgb(annotation.color || "#FFEB3B");
        page.drawRectangle({
          x: annotation.bounds.x1,
          y: height - annotation.bounds.y2,
          width: annotation.bounds.x2 - annotation.bounds.x1,
          height: annotation.bounds.y2 - annotation.bounds.y1,
          color: rgb(r, g, b),
          opacity: 0.3,
        });
        break;
      }

      case "underline": {
        const [r, g, b] = hexToRgb(annotation.color || "#2196F3");
        page.drawLine({
          start: { x: annotation.bounds.x1, y: height - annotation.bounds.y1 },
          end: { x: annotation.bounds.x2, y: height - annotation.bounds.y1 },
          thickness: 2,
          color: rgb(r, g, b),
        });
        break;
      }

      case "comment": {
        const [r, g, b] = hexToRgb(annotation.color || "#4CAF50");
        page.drawCircle({
          x: annotation.position.x,
          y: height - annotation.position.y,
          size: 8,
          color: rgb(r, g, b),
        });

        if (annotation.content) {
          page.drawText(annotation.content, {
            x: annotation.position.x + 12,
            y: height - annotation.position.y - 5,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
        }
        break;
      }

      case "signature": {
        const [r, g, b] = hexToRgb(annotation.color || "#000000");
        const path = annotation.points.map((p) => ({
          x: p.x,
          y: height - p.y,
        }));

        for (let i = 1; i < path.length; i++) {
          page.drawLine({
            start: path[i - 1],
            end: path[i],
            thickness: 2,
            color: rgb(r, g, b),
          });
        }
        break;
      }
    }
  }

  return pdfDoc.save();
}

function hexToRgb(hex: string): [number, number, number] {
  const bigint = parseInt(hex.replace("#", ""), 16);
  return [
    ((bigint >> 16) & 255) / 255,
    ((bigint >> 8) & 255) / 255,
    (bigint & 255) / 255,
  ];
}

export function downloadPdf(pdfBytes: Uint8Array, filename: string): void {
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
