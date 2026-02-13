import { test, expect } from "@playwright/test";
import { createServer, type Server } from "http";
import { mockAuth, MOCK_EVENTS } from "./helpers/mock";

test.describe("웰컴 페이지 (로그인 후 분기)", () => {
  test("인증되지 않은 사용자는 홈으로 리다이렉트된다", async ({ page }) => {
    await page.goto("/welcome");
    await expect(page).toHaveURL("/");
  });

  test("이벤트가 없는 사용자: 온보딩 메시지가 표시된다", async ({ page }) => {
    await mockAuth(page);

    await page.goto("/welcome");

    await expect(page.getByText("환영합니다!")).toBeVisible();
    await expect(page.getByText("첫 번째 경조사를 등록해보세요")).toBeVisible();
  });

  test("이벤트가 없는 사용자: /dashboard/events/new로 자동 이동된다", async ({ page }) => {
    await mockAuth(page);

    await page.goto("/welcome");

    await expect(page).toHaveURL(/\/dashboard\/events\/new/, { timeout: 5000 });
  });
});

// SSR fetch는 Playwright의 page.route()로 가로챌 수 없으므로
// 실제 mock API 서버를 port 3001에 띄워서 테스트
// (이미 API 서버가 실행 중이면 해당 테스트 skip)
test.describe("웰컴 페이지 (이벤트 있는 사용자)", () => {
  let mockServer: Server | null = null;
  let serverReady = false;

  test.beforeAll(async () => {
    mockServer = createServer((req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "*");

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      if (req.url === "/events" && req.method === "GET") {
        res.writeHead(200);
        res.end(JSON.stringify({ result: MOCK_EVENTS, error: null }));
        return;
      }

      res.writeHead(404);
      res.end(JSON.stringify({ result: null, error: { code: "NOT_FOUND", message: "Not found" } }));
    });

    try {
      await new Promise<void>((resolve, reject) => {
        mockServer!.once("error", reject);
        mockServer!.listen(3001, () => {
          mockServer!.removeListener("error", reject);
          resolve();
        });
      });
      serverReady = true;
    } catch {
      // Port 3001 already in use (실제 API 서버가 실행 중)
      mockServer = null;
    }
  });

  test.afterAll(async () => {
    if (mockServer) {
      await new Promise<void>((resolve) => mockServer!.close(() => resolve()));
    }
  });

  test("재방문 메시지가 표시된다", async ({ page }) => {
    test.skip(!serverReady, "Port 3001 already in use — mock API server를 시작할 수 없음");

    await mockAuth(page);
    await page.goto("/welcome");

    await expect(page.getByText("다시 만나서 반가워요!")).toBeVisible();
    await expect(page.getByText("잠시 후 이동합니다...")).toBeVisible();
  });

  test("/dashboard/chat으로 자동 이동된다", async ({ page }) => {
    test.skip(!serverReady, "Port 3001 already in use — mock API server를 시작할 수 없음");

    await mockAuth(page);
    await page.goto("/welcome");

    await expect(page).toHaveURL(/\/dashboard\/chat/, { timeout: 5000 });
  });
});
