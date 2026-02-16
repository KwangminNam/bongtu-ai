"use client";

import { useState } from "react";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch-case";
import { useAmountContext } from "../_hooks";
import { useGoldPriceAI } from "../_hooks/useGoldPriceAI";

interface GoldPriceAIProps {
  eventDate: string | null;
}

export function GoldPriceAI({ eventDate }: GoldPriceAIProps) {
  const { giftType } = useAmountContext();
  const { status, content, error, fetchGoldPrice } = useGoldPriceAI(eventDate);

  if (giftType !== "gold") return null;

  return (
    <Switch
      type={status}
      case={{
        idle: <IdleView onFetch={fetchGoldPrice} />,
        loading: <LoadingView />,
        streaming: <StreamingView content={content} />,
        done: <DoneView content={content} onRetry={fetchGoldPrice} />,
        error: <ErrorView error={error} onRetry={fetchGoldPrice} />,
      }}
    />
  );
}

// ─── Sub Views ───

function IdleView({ onFetch }: { onFetch: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onFetch}
      className="w-full mt-3 border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/30"
    >
      <Sparkles size={16} className="mr-2" />
      AI로 금시세 알아보기
    </Button>
  );
}

function LoadingView() {
  return (
    <div className="mt-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm font-medium">금시세를 조회하고 있어요...</span>
      </div>
    </div>
  );
}

function StreamingView({ content }: { content: string }) {
  return (
    <div className="mt-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={14} className="text-amber-600 dark:text-amber-400" />
        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
          AI 금시세
        </span>
        <Loader2 size={12} className="animate-spin text-amber-500" />
      </div>
      <p className="text-sm text-amber-900 dark:text-amber-100 whitespace-pre-wrap leading-relaxed">
        {content}
      </p>
    </div>
  );
}

function DoneView({
  content,
  onRetry,
}: {
  content: string;
  onRetry: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div className="mt-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            AI 금시세
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onRetry();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                onRetry();
              }
            }}
            className="flex items-center gap-1 text-xs text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
          >
            <RefreshCw size={12} />
            다시 조회
          </span>
          {isExpanded ? (
            <ChevronUp size={14} className="text-amber-500" />
          ) : (
            <ChevronDown size={14} className="text-amber-500" />
          )}
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[500px]" : "max-h-0"
        }`}
      >
        <p className="px-4 pb-4 text-sm text-amber-900 dark:text-amber-100 whitespace-pre-wrap leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
}

function ErrorView({
  error,
  onRetry,
}: {
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="mt-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle size={14} className="text-red-500" />
        <span className="text-xs font-semibold text-red-600 dark:text-red-400">
          조회 실패
        </span>
      </div>
      <p className="text-sm text-red-700 dark:text-red-300 mb-2">
        {error ?? "알 수 없는 오류가 발생했습니다."}
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400"
      >
        <RefreshCw size={14} className="mr-1" />
        다시 시도
      </Button>
    </div>
  );
}
