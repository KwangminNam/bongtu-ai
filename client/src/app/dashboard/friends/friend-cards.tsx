"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Friend } from "@/lib/api";

interface FriendCardsProps {
  friendsPromise: Promise<Friend[]>;
  search: string;
  filter: string;
  onFriendsLoaded: (friends: Friend[]) => void;
}

export function FriendCards({
  friendsPromise,
  search,
  filter,
  onFriendsLoaded,
}: FriendCardsProps) {
  const friends = use(friendsPromise);

  // 부모에게 로드된 데이터 전달 (새 지인 추가 시 필요)
  useEffect(() => {
    onFriendsLoaded(friends);
  }, [friends, onFriendsLoaded]);

  const filtered = friends.filter((f) => {
    const matchSearch = f.name.includes(search);
    const matchFilter = filter === "전체" || f.relation.includes(filter);
    return matchSearch && matchFilter;
  });

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-10">
        {friends.length === 0 ? "등록된 지인이 없습니다" : "검색 결과가 없습니다"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {filtered.map((friend) => {
        const totalAmount = friend.records.reduce(
          (sum, r) => sum + r.amount,
          0
        );
        const hasSentRecords = friend.sentRecords && friend.sentRecords.length > 0;
        return (
          <Link key={friend.id} href={`/dashboard/friends/${friend.id}`}>
            <Card className="p-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {friend.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {friend.relation}
                    </Badge>
                    {hasSentRecords && (
                      <CheckCircle2 size={14} className="text-green-500" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {friend.records.length}건 ·{" "}
                    {totalAmount.toLocaleString()}원
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

export function FriendCardsSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-4 animate-pulse">
          <div className="h-12 bg-muted rounded" />
        </Card>
      ))}
    </div>
  );
}
