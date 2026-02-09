"use client";

import { useReducer, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { revalidateFriendDetail, revalidateFriends } from "@/lib/actions";

// ─── State & Actions ───
interface SentRecordItemState {
  isEditing: boolean;
  amount: string;
  date: string;
  eventType: string;
  memo: string;
  isSaving: boolean;
  isDeleting: boolean;
}

type SentRecordItemAction =
  | { type: "START_EDITING" }
  | {
      type: "CANCEL_EDITING";
      payload: { amount: string; date: string; eventType: string; memo: string };
    }
  | { type: "SET_AMOUNT"; payload: string }
  | { type: "SET_DATE"; payload: string }
  | { type: "SET_EVENT_TYPE"; payload: string }
  | { type: "SET_MEMO"; payload: string }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_DELETING"; payload: boolean }
  | { type: "SAVE_SUCCESS" };

const sentRecordItemReducer = (
  state: SentRecordItemState,
  action: SentRecordItemAction
): SentRecordItemState => {
  switch (action.type) {
    case "START_EDITING":
      return { ...state, isEditing: true };
    case "CANCEL_EDITING":
      return {
        ...state,
        isEditing: false,
        amount: action.payload.amount,
        date: action.payload.date,
        eventType: action.payload.eventType,
        memo: action.payload.memo,
      };
    case "SET_AMOUNT":
      return { ...state, amount: action.payload };
    case "SET_DATE":
      return { ...state, date: action.payload };
    case "SET_EVENT_TYPE":
      return { ...state, eventType: action.payload };
    case "SET_MEMO":
      return { ...state, memo: action.payload };
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

interface UseSentRecordItemParams {
  recordId: string;
  friendId: string;
  initialAmount: number;
  initialDate: string;
  initialEventType: string;
  initialMemo: string | null;
}

export const useSentRecordItem = ({
  recordId,
  friendId,
  initialAmount,
  initialDate,
  initialEventType,
  initialMemo,
}: UseSentRecordItemParams) => {
  const router = useRouter();

  const dateStr = initialDate.split("T")[0];

  const [state, dispatch] = useReducer(sentRecordItemReducer, {
    isEditing: false,
    amount: initialAmount.toString(),
    date: dateStr,
    eventType: initialEventType,
    memo: initialMemo || "",
    isSaving: false,
    isDeleting: false,
  });

  const startEditing = useCallback(() => {
    dispatch({ type: "START_EDITING" });
  }, []);

  const cancelEditing = useCallback(() => {
    dispatch({
      type: "CANCEL_EDITING",
      payload: {
        amount: initialAmount.toString(),
        date: dateStr,
        eventType: initialEventType,
        memo: initialMemo || "",
      },
    });
  }, [initialAmount, dateStr, initialEventType, initialMemo]);

  const setAmount = useCallback((value: string) => {
    dispatch({ type: "SET_AMOUNT", payload: value });
  }, []);

  const setDate = useCallback((value: string) => {
    dispatch({ type: "SET_DATE", payload: value });
  }, []);

  const setEventType = useCallback((value: string) => {
    dispatch({ type: "SET_EVENT_TYPE", payload: value });
  }, []);

  const setMemo = useCallback((value: string) => {
    dispatch({ type: "SET_MEMO", payload: value });
  }, []);

  const handleSave = useCallback(async () => {
    dispatch({ type: "SET_SAVING", payload: true });

    try {
      await api.sentRecords.update(recordId, {
        amount: Number(state.amount),
        date: state.date,
        eventType: state.eventType,
        memo: state.memo || undefined,
      });
      await Promise.all([
        revalidateFriendDetail(friendId),
        revalidateFriends(),
      ]);
      dispatch({ type: "SAVE_SUCCESS" });
      toast.success("보낸 기록이 수정되었습니다");
      router.refresh();
    } catch {
      toast.error("수정에 실패했습니다");
      dispatch({ type: "SET_SAVING", payload: false });
    }
  }, [recordId, friendId, state.amount, state.date, state.eventType, state.memo, router]);

  const handleDelete = useCallback(async () => {
    dispatch({ type: "SET_DELETING", payload: true });

    try {
      await api.sentRecords.delete(recordId);
      await Promise.all([
        revalidateFriendDetail(friendId),
        revalidateFriends(),
      ]);
      toast.success("보낸 기록이 삭제되었습니다");
      router.refresh();
    } catch {
      toast.error("삭제에 실패했습니다");
      dispatch({ type: "SET_DELETING", payload: false });
    }
  }, [recordId, friendId, router]);

  return {
    ...state,
    startEditing,
    cancelEditing,
    setAmount,
    setDate,
    setEventType,
    setMemo,
    handleSave,
    handleDelete,
  };
};
