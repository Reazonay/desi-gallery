"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar, { ActiveTab } from "@/components/Navbar";
import UploadSection from "@/components/UploadSection";
import GalleryView, { PhotoItem } from "@/components/GalleryView";
import TrailerView from "@/components/TrailerView";
import { Camera, Image as ImageIcon, Film, Heart } from "lucide-react";

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
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-[#2d2621]">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        photoCount={photos.length}
      />

      {/* Hero Welcome Header */}
      <section className="pt-8 pb-6 px-4 text-center border-b border-[#ede5d8] bg-gradient-to-b from-[#f5ede1]/60 to-transparent">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase text-[#a8824b] bg-[#fbf6ed] border border-[#e8d8c2] mb-3">
            <Heart className="w-3.5 h-3.5 text-[#dfba73] fill-[#dfba73]" />
            <span>Добре дошли в нашия сватбен албум</span>
          </div>

          <h2 className="font-wedding text-3xl sm:text-4xl md:text-5xl font-semibold text-[#3b3228] tracking-tight">
            Сватбени Спомени
          </h2>

          <p className="mt-2.5 text-xs sm:text-sm text-[#7a6d5f] max-w-lg mx-auto">
            Разгледайте сватбените снимки, качете вашите собствени кадри или се насладете на
            3-минутния сватбен трейлър.
          </p>

          {/* 3 Large, Clean Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
            {/* Button 1: Upload */}
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === "upload"
                  ? "bg-[#3b3228] text-white shadow-md scale-105"
                  : "bg-white hover:bg-[#fbf6ed] text-[#4a3f33] border border-[#eadecf] shadow-2xs"
              }`}
            >
              <Camera className="w-4 h-4 text-[#dfba73]" />
              <span>1. Качи снимка</span>
            </button>

            {/* Button 2: Gallery */}
            <button
              onClick={() => setActiveTab("gallery")}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === "gallery"
                  ? "bg-[#3b3228] text-white shadow-md scale-105"
                  : "bg-white hover:bg-[#fbf6ed] text-[#4a3f33] border border-[#eadecf] shadow-2xs"
              }`}
            >
              <ImageIcon className="w-4 h-4 text-[#dfba73]" />
              <span>2. Галерия ({photos.length})</span>
            </button>

            {/* Button 3: Trailer */}
            <button
              onClick={() => setActiveTab("trailer")}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === "trailer"
                  ? "bg-[#3b3228] text-white shadow-md scale-105"
                  : "bg-white hover:bg-[#fbf6ed] text-[#4a3f33] border border-[#eadecf] shadow-2xs"
              }`}
            >
              <Film className="w-4 h-4 text-[#dfba73]" />
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
      <footer className="w-full border-t border-[#ede5d8] py-6 px-4 mt-12 bg-[#faf8f5] text-center text-xs text-[#8c7e70]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Сватбена Галерия. Всички спомени са запазени.</p>
          <p className="flex items-center justify-center gap-1">
            Създадено с <Heart className="w-3.5 h-3.5 text-[#a8824b] fill-[#a8824b] inline" /> от нашия специален ден
          </p>
        </div>
      </footer>
    </div>
  );
}
