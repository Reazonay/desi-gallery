"use client";

import React from "react";
import { UploadCloud, Images, Video } from "lucide-react";

export type ActiveTab = "upload" | "gallery" | "trailer";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  photoCount: number;
}

export default function Navbar({ activeTab, setActiveTab, photoCount }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/85 border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="text-center md:text-left cursor-pointer" onClick={() => setActiveTab("gallery")}>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-200 via-rose-300 to-amber-400 bg-clip-text text-transparent">
            Споделена Галерия
          </h1>
          <p className="text-xs text-slate-400">
            Качване, преглед и сваляне на незабравими спомени
          </p>
        </div>

        {/* 3 Main Action Buttons */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800/80 shadow-inner">
          {/* Button 1: Upload */}
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === "upload"
                ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-rose-500/20 scale-[1.02]"
                : "text-slate-300 hover:text-white hover:bg-slate-800/70"
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Качи снимки</span>
          </button>

          {/* Button 2: Gallery */}
          <button
            onClick={() => setActiveTab("gallery")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === "gallery"
                ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-rose-500/20 scale-[1.02]"
                : "text-slate-300 hover:text-white hover:bg-slate-800/70"
            }`}
          >
            <Images className="w-4 h-4" />
            <span>Галерия</span>
            {photoCount > 0 && (
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                {photoCount}
              </span>
            )}
          </button>

          {/* Button 3: Trailer */}
          <button
            onClick={() => setActiveTab("trailer")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === "trailer"
                ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-rose-500/20 scale-[1.02]"
                : "text-slate-300 hover:text-white hover:bg-slate-800/70"
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Трейлър</span>
          </button>
        </div>
      </div>
    </header>
  );
}
