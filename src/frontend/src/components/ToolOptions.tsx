import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { useEffect, useState } from "react";
import type { ProcessOptions } from "../lib/pdfProcessor";

interface ToolOptionsProps {
  slug: string;
  fileCount: number;
  onOptionsChange: (opts: ProcessOptions) => void;
}

function OptionSection({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-gold/70">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function MergeOptions({
  fileCount,
  onOptionsChange,
}: { fileCount: number; onOptionsChange: (opts: ProcessOptions) => void }) {
  const [order, setOrder] = useState(
    Array.from({ length: Math.max(fileCount, 2) }, (_, i) => `File ${i + 1}`),
  );

  useEffect(() => {
    onOptionsChange({});
  }, [onOptionsChange]);

  const moveUp = (i: number) => {
    if (i === 0) return;
    const n = [...order];
    [n[i - 1], n[i]] = [n[i], n[i - 1]];
    setOrder(n);
  };

  const moveDown = (i: number) => {
    if (i === order.length - 1) return;
    const n = [...order];
    [n[i], n[i + 1]] = [n[i + 1], n[i]];
    setOrder(n);
  };

  return (
    <OptionSection title="File Order">
      <p className="text-xs text-muted-foreground">
        Drag files in the list above, or use arrows to set merge order.
      </p>
      <div className="space-y-1.5">
        {order.map((name, i) => (
          <div
            key={name}
            className="flex items-center gap-2 rounded-lg border border-border/40 bg-secondary/30 px-3 py-2"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/40" />
            <span className="flex-1 text-sm text-foreground">{name}</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => moveUp(i)}
                className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
                disabled={i === 0}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moveDown(i)}
                className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
                disabled={i === order.length - 1}
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </OptionSection>
  );
}

function SplitOptions({
  onOptionsChange,
}: { onOptionsChange: (opts: ProcessOptions) => void }) {
  const [mode, setMode] = useState<"all" | "range">("all");
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(5);

  useEffect(() => {
    onOptionsChange({ splitMode: mode, fromPage, toPage });
  }, [mode, fromPage, toPage, onOptionsChange]);

  return (
    <OptionSection title="Split Mode">
      <Tabs value={mode} onValueChange={(v) => setMode(v as "all" | "range")}>
        <TabsList className="w-full bg-secondary">
          <TabsTrigger value="all" className="flex-1">
            All Pages
          </TabsTrigger>
          <TabsTrigger value="range" className="flex-1">
            Page Range
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {mode === "range" && (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Label className="mb-1.5 text-xs text-muted-foreground">
              From page
            </Label>
            <Input
              type="number"
              min={1}
              value={fromPage}
              onChange={(e) => setFromPage(Number(e.target.value))}
              className="bg-secondary"
            />
          </div>
          <div className="flex-1">
            <Label className="mb-1.5 text-xs text-muted-foreground">
              To page
            </Label>
            <Input
              type="number"
              min={1}
              value={toPage}
              onChange={(e) => setToPage(Number(e.target.value))}
              className="bg-secondary"
            />
          </div>
        </div>
      )}
    </OptionSection>
  );
}

function CompressOptions({
  onOptionsChange,
}: { onOptionsChange: (opts: ProcessOptions) => void }) {
  const [quality, setQuality] = useState([65]);
  const label = quality[0] < 40 ? "Low" : quality[0] < 75 ? "Medium" : "High";

  useEffect(() => {
    onOptionsChange({});
  }, [onOptionsChange]);

  return (
    <OptionSection title="Compression Quality">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Quality</span>
          <Badge variant="outline" className="border-gold/30 text-gold">
            {label}
          </Badge>
        </div>
        <Slider
          value={quality}
          onValueChange={setQuality}
          min={10}
          max={100}
          step={5}
          className="[&>span]:bg-gold [&>span]:shadow-gold-sm"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Smaller file</span>
          <span>Better quality</span>
        </div>
      </div>
    </OptionSection>
  );
}

function RotateOptions({
  onOptionsChange,
}: { onOptionsChange: (opts: ProcessOptions) => void }) {
  const [selected, setSelected] = useState("90");
  const [allPages, setAllPages] = useState(true);

  useEffect(() => {
    onOptionsChange({
      rotateDegrees: Number(selected),
      rotateAllPages: allPages,
    });
  }, [selected, allPages, onOptionsChange]);

  return (
    <OptionSection title="Rotation">
      <div className="grid grid-cols-3 gap-2">
        {["90", "180", "270"].map((deg) => (
          <button
            type="button"
            key={deg}
            onClick={() => setSelected(deg)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
              selected === deg
                ? "border-gold/40 bg-gold/10 text-gold"
                : "border-border/60 bg-secondary/30 text-muted-foreground hover:border-gold/30 hover:bg-gold/5 hover:text-gold"
            }`}
          >
            {deg}°
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="all-pages"
          checked={allPages}
          onCheckedChange={(v) => setAllPages(!!v)}
          className="border-gold/30 data-[state=checked]:border-gold data-[state=checked]:bg-gold"
        />
        <Label htmlFor="all-pages" className="text-sm text-muted-foreground">
          Apply to all pages
        </Label>
      </div>
    </OptionSection>
  );
}

function WatermarkOptions({
  onOptionsChange,
}: { onOptionsChange: (opts: ProcessOptions) => void }) {
  const [opacity, setOpacity] = useState([50]);
  const [fontSize, setFontSize] = useState([24]);
  const [text, setText] = useState("CONFIDENTIAL");
  const [position, setPosition] = useState("center");

  useEffect(() => {
    onOptionsChange({
      watermarkText: text,
      watermarkFontSize: fontSize[0],
      watermarkOpacity: opacity[0],
      watermarkPosition: position,
    });
  }, [text, fontSize, opacity, position, onOptionsChange]);

  return (
    <OptionSection title="Watermark Settings">
      <div>
        <Label className="mb-1.5 block text-xs text-muted-foreground">
          Watermark Text
        </Label>
        <Input
          placeholder="e.g. CONFIDENTIAL"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="bg-secondary"
        />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Font Size</span>
          <span>{fontSize[0]}pt</span>
        </div>
        <Slider
          value={fontSize}
          onValueChange={setFontSize}
          min={8}
          max={72}
          step={2}
          className="[&>span]:bg-gold"
        />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Opacity</span>
          <span>{opacity[0]}%</span>
        </div>
        <Slider
          value={opacity}
          onValueChange={setOpacity}
          min={5}
          max={100}
          step={5}
          className="[&>span]:bg-gold"
        />
      </div>
      <div>
        <Label className="mb-1.5 block text-xs text-muted-foreground">
          Position
        </Label>
        <Select value={position} onValueChange={setPosition}>
          <SelectTrigger className="bg-secondary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="center">Center (diagonal)</SelectItem>
            <SelectItem value="top-left">Top Left</SelectItem>
            <SelectItem value="top-right">Top Right</SelectItem>
            <SelectItem value="bottom-left">Bottom Left</SelectItem>
            <SelectItem value="bottom-right">Bottom Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </OptionSection>
  );
}

function ProtectOptions({
  onOptionsChange,
}: { onOptionsChange: (opts: ProcessOptions) => void }) {
  const [password, setPassword] = useState("");

  useEffect(() => {
    onOptionsChange({ password });
  }, [password, onOptionsChange]);

  return (
    <OptionSection title="Password Protection">
      <div>
        <Label className="mb-1.5 block text-xs text-muted-foreground">
          Password
        </Label>
        <Input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-secondary"
        />
      </div>
      <div>
        <Label className="mb-1.5 block text-xs text-muted-foreground">
          Confirm Password
        </Label>
        <Input
          type="password"
          placeholder="Confirm password"
          className="bg-secondary"
        />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Permissions</p>
        {["Allow printing", "Allow copying text", "Allow editing"].map(
          (perm) => (
            <div key={perm} className="flex items-center gap-2">
              <Checkbox
                id={perm}
                className="border-gold/30 data-[state=checked]:border-gold data-[state=checked]:bg-gold"
              />
              <Label htmlFor={perm} className="text-sm text-muted-foreground">
                {perm}
              </Label>
            </div>
          ),
        )}
      </div>
    </OptionSection>
  );
}

function UnlockOptions({
  onOptionsChange,
}: { onOptionsChange: (opts: ProcessOptions) => void }) {
  const [password, setPassword] = useState("");

  useEffect(() => {
    onOptionsChange({ password });
  }, [password, onOptionsChange]);

  return (
    <OptionSection title="PDF Password">
      <div>
        <Label className="mb-1.5 block text-xs text-muted-foreground">
          Current Password
        </Label>
        <Input
          type="password"
          placeholder="Enter PDF password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-secondary"
        />
      </div>
    </OptionSection>
  );
}

function PageNumberOptions({
  onOptionsChange,
}: { onOptionsChange: (opts: ProcessOptions) => void }) {
  const [vPos, setVPos] = useState<"top" | "bottom">("bottom");
  const [hPos, setHPos] = useState<"left" | "center" | "right">("center");
  const [startNumber, setStartNumber] = useState(1);
  const [fontSize, setFontSize] = useState(12);

  useEffect(() => {
    onOptionsChange({ vPos, hPos, startNumber, pageNumberFontSize: fontSize });
  }, [vPos, hPos, startNumber, fontSize, onOptionsChange]);

  return (
    <OptionSection title="Page Number Style">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">
            Vertical Position
          </Label>
          <Select
            value={vPos}
            onValueChange={(v) => setVPos(v as "top" | "bottom")}
          >
            <SelectTrigger className="bg-secondary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top">Top</SelectItem>
              <SelectItem value="bottom">Bottom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">
            Horizontal Position
          </Label>
          <Select
            value={hPos}
            onValueChange={(v) => setHPos(v as "left" | "center" | "right")}
          >
            <SelectTrigger className="bg-secondary">
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">
            Start Number
          </Label>
          <Input
            type="number"
            min={1}
            value={startNumber}
            onChange={(e) => setStartNumber(Number(e.target.value))}
            className="bg-secondary"
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">
            Font Size (pt)
          </Label>
          <Input
            type="number"
            min={6}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="bg-secondary"
          />
        </div>
      </div>
    </OptionSection>
  );
}

function MetadataOptions({
  onOptionsChange,
}: { onOptionsChange: (opts: ProcessOptions) => void }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("");
  const [keywords, setKeywords] = useState("");

  useEffect(() => {
    onOptionsChange({ title, author, subject, keywords });
  }, [title, author, subject, keywords, onOptionsChange]);

  const fields = [
    { label: "Title", value: title, setter: setTitle },
    { label: "Author", value: author, setter: setAuthor },
    { label: "Subject", value: subject, setter: setSubject },
    { label: "Keywords", value: keywords, setter: setKeywords },
  ];

  return (
    <OptionSection title="PDF Metadata">
      {fields.map(({ label, value, setter }) => (
        <div key={label}>
          <Label className="mb-1.5 block text-xs text-muted-foreground">
            {label}
          </Label>
          <Input
            placeholder={`Enter ${label.toLowerCase()}`}
            value={value}
            onChange={(e) => setter(e.target.value)}
            className="bg-secondary"
          />
        </div>
      ))}
    </OptionSection>
  );
}

function ConvertOptions({
  slug,
  onOptionsChange,
}: { slug: string; onOptionsChange: (opts: ProcessOptions) => void }) {
  const FORMAT_MAP: Record<string, string> = {
    "pdf-to-word": "DOCX",
    "pdf-to-excel": "XLSX",
    "pdf-to-ppt": "PPTX",
    "pdf-to-jpg": "JPG / PNG",
    "word-to-pdf": "PDF",
    "excel-to-pdf": "PDF",
    "ppt-to-pdf": "PDF",
    "jpg-to-pdf": "PDF",
  };
  const format = FORMAT_MAP[slug] || "PDF";

  useEffect(() => {
    onOptionsChange({});
  }, [onOptionsChange]);

  return (
    <OptionSection title="Output Format">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10">
          <span className="text-xs font-bold text-gold">
            {format.split("/")[0].trim()}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            Output: {format}
          </p>
          <p className="text-xs text-muted-foreground">
            Your file will be converted to this format
          </p>
        </div>
      </div>
    </OptionSection>
  );
}

function ReorderOptions({
  onOptionsChange,
}: { onOptionsChange: (opts: ProcessOptions) => void }) {
  const pages = Array.from({ length: 6 }, (_, i) => i + 1);
  const [order] = useState(pages.map((_, i) => i));
  const colors = [
    "bg-blue-500/30",
    "bg-violet-500/30",
    "bg-emerald-500/30",
    "bg-gold/30",
    "bg-rose-500/30",
    "bg-teal-500/30",
  ];

  useEffect(() => {
    onOptionsChange({ pageOrder: order });
  }, [order, onOptionsChange]);

  return (
    <OptionSection title="Page Order">
      <p className="text-xs text-muted-foreground">
        Drag thumbnails to reorder pages (simulated preview).
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {pages.map((p, i) => (
          <div
            key={p}
            className={`flex h-16 cursor-grab flex-col items-center justify-center rounded-lg ${colors[i % colors.length]} border border-white/10 text-sm font-bold text-foreground/80`}
          >
            <span className="text-xs text-muted-foreground">pg</span>
            <span>{p}</span>
          </div>
        ))}
      </div>
    </OptionSection>
  );
}

export function ToolOptions({
  slug,
  fileCount,
  onOptionsChange,
}: ToolOptionsProps) {
  if (slug === "merge-pdf")
    return (
      <MergeOptions fileCount={fileCount} onOptionsChange={onOptionsChange} />
    );
  if (slug === "split-pdf")
    return <SplitOptions onOptionsChange={onOptionsChange} />;
  if (slug === "compress-pdf")
    return <CompressOptions onOptionsChange={onOptionsChange} />;
  if (slug === "rotate-pdf")
    return <RotateOptions onOptionsChange={onOptionsChange} />;
  if (slug === "watermark-pdf")
    return <WatermarkOptions onOptionsChange={onOptionsChange} />;
  if (slug === "protect-pdf")
    return <ProtectOptions onOptionsChange={onOptionsChange} />;
  if (slug === "unlock-pdf")
    return <UnlockOptions onOptionsChange={onOptionsChange} />;
  if (slug === "page-numbers")
    return <PageNumberOptions onOptionsChange={onOptionsChange} />;
  if (slug === "edit-metadata")
    return <MetadataOptions onOptionsChange={onOptionsChange} />;
  if (slug === "reorder-pdf")
    return <ReorderOptions onOptionsChange={onOptionsChange} />;
  if (
    slug === "pdf-to-word" ||
    slug === "pdf-to-excel" ||
    slug === "pdf-to-ppt" ||
    slug === "pdf-to-jpg" ||
    slug === "word-to-pdf" ||
    slug === "excel-to-pdf" ||
    slug === "ppt-to-pdf" ||
    slug === "jpg-to-pdf"
  )
    return <ConvertOptions slug={slug} onOptionsChange={onOptionsChange} />;

  return null;
}
