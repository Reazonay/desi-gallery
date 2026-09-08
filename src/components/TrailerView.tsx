"use client";

import React, { useState } from "react";
import { Play, Film, Clock, Sparkles, HelpCircle } from "lucide-react";

export default function TrailerView() {
  // Default video trailer URL (can be customized or replaced with /trailer.mp4 in public)
  const [videoSrc, setVideoSrc] = useState<string>(
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  );
  const [customUrl, setCustomUrl] = useState("");
  const [showConfig, setShowConfig] = useState(false);

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      setVideoSrc(customUrl.trim());
      setShowConfig(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Title & Badge */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 mb-3">
          <Clock className="w-3.5 h-3.5 text-rose-400" />
          <span>Продължителност: 3 минути</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
          <span>Официален Трейлър</span>
          <Film className="w-6 h-6 text-amber-400" />
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-lg mx-auto">
          Насладете се на най-вълнуващите и емоционални мигове, събрани в кратък кинематографичен трейлър.
        </p>
      </div>

      {/* Video Container */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl shadow-rose-950/20 aspect-video">
        <video
          key={videoSrc}
          src={videoSrc}
          controls
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
        >
          Вашият браузър не поддържа видео възпроизвеждане.
        </video>
      </div>

      {/* Quick guide on how to add their own video */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Имате собствен 3-минутен файл? Поставете го като <code>public/trailer.mp4</code> или задайте линк.
          </span>
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-1 text-slate-300 hover:text-amber-300 font-medium transition"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showConfig ? "Скрий настройките" : "Смяна на видеото"}</span>
        </button>
      </div>

      {/* Custom URL form modal/drawer */}
      {showConfig && (
        <form
          onSubmit={handleApplyCustomUrl}
          className="mt-4 p-4 rounded-2xl bg-slate-900 border border-slate-700/80 flex flex-col sm:flex-row gap-2"
        >
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="Въведете директен линк към .mp4 видео..."
            className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition"
          >
            Приложи видео
          </button>
        </form>
      )}
    </section>
  );
}
