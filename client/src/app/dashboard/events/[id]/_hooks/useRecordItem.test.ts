import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/api", () => ({
  api: {
    records: {
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/actions", () => ({
  revalidateEventDetail: vi.fn(),
  revalidateDashboard: vi.fn(),
}));

import { useRecordItem, parseGoldMemo, buildGoldMemo } from "./useRecordItem";

describe("useRecordItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultParams = {
    recordId: "record-1",
    eventId: "event-1",
    initialAmount: 100000,
    initialMemo: "테스트 메모",
    friendName: "홍길동",
    giftType: "cash",
  };

  describe("초기 상태", () => {
    it("기본값으로 초기화된다", () => {
      const { result } = renderHook(() => useRecordItem(defaultParams));

      expect(result.current.isEditing).toBe(false);
      expect(result.current.amount).toBe("100000");
      expect(result.current.memo).toBe("테스트 메모");
      expect(result.current.isDeleting).toBe(false);
      expect(result.current.isSaving).toBe(false);
    });

    it("메모가 null이면 빈 문자열로 초기화된다", () => {
      const { result } = renderHook(() =>
        useRecordItem({ ...defaultParams, initialMemo: null })
      );

      expect(result.current.memo).toBe("");
    });
  });

  describe("편집 모드", () => {
    it("startEditing으로 편집 모드로 전환된다", () => {
      const { result } = renderHook(() => useRecordItem(defaultParams));

      act(() => {
        result.current.startEditing();
      });

      expect(result.current.isEditing).toBe(true);
    });

    it("cancelEditing으로 편집 모드가 취소되고 초기값으로 복원된다", () => {
      const { result } = renderHook(() => useRecordItem(defaultParams));

      act(() => {
        result.current.startEditing();
        result.current.setAmount("200000");
        result.current.setMemo("변경된 메모");
      });

      expect(result.current.amount).toBe("200000");
      expect(result.current.memo).toBe("변경된 메모");

      act(() => {
        result.current.cancelEditing();
      });

      expect(result.current.isEditing).toBe(false);
      expect(result.current.amount).toBe("100000");
      expect(result.current.memo).toBe("테스트 메모");
    });
  });

  describe("값 변경", () => {
    it("setAmount로 금액을 변경할 수 있다", () => {
      const { result } = renderHook(() => useRecordItem(defaultParams));

      act(() => {
        result.current.setAmount("150000");
      });

      expect(result.current.amount).toBe("150000");
    });

    it("setMemo로 메모를 변경할 수 있다", () => {
      const { result } = renderHook(() => useRecordItem(defaultParams));

      act(() => {
        result.current.setMemo("새로운 메모");
      });

      expect(result.current.memo).toBe("새로운 메모");
    });
  });

  describe("저장", () => {
    it("handleSave 호출 시 isSaving이 true가 된다", async () => {
      const { api } = await import("@/lib/api");
      vi.mocked(api.records.update).mockResolvedValue(undefined);

      const { result } = renderHook(() => useRecordItem(defaultParams));

      act(() => {
        result.current.handleSave();
      });

      expect(result.current.isSaving).toBe(true);

      await waitFor(() => {
        expect(result.current.isSaving).toBe(false);
      });
    });

    it("저장 성공 시 isEditing이 false가 된다", async () => {
      const { api } = await import("@/lib/api");
      vi.mocked(api.records.update).mockResolvedValue(undefined);

      const { result } = renderHook(() => useRecordItem(defaultParams));

      act(() => {
        result.current.startEditing();
      });

      expect(result.current.isEditing).toBe(true);

      act(() => {
        result.current.handleSave();
      });

      await waitFor(() => {
        expect(result.current.isEditing).toBe(false);
      });
    });
  });

  describe("삭제", () => {
    it("handleDelete 호출 시 isDeleting이 true가 된다", async () => {
      const { api } = await import("@/lib/api");
      vi.mocked(api.records.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useRecordItem(defaultParams));

      act(() => {
        result.current.handleDelete();
      });

      expect(result.current.isDeleting).toBe(true);
    });
  });

  // ─── 금(gold) record 수정 테스트 ───
  describe("금 record 수정", () => {
    const goldParams = {
      recordId: "record-gold",
      eventId: "event-1",
      initialAmount: 3,
      initialMemo: "24K 2개, 14K 1개 - 특별 선물",
      friendName: "김철수",
      giftType: "gold",
    };

    it("금 record 초기화: memo에서 goldQuantities를 파싱한다", () => {
      const { result } = renderHook(() => useRecordItem(goldParams));

      expect(result.current.goldQuantities).toEqual({
        "24K": 2,
        "18K": 0,
        "14K": 1,
      });
    });

    it("사용자 메모가 분리된다", () => {
      const { result } = renderHook(() => useRecordItem(goldParams));

      expect(result.current.memo).toBe("특별 선물");
    });

    it("메모 없는 금 record는 userMemo가 빈 문자열이다", () => {
      const { result } = renderHook(() =>
        useRecordItem({ ...goldParams, initialMemo: "24K 1개" })
      );

      expect(result.current.goldQuantities).toEqual({
        "24K": 1,
        "18K": 0,
        "14K": 0,
      });
      expect(result.current.memo).toBe("");
    });

    it("setGoldQuantity로 수량을 변경할 수 있다", () => {
      const { result } = renderHook(() => useRecordItem(goldParams));

      act(() => {
        result.current.setGoldQuantity("18K", 3);
      });

      expect(result.current.goldQuantities["18K"]).toBe(3);
      expect(result.current.totalGoldCount).toBe(6); // 2 + 3 + 1
    });

    it("0 미만으로 수량이 내려가지 않는다", () => {
      const { result } = renderHook(() => useRecordItem(goldParams));

      act(() => {
        result.current.setGoldQuantity("18K", -1);
      });

      expect(result.current.goldQuantities["18K"]).toBe(0);
    });

    it("cancelEditing 시 goldQuantities가 초기값으로 리셋된다", () => {
      const { result } = renderHook(() => useRecordItem(goldParams));

      act(() => {
        result.current.startEditing();
        result.current.setGoldQuantity("24K", 10);
        result.current.setGoldQuantity("18K", 5);
        result.current.setMemo("변경된 메모");
      });

      expect(result.current.goldQuantities["24K"]).toBe(10);
      expect(result.current.goldQuantities["18K"]).toBe(5);

      act(() => {
        result.current.cancelEditing();
      });

      expect(result.current.goldQuantities).toEqual({
        "24K": 2,
        "18K": 0,
        "14K": 1,
      });
      expect(result.current.memo).toBe("특별 선물");
    });

    it("금 record 저장 시 totalGoldCount와 buildGoldMemo가 사용된다", async () => {
      const { api } = await import("@/lib/api");
      vi.mocked(api.records.update).mockResolvedValue(undefined);

      const { result } = renderHook(() => useRecordItem(goldParams));

      act(() => {
        result.current.startEditing();
        result.current.setGoldQuantity("18K", 2);
      });

      act(() => {
        result.current.handleSave();
      });

      await waitFor(() => {
        expect(api.records.update).toHaveBeenCalledWith("record-gold", {
          amount: 5, // 2 + 2 + 1
          memo: "24K 2개, 18K 2개, 14K 1개 - 특별 선물",
        });
      });
    });
  });
});

