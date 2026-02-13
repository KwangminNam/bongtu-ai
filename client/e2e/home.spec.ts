import { test, expect } from "@playwright/test";

test.describe("홈페이지 (인트로 → 로그인)", () => {
  test("페이지가 정상적으로 로드된다", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/마음장부/);
  });

  test("Welcome 단계: 로고, 앱 이름, CTA 버튼이 표시된다", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toHaveText("마음장부");
    await expect(page.getByText("경조사 내역을 기록하고")).toBeVisible();
    await expect(page.getByText("AI가 적정 금액을 제안해드려요")).toBeVisible();

    const ctaButton = page.getByRole("button", { name: /로그인하고 시작하기/ });
    await expect(ctaButton).toBeVisible();
  });

  test("CTA 버튼 클릭 시 로그인 단계로 전환된다", async ({ page }) => {
    await page.goto("/");

    const ctaButton = page.getByRole("button", { name: /로그인하고 시작하기/ });
    await ctaButton.click();

    // 로그인 단계에서는 카카오 로그인 버튼이 표시됨
    const kakaoButton = page.getByRole("button", { name: /카카오로 시작하기/ });
    await expect(kakaoButton).toBeVisible();
  });

  test("로그인 단계: 서비스 이용약관 안내가 표시된다", async ({ page }) => {
    await page.goto("/");

    // 로그인 단계로 이동
    await page.getByRole("button", { name: /로그인하고 시작하기/ }).click();

    await expect(
      page.getByText("로그인 시 서비스 이용약관에 동의하게 됩니다")
    ).toBeVisible();
  });
});
