"use client";

import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatAmount } from "@/lib/utils";
import type { GiftType } from "@/lib/types";

interface RecordSummaryProps {
  totalPeople: number;
  amount: number;
  giftType?: GiftType;
}

export function RecordSummary({ totalPeople, amount, giftType }: RecordSummaryProps) {
  if (amount <= 0 || totalPeople <= 0) return null;

  const unit = formatAmount(amount, giftType);
  const total = formatAmount(amount * totalPeople, giftType);

  return (
    <Card className="p-4 mb-4 border bg-accent">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Users size={14} className="text-primary-foreground" />
          </div>
          <span className="text-sm text-muted-foreground">
            {totalPeople}명 × {unit}
          </span>
        </div>
        <div className="text-lg font-bold text-primary">
          {total}
        </div>
      </div>
    </Card>
  );
}
