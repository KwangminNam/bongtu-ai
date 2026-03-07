"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Scan, ArrowRight, Loader2, Check } from "lucide-react";
import { Switch, Show } from "react-flowify";
import { BackButton } from "@/components/back-button";
import { cn } from "@/lib/utils";
import { LogScreen } from "@/lib/logging";
import { useOcrEventForm } from "./_hooks/useOcrEventForm";
import { OcrUploadStep } from "./_components/ocr-upload-step";
import { OcrReviewStep } from "./_components/ocr-review-step";
import { OcrInfoStep } from "./_components/ocr-info-step";

const STEP_LABELS = {
  upload: "명부 이미지를 업로드하세요",
  review: "인식된 내용을 확인하세요",
  info: "이벤트 정보를 입력하세요",
} as const;

const STEPS = ["upload", "review", "info"] as const;

export function OcrEventForm() {
  const form = useOcrEventForm();

  return (
    <LogScreen>
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800"
        >
          <div className="flex items-center gap-3 px-5 py-4">
            <BackButton />
            <div className="flex-1">
              <h1 className="text-lg font-bold">명부 스캔</h1>
              <p className="text-xs text-muted-foreground">
                {STEP_LABELS[form.step]}
              </p>
            </div>
            <Scan className="text-blue-500" size={24} />
          </div>

          {/* 단계 표시 */}
          <StepIndicator currentStep={form.step} />
        </motion.div>

        <div className="px-5 py-6">
          <AnimatePresence mode="wait">
            <Switch
              value={form.step}
              by={{
                upload: (
                  <OcrUploadStep
                    imagePreview={form.imagePreview}
                    extracting={form.extracting}
                    fileInputRef={form.fileInputRef}
                    handleFileSelect={form.handleFileSelect}
                  />
                ),
                review: (
                  <OcrReviewStep
                    records={form.records}
                    validRecords={form.validRecords}
                    totalAmount={form.totalAmount}
                    imagePreview={form.imagePreview}
                    updateRecord={form.updateRecord}
                    removeRecord={form.removeRecord}
                    addRecord={form.addRecord}
                  />
                ),
                info: (
                  <OcrInfoStep
                    validRecords={form.validRecords}
                    totalAmount={form.totalAmount}
                    title={form.title}
                    type={form.type}
                    date={form.date}
                    canSubmit={form.canSubmit}
                    setTitle={form.setTitle}
                    setType={form.setType}
                    setDate={form.setDate}
                  />
                ),
              }}
            />
          </AnimatePresence>
        </div>
      </div>

      {/* 하단 버튼 */}
      <OcrBottomActions
        step={form.step}
        canSubmit={form.canSubmit}
        submitting={form.submitting}
        validRecordsCount={form.validRecords.length}
        onPrev={form.goToPrevStep}
        onNext={() => form.setStep("info")}
        onSubmit={form.handleSubmit}
      />
    </div>
    </LogScreen>
  );
}

function StepIndicator({ currentStep }: { currentStep: string }) {
  const currentIndex = STEPS.indexOf(currentStep as typeof STEPS[number]);

  return (
    <div className="flex px-5 pb-3 gap-2">
      {STEPS.map((s, i) => (
        <div
          key={s}
          className={cn(
            "flex-1 h-1 rounded-full transition-colors",
            (() => {
              if (currentStep === s) return "bg-blue-500";
              if (currentIndex > i) return "bg-blue-300";
              return "bg-slate-200 dark:bg-slate-700";
            })()
          )}
        />
      ))}
    </div>
  );
}

function OcrBottomActions({
  step,
  canSubmit,
  submitting,
  validRecordsCount,
  onPrev,
  onNext,
  onSubmit,
}: {
  step: string;
  canSubmit: boolean;
  submitting: boolean;
  validRecordsCount: number;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  const hasValidRecords = validRecordsCount > 0;
  const isSubmittable = canSubmit && !submitting;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="shrink-0 px-5 pt-4 pb-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800"
    >
      <div className="flex gap-3">
        <Show when={step !== "upload"}>
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onPrev}
            className="px-6 h-14 rounded-2xl font-semibold border-2 border-slate-200 dark:border-slate-700"
          >
            이전
          </motion.button>
        </Show>

        <Show when={step === "review"}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            disabled={!hasValidRecords}
            className={cn(
              "flex-1 h-14 rounded-2xl font-semibold flex items-center justify-center gap-2",
              hasValidRecords
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            )}
          >
            <span>다음</span>
            <ArrowRight size={18} />
          </motion.button>
        </Show>

        <Show when={step === "info"}>
          <motion.button
            whileHover={isSubmittable ? { scale: 1.02 } : {}}
            whileTap={isSubmittable ? { scale: 0.98 } : {}}
            onClick={onSubmit}
            disabled={!isSubmittable}
            className={cn(
              "flex-1 h-14 rounded-2xl font-semibold flex items-center justify-center gap-2",
              isSubmittable
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            )}
          >
            <Show when={submitting} fallback={<><Check size={20} /><span>이벤트 등록하기</span></>}>
              <Loader2 size={20} className="animate-spin" />
              <span>등록 중...</span>
            </Show>
          </motion.button>
        </Show>
      </div>
    </motion.div>
  );
}
