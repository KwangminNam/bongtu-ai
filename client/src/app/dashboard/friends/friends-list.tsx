"use client";

import { useState, useRef, useCallback } from "react";
import { AsyncBoundary, Use, Each, Show } from "react-flowify";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Friend } from "@/lib/api";
import { LogScreen } from "@/lib/logging";
import { AddFriendDialog } from "./add-friend-dialog";
import { FriendCards, FriendCardsSkeleton } from "./friend-cards";

const RELATION_FILTERS = ["전체", "친구", "직장", "가족", "기타"];

interface FriendsListProps {
  friendsPromise: Promise<Friend[]>;
}

export function FriendsList({ friendsPromise }: FriendsListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("전체");
  const [localFriends, setLocalFriends] = useState<Friend[]>([]);
  const initialLoadDone = useRef(false);

  const handleFriendsLoaded = useCallback((friends: Friend[]) => {
    if (!initialLoadDone.current) {
      setLocalFriends(friends);
      initialLoadDone.current = true;
    }
  }, []);

  const handleFriendAdded = useCallback((friend: Friend) => {
    setLocalFriends((prev) => [...prev, friend]);
  }, []);

  const hasLocalAdditions = localFriends.length > 0 && initialLoadDone.current;

  return (
    <LogScreen>
    <div className="flex flex-col px-5 pt-14 pb-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">지인 관리</h1>
          <p className="text-sm text-muted-foreground mt-0.5">소중한 인연을 관리하세요</p>
        </div>
        <AddFriendDialog onFriendAdded={handleFriendAdded} />
      </div>

      {/* 검색 */}
      <div className="relative mb-4">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
          <Search size={14} className="text-muted-foreground" />
        </div>
        <Input
          placeholder="이름으로 검색"
          className="pl-14 h-12 rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 필터 */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        <Each items={RELATION_FILTERS}>
          {(f) => (
            <button
              key={f}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shrink-0 ${
                filter === f
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          )}
        </Each>
      </div>

      {/* 지인 목록 */}
      <Show when={hasLocalAdditions} fallback={
        <AsyncBoundary
          suspense={{ fallback: <FriendCardsSkeleton /> }}
          errorBoundary={{ fallback: <p className="text-sm text-muted-foreground text-center py-10">데이터를 불러오지 못했습니다</p> }}
        >
          <Use promise={friendsPromise}>
            {(friends) => (
              <FriendCards
                friends={friends}
                search={search}
                filter={filter}
                onFriendsLoaded={handleFriendsLoaded}
              />
            )}
          </Use>
        </AsyncBoundary>
      }>
        <FriendCards
          friends={localFriends}
          search={search}
          filter={filter}
        />
      </Show>
    </div>
    </LogScreen>
  );
}
