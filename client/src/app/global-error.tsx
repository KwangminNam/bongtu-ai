"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko">
      <body className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8">
          <h1 className="text-xl font-bold mb-2">문제가 발생했습니다</h1>
          <p className="text-sm text-gray-500 mb-6">
            예상치 못한 오류가 발생했습니다.
          </p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
