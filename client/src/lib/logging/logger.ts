import * as Sentry from "@sentry/nextjs";
import { SERVICE_NAME, type LogEventType, type LogParams } from "./types";

function buildLogName(pathname: string, eventType: LogEventType, eventName?: string): string {
  const path = pathname
    .replace(/^\//, "")
    .replace(/\//g, "_")
    .replace(/\[([^\]]+)\]/g, "$1")
    || "root";

  const base = `${SERVICE_NAME}__${path}::${eventType}`;
  return eventName ? `${base}__${eventName}` : base;
}

export function logScreenView(pathname: string, params: LogParams) {
  const logName = buildLogName(pathname, "screen_view");

  Sentry.addBreadcrumb({
    category: "screen_view",
    message: logName,
    data: params,
    level: "info",
  });

  if (process.env.NODE_ENV === "development") {
    console.debug("[LOG] screen_view:", logName, params);
  }
}

export function logClick(pathname: string, eventName: string, params: LogParams) {
  const logName = buildLogName(pathname, "click", eventName);

  Sentry.addBreadcrumb({
    category: "click",
    message: logName,
    data: params,
    level: "info",
  });

  if (process.env.NODE_ENV === "development") {
    console.debug("[LOG] click:", logName, params);
  }
}

export function logError(error: unknown, context?: Record<string, unknown>) {
  Sentry.captureException(error, { extra: context });
}
