import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
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
    friends: {
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/actions", () => ({
  revalidateFriendDetail: vi.fn(),
  revalidateFriends: vi.fn(),
}));

import { useFriendEdit } from "./useFriendEdit";

describe("useFriendEdit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultParams = {
    friendId: "friend-1",
    initialName: "김철수",
    initialRelation: "친구",
  };

  describe("초기 상태", () => {
    it("기본값으로 초기화된다", () => {
      const { result } = renderHook(() => useFriendEdit(defaultParams));

      expect(result.current.isEditing).toBe(false);
      expect(result.current.name).toBe("김철수");
      expect(result.current.relation).toBe("친구");
      expect(result.current.isSaving).toBe(false);
      expect(result.current.isDeleting).toBe(false);
    });
  });

  describe("편집 모드", () => {
    it("startEditing으로 편집 모드로 전환된다", () => {
      const { result } = renderHook(() => useFriendEdit(defaultParams));

      act(() => {
        result.current.startEditing();
      });

      expect(result.current.isEditing).toBe(true);
    });

    it("cancelEditing으로 편집 모드가 취소되고 초기값으로 복원된다", () => {
      const { result } = renderHook(() => useFriendEdit(defaultParams));

      act(() => {
        result.current.startEditing();
        result.current.setName("이영희");
        result.current.setRelation("직장 동료");
      });

      expect(result.current.name).toBe("이영희");
      expect(result.current.relation).toBe("직장 동료");

      act(() => {
        result.current.cancelEditing();
      });

      expect(result.current.isEditing).toBe(false);
      expect(result.current.name).toBe("김철수");
      expect(result.current.relation).toBe("친구");
    });
  });

  describe("값 변경", () => {
    it("setName으로 이름을 변경할 수 있다", () => {
      const { result } = renderHook(() => useFriendEdit(defaultParams));

      act(() => {
        result.current.setName("박민수");
      });

      expect(result.current.name).toBe("박민수");
    });

    it("setRelation으로 관계를 변경할 수 있다", () => {
      const { result } = renderHook(() => useFriendEdit(defaultParams));

      act(() => {
        result.current.setRelation("가족");
      });

      expect(result.current.relation).toBe("가족");
    });
  });

  describe("저장", () => {
    it("handleSave 호출 시 isSaving이 true가 된다", async () => {
      const { api } = await import("@/lib/api");
      vi.mocked(api.friends.update).mockResolvedValue(undefined);

      const { result } = renderHook(() => useFriendEdit(defaultParams));

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
      vi.mocked(api.friends.update).mockResolvedValue(undefined);

      const { result } = renderHook(() => useFriendEdit(defaultParams));

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

    it("이름이 비어있으면 저장하지 않는다", async () => {
      const { api } = await import("@/lib/api");

      const { result } = renderHook(() => useFriendEdit(defaultParams));

      act(() => {
        result.current.startEditing();
        result.current.setName("  ");
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(api.friends.update).not.toHaveBeenCalled();
    });
  });

  describe("삭제", () => {
    it("handleDelete 호출 시 isDeleting이 true가 된다", async () => {
      const { api } = await import("@/lib/api");
      vi.mocked(api.friends.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useFriendEdit(defaultParams));

      act(() => {
        result.current.handleDelete();
      });

      expect(result.current.isDeleting).toBe(true);
    });
  });
});
