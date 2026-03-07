"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { Camera, Upload, Loader2, ImageIcon } from "lucide-react";
import { Guard, Show } from "react-flowify";
import { cn } from "@/lib/utils";
import { LogClick } from "@/lib/logging";
import type { OcrEventFormReturn } from "../_hooks/useOcrEventForm";

type UploadStepProps = Pick<
  OcrEventFormReturn,
  "imagePreview" | "extracting" | "fileInputRef" | "handleFileSelect"
>;

export function OcrUploadStep({
  imagePreview,
  extracting,
  fileInputRef,
  handleFileSelect,
}: UploadStepProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  return (
    <motion.div
      key="upload"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6"
    >
      <LogClick eventName="ocr_upload">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center gap-4 p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer min-h-[300px]",
            extracting
              ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20"
              : "border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/10"
          )}
        >
          <Show when={extracting} fallback={
            <Guard when={imagePreview} fallback={<EmptyState />}>
              {(src) => <ImagePreview src={src} />}
            </Guard>
          }>
            <ExtractingState />
          </Show>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      </LogClick>

      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>TIP:</strong> 축의금, 조의금 명부 등 이름과 금액이 적힌 이미지를 올려주세요.
          글씨가 선명할수록 인식률이 높아집니다.
        </p>
      </div>
    </motion.div>
  );
}

function ExtractingState() {
  return (
    <>
      <Loader2 size={48} className="text-blue-500 animate-spin" />
      <div className="text-center">
        <p className="font-semibold text-blue-600">명부 분석 중...</p>
        <p className="text-sm text-muted-foreground mt-1">
          AI가 이름과 금액을 추출하고 있습니다
        </p>
      </div>
    </>
  );
}

function ImagePreview({ src }: { src: string }) {
  return (
    <div className="relative w-full">
      <img
        src={src}
        alt="미리보기"
        className="w-full rounded-2xl object-contain max-h-[300px]"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 hover:opacity-100 transition-opacity">
        <p className="text-white font-medium">다른 이미지 선택</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <>
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 flex items-center justify-center">
        <ImageIcon size={36} className="text-blue-500" />
      </div>
      <div className="text-center">
        <p className="font-semibold">명부 이미지 업로드</p>
        <p className="text-sm text-muted-foreground mt-1">
          클릭하거나 이미지를 드래그하세요
        </p>
      </div>
      <div className="flex gap-3 mt-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-sm">
          <Upload size={16} />
          <span>파일 선택</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-sm">
          <Camera size={16} />
          <span>카메라</span>
        </div>
      </div>
    </>
  );
}
