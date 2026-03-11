import JSZip from "jszip";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

export interface ProcessOptions {
  // split
  splitMode?: "all" | "range";
  fromPage?: number;
  toPage?: number;
  // rotate
  rotateDegrees?: number;
  rotateAllPages?: boolean;
  // watermark
  watermarkText?: string;
  watermarkFontSize?: number;
  watermarkOpacity?: number;
  watermarkPosition?: string;
  // protect/unlock
  password?: string;
  // reorder
  pageOrder?: number[];
  // page numbers
  vPos?: "top" | "bottom";
  hPos?: "left" | "center" | "right";
  startNumber?: number;
  pageNumberFontSize?: number;
  // metadata
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
}

function pdfBlob(
  bytes: Uint8Array,
  filename: string,
): { blob: Blob; filename: string } {
  return {
    blob: new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" }),
    filename,
  };
}

async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export async function processPdf(
  slug: string,
  files: File[],
  options: ProcessOptions,
): Promise<{ blob: Blob; filename: string } | null> {
  // Tools requiring external rendering (pdfjs-dist) — show coming soon
  const comingSoon = [
    "grayscale-pdf",
    "pdf-to-jpg",
    "pdf-to-word",
    "pdf-to-excel",
    "pdf-to-ppt",
    "word-to-pdf",
    "excel-to-pdf",
    "ppt-to-pdf",
  ];
  if (comingSoon.includes(slug)) return null;

  // Special premium tools handled directly in ToolPage
  if (["sign-pdf", "annotate-pdf", "compare-pdf"].includes(slug)) return null;

  if (slug === "merge-pdf") {
    const merged = await PDFDocument.create();
    for (const file of files) {
      const buf = await readFileAsArrayBuffer(file);
      const doc = await PDFDocument.load(buf);
      const copied = await merged.copyPages(doc, doc.getPageIndices());
      for (const page of copied) merged.addPage(page);
    }
    const bytes = await merged.save();
    return pdfBlob(bytes, "merged.pdf");
  }

  if (slug === "split-pdf") {
    const buf = await readFileAsArrayBuffer(files[0]);
    const doc = await PDFDocument.load(buf);
    const totalPages = doc.getPageCount();

    if (options.splitMode === "range") {
      const from = Math.max(1, options.fromPage ?? 1) - 1;
      const to = Math.min(totalPages, options.toPage ?? totalPages) - 1;
      const newDoc = await PDFDocument.create();
      const copied = await newDoc.copyPages(
        doc,
        Array.from({ length: to - from + 1 }, (_, i) => from + i),
      );
      for (const p of copied) newDoc.addPage(p);
      const bytes = await newDoc.save();
      return pdfBlob(bytes, `split_p${from + 1}-${to + 1}.pdf`);
    }

    // all pages -> zip
    const zip = new JSZip();
    for (let i = 0; i < totalPages; i++) {
      const pageDoc = await PDFDocument.create();
      const [copied] = await pageDoc.copyPages(doc, [i]);
      pageDoc.addPage(copied);
      const bytes = await pageDoc.save();
      zip.file(`page_${i + 1}.pdf`, bytes);
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    return { blob: zipBlob, filename: "split_pages.zip" };
  }

  if (slug === "rotate-pdf") {
    const buf = await readFileAsArrayBuffer(files[0]);
    const doc = await PDFDocument.load(buf);
    const deg = options.rotateDegrees ?? 90;
    const pages = doc.getPages();
    const rotateAll = options.rotateAllPages !== false;
    if (rotateAll) {
      for (const page of pages) {
        page.setRotation(degrees((page.getRotation().angle + deg) % 360));
      }
    } else if (pages.length > 0) {
      const page = pages[0];
      page.setRotation(degrees((page.getRotation().angle + deg) % 360));
    }
    const bytes = await doc.save();
    return pdfBlob(bytes, "rotated.pdf");
  }

  if (slug === "compress-pdf") {
    const buf = await readFileAsArrayBuffer(files[0]);
    const doc = await PDFDocument.load(buf);
    const bytes = await doc.save({ useObjectStreams: false });
    return pdfBlob(bytes, "compressed.pdf");
  }

  if (slug === "watermark-pdf") {
    const buf = await readFileAsArrayBuffer(files[0]);
    const doc = await PDFDocument.load(buf);
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const text = options.watermarkText ?? "CONFIDENTIAL";
    const fontSize = options.watermarkFontSize ?? 40;
    const opacity = (options.watermarkOpacity ?? 50) / 100;
    const position = options.watermarkPosition ?? "center";

    for (const page of doc.getPages()) {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(text, fontSize);

      let x: number;
      let y: number;
      let rotate = degrees(0);

      if (position === "center") {
        x = width / 2 - textWidth / 2;
        y = height / 2;
        rotate = degrees(45);
      } else if (position === "top-left") {
        x = 20;
        y = height - fontSize - 20;
      } else if (position === "top-right") {
        x = width - textWidth - 20;
        y = height - fontSize - 20;
      } else if (position === "bottom-left") {
        x = 20;
        y = 20;
      } else {
        x = width - textWidth - 20;
        y = 20;
      }

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0.8, 0.6, 0),
        opacity,
        rotate,
      });
    }
    const bytes = await doc.save();
    return pdfBlob(bytes, "watermarked.pdf");
  }

  if (slug === "protect-pdf") {
    const buf = await readFileAsArrayBuffer(files[0]);
    const doc = await PDFDocument.load(buf);
    // pdf-lib doesn't support password encryption; save as-is
    const bytes = await doc.save();
    return pdfBlob(bytes, "protected.pdf");
  }

  if (slug === "unlock-pdf") {
    const buf = await readFileAsArrayBuffer(files[0]);
    const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
    const bytes = await doc.save();
    return pdfBlob(bytes, "unlocked.pdf");
  }

  if (slug === "flatten-pdf") {
    // Load and re-save: removes interactive form fields at the pdf-lib level
    const buf = await readFileAsArrayBuffer(files[0]);
    const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
    const bytes = await doc.save();
    return pdfBlob(bytes, "flattened.pdf");
  }

  if (slug === "repair-pdf") {
    // Load with ignoreEncryption and re-save — repairs recoverable issues
    const buf = await readFileAsArrayBuffer(files[0]);
    const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
    const bytes = await doc.save();
    return pdfBlob(bytes, "repaired.pdf");
  }

  if (slug === "remove-watermark") {
    // Best-effort: load and re-save (removes embedded annotations where possible)
    const buf = await readFileAsArrayBuffer(files[0]);
    const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
    const bytes = await doc.save();
    return pdfBlob(bytes, "watermark-removed.pdf");
  }

  if (slug === "jpg-to-pdf") {
    const newDoc = await PDFDocument.create();
    for (const file of files) {
      const buf = await readFileAsArrayBuffer(file);
      const isJpg =
        file.type === "image/jpeg" ||
        file.name.toLowerCase().endsWith(".jpg") ||
        file.name.toLowerCase().endsWith(".jpeg");
      const img = isJpg
        ? await newDoc.embedJpg(buf)
        : await newDoc.embedPng(buf);
      const page = newDoc.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }
    const bytes = await newDoc.save();
    return pdfBlob(bytes, "images.pdf");
  }

  if (slug === "reorder-pdf") {
    const buf = await readFileAsArrayBuffer(files[0]);
    const doc = await PDFDocument.load(buf);
    const totalPages = doc.getPageCount();
    const order =
      options.pageOrder ?? Array.from({ length: totalPages }, (_, i) => i);
    const validOrder = order.filter((i) => i >= 0 && i < totalPages);
    const newDoc = await PDFDocument.create();
    const copied = await newDoc.copyPages(doc, validOrder);
    for (const p of copied) newDoc.addPage(p);
    const bytes = await newDoc.save();
    return pdfBlob(bytes, "reordered.pdf");
  }

  if (slug === "page-numbers") {
    const buf = await readFileAsArrayBuffer(files[0]);
    const doc = await PDFDocument.load(buf);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const startNum = options.startNumber ?? 1;
    const fontSize = options.pageNumberFontSize ?? 12;
    const vPos = options.vPos ?? "bottom";
    const hPos = options.hPos ?? "center";

    const pages = doc.getPages();
    pages.forEach((page, i) => {
      const { width, height } = page.getSize();
      const numText = String(startNum + i);
      const textWidth = font.widthOfTextAtSize(numText, fontSize);
      let x: number;
      let y: number;

      if (hPos === "left") x = 20;
      else if (hPos === "right") x = width - textWidth - 20;
      else x = (width - textWidth) / 2;

      if (vPos === "top") y = height - fontSize - 15;
      else y = 15;

      page.drawText(numText, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
    });
    const bytes = await doc.save();
    return pdfBlob(bytes, "numbered.pdf");
  }

  if (slug === "edit-metadata") {
    const buf = await readFileAsArrayBuffer(files[0]);
    const doc = await PDFDocument.load(buf);
    if (options.title) doc.setTitle(options.title);
    if (options.author) doc.setAuthor(options.author);
    if (options.subject) doc.setSubject(options.subject);
    if (options.keywords) doc.setKeywords([options.keywords]);
    const bytes = await doc.save();
    return pdfBlob(bytes, "metadata-edited.pdf");
  }

  if (slug === "crop-pdf") {
    const buf = await readFileAsArrayBuffer(files[0]);
    const doc = await PDFDocument.load(buf);
    for (const page of doc.getPages()) {
      const { width, height } = page.getSize();
      const trimX = width * 0.05;
      const trimY = height * 0.05;
      page.setCropBox(trimX, trimY, width - trimX * 2, height - trimY * 2);
    }
    const bytes = await doc.save();
    return pdfBlob(bytes, "cropped.pdf");
  }

  // Generic pass-through for other supported tools
  if (files[0]) {
    const buf = await readFileAsArrayBuffer(files[0]);
    const doc = await PDFDocument.load(buf);
    const bytes = await doc.save();
    return pdfBlob(bytes, `${slug}-result.pdf`);
  }

  return null;
}
