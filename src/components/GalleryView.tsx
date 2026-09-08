"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Download, ChevronLeft, ChevronRight, X, Loader2, RefreshCw, Check, Share } from "lucide-react";

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Lock body scroll when lightbox is active
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [selectedIndex]);

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

  // Touch swipe support for mobile
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Horizontal swipe threshold
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // swipe left -> next photo
        setSelectedIndex((prev) =>
          prev !== null && prev < photos.length - 1 ? prev + 1 : 0
        );
      } else {
        // swipe right -> previous photo
        setSelectedIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : photos.length - 1
        );
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Direct save to mobile Photos Gallery via Web Share API
  const handleDownloadToGallery = async (photo: PhotoItem) => {
    setIsDownloading(true);
    const filename = photo.pathname?.split("/").pop() || `svatba-${Date.now()}.jpg`;

    try {
      const targetUrl = photo.downloadUrl || photo.url;
      const res = await fetch(targetUrl);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: blob.type || "image/jpeg" });

      // Check if native Web Share with files is supported (iPhone Safari & Android Chrome)
      // This is the ONLY API that triggers "Save Image" into Apple Photos / Google Photos!
      if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
        setToastMessage("Изберете 'Запази изображението' (Save Image) за галерията!");
        await navigator.share({
          files: [file],
          title: "Сватбена снимка",
        });
        setDownloadSuccess(true);
        setTimeout(() => {
          setDownloadSuccess(false);
          setToastMessage(null);
        }, 3000);
        setIsDownloading(false);
        return;
      }

      // Fallback for Desktop: regular download
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);

      setDownloadSuccess(true);
      setToastMessage("Снимката е свалена на вашето устройство!");
      setTimeout(() => {
        setDownloadSuccess(false);
        setToastMessage(null);
      }, 2500);
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        // Direct browser fallback
        const link = document.createElement("a");
        link.href = photo.downloadUrl || photo.url;
        link.download = filename;
        link.target = "_blank";
        link.click();
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const currentPhoto = selectedIndex !== null ? photos[selectedIndex] : null;
  const visiblePhotos = photos.slice(0, visibleCount);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 animate-fade-in">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-wedding text-2xl sm:text-3xl text-[#3b3228] font-semibold">
            Сватбени Спомени
          </h2>
          <p className="text-xs sm:text-sm text-[#7a6d5f] mt-0.5">
            Общо {photos.length} снимки. Докоснете снимка за голям преглед и запазване в телефона.
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
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-2">
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

      {/* FULLSCREEN LIGHTBOX - MAXIMIZED FOR LARGE PHOTO DISPLAY ON MOBILE WITH ZERO SCROLL */}
      {selectedIndex !== null && currentPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 h-[100dvh] w-screen overflow-hidden bg-black/95 flex flex-col justify-between select-none touch-none overscroll-none"
        >
          {/* FLOATING TOP BAR: Always pinned at top with Counter, Download/Save button and Close button */}
          <header className="shrink-0 w-full px-3 py-2 sm:px-6 sm:py-3 flex items-center justify-between bg-black/80 backdrop-blur-md border-b border-white/10 z-30">
            {/* Left: Counter */}
            <div className="text-xs sm:text-sm text-white/90 bg-white/15 px-3 py-1 rounded-full font-medium">
              {selectedIndex + 1} / {photos.length}
            </div>

            {/* Right: SAVE TO GALLERY BUTTON (IN TOP RIGHT AS REQUESTED) + CLOSE BUTTON */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadToGallery(currentPhoto)}
                disabled={isDownloading}
                title="Запази директно в Снимки на телефона"
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#dfba73] hover:bg-[#c9a35e] text-[#2d2621] font-semibold text-xs sm:text-sm shadow-md transition transform active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Обработка...</span>
                  </>
                ) : downloadSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-[#2d5a2d]" />
                    <span>Запазено!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Свали в галерията</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedIndex(null)}
                className="p-1.5 sm:p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
                title="Затвори"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Toast / Notification Banner */}
          {toastMessage && (
            <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl bg-[#dfba73] text-[#2d2621] font-medium text-xs shadow-lg animate-fade-in text-center max-w-[90vw]">
              {toastMessage}
            </div>
          )}

          {/* MAIN PHOTO DISPLAY: EXPANDED TO MAXIMUM SCREEN SIZE (ZERO PADDING RESTRICTIONS) */}
          <div
            className="relative flex-1 min-h-0 w-full flex items-center justify-center p-1 sm:p-2 overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Desktop Left Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) =>
                  prev !== null && prev > 0 ? prev - 1 : photos.length - 1
                );
              }}
              className="hidden md:flex absolute left-4 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition cursor-pointer"
              title="Предишна снимка"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* The Image: Fills almost 100% of the visible viewport */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentPhoto.url}
                alt={`Сватбена снимка ${selectedIndex + 1}`}
                className="max-h-[92dvh] max-w-[99vw] w-auto h-auto object-contain rounded-md shadow-2xl"
              />
            </div>

            {/* Desktop Right Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) =>
                  prev !== null && prev < photos.length - 1 ? prev + 1 : 0
                );
              }}
              className="hidden md:flex absolute right-4 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition cursor-pointer"
              title="Следваща снимка"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* SLIM MINIMAL BOTTOM BAR: THUMB CONTROLS & HINTS */}
          <footer className="shrink-0 w-full px-4 py-1.5 sm:py-2 flex items-center justify-between bg-black/70 backdrop-blur-md border-t border-white/10 z-30">
            <button
              onClick={() => {
                setSelectedIndex((prev) =>
                  prev !== null && prev > 0 ? prev - 1 : photos.length - 1
                );
              }}
              className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Предишна</span>
            </button>

            <span className="text-[11px] text-white/50">
              Плъзнете с пръст ↔
            </span>

            <button
              onClick={() => {
                setSelectedIndex((prev) =>
                  prev !== null && prev < photos.length - 1 ? prev + 1 : 0
                );
              }}
              className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer"
            >
              <span>Следваща</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </footer>
        </div>
      )}
    </div>
  );
}
