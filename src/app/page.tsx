"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar, { ActiveTab } from "@/components/Navbar";
import UploadSection from "@/components/UploadSection";
import GalleryView, { PhotoItem } from "@/components/GalleryView";
import TrailerView from "@/components/TrailerView";
import { UploadCloud, Images, Film, Heart } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("gallery");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPhotos = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/photos", { cache: "no-store" });
      const data = await res.json();
      if (data.photos) {
        setPhotos(data.photos);
      }
    } catch (err) {
      console.error("Failed to load photos:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-white">
      {/* Sticky Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        photoCount={photos.length}
      />

      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden pt-8 pb-6 px-4 text-center border-b border-slate-900 bg-gradient-to-b from-slate-900/40 to-transparent">
        {/* Decorative background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-10 left-1/3 w-64 h-32 bg-rose-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold tracking-wider uppercase text-amber-400/90 bg-amber-400/10 rounded-full border border-amber-400/20">
            Добре дошли в нашата обща галерия
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Спомени, които остават <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-amber-400 bg-clip-text text-transparent">завинаги</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Качете вашите снимки, разгледайте споделените моменти и ги свалете директно в телефона си, или се насладете на 3-минутния видео трейлър.
          </p>

          {/* 3 Prominent Main Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {/* Button 1: Upload */}
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 shadow-md ${
                activeTab === "upload"
                  ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-rose-500/25 scale-105"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700"
              }`}
            >
              <UploadCloud className="w-5 h-5 text-amber-400" />
              <span>1. Качи снимки</span>
            </button>

            {/* Button 2: Gallery */}
            <button
              onClick={() => setActiveTab("gallery")}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 shadow-md ${
                activeTab === "gallery"
                  ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-rose-500/25 scale-105"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700"
              }`}
            >
              <Images className="w-5 h-5 text-rose-400" />
              <span>2. Галерия ({photos.length})</span>
            </button>

            {/* Button 3: Trailer */}
            <button
              onClick={() => setActiveTab("trailer")}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 shadow-md ${
                activeTab === "trailer"
                  ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-rose-500/25 scale-105"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700"
              }`}
            >
              <Film className="w-5 h-5 text-amber-400" />
              <span>3. Трейлър (3 мин)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === "upload" && (
          <UploadSection
            onUploadSuccess={fetchPhotos}
            onGoToGallery={() => setActiveTab("gallery")}
          />
        )}

        {activeTab === "gallery" && (
          <GalleryView
            photos={photos}
            isLoading={isLoading}
            onRefresh={fetchPhotos}
            onGoToUpload={() => setActiveTab("upload")}
          />
        )}

        {activeTab === "trailer" && <TrailerView />}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 py-6 px-4 mt-12 bg-slate-950 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Споделена Галерия. Всички права запазени.</p>
          <p className="flex items-center justify-center gap-1">
            Създадено с <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> за нашите специални моменти
          </p>
        </div>
      </footer>
    </div>
  );
}
