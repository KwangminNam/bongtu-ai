import * as Sentry from "@sentry/nextjs";
import { client, FetchError } from "@/lib/fetch-client";

export function setupSentryInterceptor() {
  client.interceptors.response.use(
    // 성공 응답: API 요청 breadcrumb 기록
    (response, data) => {
      Sentry.addBreadcrumb({
        category: "api",
        message: `${response.status} ${response.url}`,
        level: "info",
      });
      return data;
    },
    // 에러 응답: 5xx만 captureException (4xx는 breadcrumb만)
    (error: FetchError) => {
      if (error.status >= 500) {
        Sentry.captureException(error, {
          extra: {
            status: error.status,
            statusText: error.statusText,
            data: error.data,
          },
        });
      } else {
        Sentry.addBreadcrumb({
          category: "api.error",
          message: `${error.status} ${error.statusText}`,
          data: { status: error.status },
          level: "warning",
        });
      }
      throw error;
    },
  );
}
