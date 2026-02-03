"use client";

import { use } from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { Friend } from "@/lib/api";

interface ExistingFriendsListProps {
  friendsPromise: Promise<Friend[]>;
  selectedFriendIds: string[];
  onToggle: (friendId: string) => void;
}

export function ExistingFriendsList({
  friendsPromise,
  selectedFriendIds,
  onToggle,
}: ExistingFriendsListProps) {
  const existingFriends = use(friendsPromise);

  if (existingFriends.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <Label className="mb-3 block">
        기존 지인에서 선택{" "}
        <span className="text-muted-foreground font-normal">
          ({selectedFriendIds.length}명 선택)
        </span>
      </Label>
      <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
        {existingFriends.map((friend) => {
          const isSelected = selectedFriendIds.includes(friend.id);
          return (
            <Card
              key={friend.id}
              className={`p-3 cursor-pointer transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "hover:bg-accent/50"
              }`}
              onClick={() => onToggle(friend.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{friend.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {friend.relation}
                  </div>
                </div>
                {isSelected && <Check size={16} className="text-primary" />}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function ExistingFriendsListSkeleton() {
  return (
    <div className="mb-6">
      <div className="h-5 w-32 bg-muted rounded animate-pulse mb-3" />
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-3 animate-pulse">
            <div className="h-10 bg-muted rounded" />
          </Card>
        ))}
      </div>
    </div>
  );
}
