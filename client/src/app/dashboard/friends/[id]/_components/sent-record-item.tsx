"use client";

import { Trash2, Pencil, X, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import { useSentRecordItem } from "../_hooks/useSentRecordItem";
import type { SentRecord } from "@/lib/api";

const EVENT_TYPES = [
  { value: "WEDDING", label: "결혼" },
  { value: "FUNERAL", label: "장례" },
  { value: "BIRTHDAY", label: "생일/잔치" },
  { value: "ETC", label: "기타" },
];

interface SentRecordItemProps {
  record: SentRecord;
  friendId: string;
}

export function SentRecordItem({ record, friendId }: SentRecordItemProps) {
  const {
    isEditing,
    amount,
    date,
    eventType,
    memo,
    isSaving,
    isDeleting,
    startEditing,
    cancelEditing,
    setAmount,
    setDate,
    setEventType,
    setMemo,
    handleSave,
    handleDelete,
  } = useSentRecordItem({
    recordId: record.id,
    friendId,
    initialAmount: record.amount,
    initialDate: record.date,
    initialEventType: record.eventType,
    initialMemo: record.memo,
  });

  if (isEditing) {
    return (
      <motion.div layout>
        <Card
          className={`p-4 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 shadow-md ${isSaving ? "opacity-60" : ""}`}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">보낸 기록 수정</span>
              <div className="flex gap-1">
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={cancelEditing}
                      className="p-2 rounded-full hover:bg-white/50 transition-colors"
                    >
                      <X size={16} />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSave}
                      disabled={!amount}
                      className="p-2 rounded-full hover:bg-white/50 transition-colors text-blue-600"
                    >
                      <Check size={16} />
                    </motion.button>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="금액"
                className="flex-1 h-10 rounded-xl bg-white/70 dark:bg-slate-900/50"
                disabled={isSaving}
              />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 h-10 rounded-xl bg-white/70 dark:bg-slate-900/50"
                disabled={isSaving}
              />
            </div>

            <div className="flex gap-1.5 flex-wrap">
              {EVENT_TYPES.map((type) => (
                <Badge
                  key={type.value}
                  variant={eventType === type.value ? "default" : "outline"}
                  className="cursor-pointer px-2.5 py-1 text-xs"
                  onClick={() => !isSaving && setEventType(type.value)}
                >
                  {type.label}
                </Badge>
              ))}
            </div>

            <Input
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모 (선택)"
              className="h-10 rounded-xl bg-white/70 dark:bg-slate-900/50"
              disabled={isSaving}
            />
          </div>
        </Card>
      </motion.div>
    );
  }

  if (isDeleting) {
    return (
      <motion.div
        layout
        initial={{ opacity: 1 }}
        animate={{ opacity: 0.5, scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="p-3 shadow-sm">
          <div className="flex items-center justify-center gap-2 py-1">
            <Loader2 size={18} className="animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">삭제 중...</span>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div layout whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
      <Card className="p-3 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="outline" className="text-xs">
              {EVENT_TYPE_LABELS[record.eventType] || record.eventType}
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(record.date).toLocaleDateString("ko-KR")}
            </div>
            {record.memo && (
              <div className="text-xs text-muted-foreground mt-1">
                {record.memo}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="font-semibold text-sm text-red-600">
              -{record.amount.toLocaleString()}원
            </div>
            <div className="flex gap-0.5">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={startEditing}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <Pencil size={14} className="text-muted-foreground" />
              </motion.button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </motion.button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>보낸 기록 삭제</AlertDialogTitle>
                    <AlertDialogDescription>
                      {record.amount.toLocaleString()}원 보낸 기록을
                      삭제하시겠습니까?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">
                      취소
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="rounded-xl bg-red-500 hover:bg-red-600"
                    >
                      삭제
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
