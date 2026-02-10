"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomCTAProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  summary?: React.ReactNode;
}

export function BottomCTA({
  onClick,
  disabled = false,
  loading = false,
  loadingText = "처리 중...",
  children,
  summary,
}: BottomCTAProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="shrink-0 w-full px-5 pt-3 pb-4 flex flex-col justify-end bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-40"
    >
      {summary}
      <motion.button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.02 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        className={cn(
          "w-full h-14 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all",
          !isDisabled
            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50 hover:shadow-xl"
            : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
        )}
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>{loadingText}</span>
          </>
        ) : (
          children
        )}
      </motion.button>
    </motion.div>
  );
}
