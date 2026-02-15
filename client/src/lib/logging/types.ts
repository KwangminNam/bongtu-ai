export const SERVICE_NAME = "bongtu-ai";

export type LogEventType = "screen_view" | "click";

export interface LogParams {
  [key: string]: string | number | boolean | undefined;
}
