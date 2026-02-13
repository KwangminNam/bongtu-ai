import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAmount } from "./useAmount";

describe("useAmount", () => {
  describe("초기 상태", () => {
    it("기본값으로 초기화된다", () => {
      const { result } = renderHook(() => useAmount());

      expect(result.current.giftType).toBe("cash");
      expect(result.current.selectedAmount).toBeNull();
      expect(result.current.customAmount).toBe("");
      expect(result.current.goldQuantities).toEqual({ "24K": 0, "18K": 0, "14K": 0 });
      expect(result.current.totalGoldCount).toBe(0);
      expect(result.current.amount).toBe(0);
    });
  });

  describe("현금 금액 선택", () => {
    it("금액 뱃지를 선택하면 selectedAmount가 설정된다", () => {
      const { result } = renderHook(() => useAmount());

      act(() => {
        result.current.selectAmount(50000);
      });

      expect(result.current.selectedAmount).toBe(50000);
      expect(result.current.amount).toBe(50000);
    });

    it("금액을 선택하면 customAmount가 초기화된다", () => {
      const { result } = renderHook(() => useAmount());

      act(() => {
        result.current.setCustomAmount("30000");
      });

      expect(result.current.customAmount).toBe("30000");

      act(() => {
        result.current.selectAmount(50000);
      });

      expect(result.current.selectedAmount).toBe(50000);
      expect(result.current.customAmount).toBe("");
    });

    it("직접 입력하면 selectedAmount가 null이 된다", () => {
      const { result } = renderHook(() => useAmount());

      act(() => {
        result.current.selectAmount(50000);
      });

      act(() => {
        result.current.setCustomAmount("100000");
      });

      expect(result.current.selectedAmount).toBeNull();
      expect(result.current.customAmount).toBe("100000");
      expect(result.current.amount).toBe(100000);
    });
  });

  describe("금 수량 선택", () => {
    it("24K 수량을 설정할 수 있다", () => {
      const { result } = renderHook(() => useAmount());

      act(() => {
        result.current.setGoldQuantity("24K", 2);
      });

      expect(result.current.goldQuantities["24K"]).toBe(2);
      expect(result.current.totalGoldCount).toBe(2);
    });

    it("여러 순도의 수량을 동시에 설정할 수 있다", () => {
      const { result } = renderHook(() => useAmount());

      act(() => {
        result.current.setGoldQuantity("24K", 1);
        result.current.setGoldQuantity("18K", 2);
        result.current.setGoldQuantity("14K", 3);
      });

      expect(result.current.goldQuantities).toEqual({ "24K": 1, "18K": 2, "14K": 3 });
      expect(result.current.totalGoldCount).toBe(6);
    });

    it("수량이 0 미만이 되지 않는다", () => {
      const { result } = renderHook(() => useAmount());

      act(() => {
        result.current.setGoldQuantity("24K", -5);
      });

      expect(result.current.goldQuantities["24K"]).toBe(0);
    });

    it("goldSummary가 선택된 항목만 표시한다", () => {
      const { result } = renderHook(() => useAmount());

      act(() => {
        result.current.setGoldQuantity("24K", 2);
        result.current.setGoldQuantity("14K", 1);
      });

      expect(result.current.goldSummary).toBe("24K 2개, 14K 1개");
    });

    it("아무것도 선택하지 않으면 goldSummary가 빈 문자열이다", () => {
      const { result } = renderHook(() => useAmount());
      expect(result.current.goldSummary).toBe("");
    });
  });

  describe("giftType에 따른 amount 계산", () => {
    it("cash 타입일 때 현금 금액이 반환된다", () => {
      const { result } = renderHook(() => useAmount());

      act(() => {
        result.current.selectAmount(100000);
        result.current.setGoldQuantity("24K", 3);
      });

      expect(result.current.giftType).toBe("cash");
      expect(result.current.amount).toBe(100000);
    });

    it("gold 타입일 때 총 수량이 반환된다", () => {
      const { result } = renderHook(() => useAmount());

      act(() => {
        result.current.setGiftType("gold");
        result.current.setGoldQuantity("24K", 1);
        result.current.setGoldQuantity("18K", 2);
      });

      expect(result.current.giftType).toBe("gold");
      expect(result.current.amount).toBe(3);
    });
  });
});
