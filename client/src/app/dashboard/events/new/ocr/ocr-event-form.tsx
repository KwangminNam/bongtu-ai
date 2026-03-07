"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  Loader2,
  ArrowRight,
  Trash2,
  Plus,
  Scan,
  Check,
  X,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { BackButton } from "@/components/back-button";
import { api, OcrRecord } from "@/lib/api";
import { revalidateDashboard } from "@/lib/actions";
import { Each } from "react-flowify";
import { cn } from "@/lib/utils";
import { LogScreen, LogClick } from "@/lib/logging";

const EVENT_TYPES = [
  {
    value: "WEDDING",
    label: "결혼식",
    emoji: "💒",
    gradient: "from-pink-100 to-rose-100 dark:from-pink-950/40 dark:to-rose-950/40",
    ring: "ring-pink-400",
  },
  {
    value: "FUNERAL",
    label: "장례식",
    emoji: "🕯️",
    gradient: "from-purple-100 to-violet-100 dark:from-purple-950/40 dark:to-violet-950/40",
    ring: "ring-purple-400",
  },
  {
    value: "BIRTHDAY",
    label: "생일/잔치",
    emoji: "🎂",
    gradient: "from-amber-100 to-yellow-100 dark:from-amber-950/40 dark:to-yellow-950/40",
    ring: "ring-amber-400",
  },
  {
    value: "ETC",
    label: "기타",
    emoji: "🎉",
    gradient: "from-slate-100 to-gray-100 dark:from-slate-900/40 dark:to-gray-900/40",
    ring: "ring-slate-400",
  },
];

type Step = "upload" | "review" | "info";

