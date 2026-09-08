"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";

interface UploadSectionProps {
  onUploadSuccess: () => void;
  onGoToGallery: () => void;
}

export default function UploadSection({ onUploadSuccess, onGoToGallery }: UploadSectionProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (fileArray.length === 0) {
      setUploadStatus({
        type: "error",
        message: "Моля, изберете валидни файлове за снимки (JPG, PNG, HEIC, WEBP).",
      });
      return;
    }

    setSelectedFiles((prev) => [...prev, ...fileArray]);

    // Generate previews
    const newPreviews = fileArray.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
    setUploadStatus({ type: "idle", message: "" });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const clearSelection = () => {
    previews.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setUploadStatus({ type: "idle", message: "" });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadStatus({ type: "idle", message: "" });

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Възникна проблем при качването.");
      }

      if (data.demo) {
        setUploadStatus({
          type: "success",
          message:
            "Снимките са обработени! (Локален тестов режим – във Vercel ще се качват в облака веднага).",
        });
      } else {
        setUploadStatus({
          type: "success",
          message: `Успешно качени ${selectedFiles.length} ${
            selectedFiles.length === 1 ? "снимка" : "снимки"
          }!`,
        });
      }

      clearSelection();
      onUploadSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Грешка при качване на снимките.";
      setUploadStatus({
        type: "error",
        message: msg,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
          Стъпка 1: Споделете вашите моменти
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Качване на снимки в общия албум
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-lg mx-auto">
          Изберете снимки директно от камерата или галерията на телефона си. Всички снимки ще
          бъдат видими в общата галерия за сваляне.
        </p>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? "border-amber-400 bg-amber-500/10 scale-[1.01]"
            : "border-slate-700 bg-slate-900/60 hover:border-slate-500 hover:bg-slate-900"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <p className="text-base sm:text-lg font-semibold text-white">
              Натиснете тук за избор на снимки
            </p>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              или плъзнете файловете тук (поддържа JPEG, PNG, WEBP, HEIC)
            </p>
          </div>

          <button
            type="button"
            className="mt-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition"
          >
            Избери от телефона / компютъра
          </button>
        </div>
      </div>

      {/* Selected Previews */}
      {selectedFiles.length > 0 && (
        <div className="mt-6 p-4 sm:p-6 bg-slate-900/80 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              Избрани снимки ({selectedFiles.length})
            </h3>
            <button
              onClick={clearSelection}
              disabled={isUploading}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium transition"
            >
              Изчисти избора
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {previews.map((src, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-xl overflow-hidden bg-slate-800 border border-slate-700/60"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Избрана снимка ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:brightness-110 shadow-lg shadow-rose-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Качване на снимките ({selectedFiles.length})...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Качи {selectedFiles.length} {selectedFiles.length === 1 ? "снимка" : "снимки"} в галерията</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {uploadStatus.type === "success" && (
        <div className="mt-6 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-sm font-medium">{uploadStatus.message}</p>
          </div>
          <button
            onClick={onGoToGallery}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition shrink-0"
          >
            <span>Към Галерията</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {uploadStatus.type === "error" && (
        <div className="mt-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <p className="text-sm">{uploadStatus.message}</p>
        </div>
      )}

      {/* Permanent Storage Notice */}
      <div className="mt-8 p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
        <span className="text-base">🔒</span>
        <span>
          <strong>Бележка за сигурност:</strong> Веднъж качени, снимките се пазят в общия албум за
          всички гости и не могат да бъдат изтривани от посетителите на сайта. Всеки може да ги
          разглежда и сваля.
        </span>
      </div>
    </section>
  );
}
