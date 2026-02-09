import { test, expect } from "@playwright/test";
import {
  mockAuth,
  mockFriendsApi,
  mockFriendDetailApi,
  mockSentRecordsApi,
} from "./helpers/mock";

test.describe("지인 상세 페이지", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
    await mockFriendsApi(page);
    await mockFriendDetailApi(page);
    await mockSentRecordsApi(page);
  });

  test("지인 상세 페이지가 로드되고 뒤로가기 버튼이 표시된다", async ({
    page,
  }) => {
    await page.goto("/dashboard/friends/friend-1");

    // 뒤로 가기 버튼 표시
    await expect(
      page.getByRole("button", { name: "뒤로 가기" })
    ).toBeVisible();

    // 헤더 영역에 "지인" 텍스트 (데이터 미로드 시) 또는 이름이 표시됨
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
  });

  test("지인 상세 페이지에서 뒤로 가기를 누르면 이전 페이지로 돌아간다", async ({
    page,
  }) => {
    // 지인 목록에서 출발
    await page.goto("/dashboard/friends");
    await expect(
      page.getByRole("heading", { name: "지인 관리" })
    ).toBeVisible();

    // 지인 상세로 이동
    await page.goto("/dashboard/friends/friend-1");
    await expect(
      page.getByRole("button", { name: "뒤로 가기" })
    ).toBeVisible();

    // 뒤로 가기
    await page.getByRole("button", { name: "뒤로 가기" }).click();
    await page.waitForURL("/dashboard/friends");
  });

  test("지인 상세 페이지 URL이 올바르게 라우팅된다", async ({ page }) => {
    await page.goto("/dashboard/friends/friend-1");

    // 페이지가 정상적으로 로드되고 에러 페이지가 아님
    await expect(page.locator("main")).toBeVisible();
    // 404가 아님
    await expect(page.getByText("404")).not.toBeVisible();
  });
});
