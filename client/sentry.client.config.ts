import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",

  // 무료 티어 최적화: 10%만 성능 트랜잭션 생성
  tracesSampleRate: 0.1,

  // Replays 완전 비활성화 (무료 쿼터 절약)
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  beforeSend(event) {
    // 브라우저 노이즈 필터링
    const message = event.exception?.values?.[0]?.value ?? "";
    const ignorePatterns = [
      "ResizeObserver loop",
      "Non-Error promise rejection",
      "Load failed",
      "Failed to fetch",
    ];
    if (ignorePatterns.some((pattern) => message.includes(pattern))) {
      return null;
    }
    return event;
  },

  // 개발 환경에서 디버그 로그
  debug: false,
});
