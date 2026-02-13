"use client";

import { useReducer, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { revalidateEventDetail, revalidateDashboard } from "@/lib/actions";
import type { GoldKarat } from "@/lib/types";

// ─── Gold Memo Utils ───
type GoldQuantities = Record<GoldKarat, number>;

const INITIAL_GOLD_QUANTITIES: GoldQuantities = { "24K": 0, "18K": 0, "14K": 0 };
const KARATS: GoldKarat[] = ["24K", "18K", "14K"];

export function parseGoldMemo(memo: string | null): {
  goldQuantities: GoldQuantities;
  userMemo: string;
} {
  if (!memo) return { goldQuantities: INITIAL_GOLD_QUANTITIES, userMemo: "" };

  const [goldPart, ...rest] = memo.split(" - ");
  const userMemo = rest.join(" - ").trim();

  const quantities: GoldQuantities = { ...INITIAL_GOLD_QUANTITIES };
  for (const karat of KARATS) {
    const match = goldPart.match(new RegExp(`${karat}\\s+(\\d+)개`));
    if (match) {
      quantities[karat] = Number(match[1]);
    }
  }

  const hasAnyGold = KARATS.some((k) => quantities[k] > 0);
  if (!hasAnyGold) return { goldQuantities: INITIAL_GOLD_QUANTITIES, userMemo: memo };

  return { goldQuantities: quantities, userMemo };
}

export function buildGoldMemo(goldQuantities: GoldQuantities, userMemo: string): string {
  const parts: string[] = [];
  for (const k of KARATS) {
    if (goldQuantities[k] > 0) {
      parts.push(`${k} ${goldQuantities[k]}개`);
    }
  }
  const goldSummary = parts.join(", ");
  if (!goldSummary) return userMemo;
  return userMemo ? `${goldSummary} - ${userMemo}` : goldSummary;
}

// ─── State & Actions ───
interface RecordItemState {
  isEditing: boolean;
  amount: string;
  memo: string;
  goldQuantities: GoldQuantities;
  isDeleting: boolean;
  isSaving: boolean;
}

type RecordItemAction =
  | { type: "START_EDITING" }
  | {
      type: "CANCEL_EDITING";
      payload: { amount: string; memo: string; goldQuantities: GoldQuantities };
    }
  | { type: "SET_AMOUNT"; payload: string }
  | { type: "SET_MEMO"; payload: string }
  | { type: "SET_GOLD_QUANTITY"; payload: { karat: GoldKarat; quantity: number } }
  | { type: "SET_DELETING"; payload: boolean }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SAVE_SUCCESS" };

const recordItemReducer = (
  state: RecordItemState,
  action: RecordItemAction
): RecordItemState => {
  switch (action.type) {
    case "START_EDITING":
      return { ...state, isEditing: true };
    case "CANCEL_EDITING":
      return {
        ...state,
        isEditing: false,
        amount: action.payload.amount,
        memo: action.payload.memo,
        goldQuantities: action.payload.goldQuantities,
      };
    case "SET_AMOUNT":
      return { ...state, amount: action.payload };
    case "SET_MEMO":
      return { ...state, memo: action.payload };
    case "SET_GOLD_QUANTITY":
      return {
        ...state,
        goldQuantities: {
          ...state.goldQuantities,
          [action.payload.karat]: Math.max(0, action.payload.quantity),
        },
      };
    case "SET_DELETING":
      return { ...state, isDeleting: action.payload };
    case "SET_SAVING":
      return { ...state, isSaving: action.payload };
    case "SAVE_SUCCESS":
      return { ...state, isEditing: false, isSaving: false };
    default:
      return action satisfies never;
  }
};

interface UseRecordItemParams {
  recordId: string;
  eventId: string;
  initialAmount: number;
  initialMemo: string | null;
  friendName: string;
  giftType: string;
}

export const useRecordItem = ({
  recordId,
  eventId,
  initialAmount,
  initialMemo,
  friendName,
  giftType,
}: UseRecordItemParams) => {
  const router = useRouter();
  const isGold = giftType === "gold";

  const { goldQuantities: initialGoldQuantities, userMemo: initialUserMemo } = isGold
    ? parseGoldMemo(initialMemo)
    : { goldQuantities: INITIAL_GOLD_QUANTITIES, userMemo: initialMemo || "" };

  const [state, dispatch] = useReducer(recordItemReducer, {
    isEditing: false,
    amount: initialAmount.toString(),
    memo: isGold ? initialUserMemo : initialMemo || "",
    goldQuantities: initialGoldQuantities,
    isDeleting: false,
    isSaving: false,
  });

  const startEditing = useCallback(() => {
    dispatch({ type: "START_EDITING" });
  }, []);

  const cancelEditing = useCallback(() => {
    dispatch({
      type: "CANCEL_EDITING",
      payload: {
        amount: initialAmount.toString(),
        memo: isGold ? initialUserMemo : initialMemo || "",
        goldQuantities: initialGoldQuantities,
      },
    });
  }, [initialAmount, initialMemo, initialGoldQuantities, initialUserMemo, isGold]);

  const setAmount = useCallback((value: string) => {
    dispatch({ type: "SET_AMOUNT", payload: value });
  }, []);

  const setMemo = useCallback((value: string) => {
    dispatch({ type: "SET_MEMO", payload: value });
  }, []);

  const setGoldQuantity = useCallback((karat: GoldKarat, quantity: number) => {
    dispatch({ type: "SET_GOLD_QUANTITY", payload: { karat, quantity } });
  }, []);

  const totalGoldCount =
    state.goldQuantities["24K"] +
    state.goldQuantities["18K"] +
    state.goldQuantities["14K"];

  const handleSave = useCallback(async () => {
    dispatch({ type: "SET_SAVING", payload: true });

    try {
      const saveAmount = isGold ? totalGoldCount : Number(state.amount);
      const saveMemo = isGold
        ? buildGoldMemo(state.goldQuantities, state.memo) || undefined
        : state.memo || undefined;

      await api.records.update(recordId, {
        amount: saveAmount,
        memo: saveMemo,
      });
      await Promise.all([revalidateEventDetail(eventId), revalidateDashboard()]);
      dispatch({ type: "SAVE_SUCCESS" });
      toast.success("내역이 수정되었습니다");
      router.refresh();
    } catch {
      toast.error("수정에 실패했습니다");
      dispatch({ type: "SET_SAVING", payload: false });
    }
  }, [recordId, eventId, state.amount, state.memo, state.goldQuantities, isGold, totalGoldCount, router]);

  const handleDelete = useCallback(async () => {
    dispatch({ type: "SET_DELETING", payload: true });

    try {
      await api.records.delete(recordId);
      await Promise.all([revalidateEventDetail(eventId), revalidateDashboard()]);
      toast.success(`${friendName}님의 내역이 삭제되었습니다`);
      router.refresh();
    } catch {
      toast.error("삭제에 실패했습니다");
      dispatch({ type: "SET_DELETING", payload: false });
    }
  }, [recordId, eventId, friendName, router]);

  return {
    ...state,
    totalGoldCount,
    startEditing,
    cancelEditing,
    setAmount,
    setMemo,
    setGoldQuantity,
    handleSave,
    handleDelete,
  };
};
