"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface PhotoUploaderProps {
  tripId: string;
  onUploadComplete: () => void;
}

interface UploadingFile {
  file: File;
  preview: string;
  progress: "pending" | "uploading" | "done" | "error";
}

export default function PhotoUploader({
  tripId,
  onUploadComplete,
}: PhotoUploaderProps) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const newFiles: UploadingFile[] = selected
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        progress: "pending" as const,
      }));
    setFiles((prev) => [...prev, ...newFiles]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);

    const formData = new FormData();
    files.forEach((f) => formData.append("photos", f.file));

    setFiles((prev) =>
      prev.map((f) => ({ ...f, progress: "uploading" as const }))
    );

    try {
      const res = await fetch(`/api/trips/${tripId}/photos`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setFiles((prev) =>
          prev.map((f) => ({ ...f, progress: "done" as const }))
        );
        // Clean up previews
        files.forEach((f) => URL.revokeObjectURL(f.preview));
        setTimeout(() => {
          setFiles([]);
          onUploadComplete();
        }, 500);
      } else {
        setFiles((prev) =>
          prev.map((f) => ({ ...f, progress: "error" as const }))
        );
      }
    } catch {
      setFiles((prev) =>
        prev.map((f) => ({ ...f, progress: "error" as const }))
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-border p-8 text-center transition hover:border-forest hover:bg-cream/50"
      >
        <Upload className="mb-2 text-text-muted" size={24} />
        <p className="text-sm font-medium text-bark">
          Click to add photos
        </p>
        <p className="text-xs text-text-muted">JPG, PNG, WebP up to 10MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {files.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {files.map((f, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-lg bg-cream"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.preview}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {f.progress === "uploading" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="animate-spin text-white" size={24} />
                  </div>
                )}
                {f.progress === "pending" && (
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-sm font-medium text-white transition hover:bg-forest-light disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload {files.length} photo{files.length !== 1 ? "s" : ""}
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
