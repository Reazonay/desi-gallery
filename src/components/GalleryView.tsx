"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Download, ChevronLeft, ChevronRight, X, Loader2, RefreshCw, Check, Info, ArrowLeftRight } from "lucide-react";

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

    // Swipe left/right
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
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

      // 1. Direct download (Immediately saves to Android Gallery / Downloads folder & Desktop)
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
      }, 4000);
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        setShowSaveTip(true);
        setTimeout(() => setShowSaveTip(false), 4000);
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

      {/* Photos Grid - 4:5 aspect ratio so portrait wedding photos are not severely cropped */}
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

      {/* FULLSCREEN LIGHTBOX - LARGE UNCROPPED PHOTOS WITH SWIPE & SCROLL */}
      {selectedIndex !== null && currentPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 overflow-y-auto overscroll-contain"
        >
          {/* FIXED TOP BAR: ALWAYS VISIBLE AND PINNED AT TOP RIGHT */}
          <div className="fixed top-0 left-0 right-0 z-50 px-3 py-2.5 sm:px-6 sm:py-3 flex items-center justify-between bg-black/85 backdrop-blur-md border-b border-white/10">
            {/* Left: Counter */}
            <div className="text-xs sm:text-sm text-white/90 bg-white/15 px-3 py-1 rounded-full font-medium">
              {selectedIndex + 1} / {photos.length}
            </div>

            {/* Right: PRIMARY DOWNLOAD BUTTON + CLOSE */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSaveToPhotos(currentPhoto)}
                disabled={isDownloading}
                title="Свали директно в Снимки на телефона"
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-[#dfba73] hover:bg-[#c9a35e] text-[#2d2621] font-semibold text-xs sm:text-sm shadow-lg transition transform active:scale-95 cursor-pointer disabled:opacity-50"
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
                className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
                title="Затвори"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* IPHONE & ANDROID HINT POPUP */}
          {showSaveTip && (
            <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-[92vw] sm:max-w-md bg-[#dfba73] text-[#2d2621] p-3.5 rounded-2xl shadow-2xl border border-white/30 text-xs text-center animate-fade-in">
              <p className="font-semibold text-sm mb-1 flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 text-[#2d5a2d]" />
                <span>Снимката е свалена на телефона!</span>
              </p>
              <p>
                <strong>Android:</strong> Снимката е в папка &bdquo;Свалени&ldquo; (Downloads) в Галерията!
              </p>
              <p className="mt-1 text-[11px] opacity-90">
                <strong>iPhone:</strong> Изберете &bdquo;Запази изображението&ldquo; (Save Image) или задръжте пръст върху снимката.
              </p>
            </div>
          )}

          {/* MAIN PHOTO CONTAINER: LARGE UNCROPPED DISPLAY */}
          <div
            className="min-h-[100dvh] w-full pt-16 pb-28 px-1 sm:px-4 flex flex-col items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Desktop Navigation Arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) =>
                  prev !== null && prev > 0 ? prev - 1 : photos.length - 1
                );
              }}
              className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition cursor-pointer"
              title="Предишна снимка"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) =>
                  prev !== null && prev < photos.length - 1 ? prev + 1 : 0
                );
              }}
              className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition cursor-pointer"
              title="Следваща снимка"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* The Photo: Large, uncropped, filling the screen */}
            <div className="relative w-full max-w-5xl flex flex-col items-center justify-center my-auto py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentPhoto.url}
                alt={`Сватбена снимка ${selectedIndex + 1}`}
                style={{
                  WebkitTouchCallout: "default",
                  userSelect: "auto",
                }}
                className="w-full h-auto max-h-[88vh] sm:max-h-[85vh] object-contain rounded-xl shadow-2xl pointer-events-auto"
              />

              {/* CLEAR PROMINENT SWIPE HINT BADGE (REQUESTED BY USER) */}
              <div className="mt-3 inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white/90 text-xs font-medium border border-white/10 shadow-sm text-center">
                <ArrowLeftRight className="w-3.5 h-3.5 text-[#dfba73]" />
                <span>Плъзнете с пръст ↔ за смяна на снимка (Wischen)</span>
              </div>

              {/* Tips for iPhone and Android */}
              <div className="mt-2 flex items-center justify-center gap-1 text-[11px] text-white/50 text-center px-4">
                <Info className="w-3.5 h-3.5 text-[#dfba73]" />
                <span>
                  Запазване: натиснете &bdquo;Свали в галерията&ldquo; или задръжте пръст върху снимката
                </span>
              </div>
            </div>
          </div>

          {/* FIXED BOTTOM NAVIGATION BAR */}
          <div className="fixed bottom-0 left-0 right-0 z-40 px-4 py-2 sm:py-2.5 flex items-center justify-between bg-black/85 backdrop-blur-md border-t border-white/10">
            <button
              onClick={() => {
                setSelectedIndex((prev) =>
                  prev !== null && prev > 0 ? prev - 1 : photos.length - 1
                );
              }}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Предишна</span>
            </button>

            <span className="text-[11px] text-white/60">
              Скрол надолу ↕ или плъзнете ↔
            </span>

            <button
              onClick={() => {
                setSelectedIndex((prev) =>
                  prev !== null && prev < photos.length - 1 ? prev + 1 : 0
                );
              }}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer"
            >
              <span>Следваща</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
