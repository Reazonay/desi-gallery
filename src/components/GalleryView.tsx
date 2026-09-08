"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Download, ChevronLeft, ChevronRight, X, Loader2, RefreshCw } from "lucide-react";

export interface PhotoItem {
  url: string;
  pathname?: string;
  size?: number;
  uploadedAt?: string;
  downloadUrl?: string;
}

interface GalleryViewProps {
  photos: PhotoItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onGoToUpload: () => void;
}

const PAGE_SIZE = 48;

export default function GalleryView({
  photos,
  isLoading,
  onRefresh,
  onGoToUpload,
}: GalleryViewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : photos.length - 1));
      }
      if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev !== null && prev < photos.length - 1 ? prev + 1 : 0));
      }
    },
    [selectedIndex, photos.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleDownload = async (photo: PhotoItem) => {
    setIsDownloading(true);
    const filename = photo.pathname?.split("/").pop() || `svatba-${Date.now()}.jpg`;

    try {
      const targetUrl = photo.downloadUrl || photo.url;
      const res = await fetch(targetUrl);
      const blob = await res.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch {
      // Fallback for mobile browser direct link
      const link = document.createElement("a");
      link.href = photo.downloadUrl || photo.url;
      link.download = filename;
      link.target = "_blank";
      link.click();
    } finally {
      setIsDownloading(false);
    }
  };

  const currentPhoto = selectedIndex !== null ? photos[selectedIndex] : null;
  const visiblePhotos = photos.slice(0, visibleCount);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 animate-fade-in">
      {/* Top bar with count & refresh */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-wedding text-2xl sm:text-3xl text-[#3b3228] font-semibold">
            Сватбени Спомени
          </h2>
          <p className="text-xs sm:text-sm text-[#7a6d5f] mt-0.5">
            Общо {photos.length} снимки. Докоснете снимка за преглед и сваляне в телефона.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#eadecf] text-xs font-medium text-[#6b5e51] hover:text-[#2d2621] shadow-2xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Обнови</span>
          </button>

          <button
            onClick={onGoToUpload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#3b3228] hover:bg-[#2d2621] text-white text-xs font-medium shadow-2xs transition cursor-pointer"
          >
            <span>+ Качи снимка</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && photos.length === 0 && (
        <div className="py-24 text-center text-[#7a6d5f]">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#a8824b] mb-3" />
          <p className="text-sm font-medium">Зареждане на сватбената галерия...</p>
        </div>
      )}

      {/* Photos Grid */}
      {photos.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
            {visiblePhotos.map((photo, index) => (
              <div
                key={photo.url || index}
                onClick={() => setSelectedIndex(index)}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-[#f0ebe1] border border-[#e8d8c2] cursor-pointer shadow-xs hover:shadow-md hover:border-[#a8824b] transition-all duration-200"
              >
                <Image
                  src={photo.url}
                  alt={`Сватбена снимка ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-2">
                  <span className="p-1.5 rounded-lg bg-white/90 text-[#3b3228] shadow-xs">
                    <Download className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {visibleCount < photos.length && (
            <div className="text-center mt-8">
              <button
                onClick={() => setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, photos.length))}
                className="px-6 py-2.5 rounded-2xl bg-white hover:bg-[#fbf6ed] text-[#3b3228] border border-[#eadecf] font-medium text-xs sm:text-sm shadow-xs transition cursor-pointer"
              >
                Покажи още снимки ({photos.length - visibleCount} оставащи)
              </button>
            </div>
          )}
        </>
      )}

      {/* FULLSCREEN LIGHTBOX WITH PROMINENT TOP-RIGHT DOWNLOAD BUTTON */}
      {selectedIndex !== null && currentPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col justify-between select-none"
        >
          {/* Top Bar: Left Counter & PROMINENT RIGHT DOWNLOAD BUTTON */}
          <div className="w-full px-4 sm:px-6 py-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-10">
            {/* Left: Photo Counter */}
            <div className="text-xs sm:text-sm text-white/90 bg-white/10 px-3 py-1.5 rounded-full border border-white/15">
              Снимка {selectedIndex + 1} от {photos.length}
            </div>

            {/* Right: PRIMARY DOWNLOAD BUTTON + Close */}
            <div className="flex items-center gap-3">
              {/* THE REQUESTED DOWNLOAD BUTTON IN THE TOP RIGHT */}
              <button
                onClick={() => handleDownload(currentPhoto)}
                disabled={isDownloading}
                title="Свали снимката в галерията на телефона"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#dfba73] hover:bg-[#c9a35e] text-[#2d2621] font-semibold text-xs sm:text-sm shadow-md transition transform active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Сваляне...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Свали снимката</span>
                  </>
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={() => setSelectedIndex(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/15 transition cursor-pointer"
                title="Затвори"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Image with Previous / Next Controls */}
          <div className="relative flex-1 flex items-center justify-center p-2 sm:p-4">
            {/* Prev Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) =>
                  prev !== null && prev > 0 ? prev - 1 : photos.length - 1
                );
              }}
              className="absolute left-2 sm:left-6 z-10 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition cursor-pointer"
              title="Предишна снимка"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Image Container */}
            <div className="relative max-w-5xl max-h-[78vh] w-full h-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentPhoto.url}
                alt={`Сватбена снимка ${selectedIndex + 1}`}
                className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Next Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) =>
                  prev !== null && prev < photos.length - 1 ? prev + 1 : 0
                );
              }}
              className="absolute right-2 sm:right-6 z-10 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition cursor-pointer"
              title="Следваща снимка"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Bar: Success toast / Hint */}
          <div className="w-full py-3 px-4 text-center bg-gradient-to-t from-black/80 to-transparent">
            {downloadSuccess ? (
              <span className="inline-block text-xs font-semibold text-[#86efac] bg-green-950/80 px-4 py-1.5 rounded-full border border-green-500/30">
                ✓ Снимката е запазена на вашето устройство!
              </span>
            ) : (
              <span className="text-xs text-white/60">
                Използвайте бутона горе вдясно &bdquo;Свали снимката&ldquo;, за да я запазите на телефона си.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
