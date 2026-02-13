"use client";

import { Minus, Plus } from "lucide-react";
import { GOLD_KARAT_OPTIONS } from "@/lib/constants";
import type { GoldKarat } from "@/lib/types";

type GoldQuantities = Record<GoldKarat, number>;

interface GoldEditSelectorProps {
  goldQuantities: GoldQuantities;
  onQuantityChange: (karat: GoldKarat, quantity: number) => void;
  disabled?: boolean;
}

export function GoldEditSelector({
  goldQuantities,
  onQuantityChange,
  disabled,
}: GoldEditSelectorProps) {
  return (
    <div className="space-y-1.5">
      {GOLD_KARAT_OPTIONS.map((option) => (
        <div
          key={option.value}
          className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20"
        >
          <div>
            <span className="text-xs font-semibold">{option.label}</span>
            <span className="ml-1 text-[10px] text-muted-foreground">
              {option.description}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                onQuantityChange(option.value, goldQuantities[option.value] - 1)
              }
              disabled={disabled || goldQuantities[option.value] <= 0}
              className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-700 dark:text-amber-300 disabled:opacity-30 transition-opacity"
            >
              <Minus size={12} />
            </button>
            <span className="w-5 text-center text-xs font-bold tabular-nums">
              {goldQuantities[option.value]}
            </span>
            <button
              type="button"
              onClick={() =>
                onQuantityChange(option.value, goldQuantities[option.value] + 1)
              }
              disabled={disabled}
              className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-white disabled:opacity-30 transition-opacity"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
