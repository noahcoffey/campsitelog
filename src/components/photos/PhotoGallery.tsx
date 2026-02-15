"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, X, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import PhotoUploader from "./PhotoUploader";

interface Photo {
  id: string;
  filename: string;
  thumbnailFilename: string;
  caption: string | null;
  width: number | null;
  height: number | null;
}

interface PhotoGalleryProps {
  photos: Photo[];
  tripId: string;
}

export default function PhotoGallery({ photos, tripId }: PhotoGalleryProps) {
  const router = useRouter();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (photoId: string) => {
    if (!confirm("Delete this photo?")) return;
    setDeleting(photoId);

    const res = await fetch(`/api/photos/${photoId}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
      if (lightboxIndex !== null) setLightboxIndex(null);
    }
    setDeleting(null);
  };

  const navigateLightbox = (direction: number) => {
    if (lightboxIndex === null) return;
    const newIndex = lightboxIndex + direction;
    if (newIndex >= 0 && newIndex < photos.length) {
      setLightboxIndex(newIndex);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-bark">
          Photos ({photos.length})
        </h2>
      </div>

      {photos.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setLightboxIndex(index)}
              className="group relative aspect-square overflow-hidden rounded-lg bg-cream"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/uploads/thumbnails/${photo.thumbnailFilename}`}
                alt={photo.caption || ""}
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <div className="mb-4 py-4 text-center">
          <Camera className="mx-auto mb-2 text-text-muted" size={24} />
          <p className="text-sm text-text-muted">No photos yet</p>
        </div>
      )}

      <PhotoUploader
        tripId={tripId}
        onUploadComplete={() => router.refresh()}
      />

      {/* Lightbox */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(null);
            }}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X size={20} />
          </button>

          {lightboxIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox(-1);
              }}
              className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {lightboxIndex < photos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox(1);
              }}
              className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <ChevronRight size={24} />
            </button>
          )}

          <div
            className="max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/uploads/originals/${photos[lightboxIndex].filename}`}
              alt={photos[lightboxIndex].caption || ""}
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
            />
            <div className="mt-3 flex items-center justify-between">
              {photos[lightboxIndex].caption && (
                <p className="text-sm text-white/80">
                  {photos[lightboxIndex].caption}
                </p>
              )}
              <button
                onClick={() => handleDelete(photos[lightboxIndex].id)}
                disabled={deleting === photos[lightboxIndex].id}
                className="ml-auto rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-danger/80 disabled:opacity-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
