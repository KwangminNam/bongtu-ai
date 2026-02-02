"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { use } from "react";
import { api, type FriendDetail } from "@/lib/api";

const TYPE_LABEL: Record<string, string> = {
  WEDDING: "결혼",
  FUNERAL: "장례",
  BIRTHDAY: "생일/잔치",
  ETC: "기타",
};

export default function FriendDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [friend, setFriend] = useState<FriendDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.friends
      .get(id)
      .then(setFriend)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  if (!friend) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <p className="text-sm text-muted-foreground">지인을 찾을 수 없습니다</p>
      </div>
    );
  }

  const totalAmount = friend.records.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="flex flex-col px-5 pt-14 pb-4">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold">{friend.name}</h1>
          <p className="text-sm text-muted-foreground">{friend.relation}</p>
        </div>
      </div>

      {/* 요약 */}
      <Card className="p-4 mb-6">
        <div className="flex justify-around text-center">
          <div>
            <div className="text-xs text-muted-foreground mb-1">총 기록</div>
            <div className="font-bold text-base">{friend.records.length}건</div>
          </div>
          <Separator orientation="vertical" className="h-10" />
          <div>
            <div className="text-xs text-muted-foreground mb-1">총 금액</div>
            <div className="font-bold text-base">
              {totalAmount.toLocaleString()}원
            </div>
          </div>
        </div>
      </Card>

      {/* 타임라인 */}
      <h2 className="font-semibold mb-4">히스토리</h2>
      <div className="flex flex-col gap-3">
        {friend.records.map((record) => (
          <Card key={record.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {record.event.title}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {TYPE_LABEL[record.event.type] || record.event.type}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(record.event.date).toLocaleDateString("ko-KR")}
                </div>
              </div>
              <div className="font-semibold text-sm">
                {record.amount.toLocaleString()}원
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