// ─── parseGoldMemo / buildGoldMemo 유닛 테스트 ───
describe("parseGoldMemo", () => {
  it("금 수량과 사용자 메모를 파싱한다", () => {
    const result = parseGoldMemo("24K 2개, 14K 1개 - 특별 선물");

    expect(result.goldQuantities).toEqual({ "24K": 2, "18K": 0, "14K": 1 });
    expect(result.userMemo).toBe("특별 선물");
  });

  it("사용자 메모가 없으면 빈 문자열을 반환한다", () => {
    const result = parseGoldMemo("24K 1개");

    expect(result.goldQuantities).toEqual({ "24K": 1, "18K": 0, "14K": 0 });
    expect(result.userMemo).toBe("");
  });

  it("null 입력 시 기본값을 반환한다", () => {
    const result = parseGoldMemo(null);

    expect(result.goldQuantities).toEqual({ "24K": 0, "18K": 0, "14K": 0 });
    expect(result.userMemo).toBe("");
  });

  it("금 형식이 아닌 메모는 전체를 userMemo로 반환한다", () => {
    const result = parseGoldMemo("일반 메모입니다");

    expect(result.goldQuantities).toEqual({ "24K": 0, "18K": 0, "14K": 0 });
    expect(result.userMemo).toBe("일반 메모입니다");
  });

  it("하이픈이 여러 개인 메모를 올바르게 파싱한다", () => {
    const result = parseGoldMemo("24K 1개 - 메모 - 추가 메모");

    expect(result.goldQuantities).toEqual({ "24K": 1, "18K": 0, "14K": 0 });
    expect(result.userMemo).toBe("메모 - 추가 메모");
  });
});

describe("buildGoldMemo", () => {
  it("금 수량과 메모를 결합한다", () => {
    const result = buildGoldMemo({ "24K": 2, "18K": 0, "14K": 1 }, "선물");

    expect(result).toBe("24K 2개, 14K 1개 - 선물");
  });

  it("메모가 없으면 금 수량만 반환한다", () => {
    const result = buildGoldMemo({ "24K": 1, "18K": 0, "14K": 0 }, "");

    expect(result).toBe("24K 1개");
  });

  it("금 수량이 모두 0이면 메모만 반환한다", () => {
    const result = buildGoldMemo({ "24K": 0, "18K": 0, "14K": 0 }, "메모만");

    expect(result).toBe("메모만");
  });

  it("금 수량이 모두 0이고 메모도 없으면 빈 문자열을 반환한다", () => {
    const result = buildGoldMemo({ "24K": 0, "18K": 0, "14K": 0 }, "");

    expect(result).toBe("");
  });
});
