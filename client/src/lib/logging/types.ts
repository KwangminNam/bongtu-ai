export const SERVICE_NAME = "maum-jangbu";

export type LogEventType = "screen_view" | "click";

export interface LogParams {
  [key: string]: string | number | boolean | undefined;
}
