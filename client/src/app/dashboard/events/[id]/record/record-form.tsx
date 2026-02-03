"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BackButton } from "@/components/back-button";
import { api, type Friend } from "@/lib/api";
import { revalidateEventDetail, revalidateFriends } from "@/lib/actions";
import {
  ExistingFriendsList,
  ExistingFriendsListSkeleton,
} from "./existing-friends-list";

const AMOUNT_BADGES = [
  { value: 30000, label: "3만" },
  { value: 50000, label: "5만" },
  { value: 100000, label: "10만" },
  { value: 200000, label: "20만" },
];

const RELATION_SUGGESTIONS = ["친구", "직장 동료", "가족", "친척", "선후배", "지인"];

interface RecordFormProps {
  eventId: string;
  friendsPromise: Promise<Friend[]>;
}

interface NewFriend {
  name: string;
  relation: string;
}

export function RecordForm({ eventId, friendsPromise }: RecordFormProps) {
  const router = useRouter();

  // 금액
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");

  // 기존 지인 선택
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);

  // 새 지인 입력
  const [newFriends, setNewFriends] = useState<NewFriend[]>([]);
  const [newName, setNewName] = useState("");
  const [newRelation, setNewRelation] = useState("");

  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const amount = selectedAmount ?? (customAmount ? Number(customAmount) : 0);
  // 입력 중인 새 지인도 카운트에 포함
  const hasPendingNewFriend = newName.trim() && newRelation.trim();
  const totalPeople = selectedFriendIds.length + newFriends.length + (hasPendingNewFriend ? 1 : 0);

  const toggleExistingFriend = (friendId: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((fid) => fid !== friendId)
        : [...prev, friendId]
    );
  };

  const addNewFriend = () => {
    if (!newName.trim() || !newRelation.trim()) return;
    setNewFriends((prev) => [...prev, { name: newName.trim(), relation: newRelation.trim() }]);
    setNewName("");
    setNewRelation("");
  };

  const removeNewFriend = (index: number) => {
    setNewFriends((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (amount <= 0 || totalPeople === 0) return;

    setSubmitting(true);
    try {
      // 입력 중인 새 지인이 있으면 자동 추가
      const friendsToCreate = [...newFriends];
      if (newName.trim() && newRelation.trim()) {
        friendsToCreate.push({ name: newName.trim(), relation: newRelation.trim() });
      }

      // 1. 새 지인들 먼저 생성
      const createdFriendIds: string[] = [];
      for (const friend of friendsToCreate) {
        const created = await api.friends.create(friend);
        createdFriendIds.push(created.id);
      }

      // 2. 모든 지인 ID 합치기
      const allFriendIds = [...selectedFriendIds, ...createdFriendIds];

      // 3. 레코드 생성
      await api.records.create({
        amount,
        memo: memo || undefined,
        eventId,
        friendIds: allFriendIds,
      });

      // 4. 캐시 무효화
      await revalidateEventDetail(eventId);
      if (friendsToCreate.length > 0) {
        await revalidateFriends();
      }

      router.back();
    } catch {
      alert("기록 등록에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col px-5 pt-14 pb-4 h-full">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <h1 className="text-xl font-bold">기록 추가</h1>
      </div>

      {/* 1. 금액 선택 */}
      <div className="mb-6">
        <Label className="mb-3 block">금액 선택</Label>
        <div className="flex gap-2 flex-wrap mb-3">
          {AMOUNT_BADGES.map((badge) => (
            <Badge
              key={badge.value}
              variant={selectedAmount === badge.value ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm"
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

      {/* 2. 새 지인 입력 */}
      <div className="mb-6">
        <Label className="mb-3 block">지인 추가</Label>
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="이름"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="관계"
            value={newRelation}
            onChange={(e) => setNewRelation(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={addNewFriend}
            disabled={!newName.trim() || !newRelation.trim()}
          >
            <Plus size={18} />
          </Button>
        </div>

        {/* 관계 추천 */}
        <div className="flex gap-1 flex-wrap mb-3">
          {RELATION_SUGGESTIONS.map((rel) => (
            <Badge
              key={rel}
              variant="secondary"
              className="cursor-pointer text-xs"
              onClick={() => setNewRelation(rel)}
            >
              {rel}
            </Badge>
          ))}
        </div>

        {/* 추가된 새 지인 목록 */}
        {newFriends.length > 0 && (
          <div className="flex flex-col gap-2 mb-3">
            {newFriends.map((friend, index) => (
              <Card key={index} className="p-3 border-primary bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{friend.name}</div>
                    <div className="text-xs text-muted-foreground">{friend.relation}</div>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => removeNewFriend(index)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 3. 기존 지인 선택 */}
      <Suspense fallback={<ExistingFriendsListSkeleton />}>
        <ExistingFriendsList
          friendsPromise={friendsPromise}
          selectedFriendIds={selectedFriendIds}
          onToggle={toggleExistingFriend}
        />
      </Suspense>

      {/* 4. 메모 */}
      <div className="mb-6">
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

      {/* 제출 */}
      <div className="mt-auto pt-4">
        {amount > 0 && totalPeople > 0 && (
          <p className="text-sm text-center text-muted-foreground mb-3">
            {totalPeople}명 x {amount.toLocaleString()}원 ={" "}
            <span className="font-semibold text-foreground">
              {(amount * totalPeople).toLocaleString()}원
            </span>
          </p>
        )}
        <Button
          className="w-full h-12 text-base"
          disabled={amount <= 0 || totalPeople === 0 || submitting}
          onClick={handleSubmit}
        >
          {submitting
            ? "등록 중..."
            : totalPeople > 0
              ? `${totalPeople}명 등록`
              : "기록 등록"}
        </Button>
      </div>
    </div>
  );
}
