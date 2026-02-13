"use client";

import { useReducer, useCallback, useRef } from "react";

// ─── State & Actions ───
type GoldPriceStatus = "idle" | "loading" | "streaming" | "done" | "error";

interface GoldPriceState {
  status: GoldPriceStatus;
  content: string;
  error: string | null;
}

type GoldPriceAction =
  | { type: "START" }
  | { type: "STREAM_START" }
  | { type: "STREAM_CHUNK"; payload: string }
  | { type: "DONE" }
  | { type: "ERROR"; payload: string }
  | { type: "RESET" };

const initialState: GoldPriceState = {
  status: "idle",
  content: "",
  error: null,
};

const goldPriceReducer = (
  state: GoldPriceState,
  action: GoldPriceAction
): GoldPriceState => {
  switch (action.type) {
    case "START":
      return { status: "loading", content: "", error: null };
    case "STREAM_START":
      return { ...state, status: "streaming" };
    case "STREAM_CHUNK":
      return { ...state, content: action.payload };
    case "DONE":
      return { ...state, status: "done" };
    case "ERROR":
      return { status: "error", content: "", error: action.payload };
    case "RESET":
      return initialState;
    default:
      return action satisfies never;
  }
};

// ─── Hook ───
function buildGoldPricePrompt(eventDate: string | null): string {
  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const eventDateFormatted = eventDate
    ? new Date(eventDate).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const hasEventDate =
    eventDateFormatted && eventDate !== new Date().toISOString().slice(0, 10);

  if (hasEventDate) {
    return `오늘(${today})과 행사일(${eventDateFormatted}) 기준으로 금 1개 시세를 24K(순금), 18K, 14K 각각 알려줘.
두 날짜의 시세를 비교해서 각 순도별로 약 몇% 올랐는지 또는 내렸는지도 알려줘.
금액은 원 단위로, 출처도 간단히 언급해줘.`;
  }

  return `오늘(${today}) 기준으로 금 1개 시세를 24K(순금), 18K, 14K 각각 간결하게 알려줘. 금액은 원 단위로, 출처도 간단히 언급해줘.`;
}

export const useGoldPriceAI = (eventDate: string | null) => {
  const [state, dispatch] = useReducer(goldPriceReducer, initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchGoldPrice = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    dispatch({ type: "START" });

    try {
      const response = await fetch("/api/gold-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: buildGoldPricePrompt(eventDate),
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("API 요청 실패");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("스트림을 읽을 수 없습니다");

      const decoder = new TextDecoder();
      let fullContent = "";
      dispatch({ type: "STREAM_START" });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullContent += chunk;
        dispatch({ type: "STREAM_CHUNK", payload: fullContent });
      }

      dispatch({ type: "DONE" });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      dispatch({
        type: "ERROR",
        payload: "금시세 조회에 실패했습니다. 다시 시도해주세요.",
      });
    }
  }, [eventDate]);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    dispatch({ type: "RESET" });
  }, []);

  return {
    status: state.status,
    content: state.content,
    error: state.error,
    fetchGoldPrice,
    reset,
  };
};
