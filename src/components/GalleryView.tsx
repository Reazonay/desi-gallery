"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Download, ChevronLeft, ChevronRight, X, Loader2, Sparkles, RefreshCw } from "lucide-react";

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

export default function GalleryView({
  photos,
  isLoading,
  onRefresh,
  onGoToUpload,
}: GalleryViewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Keyboard navigation for lightbox
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
    setDownloading(true);
    const filename = photo.pathname?.split("/").pop() || `snimka-${Date.now()}.jpg`;

    try {
      const response = await fetch(photo.downloadUrl || photo.url);
      const blob = await response.blob();
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
      // Fallback for direct browser download
      const link = document.createElement("a");
      link.href = photo.downloadUrl || photo.url;
      link.download = filename;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const currentPhoto = selectedIndex !== null ? photos[selectedIndex] : null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Header info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Галерия със спомени</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {photos.length > 0
              ? `Налични ${photos.length} ${photos.length === 1 ? "снимка" : "снимки"}. Докоснете снимка за преглед и сваляне.`
              : "Все още няма качени снимки."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Обнови</span>
          </button>

          <button
            onClick={onGoToUpload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition shadow-md shadow-amber-500/20"
          >
            <span>+ Добави още</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && photos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mb-3" />
          <p className="text-sm">Зареждане на снимките...</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && photos.length === 0 && (
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/50 border border-slate-800">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
            <Sparkles className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Все още няма споделени снимки</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Бъдете първите, които ще споделят спомен от събитието!
          </p>
          <button
            onClick={onGoToUpload}
            className="mt-5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold text-sm shadow-lg shadow-rose-500/20 hover:brightness-110 transition"
          >
            Качи първите снимки
          </button>
        </div>
      )}

      {/* Photos Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {photos.map((photo, index) => (
            <div
              key={photo.url || index}
              onClick={() => setSelectedIndex(index)}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/80 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-rose-500/10 hover:border-amber-500/50 transition-all duration-300"
            >
              <Image
                src={photo.url}
                alt={`Снимка ${index + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition duration-500"
                unoptimized
              />

              {/* Hover overlay with download hint */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
                <span className="text-xs text-slate-200 font-medium">Преглед</span>
                <span className="p-1.5 rounded-lg bg-amber-500/90 text-slate-950 shadow">
                  <Download className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX WITH TOP-RIGHT DOWNLOAD BUTTON */}
      {selectedIndex !== null && currentPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between"
        >
          {/* Top Bar: Left Counter & RIGHT DOWNLOAD BUTTON */}
          <div className="w-full px-4 sm:px-6 py-4 flex items-center justify-between bg-gradient-to-b from-slate-950/80 to-transparent z-10">
            {/* Left: Counter */}
            <div className="text-xs sm:text-sm font-medium text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
              Снимка {selectedIndex + 1} от {photos.length}
            </div>

            {/* Right: DOWNLOAD BUTTON + Close Button */}
            <div className="flex items-center gap-3">
              {/* PRIMARY DOWNLOAD BUTTON AS REQUESTED BY USER */}
              <button
                onClick={() => handleDownload(currentPhoto)}
                disabled={downloading}
                title="Свали в галерията на телефона / компютъра"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-rose-500/30 transition transform hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {downloading ? (
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

              {/* Close (X) button */}
              <button
                onClick={() => setSelectedIndex(null)}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
                title="Затвори"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Image with Previous / Next navigation */}
          <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 select-none">
            {/* Previous Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) =>
                  prev !== null && prev > 0 ? prev - 1 : photos.length - 1
                );
              }}
              className="absolute left-2 sm:left-6 z-10 p-3 rounded-full bg-slate-900/70 hover:bg-slate-800 text-white border border-slate-700/60 backdrop-blur transition"
              title="Предишна снимка"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Main Photo */}
            <div className="relative max-w-5xl max-h-[75vh] w-full h-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentPhoto.url}
                alt={`Снимка ${selectedIndex + 1}`}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl shadow-black/80"
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
              className="absolute right-2 sm:right-6 z-10 p-3 rounded-full bg-slate-900/70 hover:bg-slate-800 text-white border border-slate-700/60 backdrop-blur transition"
              title="Следваща снимка"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Bar: Instructions / Success Toast */}
          <div className="w-full py-3 px-4 text-center bg-gradient-to-t from-slate-950/80 to-transparent">
            {downloadSuccess ? (
              <span className="inline-block text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-4 py-1.5 rounded-full border border-emerald-500/30">
                ✓ Снимката е запазена на вашето устройство!
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                Използвайте бутона горе вдясно &quot;Свали снимката&quot;, за да я запазите директно в телефона си.
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
