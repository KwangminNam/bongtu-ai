"use client";

import { Pencil, Trash2, X, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LogScreen } from "@/lib/logging";
import { useFriendEdit } from "../_hooks/useFriendEdit";

interface FriendDetailHeaderProps {
  friendId: string;
  name: string;
  relation: string;
}

export function FriendDetailHeader({
  friendId,
  name,
  relation,
}: FriendDetailHeaderProps) {
  const {
    isEditing,
    name: editName,
    relation: editRelation,
    isSaving,
    isDeleting,
    startEditing,
    cancelEditing,
    setName,
    setRelation,
    handleSave,
    handleDelete,
  } = useFriendEdit({
    friendId,
    initialName: name,
    initialRelation: relation,
  });

  if (isDeleting) {
    return (
      <LogScreen params={{ friendId }}>
        <div className="flex items-center gap-2">
          <Loader2 size={18} className="animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">삭제 중...</span>
        </div>
      </LogScreen>
    );
  }

  if (isEditing) {
    return (
      <LogScreen params={{ friendId }}>
        <div className="flex items-center gap-2 flex-1">
          <div className="flex flex-col gap-1.5 flex-1">
            <Input
              value={editName}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름"
              className="h-8 text-sm"
              disabled={isSaving}
              autoFocus
            />
            <Input
              value={editRelation}
              onChange={(e) => setRelation(e.target.value)}
              placeholder="관계"
              className="h-8 text-sm"
              disabled={isSaving}
            />
          </div>
          <div className="flex gap-1">
            {isSaving ? (
              <Loader2 size={16} className="animate-spin text-muted-foreground" />
            ) : (
              <>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={cancelEditing}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X size={16} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSave}
                  disabled={!editName.trim()}
                  className="p-2 rounded-full hover:bg-muted transition-colors text-blue-600"
                >
                  <Check size={16} />
                </motion.button>
              </>
            )}
          </div>
        </div>
      </LogScreen>
    );
  }

  return (
    <LogScreen params={{ friendId }}>
      <div className="flex items-center gap-2 flex-1">
        <div>
          <h1 className="text-xl font-bold">{name}</h1>
          <p className="text-sm text-muted-foreground">{relation}</p>
        </div>
        <div className="flex gap-0.5 ml-auto">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={startEditing}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <Pencil size={14} className="text-muted-foreground" />
          </motion.button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.85 }}
                className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 size={14} className="text-red-500" />
              </motion.button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>지인 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  {name}님을 삭제하시겠습니까? 관련된 보낸 기록도 함께
                  삭제됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">취소</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="rounded-xl bg-red-500 hover:bg-red-600"
                >
                  삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </LogScreen>
  );
}
