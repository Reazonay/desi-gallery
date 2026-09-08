"use client";

import React from "react";
import { Camera, Image as ImageIcon, Film } from "lucide-react";

export type ActiveTab = "upload" | "gallery" | "trailer";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  photoCount: number;
}

export default function Navbar({ activeTab, setActiveTab, photoCount }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#eadecf] shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Title */}
        <button
          onClick={() => setActiveTab("gallery")}
          className="text-center sm:text-left group cursor-pointer"
        >
          <span className="text-xs uppercase tracking-widest text-[#a8824b] font-medium block">
            Сватбен Ден
          </span>
          <h1 className="font-wedding text-2xl sm:text-3xl font-semibold text-[#3b3228] tracking-tight group-hover:text-[#a8824b] transition">
            Сватбена Галерия
          </h1>
        </button>

        {/* 3 Main Action Buttons */}
        <nav className="flex items-center gap-1.5 p-1 bg-[#f0ebe1] rounded-2xl border border-[#e4dcd0]">
          {/* Button 1: Upload */}
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === "upload"
                ? "bg-[#3b3228] text-[#fdfbf7] shadow-sm scale-[1.02]"
                : "text-[#6b5e51] hover:text-[#2d2621] hover:bg-[#e6dfd3]"
            }`}
          >
            <Camera className="w-4 h-4 text-[#dfba73]" />
            <span>Качи снимка</span>
          </button>

          {/* Button 2: Gallery */}
          <button
            onClick={() => setActiveTab("gallery")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === "gallery"
                ? "bg-[#3b3228] text-[#fdfbf7] shadow-sm scale-[1.02]"
                : "text-[#6b5e51] hover:text-[#2d2621] hover:bg-[#e6dfd3]"
            }`}
          >
            <ImageIcon className="w-4 h-4 text-[#dfba73]" />
            <span>Галерия</span>
            {photoCount > 0 && (
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                activeTab === "gallery"
                  ? "bg-[#55493d] text-[#f3e9d8]"
                  : "bg-[#e2d8c9] text-[#594d40]"
              }`}>
                {photoCount}
              </span>
            )}
          </button>

          {/* Button 3: Trailer */}
          <button
            onClick={() => setActiveTab("trailer")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === "trailer"
                ? "bg-[#3b3228] text-[#fdfbf7] shadow-sm scale-[1.02]"
                : "text-[#6b5e51] hover:text-[#2d2621] hover:bg-[#e6dfd3]"
            }`}
          >
            <Film className="w-4 h-4 text-[#dfba73]" />
            <span>Трейлър</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
