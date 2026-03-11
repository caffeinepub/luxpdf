import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronRight,
  Crown,
  Download,
  Lock,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Dropzone } from "../components/Dropzone";
import { type ProcessState, ProgressState } from "../components/ProgressState";
import { StartTrialModal } from "../components/StartTrialModal";
import { ToolOptions } from "../components/ToolOptions";
import { usePremium } from "../context/PremiumContext";
import { useToolBySlug } from "../hooks/useQueries";
import type { ProcessOptions } from "../lib/pdfProcessor";
import { processPdf } from "../lib/pdfProcessor";
import { FALLBACK_TOOLS } from "../lib/toolsData";

interface ToolPageProps {
  slug: string;
  onNavigate: (page: string, toolSlug?: string) => void;
}

interface UploadedFile {
  file: File;
  id: string;
}

const ACCEPT_MAP: Record<string, string> = {
  "word-to-pdf": ".doc,.docx",
  "excel-to-pdf": ".xls,.xlsx",
  "ppt-to-pdf": ".ppt,.pptx",
  "jpg-to-pdf": ".jpg,.jpeg,.png,.gif,.webp",
};

const BUTTON_LABELS: Record<string, string> = {
  "merge-pdf": "Merge PDFs",
  "split-pdf": "Split PDF",
  "compress-pdf": "Compress PDF",
  "rotate-pdf": "Rotate Pages",
  "watermark-pdf": "Add Watermark",
  "protect-pdf": "Protect PDF",
  "unlock-pdf": "Unlock PDF",
};

const SPECIAL_TOOLS = ["sign-pdf", "annotate-pdf", "compare-pdf"];

