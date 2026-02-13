"use client";

import { type ReactNode } from "react";
import { Wallet, Minus, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RECEIVED_AMOUNT_BADGES, GOLD_KARAT_OPTIONS } from "@/lib/constants";
import type { GoldKarat } from "@/lib/types";
import { AmountContext, useAmountContext, useAmount } from "../_hooks";
import { GoldPriceAI } from "./gold-price-ai";

// ─── Root (Provider only) ───
interface AmountSelectionProps {
  children: ReactNode;
}

function AmountSelectionRoot({ children }: AmountSelectionProps) {
  const amount = useAmount();

  return (
    <AmountContext.Provider value={amount}>{children}</AmountContext.Provider>
  );
}

// ─── Card Wrapper ───
interface CardProps {
  children: ReactNode;
}

function AmountCard({ children }: CardProps) {
  return (
    <Card className="p-4 mb-4 border shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
          <Wallet size={16} className="text-primary-foreground" />
        </div>
        <Label className="text-sm font-semibold">금액 선택</Label>
      </div>
      {children}
    </Card>
  );
}

// ─── TypeToggle ───
function TypeToggle() {
  const { giftType, setGiftType } = useAmountContext();

  return (
    <div className="flex gap-2 mb-4">
      <button
        type="button"
        onClick={() => setGiftType("cash")}
        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          giftType === "cash"
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        💵 현금
      </button>
      <button
        type="button"
        onClick={() => setGiftType("gold")}
        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          giftType === "gold"
            ? "bg-amber-500 text-white"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        🥇 금
      </button>
    </div>
  );
}

// ─── CashSelector ───
function CashSelector() {
  const { giftType, selectedAmount, customAmount, selectAmount, setCustomAmount } =
    useAmountContext();

  if (giftType !== "cash") return null;

  return (
    <>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {RECEIVED_AMOUNT_BADGES.map((badge) => (
          <button
            key={badge.value}
            type="button"
            className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              selectedAmount === badge.value
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
            onClick={() => selectAmount(badge.value)}
          >
            {badge.label}
          </button>
        ))}
      </div>
      <div className="relative">
        <Input
          placeholder="직접 입력"
          type="number"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          className="pr-10 h-11 rounded-xl"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          원
        </span>
      </div>
    </>
  );
}

// ─── GoldSelector ───
function GoldSelector() {
  const { giftType, goldQuantities, setGoldQuantity } = useAmountContext();

  if (giftType !== "gold") return null;

  return (
    <div className="space-y-2">
      {GOLD_KARAT_OPTIONS.map((option) => (
        <GoldKaratRow
          key={option.value}
          karat={option.value}
          label={option.label}
          description={option.description}
          quantity={goldQuantities[option.value]}
          onChange={(qty) => setGoldQuantity(option.value, qty)}
        />
      ))}
    </div>
  );
}

interface GoldKaratRowProps {
  karat: GoldKarat;
  label: string;
  description: string;
  quantity: number;
  onChange: (quantity: number) => void;
}

function GoldKaratRow({ label, description, quantity, onChange }: GoldKaratRowProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
      <div>
        <span className="text-sm font-semibold">{label}</span>
        <span className="ml-1.5 text-xs text-muted-foreground">{description}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(quantity - 1)}
          disabled={quantity <= 0}
          className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-700 dark:text-amber-300 disabled:opacity-30 transition-opacity"
        >
          <Minus size={14} />
        </button>
        <span className="w-6 text-center text-sm font-bold tabular-nums">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => onChange(quantity + 1)}
          className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Export Compound Component ───
export const AmountSelection = Object.assign(AmountSelectionRoot, {
  Card: AmountCard,
  TypeToggle,
  CashSelector,
  GoldSelector,
  GoldPriceAI,
  useContext: useAmountContext,
});
