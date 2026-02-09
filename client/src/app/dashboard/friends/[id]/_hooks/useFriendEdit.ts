"use client";

import { useReducer, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { revalidateFriendDetail, revalidateFriends } from "@/lib/actions";

// ─── State & Actions ───
interface FriendEditState {
  isEditing: boolean;
  name: string;
  relation: string;
  isSaving: boolean;
  isDeleting: boolean;
}

type FriendEditAction =
  | { type: "START_EDITING" }
  | { type: "CANCEL_EDITING"; payload: { name: string; relation: string } }
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_RELATION"; payload: string }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_DELETING"; payload: boolean }
  | { type: "SAVE_SUCCESS" };

const friendEditReducer = (
  state: FriendEditState,
  action: FriendEditAction
): FriendEditState => {
  switch (action.type) {
    case "START_EDITING":
      return { ...state, isEditing: true };
    case "CANCEL_EDITING":
      return {
        ...state,
        isEditing: false,
        name: action.payload.name,
        relation: action.payload.relation,
      };
    case "SET_NAME":
      return { ...state, name: action.payload };
    case "SET_RELATION":
      return { ...state, relation: action.payload };
    case "SET_SAVING":
      return { ...state, isSaving: action.payload };
    case "SET_DELETING":
      return { ...state, isDeleting: action.payload };
    case "SAVE_SUCCESS":
      return { ...state, isEditing: false, isSaving: false };
    default:
      return action satisfies never;
  }
};

interface UseFriendEditParams {
  friendId: string;
  initialName: string;
  initialRelation: string;
}

export const useFriendEdit = ({
  friendId,
  initialName,
  initialRelation,
}: UseFriendEditParams) => {
  const router = useRouter();

  const [state, dispatch] = useReducer(friendEditReducer, {
    isEditing: false,
    name: initialName,
    relation: initialRelation,
    isSaving: false,
    isDeleting: false,
  });

  const startEditing = useCallback(() => {
    dispatch({ type: "START_EDITING" });
  }, []);

  const cancelEditing = useCallback(() => {
    dispatch({
      type: "CANCEL_EDITING",
      payload: { name: initialName, relation: initialRelation },
    });
  }, [initialName, initialRelation]);

  const setName = useCallback((value: string) => {
    dispatch({ type: "SET_NAME", payload: value });
  }, []);

  const setRelation = useCallback((value: string) => {
    dispatch({ type: "SET_RELATION", payload: value });
  }, []);

  const handleSave = useCallback(async () => {
    if (!state.name.trim()) return;

    dispatch({ type: "SET_SAVING", payload: true });

    try {
      await api.friends.update(friendId, {
        name: state.name.trim(),
        relation: state.relation.trim(),
      });
      await Promise.all([
        revalidateFriendDetail(friendId),
        revalidateFriends(),
      ]);
      dispatch({ type: "SAVE_SUCCESS" });
      toast.success("지인 정보가 수정되었습니다");
      router.refresh();
    } catch {
      toast.error("수정에 실패했습니다");
      dispatch({ type: "SET_SAVING", payload: false });
    }
  }, [friendId, state.name, state.relation, router]);

  const handleDelete = useCallback(async () => {
    dispatch({ type: "SET_DELETING", payload: true });

    try {
      await api.friends.delete(friendId);
      await revalidateFriends();
      toast.success("지인이 삭제되었습니다");
      router.push("/dashboard/friends");
      router.refresh();
    } catch {
      toast.error("삭제에 실패했습니다");
      dispatch({ type: "SET_DELETING", payload: false });
    }
  }, [friendId, router]);

  return {
    ...state,
    startEditing,
    cancelEditing,
    setName,
    setRelation,
    handleSave,
    handleDelete,
  };
};
