"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Each } from "react-flowify";
import { cn } from "@/lib/utils";
import { EVENT_TYPES } from "@/lib/constants";
import type { OcrEventFormReturn } from "../_hooks/useOcrEventForm";

type InfoStepProps = Pick<
  OcrEventFormReturn,
  "validRecords" | "totalAmount" | "title" | "type" | "date" | "canSubmit" | "setTitle" | "setType" | "setDate"
>;

export function OcrInfoStep({
  validRecords,
  totalAmount,
  title,
  type,
  date,
  canSubmit,
  setTitle,
  setType,
  setDate,
}: InfoStepProps) {
  const selectedType = EVENT_TYPES.find((t) => t.value === type);

  return (
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
  );
}
