import type { ReactNode } from "react";

type SwitchProps<T extends string> = {
  type: T;
  case: Partial<Record<T, ReactNode>>;
  default?: ReactNode;
};

export function Switch<T extends string>({
  type,
  case: cases,
  default: defaultCase,
}: SwitchProps<T>): ReactNode {
  return cases[type] ?? defaultCase ?? null;
}
