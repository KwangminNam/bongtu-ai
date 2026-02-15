import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  // Source map 업로드 (프로덕션 빌드 시에만)
  silent: !process.env.CI,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // 무료 티어 최적화
  webpack: {
    autoInstrumentServerFunctions: false,
    autoInstrumentMiddleware: false,
    treeshake: {
      removeDebugLogging: true,
    },
  },

  // 클라이언트 번들 크기 최적화
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
});
