"use client";

import { useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Each } from "react-flowify";
import { RELATION_SUGGESTIONS } from "@/lib/constants";
import { api, type Friend } from "@/lib/api";

interface AddFriendDialogProps {
  onFriendAdded: (friend: Friend) => void;
}

export function AddFriendDialog({ onFriendAdded }: AddFriendDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");

  const handleAdd = async () => {
    try {
      const newFriend = await api.friends.create({ name, relation });
      onFriendAdded(newFriend);
      setName("");
      setRelation("");
      setOpen(false);
    } catch {
      alert("지인 추가에 실패했습니다");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-full shadow-md">
          <Plus size={16} className="mr-1" />
          추가
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[350px] rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <UserPlus size={20} className="text-primary-foreground" />
            </div>
            <DialogTitle className="text-lg">지인 추가</DialogTitle>
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-sm font-medium">이름</Label>
            <Input
              id="name"
              placeholder="이름을 입력하세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="relation" className="text-sm font-medium">관계</Label>
            <Input
              id="relation"
              placeholder="예: 직장 동료, 고교 동창"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className="h-11 rounded-xl"
            />
            <div className="flex gap-1.5 flex-wrap mt-1">
              <Each items={RELATION_SUGGESTIONS}>
                {(rel) => (
                  <button
                    key={rel}
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      relation === rel
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-accent"
                    }`}
                    onClick={() => setRelation(rel)}
                  >
                    {rel}
                  </button>
                )}
              </Each>
            </div>
          </div>
          <Button
            onClick={handleAdd}
            disabled={!name || !relation}
            className="h-12 rounded-xl font-semibold"
          >
            추가하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