// ─────────────────────────────────────────────────────────────
// Sign PDF Component
// ─────────────────────────────────────────────────────────────
function SignPdfTool() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [signMode, setSignMode] = useState<"draw" | "type">("draw");
  const [typedName, setTypedName] = useState("");
  const [sigPage, setSigPage] = useState("last");
  const [sigPosition, setSigPosition] = useState("bottom-right");
  const [processState, setProcessState] = useState<ProcessState>("idle");
  const [downloadResult, setDownloadResult] = useState<{
    blob: Blob;
    filename: string;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getPos = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  };

  const startDraw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current = getPos(e);
  };

  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    e.preventDefault();
    if (!isDrawing.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current?.x ?? pos.x, lastPos.current?.y ?? pos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => {
    isDrawing.current = false;
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const getSignatureDataUrl = (): string | null => {
    if (signMode === "draw") {
      return canvasRef.current?.toDataURL("image/png") ?? null;
    }
    if (!typedName.trim()) return null;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 400;
    tempCanvas.height = 120;
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 400, 120);
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "italic 48px serif";
    ctx.textBaseline = "middle";
    ctx.fillText(typedName, 20, 60);
    return tempCanvas.toDataURL("image/png");
  };

  const handleSign = async () => {
    if (files.length === 0) {
      toast.error("Please upload a PDF file first.");
      return;
    }
    const sigDataUrl = getSignatureDataUrl();
    if (!sigDataUrl) {
      toast.error("Please draw or type your signature first.");
      return;
    }

    setProcessState("processing");
    try {
      const buf = await files[0].file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buf);
      const base64 = sigDataUrl.split(",")[1];
      const pngBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const sigImg = await pdfDoc.embedPng(pngBytes);

      const pages = pdfDoc.getPages();
      const pagesToSign =
        sigPage === "all"
          ? pages
          : sigPage === "first"
            ? [pages[0]]
            : [pages[pages.length - 1]];

      const sigW = 180;
      const sigH = 60;

      for (const page of pagesToSign) {
        const { width, height } = page.getSize();
        let x = 0;
        let y = 0;
        const margin = 20;
        if (sigPosition === "top-left") {
          x = margin;
          y = height - sigH - margin;
        } else if (sigPosition === "top-right") {
          x = width - sigW - margin;
          y = height - sigH - margin;
        } else if (sigPosition === "center") {
          x = (width - sigW) / 2;
          y = (height - sigH) / 2;
        } else if (sigPosition === "bottom-left") {
          x = margin;
          y = margin;
        } else {
          // bottom-right
          x = width - sigW - margin;
          y = margin;
        }
        page.drawImage(sigImg, { x, y, width: sigW, height: sigH });
      }

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });
      setDownloadResult({ blob, filename: "signed.pdf" });
      setProcessState("success");
    } catch (err) {
      console.error(err);
      toast.error(
        "Failed to sign the PDF. Please check the file and try again.",
      );
      setProcessState("error");
    }
  };

  const handleReset = () => {
    setFiles([]);
    setProcessState("idle");
    setDownloadResult(null);
    clearCanvas();
  };

  if (processState !== "idle") {
    return (
      <ProgressState
        state={processState}
        onReset={handleReset}
        toolName="Sign PDF"
        downloadBlob={downloadResult?.blob}
        downloadFilename={downloadResult?.filename}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Dropzone
        files={files}
        onFilesChange={setFiles}
        accept=".pdf"
        multiple={false}
      />

      {files.length > 0 && (
        <div className="space-y-5 rounded-xl border border-border/50 bg-card p-6">
          <Tabs
            value={signMode}
            onValueChange={(v) => setSignMode(v as "draw" | "type")}
          >
            <TabsList className="grid w-full grid-cols-2 bg-secondary/60">
              <TabsTrigger data-ocid="sign.draw_tab" value="draw">
                Draw Signature
              </TabsTrigger>
              <TabsTrigger data-ocid="sign.type_tab" value="type">
                Type Signature
              </TabsTrigger>
            </TabsList>

            <TabsContent value="draw" className="mt-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Draw your signature below:
              </p>
              <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-border/60 bg-white">
                <canvas
                  ref={canvasRef}
                  data-ocid="sign.canvas_target"
                  width={400}
                  height={150}
                  className="w-full cursor-crosshair touch-none"
                  style={{ display: "block" }}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                />
              </div>
              <Button
                type="button"
                data-ocid="sign.clear_button"
                variant="outline"
                size="sm"
                onClick={clearCanvas}
                className="gap-2 border-border/60"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </Button>
            </TabsContent>

            <TabsContent value="type" className="mt-4 space-y-3">
              <Label className="text-xs text-muted-foreground">
                Type your name:
              </Label>
              <Input
                data-ocid="sign.name_input"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Your full name"
                className="border-border/50 bg-secondary/40 font-serif italic text-lg"
              />
              {typedName && (
                <div className="rounded-lg bg-white p-4 text-center">
                  <span
                    style={{
                      fontFamily: "serif",
                      fontStyle: "italic",
                      fontSize: "2rem",
                      color: "#1a1a2e",
                    }}
                  >
                    {typedName}
                  </span>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Page</Label>
              <Select value={sigPage} onValueChange={setSigPage}>
                <SelectTrigger
                  data-ocid="sign.page_select"
                  className="border-border/50 bg-secondary/40"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last">Last Page</SelectItem>
                  <SelectItem value="first">First Page</SelectItem>
                  <SelectItem value="all">All Pages</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Position</Label>
              <Select value={sigPosition} onValueChange={setSigPosition}>
                <SelectTrigger
                  data-ocid="sign.position_select"
                  className="border-border/50 bg-secondary/40"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      <Button
        type="button"
        data-ocid="sign.submit_button"
        size="lg"
        className="w-full gap-2 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light py-6 font-bold text-background shadow-gold-sm transition hover:shadow-gold disabled:opacity-50"
        onClick={handleSign}
        disabled={files.length === 0}
      >
        <Sparkles className="h-5 w-5" />
        Sign PDF
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Annotate PDF Component
// ─────────────────────────────────────────────────────────────
const ANNOTATION_COLORS: {
  label: string;
  hex: string;
  rgb: [number, number, number];
}[] = [
  { label: "Gold", hex: "#C9A84C", rgb: [0.788, 0.659, 0.298] },
  { label: "Red", hex: "#e53e3e", rgb: [0.898, 0.243, 0.243] },
  { label: "Blue", hex: "#3182ce", rgb: [0.192, 0.51, 0.808] },
  { label: "Green", hex: "#38a169", rgb: [0.22, 0.631, 0.412] },
  { label: "Gray", hex: "#718096", rgb: [0.443, 0.502, 0.588] },
];

function AnnotatePdfTool() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [annotation, setAnnotation] = useState("");
  const [colorIdx, setColorIdx] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [fontSize, setFontSize] = useState(14);
  const [vPos, setVPos] = useState("top");
  const [hPos, setHPos] = useState("left");
  const [processState, setProcessState] = useState<ProcessState>("idle");
  const [downloadResult, setDownloadResult] = useState<{
    blob: Blob;
    filename: string;
  } | null>(null);

  const handleAnnotate = async () => {
    if (files.length === 0) {
      toast.error("Please upload a PDF file first.");
      return;
    }
    if (!annotation.trim()) {
      toast.error("Please enter annotation text.");
      return;
    }

    setProcessState("processing");
    try {
      const buf = await files[0].file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buf);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const targetPage = pages[Math.min(pageNum - 1, pages.length - 1)];
      const { width, height } = targetPage.getSize();
      const [r, g, b] = ANNOTATION_COLORS[colorIdx].rgb;
      const textWidth = font.widthOfTextAtSize(annotation, fontSize);
      const margin = 20;
      let x = margin;
      let y = height - fontSize - margin;
      if (hPos === "center") x = (width - textWidth) / 2;
      else if (hPos === "right") x = width - textWidth - margin;
      if (vPos === "center") y = (height - fontSize) / 2;
      else if (vPos === "bottom") y = margin;
      targetPage.drawText(annotation, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(r, g, b),
      });
      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });
      setDownloadResult({ blob, filename: "annotated.pdf" });
      setProcessState("success");
    } catch (err) {
      console.error(err);
      toast.error("Failed to annotate the PDF. Please try again.");
      setProcessState("error");
    }
  };

  const handleReset = () => {
    setFiles([]);
    setProcessState("idle");
    setDownloadResult(null);
  };

  if (processState !== "idle") {
    return (
      <ProgressState
        state={processState}
        onReset={handleReset}
        toolName="Annotate PDF"
        downloadBlob={downloadResult?.blob}
        downloadFilename={downloadResult?.filename}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Dropzone
        files={files}
        onFilesChange={setFiles}
        accept=".pdf"
        multiple={false}
      />

      {files.length > 0 && (
        <div className="space-y-5 rounded-xl border border-border/50 bg-card p-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Annotation Text
            </Label>
            <Input
              data-ocid="annotate.text_input"
              value={annotation}
              onChange={(e) => setAnnotation(e.target.value)}
              placeholder="Enter your annotation..."
              className="border-border/50 bg-secondary/40"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Color
            </Label>
            <div className="flex gap-3">
              {ANNOTATION_COLORS.map((c, i) => (
                <button
                  key={c.label}
                  type="button"
                  data-ocid={`annotate.color_toggle.${i + 1}`}
                  title={c.label}
                  onClick={() => setColorIdx(i)}
                  className={`h-8 w-8 rounded-full transition-all ${
                    colorIdx === i
                      ? "scale-110 ring-2 ring-offset-2 ring-offset-card"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Page</Label>
              <Input
                data-ocid="annotate.page_input"
                type="number"
                min={1}
                value={pageNum}
                onChange={(e) => setPageNum(Number(e.target.value))}
                className="border-border/50 bg-secondary/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Vertical</Label>
              <Select value={vPos} onValueChange={setVPos}>
                <SelectTrigger
                  data-ocid="annotate.vpos_select"
                  className="border-border/50 bg-secondary/40"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Horizontal
              </Label>
              <Select value={hPos} onValueChange={setHPos}>
                <SelectTrigger
                  data-ocid="annotate.hpos_select"
                  className="border-border/50 bg-secondary/40"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Font Size: {fontSize}pt
            </Label>
            <Slider
              data-ocid="annotate.fontsize_select"
              min={8}
              max={48}
              step={1}
              value={[fontSize]}
              onValueChange={([v]) => setFontSize(v)}
              className="[&_[role=slider]]:bg-gold"
            />
          </div>
        </div>
      )}

      <Button
        type="button"
        data-ocid="annotate.submit_button"
        size="lg"
        className="w-full gap-2 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light py-6 font-bold text-background shadow-gold-sm transition hover:shadow-gold disabled:opacity-50"
        onClick={handleAnnotate}
        disabled={files.length === 0}
      >
        <Sparkles className="h-5 w-5" />
        Add Annotation
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Compare PDFs Component
// ─────────────────────────────────────────────────────────────
function ComparePdfsTool() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileA = (files: UploadedFile[]) =>
    setFileA(files[0]?.file ?? null);
  const handleFileB = (files: UploadedFile[]) =>
    setFileB(files[0]?.file ?? null);

  const filesA: UploadedFile[] = fileA ? [{ file: fileA, id: "a" }] : [];
  const filesB: UploadedFile[] = fileB ? [{ file: fileB, id: "b" }] : [];

  const formatSize = (n: number) =>
    n < 1024 * 1024
      ? `${(n / 1024).toFixed(1)} KB`
      : `${(n / 1024 / 1024).toFixed(2)} MB`;

  const getPdfPageCount = async (file: File): Promise<number> => {
    try {
      const buf = await file.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      return doc.getPageCount();
    } catch {
      return 0;
    }
  };

  const generateReport = async () => {
    if (!fileA || !fileB) {
      toast.error("Please upload both PDFs.");
      return;
    }
    setIsGenerating(true);
    try {
      const [pagesA, pagesB] = await Promise.all([
        getPdfPageCount(fileA),
        getPdfPageCount(fileB),
      ]);
      const rows: { label: string; a: string; b: string }[] = [
        { label: "File Name", a: fileA.name, b: fileB.name },
        {
          label: "File Size",
          a: formatSize(fileA.size),
          b: formatSize(fileB.size),
        },
        { label: "Page Count", a: String(pagesA), b: String(pagesB) },
      ];
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const page = pdfDoc.addPage([595, 842]);
      const { height } = page.getSize();

      page.drawText("PDF Comparison Report", {
        x: 50,
        y: height - 60,
        size: 20,
        font: boldFont,
        color: rgb(0.788, 0.659, 0.298),
      });
      page.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
        x: 50,
        y: height - 85,
        size: 10,
        font,
        color: rgb(0.6, 0.6, 0.6),
      });

      let y = height - 130;
      page.drawText("Property", {
        x: 50,
        y,
        size: 11,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      page.drawText("Document A", {
        x: 200,
        y,
        size: 11,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      page.drawText("Document B", {
        x: 380,
        y,
        size: 11,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
      });

      y -= 10;
      page.drawLine({
        start: { x: 50, y },
        end: { x: 545, y },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
      });

      for (const row of rows) {
        y -= 30;
        const differs = row.a !== row.b;
        const color = differs ? rgb(0.788, 0.659, 0.298) : rgb(0.4, 0.4, 0.4);
        page.drawText(row.label, {
          x: 50,
          y,
          size: 10,
          font: boldFont,
          color: rgb(0.3, 0.3, 0.3),
        });
        page.drawText(row.a.slice(0, 28), { x: 200, y, size: 10, font, color });
        page.drawText(row.b.slice(0, 28), { x: 380, y, size: 10, font, color });
      }

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "comparison-report.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Comparison report downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate report.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Document A
          </p>
          <Dropzone
            files={filesA}
            onFilesChange={handleFileA}
            accept=".pdf"
            multiple={false}
            label="Drop Document A"
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Document B
          </p>
          <Dropzone
            files={filesB}
            onFilesChange={handleFileB}
            accept=".pdf"
            multiple={false}
            label="Drop Document B"
          />
        </div>
      </div>

      {fileA && fileB && (
        <div
          data-ocid="compare.table"
          className="overflow-hidden rounded-xl border border-border/50 bg-card"
        >
          <div className="border-b border-border/40 bg-secondary/30 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Comparison
            </p>
          </div>
          <div className="divide-y divide-border/30">
            {[
              { label: "File Name", a: fileA.name, b: fileB.name },
              {
                label: "File Size",
                a: formatSize(fileA.size),
                b: formatSize(fileB.size),
              },
            ].map((row, i) => {
              const differs = row.a !== row.b;
              return (
                <div
                  key={row.label}
                  data-ocid={`compare.row.${i + 1}`}
                  className={`grid grid-cols-3 px-4 py-3 text-sm ${
                    differs ? "bg-gold/5" : ""
                  }`}
                >
                  <span className="font-medium text-muted-foreground">
                    {row.label}
                  </span>
                  <span
                    className={`truncate ${
                      differs ? "text-gold" : "text-foreground"
                    }`}
                  >
                    {row.a}
                  </span>
                  <span
                    className={`truncate ${
                      differs ? "text-gold" : "text-foreground"
                    }`}
                  >
                    {row.b}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Button
        type="button"
        data-ocid="compare.submit_button"
        size="lg"
        className="w-full gap-2 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light py-6 font-bold text-background shadow-gold-sm transition hover:shadow-gold disabled:opacity-50"
        onClick={generateReport}
        disabled={!fileA || !fileB || isGenerating}
      >
        {isGenerating ? (
          <RefreshCw className="h-5 w-5 animate-spin" />
        ) : (
          <Download className="h-5 w-5" />
        )}
        Download Comparison Report
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main ToolPage
// ─────────────────────────────────────────────────────────────
export function ToolPage({ slug, onNavigate }: ToolPageProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [processState, setProcessState] = useState<ProcessState>("idle");
  const [processOptions, setProcessOptions] = useState<ProcessOptions>({});
  const [downloadResult, setDownloadResult] = useState<{
    blob: Blob;
    filename: string;
  } | null>(null);
  const { data: backendTool } = useToolBySlug(slug);
  const { isPremium: isPremiumUser, isTrialing } = usePremium();
  const [trialModalOpen, setTrialModalOpen] = useState(false);

  const tool =
    backendTool || FALLBACK_TOOLS.find((t) => t.slug === slug) || null;

  const isPremiumTool = tool?.tier === "premium";
  const isUnlocked = !isPremiumTool || isPremiumUser;
  const isSpecialTool = SPECIAL_TOOLS.includes(slug);
  const accept = ACCEPT_MAP[slug] || ".pdf";
  const buttonLabel = BUTTON_LABELS[slug] || "Process PDF";

  const handleProcess = useCallback(async () => {
    if (files.length === 0) {
      toast.error("Please upload at least one file first.");
      return;
    }

    setProcessState("uploading");
    await new Promise((r) => setTimeout(r, 800));
    setProcessState("processing");

    let result: { blob: Blob; filename: string } | null = null;
    try {
      result = await processPdf(
        slug,
        files.map((f) => f.file),
        processOptions,
      );
    } catch (err) {
      console.error("PDF processing error:", err);
      toast.error("Processing failed. Please check your file and try again.");
      setProcessState("error");
      return;
    }

    if (result === null) {
      toast.info("This tool is coming soon \u2014 stay tuned!");
      setProcessState("idle");
      return;
    }

    setDownloadResult(result);
    await new Promise((r) => setTimeout(r, 500));
    setProcessState("finalizing");
    await new Promise((r) => setTimeout(r, 900));
    setProcessState("success");
  }, [files, slug, processOptions]);

  const handleReset = useCallback(() => {
    setFiles([]);
    setProcessState("idle");
    setDownloadResult(null);
  }, []);

  if (!tool) {
    return (
      <main className="animate-fade-in px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-xl font-bold text-muted-foreground">
            Tool not found.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => onNavigate("home")}
          >
            Back to Tools
          </Button>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="animate-fade-in px-4 py-10">
        <div className="mx-auto max-w-3xl">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-1 text-sm text-muted-foreground">
            <button
              type="button"
              data-ocid="tool.home_link"
              onClick={() => onNavigate("home")}
              className="transition hover:text-foreground"
            >
              Home
            </button>
            <ChevronRight className="h-3.5 w-3.5" />
            <button
              type="button"
              onClick={() => onNavigate("home")}
              className="transition hover:text-foreground"
            >
              {tool.category}
            </button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">{tool.name}</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-black text-foreground md:text-4xl">
                {tool.name}
              </h1>
              {isPremiumTool && isTrialing ? (
                <Badge className="gap-1 border-gold/30 bg-gold/10 text-gold">
                  <Crown className="h-3 w-3" /> Trial Active
                </Badge>
              ) : isPremiumTool ? (
                <Badge className="gap-1 border-gold/30 bg-gold/10 text-gold">
                  <Crown className="h-3 w-3" /> Premium
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                >
                  Free
                </Badge>
              )}
            </div>
            <p className="text-base leading-relaxed text-muted-foreground">
              {tool.description}
            </p>
          </div>

          {/* Lock Overlay */}
          {!isUnlocked ? (
            <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/8 to-transparent p-10 text-center">
              <div className="pointer-events-none absolute inset-0 opacity-20 blur-sm">
                <div className="m-4 h-32 rounded-xl border border-border/40 bg-secondary" />
                <div className="m-4 h-24 rounded-xl border border-border/40 bg-secondary" />
              </div>
              <div className="relative z-10">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/15">
                  <Lock className="h-8 w-8 text-gold" />
                </div>
                <h2 className="mb-2 font-display text-2xl font-bold text-foreground">
                  Premium Feature
                </h2>
                <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">
                  {tool.name} is available in the Premium plan. Upgrade to
                  unlock this and all other advanced tools.
                </p>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Button
                    type="button"
                    data-ocid="tool.upgrade_button"
                    className="gap-2 rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light px-8 font-bold text-background shadow-gold-sm hover:shadow-gold"
                    onClick={() => onNavigate("pricing")}
                  >
                    <Sparkles className="h-4 w-4" />
                    Upgrade to Premium
                  </Button>
                  <Button
                    type="button"
                    data-ocid="tool.start_trial_button"
                    variant="outline"
                    className="rounded-full border-gold/30 text-gold hover:bg-gold/5"
                    onClick={() => setTrialModalOpen(true)}
                  >
                    Start Free Trial
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-border/60"
                    onClick={() => onNavigate("home")}
                  >
                    Explore Free Tools
                  </Button>
                </div>
              </div>
            </div>
          ) : isSpecialTool ? (
            slug === "sign-pdf" ? (
              <SignPdfTool />
            ) : slug === "annotate-pdf" ? (
              <AnnotatePdfTool />
            ) : (
              <ComparePdfsTool />
            )
          ) : (
            <div className="space-y-6">
              {processState === "idle" && (
                <Dropzone
                  files={files}
                  onFilesChange={setFiles}
                  accept={accept}
                  multiple={slug !== "unlock-pdf" && slug !== "compress-pdf"}
                />
              )}

              {processState === "idle" && files.length > 0 && (
                <ToolOptions
                  slug={slug}
                  fileCount={files.length}
                  onOptionsChange={setProcessOptions}
                />
              )}

              {processState === "idle" && (
                <Button
                  type="button"
                  data-ocid="tool.process_button"
                  size="lg"
                  className="w-full gap-2 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light py-6 font-bold text-background shadow-gold-sm transition hover:shadow-gold disabled:opacity-50"
                  onClick={handleProcess}
                  disabled={files.length === 0}
                >
                  <Sparkles className="h-5 w-5" />
                  {buttonLabel}
                </Button>
              )}

              {processState !== "idle" && (
                <ProgressState
                  state={processState}
                  onReset={handleReset}
                  toolName={tool.name}
                  downloadBlob={downloadResult?.blob}
                  downloadFilename={downloadResult?.filename}
                />
              )}
            </div>
          )}
        </div>
      </main>
      <StartTrialModal
        open={trialModalOpen}
        onClose={() => setTrialModalOpen(false)}
      />
    </>
  );
}
