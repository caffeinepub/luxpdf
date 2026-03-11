import { Button } from "@/components/ui/button";
import { FileText, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface UploadedFile {
  file: File;
  id: string;
}

interface DropzoneProps {
  multiple?: boolean;
  accept?: string;
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  label?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function Dropzone({
  multiple = true,
  accept = ".pdf",
  files,
  onFilesChange,
  label,
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;
      const mapped: UploadedFile[] = Array.from(newFiles).map((f) => ({
        file: f,
        id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
      }));
      if (multiple) {
        onFilesChange([...files, ...mapped]);
      } else {
        onFilesChange(mapped.slice(0, 1));
      }
    },
    [files, multiple, onFilesChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Drop area (not a button — it contains a button) */}
      <div
        data-ocid="tool.dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        aria-label="File drop zone"
        className={`relative flex min-h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition duration-300 ${
          isDragging
            ? "scale-[1.02] border-gold bg-gold/5 shadow-gold"
            : "border-border/60 bg-card/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />

        <div
          className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition duration-300 ${
            isDragging ? "bg-gold/20" : "bg-secondary/60"
          }`}
        >
          <Upload
            className={`h-7 w-7 transition duration-300 ${isDragging ? "text-gold" : "text-muted-foreground"}`}
          />
        </div>

        <p className="mb-1 font-display text-base font-bold text-foreground">
          {label ||
            (isDragging
              ? "Drop your files here"
              : "Drag & drop your files here")}
        </p>
        <p className="mb-4 text-sm text-muted-foreground">
          or click the button below to browse
        </p>

        <Button
          data-ocid="tool.upload_button"
          type="button"
          variant="outline"
          className="border-gold/30 bg-gold/5 text-gold hover:bg-gold/10 hover:text-gold"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Select Files
        </Button>

        <p className="mt-4 text-xs text-muted-foreground/60">
          Accepts: {accept.toUpperCase().replace(/\./g, "")} · No file size
          limit
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div data-ocid="tool.file_list" className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {files.length} file{files.length !== 1 ? "s" : ""} selected
          </p>
          {files.map((f, i) => (
            <div
              key={f.id}
              className="flex items-center gap-3 rounded-lg border border-border/50 bg-card px-4 py-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gold/10">
                <FileText className="h-4 w-4 text-gold" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {f.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(f.file.size)}
                </p>
              </div>
              <button
                type="button"
                data-ocid={`tool.file.delete_button.${i + 1}`}
                onClick={() => removeFile(f.id)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
