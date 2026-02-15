"use client";

import {
  cloneElement,
  isValidElement,
  useCallback,
  type ReactElement,
} from "react";
import { usePathname } from "next/navigation";
import { useLogParams } from "./context";
import { logClick } from "./logger";
import type { LogParams } from "./types";

interface LogClickProps {
  children: ReactElement<{ onClick?: (...args: unknown[]) => void }>;
  eventName: string;
  params?: LogParams;
}

export function LogClick({ children, eventName, params = {} }: LogClickProps) {
  const pathname = usePathname();
  const parentParams = useLogParams();

  const handleClick = useCallback(
    (...args: unknown[]) => {
      logClick(pathname, eventName, { ...parentParams, ...params });

      if (isValidElement(children) && typeof children.props.onClick === "function") {
        children.props.onClick(...args);
      }
    },
    [pathname, eventName, parentParams, params, children],
  );

  if (!isValidElement(children)) {
    return children;
  }

  return cloneElement(children, { onClick: handleClick });
}
