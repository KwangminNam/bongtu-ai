"use client";

import { useReducer, useCallback, useMemo, createContext, useContext } from "react";
import type { GiftType, GoldKarat } from "@/lib/types";

// ─── State & Actions ───
type GoldQuantities = Record<GoldKarat, number>;

interface AmountState {
  giftType: GiftType;
  selectedAmount: number | null;
  customAmount: string;
  goldQuantities: GoldQuantities;
}

type AmountAction =
  | { type: "SET_GIFT_TYPE"; payload: GiftType }
  | { type: "SELECT_AMOUNT"; payload: number }
  | { type: "SET_CUSTOM_AMOUNT"; payload: string }
  | { type: "SET_GOLD_QUANTITY"; payload: { karat: GoldKarat; quantity: number } };

const INITIAL_GOLD_QUANTITIES: GoldQuantities = {
  "24K": 0,
  "18K": 0,
  "14K": 0,
};

const initialState: AmountState = {
  giftType: "cash",
  selectedAmount: null,
  customAmount: "",
  goldQuantities: INITIAL_GOLD_QUANTITIES,
};

const amountReducer = (state: AmountState, action: AmountAction): AmountState => {
  switch (action.type) {
    case "SET_GIFT_TYPE":
      return { ...state, giftType: action.payload };
    case "SELECT_AMOUNT":
      return { ...state, selectedAmount: action.payload, customAmount: "" };
    case "SET_CUSTOM_AMOUNT":
      return { ...state, customAmount: action.payload, selectedAmount: null };
    case "SET_GOLD_QUANTITY":
      return {
        ...state,
        goldQuantities: {
          ...state.goldQuantities,
          [action.payload.karat]: Math.max(0, action.payload.quantity),
        },
      };
    default:
      return action satisfies never;
  }
};

// ─── Context ───
interface AmountContextValue {
  giftType: GiftType;
  setGiftType: (type: GiftType) => void;
  selectedAmount: number | null;
  customAmount: string;
  selectAmount: (value: number) => void;
  setCustomAmount: (value: string) => void;
  goldQuantities: GoldQuantities;
  totalGoldCount: number;
  goldSummary: string;
  setGoldQuantity: (karat: GoldKarat, quantity: number) => void;
  amount: number;
}

export const AmountContext = createContext<AmountContextValue | null>(null);

export const useAmountContext = () => {
  const context = useContext(AmountContext);
  if (!context) {
    throw new Error("useAmountContext must be used within AmountProvider");
  }
  return context;
};

export const useAmount = () => {
  const [state, dispatch] = useReducer(amountReducer, initialState);

  const setGiftType = useCallback((type: GiftType) => {
    dispatch({ type: "SET_GIFT_TYPE", payload: type });
  }, []);

  const selectAmount = useCallback((value: number) => {
    dispatch({ type: "SELECT_AMOUNT", payload: value });
  }, []);

  const setCustomAmount = useCallback((value: string) => {
    dispatch({ type: "SET_CUSTOM_AMOUNT", payload: value });
  }, []);

  const setGoldQuantity = useCallback((karat: GoldKarat, quantity: number) => {
    dispatch({ type: "SET_GOLD_QUANTITY", payload: { karat, quantity } });
  }, []);

  const cashAmount =
    state.selectedAmount ?? (state.customAmount ? Number(state.customAmount) : 0);

  const totalGoldCount = useMemo(
    () =>
      state.goldQuantities["24K"] +
      state.goldQuantities["18K"] +
      state.goldQuantities["14K"],
    [state.goldQuantities]
  );

  const goldSummary = useMemo(() => {
    const parts: string[] = [];
    const karats: GoldKarat[] = ["24K", "18K", "14K"];
    for (const k of karats) {
      if (state.goldQuantities[k] > 0) {
        parts.push(`${k} ${state.goldQuantities[k]}개`);
      }
    }
    return parts.join(", ");
  }, [state.goldQuantities]);

  const amount = state.giftType === "cash" ? cashAmount : totalGoldCount;

  return {
    giftType: state.giftType,
    setGiftType,
    selectedAmount: state.selectedAmount,
    customAmount: state.customAmount,
    selectAmount,
    setCustomAmount,
    goldQuantities: state.goldQuantities,
    totalGoldCount,
    goldSummary,
    setGoldQuantity,
    amount,
  };
};
