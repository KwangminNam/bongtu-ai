"use client";

import { motion } from "framer-motion";
import { Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Each } from "react-flowify";
import type { OcrEventFormReturn } from "../_hooks/useOcrEventForm";

type ReviewStepProps = Pick<
  OcrEventFormReturn,
  "records" | "validRecords" | "totalAmount" | "imagePreview" | "updateRecord" | "removeRecord" | "addRecord"
>;

export function OcrReviewStep({
  records,
  validRecords,
  totalAmount,
  imagePreview,
  updateRecord,
  removeRecord,
  addRecord,
}: ReviewStepProps) {
  return (
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
  );
}
