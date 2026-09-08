"use client";

import React, { useState, useRef } from "react";
import { Camera, Check, Loader2, ArrowRight, Image as ImageIcon } from "lucide-react";

interface UploadSectionProps {
  onUploadSuccess: () => void;
  onGoToGallery: () => void;
}

export default function UploadSection({ onUploadSuccess, onGoToGallery }: UploadSectionProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "idle" | "success" | "error"; text: string }>({
    type: "idle",
    text: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) {
      setMessage({ type: "error", text: "Моля, изберете снимки (JPG, PNG, HEIC)." });
      return;
    }

    setSelectedFiles((prev) => [...prev, ...list]);
    const urls = list.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...urls]);
    setMessage({ type: "idle", text: "" });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setMessage({ type: "idle", text: "" });

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Грешка при качването.");

      setMessage({
        type: "success",
        text: `Успешно качени ${selectedFiles.length} ${
          selectedFiles.length === 1 ? "снимка" : "снимки"
        }!`,
      });

      // Clear selection
      previews.forEach((u) => URL.revokeObjectURL(u));
      setSelectedFiles([]);
      setPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";

      onUploadSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Грешка при качването.";
      setMessage({ type: "error", text: msg });
    } finally {
      setIsUploading(false);
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
          Бяхте ли част от нашия празник? Добавете вашите снимки към общия сватбен албум, за да
          могат всички да ги видят и свалят.
        </p>

        {/* Big Touch Select Button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="mt-6">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 px-6 rounded-2xl bg-[#3b3228] hover:bg-[#2d2621] text-[#fdfbf7] font-medium text-base shadow-sm transition transform active:scale-98 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Camera className="w-5 h-5 text-[#dfba73]" />
            <span>Изберете снимки от телефона</span>
          </button>
          <p className="text-xs text-[#9c8e80] mt-2">
            Можете да изберете една или много снимки наведнъж
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
                Откажи
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1 bg-[#faf8f5] rounded-2xl border border-[#ede5d8]">
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
                  <span>Качване...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Качи {selectedFiles.length} {selectedFiles.length === 1 ? "снимка" : "снимки"} в галерията</span>
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

        {/* Safe Album Note */}
        <p className="text-[12px] text-[#9c8e80] mt-6 bg-[#faf8f5] p-3 rounded-2xl border border-[#ede5d8]">
          🔒 <strong>Сигурност:</strong> Всички снимки се съхраняват в общия сватбен албум и не
          могат да бъдат изтривани от посетители.
        </p>
      </div>
    </div>
  );
}