export function OcrEventForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [records, setRecords] = useState<OcrRecord[]>([]);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resizeImage = (file: File, maxWidth = 1024): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드 가능합니다");
      return;
    }

    setExtracting(true);
    try {
      // 이미지 리사이징 (최대 1024px)
      const resizedBase64 = await resizeImage(file);
      setImagePreview(resizedBase64);

      // base64 데이터 부분만 추출
      const base64Data = resizedBase64.split(",")[1];

      const result = await api.events.ocr(base64Data);
      if (result.records.length === 0) {
        toast.error("명부를 인식할 수 없습니다. 다른 이미지를 시도해주세요.");
        setExtracting(false);
        return;
      }
      setRecords(result.records);
      setStep("review");
      toast.success(`${result.records.length}건의 기록을 인식했습니다`);
    } catch {
      toast.error("OCR 처리 중 오류가 발생했습니다");
    } finally {
      setExtracting(false);
    }
  }, []);

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

  const updateRecord = (index: number, field: keyof OcrRecord, value: string | number) => {
    setRecords((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const removeRecord = (index: number) => {
    setRecords((prev) => prev.filter((_, i) => i !== index));
  };

  const addRecord = () => {
    setRecords((prev) => [...prev, { name: "", amount: 0 }]);
  };

  const handleSubmit = async () => {
    if (!title || !type || !date || records.length === 0) return;

    setSubmitting(true);
    try {
      const result = await api.events.ocrBulk({
        title,
        type,
        date,
        records: records.filter((r) => r.name && r.amount > 0),
      });
      await revalidateDashboard();
      toast.success(
        `이벤트가 등록되었습니다! (${result.summary.totalRecords}건, ${result.summary.totalAmount.toLocaleString()}원)`
      );
      router.push("/dashboard");
    } catch {
      toast.error("등록에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = records.reduce((sum, r) => sum + (r.amount || 0), 0);
  const validRecords = records.filter((r) => r.name && r.amount > 0);
  const selectedType = EVENT_TYPES.find((t) => t.value === type);
  const canSubmit = title && type && date && validRecords.length > 0;

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
                {step === "upload" && "명부 이미지를 업로드하세요"}
                {step === "review" && "인식된 내용을 확인하세요"}
                {step === "info" && "이벤트 정보를 입력하세요"}
              </p>
            </div>
            <Scan className="text-blue-500" size={24} />
          </div>

          {/* 단계 표시 */}
          <div className="flex px-5 pb-3 gap-2">
            {(["upload", "review", "info"] as Step[]).map((s, i) => (
              <div
                key={s}
                className={cn(
                  "flex-1 h-1 rounded-full transition-colors",
                  step === s
                    ? "bg-blue-500"
                    : ["review", "info"].indexOf(step) > i
                    ? "bg-blue-300"
                    : "bg-slate-200 dark:bg-slate-700"
                )}
              />
            ))}
          </div>
        </motion.div>

        <div className="px-5 py-6">
        <AnimatePresence mode="wait">
          {/* Step 1: 이미지 업로드 */}
          {step === "upload" && (
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
                {extracting ? (
                  <>
                    <Loader2 size={48} className="text-blue-500 animate-spin" />
                    <div className="text-center">
                      <p className="font-semibold text-blue-600">명부 분석 중...</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        AI가 이름과 금액을 추출하고 있습니다
                      </p>
                    </div>
                  </>
                ) : imagePreview ? (
                  <div className="relative w-full">
                    <img
                      src={imagePreview}
                      alt="미리보기"
                      className="w-full rounded-2xl object-contain max-h-[300px]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white font-medium">다른 이미지 선택</p>
                    </div>
                  </div>
                ) : (
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
                )}
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
          )}

          {/* Step 2: 결과 확인/수정 */}
          {step === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">인식된 기록</p>
                  <p className="text-sm text-muted-foreground">
                    {validRecords.length}건 · {totalAmount.toLocaleString()}원
                  </p>
                </div>
                <button
                  onClick={addRecord}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm font-medium"
                >
                  <Plus size={16} />
                  추가
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
                <Each items={records}>
                  {(record, { index }) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <Input
                        value={record.name}
                        onChange={(e) => updateRecord(index, "name", e.target.value)}
                        placeholder="이름"
                        className="flex-1 h-10 border-0 bg-slate-50 dark:bg-slate-900 rounded-xl"
                      />
                      <div className="relative">
                        <Input
                          type="number"
                          value={record.amount || ""}
                          onChange={(e) => updateRecord(index, "amount", Number(e.target.value))}
                          placeholder="금액"
                          className="w-28 h-10 border-0 bg-slate-50 dark:bg-slate-900 rounded-xl pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          원
                        </span>
                      </div>
                      <button
                        onClick={() => removeRecord(index)}
                        className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  )}
                </Each>
              </div>

              {imagePreview && (
                <details className="mt-2">
                  <summary className="text-sm text-muted-foreground cursor-pointer">
                    원본 이미지 보기
                  </summary>
                  <img
                    src={imagePreview}
                    alt="원본"
                    className="mt-2 w-full rounded-2xl object-contain max-h-[200px]"
                  />
                </details>
              )}
            </motion.div>
          )}

          {/* Step 3: 이벤트 정보 입력 */}
          {step === "info" && (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              {/* 요약 */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 border border-blue-100 dark:border-blue-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">등록할 기록</p>
                    <p className="text-2xl font-bold">{validRecords.length}건</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">총 금액</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {totalAmount.toLocaleString()}원
                    </p>
                  </div>
                </div>
              </div>

              {/* 이벤트 유형 */}
              <div className="flex flex-col gap-3">
                <span className="text-sm font-semibold">어떤 경조사인가요?</span>
                <div className="grid grid-cols-2 gap-3">
                  <Each items={EVENT_TYPES}>
                    {(eventType) => (
                      <motion.button
                        key={eventType.value}
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setType(eventType.value)}
                        className={cn(
                          "relative p-4 rounded-2xl border-2 transition-all",
                          type === eventType.value
                            ? `bg-gradient-to-br ${eventType.gradient} border-transparent ${eventType.ring} ring-2 ring-offset-2 dark:ring-offset-slate-900`
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                        )}
                      >
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-2xl">{eventType.emoji}</span>
                          <span className="font-semibold text-sm">{eventType.label}</span>
                        </div>
                      </motion.button>
                    )}
                  </Each>
                </div>
              </div>

              {/* 이벤트 이름 */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold">이벤트 이름</label>
                <Input
                  placeholder="예: 나의 결혼식, 아버지 칠순"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12 px-4 rounded-2xl border-2"
                />
              </div>

              {/* 날짜 */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold">날짜</label>
                <DatePicker value={date} onChange={setDate} placeholder="날짜를 선택하세요" />
              </div>

              {/* 미리보기 */}
              {canSubmit && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-5 rounded-3xl bg-gradient-to-br shadow-lg",
                    selectedType?.gradient
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/80 dark:bg-slate-800/80 flex items-center justify-center">
                      <span className="text-3xl">{selectedType?.emoji}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">미리보기</div>
                      <div className="font-bold text-lg">{title}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {validRecords.length}건 · {totalAmount.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      {/* 하단 버튼 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="shrink-0 px-5 pt-4 pb-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800"
      >
        <div className="flex gap-3">
          {step !== "upload" && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setStep(step === "info" ? "review" : "upload")}
              className="px-6 h-14 rounded-2xl font-semibold border-2 border-slate-200 dark:border-slate-700"
            >
              이전
            </motion.button>
          )}

          {step === "review" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep("info")}
              disabled={validRecords.length === 0}
              className={cn(
                "flex-1 h-14 rounded-2xl font-semibold flex items-center justify-center gap-2",
                validRecords.length > 0
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              )}
            >
              <span>다음</span>
              <ArrowRight size={18} />
            </motion.button>
          )}

          {step === "info" && (
            <motion.button
              whileHover={canSubmit ? { scale: 1.02 } : {}}
              whileTap={canSubmit ? { scale: 0.98 } : {}}
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className={cn(
                "flex-1 h-14 rounded-2xl font-semibold flex items-center justify-center gap-2",
                canSubmit && !submitting
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              )}
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>등록 중...</span>
                </>
              ) : (
                <>
                  <Check size={20} />
                  <span>이벤트 등록하기</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
    </LogScreen>
  );
}
