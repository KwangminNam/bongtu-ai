"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { revalidateFriendDetail } from "@/lib/actions";

const EVENT_TYPES = [
  { value: "WEDDING", label: "결혼" },
  { value: "FUNERAL", label: "장례" },
  { value: "BIRTHDAY", label: "생일/잔치" },
  { value: "ETC", label: "기타" },
];

const AMOUNT_BADGES = [
  { value: 30000, label: "3만" },
  { value: 50000, label: "5만" },
  { value: 100000, label: "10만" },
  { value: 200000, label: "20만" },
];

interface SentRecordFormProps {
  friendId: string;
  friendName: string;
}

export function SentRecordForm({ friendId, friendName }: SentRecordFormProps) {
  const [open, setOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [eventType, setEventType] = useState("WEDDING");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const amount = selectedAmount ?? (customAmount ? Number(customAmount) : 0);

  const handleSubmit = async () => {
    if (amount <= 0) return;

    setSubmitting(true);
    try {
      await api.sentRecords.create({
        amount,
        date,
        eventType,
        memo: memo || undefined,
        friendId,
      });

      await revalidateFriendDetail(friendId);

      // Reset form
      setSelectedAmount(null);
      setCustomAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setEventType("WEDDING");
      setMemo("");
      setOpen(false);
    } catch {
      alert("등록에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus size={14} className="mr-1" />
          보낸 기록 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[360px]">
        <DialogHeader>
          <DialogTitle>{friendName}에게 보낸 기록</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* 금액 선택 */}
          <div>
            <Label className="mb-2 block">금액</Label>
            <div className="flex gap-2 flex-wrap mb-2">
              {AMOUNT_BADGES.map((badge) => (
                <Badge
                  key={badge.value}
                  variant={selectedAmount === badge.value ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1.5 text-sm"
                  onClick={() => {
                    setSelectedAmount(badge.value);
                    setCustomAmount("");
                  }}
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
            <Input
              placeholder="직접 입력 (원)"
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(null);
              }}
            />
          </div>

          {/* 날짜 */}
          <div>
            <Label htmlFor="date" className="mb-2 block">
              날짜
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* 행사 유형 */}
          <div>
            <Label className="mb-2 block">행사 유형</Label>
            <div className="flex gap-2 flex-wrap">
              {EVENT_TYPES.map((type) => (
                <Badge
                  key={type.value}
                  variant={eventType === type.value ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1.5 text-sm"
                  onClick={() => setEventType(type.value)}
                >
                  {type.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* 메모 */}
          <div>
            <Label htmlFor="memo" className="mb-2 block">
              메모 (선택)
            </Label>
            <Input
              id="memo"
              placeholder="메모를 입력하세요"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            disabled={amount <= 0 || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "등록 중..." : `${amount.toLocaleString()}원 등록`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
