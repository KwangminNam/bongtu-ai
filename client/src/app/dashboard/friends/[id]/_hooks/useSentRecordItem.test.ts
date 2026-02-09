import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

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
    sentRecords: {
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/actions", () => ({
  revalidateFriendDetail: vi.fn(),
  revalidateFriends: vi.fn(),
}));

import { useSentRecordItem } from "./useSentRecordItem";

describe("useSentRecordItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultParams = {
    recordId: "sent-1",
    friendId: "friend-1",
    initialAmount: 30000,
    initialDate: "2025-07-20T00:00:00.000Z",
    initialEventType: "BIRTHDAY",
    initialMemo: "생일 축하",
  };

  describe("초기 상태", () => {
    it("기본값으로 초기화된다", () => {
      const { result } = renderHook(() => useSentRecordItem(defaultParams));

      expect(result.current.isEditing).toBe(false);
      expect(result.current.amount).toBe("30000");
      expect(result.current.date).toBe("2025-07-20");
      expect(result.current.eventType).toBe("BIRTHDAY");
      expect(result.current.memo).toBe("생일 축하");
      expect(result.current.isSaving).toBe(false);
      expect(result.current.isDeleting).toBe(false);
    });

    it("메모가 null이면 빈 문자열로 초기화된다", () => {
      const { result } = renderHook(() =>
        useSentRecordItem({ ...defaultParams, initialMemo: null })
      );

      expect(result.current.memo).toBe("");
    });
  });

  describe("편집 모드", () => {
    it("startEditing으로 편집 모드로 전환된다", () => {
      const { result } = renderHook(() => useSentRecordItem(defaultParams));

      act(() => {
        result.current.startEditing();
      });

      expect(result.current.isEditing).toBe(true);
    });

    it("cancelEditing으로 편집 모드가 취소되고 초기값으로 복원된다", () => {
      const { result } = renderHook(() => useSentRecordItem(defaultParams));

      act(() => {
        result.current.startEditing();
        result.current.setAmount("50000");
        result.current.setDate("2025-08-01");
        result.current.setEventType("WEDDING");
        result.current.setMemo("변경된 메모");
      });

      expect(result.current.amount).toBe("50000");
      expect(result.current.date).toBe("2025-08-01");
      expect(result.current.eventType).toBe("WEDDING");
      expect(result.current.memo).toBe("변경된 메모");

      act(() => {
        result.current.cancelEditing();
      });

      expect(result.current.isEditing).toBe(false);
      expect(result.current.amount).toBe("30000");
      expect(result.current.date).toBe("2025-07-20");
      expect(result.current.eventType).toBe("BIRTHDAY");
      expect(result.current.memo).toBe("생일 축하");
    });
  });

  describe("값 변경", () => {
    it("setAmount로 금액을 변경할 수 있다", () => {
      const { result } = renderHook(() => useSentRecordItem(defaultParams));

      act(() => {
        result.current.setAmount("100000");
      });

      expect(result.current.amount).toBe("100000");
    });

    it("setDate로 날짜를 변경할 수 있다", () => {
      const { result } = renderHook(() => useSentRecordItem(defaultParams));

      act(() => {
        result.current.setDate("2025-09-01");
      });

      expect(result.current.date).toBe("2025-09-01");
    });

    it("setEventType으로 행사유형을 변경할 수 있다", () => {
      const { result } = renderHook(() => useSentRecordItem(defaultParams));

      act(() => {
        result.current.setEventType("FUNERAL");
      });

      expect(result.current.eventType).toBe("FUNERAL");
    });

    it("setMemo로 메모를 변경할 수 있다", () => {
      const { result } = renderHook(() => useSentRecordItem(defaultParams));

      act(() => {
        result.current.setMemo("새로운 메모");
      });

      expect(result.current.memo).toBe("새로운 메모");
    });
  });

  describe("저장", () => {
    it("handleSave 호출 시 isSaving이 true가 된다", async () => {
      const { api } = await import("@/lib/api");
      vi.mocked(api.sentRecords.update).mockResolvedValue(undefined);

      const { result } = renderHook(() => useSentRecordItem(defaultParams));

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
      vi.mocked(api.sentRecords.update).mockResolvedValue(undefined);

      const { result } = renderHook(() => useSentRecordItem(defaultParams));

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
      vi.mocked(api.sentRecords.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useSentRecordItem(defaultParams));

      act(() => {
        result.current.handleDelete();
      });

      expect(result.current.isDeleting).toBe(true);
    });
  });
});
