"use client";

import { useState, Suspense, useRef, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { api, type Friend } from "@/lib/api";
import { FriendCards, FriendCardsSkeleton } from "./friend-cards";

const RELATION_FILTERS = ["전체", "친구", "직장", "가족", "기타"];

interface FriendsListProps {
  friendsPromise: Promise<Friend[]>;
}

export function FriendsList({ friendsPromise }: FriendsListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("전체");
  const [newName, setNewName] = useState("");
  const [newRelation, setNewRelation] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [localFriends, setLocalFriends] = useState<Friend[]>([]);
  const initialLoadDone = useRef(false);

  const handleFriendsLoaded = useCallback((friends: Friend[]) => {
    if (!initialLoadDone.current) {
      setLocalFriends(friends);
      initialLoadDone.current = true;
    }
  }, []);

  const handleAddFriend = async () => {
    try {
      const newFriend = await api.friends.create({
        name: newName,
        relation: newRelation,
      });
      setLocalFriends((prev) => [...prev, newFriend]);
      setNewName("");
      setNewRelation("");
      setDialogOpen(false);
    } catch {
      alert("지인 추가에 실패했습니다");
    }
  };

  // 로컬에 추가된 친구가 있으면 그걸 사용, 아니면 promise 사용
  const hasLocalAdditions = localFriends.length > 0 && initialLoadDone.current;

  return (
    <div className="flex flex-col px-5 pt-14 pb-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">지인 관리</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus size={16} className="mr-1" />
              추가
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[350px]">
            <DialogHeader>
              <DialogTitle>지인 추가</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  placeholder="이름을 입력하세요"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="relation">관계</Label>
                <Input
                  id="relation"
                  placeholder="예: 직장 동료, 고교 동창"
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                />
              </div>
              <Button
                onClick={handleAddFriend}
                disabled={!newName || !newRelation}
              >
                추가하기
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 검색 */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="이름으로 검색"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 필터 */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {RELATION_FILTERS.map((f) => (
          <Badge
            key={f}
            variant={filter === f ? "default" : "outline"}
            className="cursor-pointer shrink-0"
            onClick={() => setFilter(f)}
          >
            {f}
          </Badge>
        ))}
      </div>

      {/* 지인 목록 */}
      {hasLocalAdditions ? (
        <FriendCardsLocal
          friends={localFriends}
          search={search}
          filter={filter}
        />
      ) : (
        <Suspense fallback={<FriendCardsSkeleton />}>
          <FriendCards
            friendsPromise={friendsPromise}
            search={search}
            filter={filter}
            onFriendsLoaded={handleFriendsLoaded}
          />
        </Suspense>
      )}
    </div>
  );
}

// 로컬 상태용 컴포넌트 (새 친구 추가 후 사용)
import Link from "next/link";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

function FriendCardsLocal({
  friends,
  search,
  filter,
}: {
  friends: Friend[];
  search: string;
  filter: string;
}) {
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
        const totalAmount = friend.records.reduce((sum, r) => sum + r.amount, 0);
        const hasSentRecords = friend.sentRecords && friend.sentRecords.length > 0;
        return (
          <Link key={friend.id} href={`/dashboard/friends/${friend.id}`}>
            <Card className="p-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{friend.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {friend.relation}
                    </Badge>
                    {hasSentRecords && (
                      <CheckCircle2 size={14} className="text-green-500" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {friend.records.length}건 · {totalAmount.toLocaleString()}원
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
