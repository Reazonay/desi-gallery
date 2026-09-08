"use client";

import React from "react";
import { Film, Heart } from "lucide-react";

export default function TrailerView() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-6">
        <span className="text-xs uppercase tracking-widest text-[#a8824b] font-medium block mb-1">
          Видео Спомен • 3 Минути
        </span>
        <h2 className="font-wedding text-2xl sm:text-3xl text-[#3b3228] font-semibold flex items-center justify-center gap-2">
          <span>Сватбен Трейлър</span>
          <Film className="w-5 h-5 text-[#dfba73]" />
        </h2>
        <p className="text-sm text-[#7a6d5f] mt-1.5 max-w-md mx-auto">
          Споделете вълнението от най-красивите мигове от нашия незабравим ден.
        </p>
      </div>

      {/* Fixed Video Player */}
      <div className="bg-black rounded-3xl overflow-hidden shadow-lg border border-[#eadecf] aspect-video">
        <video
          src="/trailer.mp4"
          controls
          playsInline
          preload="metadata"
          className="w-full h-full object-contain"
        >
          Вашият браузър не поддържа видео възпроизвеждане.
        </video>
      </div>

      <div className="text-center mt-6 text-xs text-[#9c8e80] flex items-center justify-center gap-1.5">
        <Heart className="w-3.5 h-3.5 text-[#a8824b] fill-[#a8824b]" />
        <span>Приятно гледане на нашия сватбен трейлър</span>
      </div>
    </div>
  );
}
