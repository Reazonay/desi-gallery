"use client";

import React, { useState, useRef } from "react";
import { Camera, Check, Loader2, ArrowRight, Image as ImageIcon, Plus } from "lucide-react";
import { PhotoItem } from "./GalleryView";

interface UploadSectionProps {
  onUploadSuccess: (newUploaded?: PhotoItem[]) => void;
  onGoToGallery: () => void;
}

export default function UploadSection({ onUploadSuccess, onGoToGallery }: UploadSectionProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [message, setMessage] = useState<{ type: "idle" | "success" | "error"; text: string }>({
    type: "idle",
    text: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) {
      setMessage({ type: "error", text: "Моля, изберете файлове за снимки (JPG, PNG, HEIC)." });
      return;
    }

    // Append to existing selection so user can pick multiple times
    setSelectedFiles((prev) => [...prev, ...list]);
    const urls = list.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...urls]);
    setMessage({ type: "idle", text: "" });

    // Reset input value so user can pick same file again if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setMessage({ type: "idle", text: "" });

    let successCount = 0;
    const total = selectedFiles.length;
    const allUploaded: PhotoItem[] = [];

    try {
      // Upload one by one to never exceed Vercel's 4.5MB serverless body payload limit
      for (let i = 0; i < total; i++) {
        setProgressText(`Качване на снимка ${i + 1} от ${total}...`);
        const formData = new FormData();
        formData.append("file", selectedFiles[i]);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Грешка при снимка ${i + 1}`);
        }
        if (data.uploaded && Array.isArray(data.uploaded)) {
          allUploaded.push(...data.uploaded);
        }
        successCount++;
      }

      setMessage({
        type: "success",
        text: `Успешно качени ${successCount} ${
          successCount === 1 ? "снимка" : "снимки"
        } в сватбения албум!`,
      });

      // Clear selection
      previews.forEach((u) => URL.revokeObjectURL(u));
      setSelectedFiles([]);
      setPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";

      onUploadSuccess(allUploaded);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Грешка при качването.";
      setMessage({ type: "error", text: msg });
    } finally {
      setIsUploading(false);
      setProgressText("");
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eadecf] shadow-sm text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#fbf6ed] border border-[#e8d8c2] flex items-center justify-center text-[#a8824b] mb-4">
          <Camera className="w-8 h-8" />
        </div>

        <h2 className="font-wedding text-2xl sm:text-3xl text-[#3b3228] font-semibold">
          Качете вашите снимки
        </h2>
        <p className="text-sm text-[#7a6d5f] mt-2 max-w-md mx-auto">
          Бяхте ли част от нашия празник? Изберете една или много снимки едновременно от вашия
          телефон или компютър.
        </p>

        {/* Hidden Multiple File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Big Select Button */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 px-6 rounded-2xl bg-[#3b3228] hover:bg-[#2d2621] text-[#fdfbf7] font-medium text-base shadow-sm transition transform active:scale-98 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Camera className="w-5 h-5 text-[#dfba73]" />
            <span>
              {selectedFiles.length > 0 ? "Изберете още снимки" : "Изберете снимки от телефона"}
            </span>
          </button>
          <p className="text-xs text-[#9c8e80]">
            Поддържа избор на много снимки наведнъж (JPG, PNG, HEIC)
          </p>
        </div>

        {/* Selected Photos Preview */}
        {selectedFiles.length > 0 && (
          <div className="mt-6 text-left border-t border-[#f0ebe1] pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7a6d5f] flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#a8824b]" />
                Избрани ({selectedFiles.length})
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-[#a8824b] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добави още</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    previews.forEach((u) => URL.revokeObjectURL(u));
                    setSelectedFiles([]);
                    setPreviews([]);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-xs text-[#a34444] hover:underline"
                >
                  Изчисти
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-52 overflow-y-auto p-1.5 bg-[#faf8f5] rounded-2xl border border-[#ede5d8]">
              {previews.map((src, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl overflow-hidden bg-[#eee] border border-[#e4dcd0]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="Преглед" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Confirm Upload Button */}
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="mt-4 w-full py-3.5 rounded-2xl bg-[#a8824b] hover:bg-[#967440] text-white font-medium text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{progressText || "Качване..."}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Качи всички {selectedFiles.length} снимки в албума</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Success / Error Message */}
        {message.type === "success" && (
          <div className="mt-5 p-4 rounded-2xl bg-[#eef7ee] border border-[#cbe5cb] text-[#2d5a2d] text-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>✓ {message.text}</span>
            <button
              onClick={onGoToGallery}
              className="px-4 py-2 rounded-xl bg-[#2d5a2d] text-white text-xs font-semibold hover:bg-[#234823] transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Към Галерията</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {message.type === "error" && (
          <div className="mt-5 p-4 rounded-2xl bg-[#fdf0f0] border border-[#f5caca] text-[#8a3333] text-sm">
            {message.text}
          </div>
        )}

        {/* Storage Notice */}
        <p className="text-[12px] text-[#9c8e80] mt-6 bg-[#faf8f5] p-3 rounded-2xl border border-[#ede5d8]">
          🔒 <strong>Сигурност:</strong> Всички качени снимки се добавят в общата галерия за гостите.
          Снимките не могат да се изтриват от посетителите.
        </p>
      </div>
    </div>
  );
}
