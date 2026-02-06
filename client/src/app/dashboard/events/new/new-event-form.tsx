"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Loader2, ArrowRight, Scan } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { BackButton } from "@/components/back-button";
import { api } from "@/lib/api";
import { revalidateDashboard } from "@/lib/actions";
import { cn } from "@/lib/utils";

const EVENT_TYPES = [
  {
    value: "WEDDING",
    label: "결혼식",
    emoji: "💒",
    description: "결혼식, 약혼식 등",
    gradient: "from-pink-100 to-rose-100 dark:from-pink-950/40 dark:to-rose-950/40",
    selectedGradient: "from-pink-500 to-rose-500",
    ring: "ring-pink-400",
  },
  {
    value: "FUNERAL",
    label: "장례식",
    emoji: "🕯️",
    description: "장례, 추모식 등",
    gradient: "from-purple-100 to-violet-100 dark:from-purple-950/40 dark:to-violet-950/40",
    selectedGradient: "from-purple-500 to-violet-500",
    ring: "ring-purple-400",
  },
  {
    value: "BIRTHDAY",
    label: "생일/잔치",
    emoji: "🎂",
    description: "생일, 돌잔치, 환갑 등",
    gradient: "from-amber-100 to-yellow-100 dark:from-amber-950/40 dark:to-yellow-950/40",
    selectedGradient: "from-amber-500 to-yellow-500",
    ring: "ring-amber-400",
  },
  {
    value: "ETC",
    label: "기타",
    emoji: "🎉",
    description: "집들이, 승진 축하 등",
    gradient: "from-slate-100 to-gray-100 dark:from-slate-900/40 dark:to-gray-900/40",
    selectedGradient: "from-slate-500 to-gray-500",
    ring: "ring-slate-400",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

export function NewEventForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.events.create({ title, type, date });
      await revalidateDashboard();
      toast.success("이벤트가 등록되었습니다!");
      router.push("/dashboard");
    } catch {
      toast.error("이벤트 등록에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = title && type && date;
  const selectedType = EVENT_TYPES.find((t) => t.value === type);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800"
      >
        <div className="flex items-center gap-3 px-5 py-4">
          <BackButton />
          <div className="flex-1">
            <h1 className="text-lg font-bold">새 이벤트</h1>
            <p className="text-xs text-muted-foreground">경조사 내역을 기록해보세요</p>
          </div>
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          >
            <Sparkles className="text-amber-400" size={24} />
          </motion.div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="flex-1 px-5 py-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-8"
        >
          {/* OCR 스캔 배너 */}
          <motion.div variants={itemVariants}>
            <Link href="/dashboard/events/new/ocr">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 border border-blue-100 dark:border-blue-900 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Scan className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-blue-900 dark:text-blue-100">명부 스캔으로 빠르게 등록</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">사진 한 장으로 여러 명 한번에 입력</p>
                </div>
                <ArrowRight className="text-blue-400" size={20} />
              </div>
            </Link>
          </motion.div>

          {/* 이벤트 유형 선택 */}
          <motion.div variants={itemVariants} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">어떤 경조사인가요?</span>
              {selectedType && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-lg"
                >
                  {selectedType.emoji}
                </motion.span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {EVENT_TYPES.map((eventType, index) => (
                <motion.button
                  key={eventType.value}
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setType(eventType.value)}
                  className={cn(
                    "relative p-4 rounded-2xl border-2 transition-all overflow-hidden",
                    type === eventType.value
                      ? `bg-gradient-to-br ${eventType.gradient} border-transparent ${eventType.ring} ring-2 ring-offset-2 dark:ring-offset-slate-900`
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  {type === eventType.value && (
                    <motion.div
                      layoutId="selectedType"
                      className={`absolute inset-0 bg-gradient-to-br ${eventType.gradient} opacity-50`}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className="relative flex flex-col items-start gap-1">
                    <span className="text-2xl">{eventType.emoji}</span>
                    <span className="font-semibold text-sm">{eventType.label}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">
                      {eventType.description}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* 이벤트 이름 */}
          <motion.div variants={itemVariants} className="flex flex-col gap-3">
            <label htmlFor="title" className="text-sm font-semibold">
              이벤트 이름을 지어주세요
            </label>
            <div className="relative">
              <Input
                id="title"
                placeholder="예: 나의 결혼식, 아버지 칠순"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-0 transition-all text-base"
              />
              {title && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M13.5 4.5L6.5 11.5L3 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* 날짜 선택 */}
          <motion.div variants={itemVariants} className="flex flex-col gap-3">
            <label className="text-sm font-semibold">언제 있었나요?</label>
            <DatePicker
              value={date}
              onChange={setDate}
              placeholder="날짜를 선택하세요"
            />
          </motion.div>

          {/* 미리보기 카드 */}
          {isValid && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "p-5 rounded-3xl bg-gradient-to-br shadow-lg",
                selectedType?.gradient || "from-slate-100 to-gray-100"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/80 dark:bg-slate-800/80 shadow-sm flex items-center justify-center">
                  <span className="text-3xl">{selectedType?.emoji}</span>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">미리보기</div>
                  <div className="font-bold text-lg">{title}</div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span>{selectedType?.label}</span>
                    <span>·</span>
                    <span>
                      {new Date(date).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </form>

      {/* 하단 버튼 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="sticky bottom-0 px-5 pt-4 pb-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800"
      >
        <motion.button
          type="submit"
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          whileHover={isValid && !submitting ? { scale: 1.02 } : {}}
          whileTap={isValid && !submitting ? { scale: 0.98 } : {}}
          className={cn(
            "w-full h-14 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all",
            isValid && !submitting
              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50 hover:shadow-xl"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
          )}
        >
          {submitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>등록 중...</span>
            </>
          ) : (
            <>
              <span>이벤트 등록하기</span>
              <ArrowRight size={18} />
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
