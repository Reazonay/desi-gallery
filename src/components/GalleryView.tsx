"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Download, ChevronLeft, ChevronRight, X, Loader2, RefreshCw, Check, ArrowLeftRight } from "lucide-react";

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
  const [showSaveTip, setShowSaveTip] = useState(false);

  // Lock background scroll when modal is open so the gallery page behind does not move
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
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

  // Touch swipe detection on mobile
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

    // Swipe left/right threshold
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        setSelectedIndex((prev) =>
          prev !== null && prev < photos.length - 1 ? prev + 1 : 0
        );
      } else {
        setSelectedIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : photos.length - 1
        );
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Direct save to iPhone & Android Photos
  const handleSaveToPhotos = async (photo: PhotoItem) => {
    setIsDownloading(true);
    const filename = photo.pathname?.split("/").pop() || `svatba-${Date.now()}.jpg`;

    try {
      const targetUrl = photo.downloadUrl || photo.url;
      const res = await fetch(targetUrl);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: blob.type || "image/jpeg" });

      // 1. Direct file download (Saves straight to Android Gallery/Downloads and Desktop)
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);

      // 2. On iPhone, invoke Web Share so user can tap "Save Image" (Bild sichern) into Camera Roll
      const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Сватбена снимка",
        });
      }

      setDownloadSuccess(true);
      setShowSaveTip(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        setShowSaveTip(false);
      }, 3500);
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        setShowSaveTip(true);
        setTimeout(() => setShowSaveTip(false), 3500);
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
            Общо {photos.length} снимки. Докоснете снимка за пълен преглед и сваляне в телефона.
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

      {/* Photos Grid - 4:5 aspect ratio so portrait photos are not cropped */}
      {photos.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
            {visiblePhotos.map((photo, index) => (
              <div
                key={photo.url || index}
                onClick={() => setSelectedIndex(index)}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#f0ebe1] border border-[#e8d8c2] cursor-pointer shadow-xs hover:shadow-md hover:border-[#a8824b] transition-all duration-200"
              >
                <Image
                  src={photo.url}
                  alt={`Сватбена снимка ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
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

      {/* FULLSCREEN LIGHTBOX - STRICTLY BOUNDED & ALWAYS CENTERED (CANNOT SCROLL INTO DARKNESS) */}
      {selectedIndex !== null && currentPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 h-[100dvh] max-h-[100dvh] w-screen overflow-hidden bg-black/95 flex flex-col justify-between select-none"
        >
          {/* TOP BAR: FIXED & PINNED AT TOP */}
          <header className="shrink-0 h-14 w-full px-3 sm:px-6 flex items-center justify-between bg-black/85 backdrop-blur-md border-b border-white/10 z-30">
            {/* Left: Counter */}
            <div className="text-xs sm:text-sm text-white/90 bg-white/15 px-3 py-1 rounded-full font-medium">
              {selectedIndex + 1} / {photos.length}
            </div>

            {/* Right: DOWNLOAD BUTTON + CLOSE */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSaveToPhotos(currentPhoto)}
                disabled={isDownloading}
                title="Свали директно в Снимки на телефона"
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#dfba73] hover:bg-[#c9a35e] text-[#2d2621] font-semibold text-xs sm:text-sm shadow-lg transition transform active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Сваляне...</span>
                  </>
                ) : downloadSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-[#2d5a2d]" />
                    <span>Свалено в Галерията!</span>
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

          {/* IPHONE & ANDROID HINT POPUP */}
          {showSaveTip && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 max-w-[92vw] sm:max-w-md bg-[#dfba73] text-[#2d2621] p-3 rounded-2xl shadow-2xl border border-white/30 text-xs text-center animate-fade-in">
              <p className="font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 text-[#2d5a2d]" />
                <span>Снимката е запазена в галерията на телефона!</span>
              </p>
            </div>
          )}

          {/* MAIN PHOTO: ALWAYS CENTERED, FULLY VISIBLE, ZERO BLACK VOID */}
          <div
            className="relative flex-1 min-h-0 w-full flex items-center justify-center p-2 sm:p-4 overflow-hidden"
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
              className="hidden md:flex absolute left-4 z-30 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition cursor-pointer"
              title="Предишна снимка"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Desktop Right Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) =>
                  prev !== null && prev < photos.length - 1 ? prev + 1 : 0
                );
              }}
              className="hidden md:flex absolute right-4 z-30 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition cursor-pointer"
              title="Следваща снимка"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* The Image: Perfect 100% fit, zero cut off, zero scroll away */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentPhoto.url}
                alt={`Сватбена снимка ${selectedIndex + 1}`}
                style={{
                  WebkitTouchCallout: "default",
                  userSelect: "auto",
                }}
                className="max-h-full max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl pointer-events-auto"
              />
            </div>
          </div>

          {/* FIXED BOTTOM BAR: CONTROLS & CLEAR SWIPE INSTRUCTION */}
          <footer className="shrink-0 h-14 w-full px-4 flex items-center justify-between bg-black/85 backdrop-blur-md border-t border-white/10 z-30">
            <button
              onClick={() => {
                setSelectedIndex((prev) =>
                  prev !== null && prev > 0 ? prev - 1 : photos.length - 1
                );
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Предишна</span>
            </button>

            {/* PROMINENT SWIPE TEXT IN BOTTOM BAR */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-[11px] sm:text-xs font-medium">
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#dfba73]" />
              <span>Плъзнете с пръст ↔ (Wischen)</span>
            </div>

            <button
              onClick={() => {
                setSelectedIndex((prev) =>
                  prev !== null && prev < photos.length - 1 ? prev + 1 : 0
                );
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer"
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
