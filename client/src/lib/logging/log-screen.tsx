"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LogParamsContext, useLogParams } from "./context";
import { logScreenView } from "./logger";
import type { LogParams } from "./types";

interface LogScreenProps {
  children: ReactNode;
  params?: LogParams;
}

export function LogScreen({ children, params = {} }: LogScreenProps) {
  const pathname = usePathname();
  const parentParams = useLogParams();

  const mergedParams = useMemo(
    () => ({ ...parentParams, ...params }),
    [parentParams, params],
  );

  useEffect(() => {
    logScreenView(pathname, mergedParams);
  }, [pathname, mergedParams]);

  return (
    <LogParamsContext.Provider value={mergedParams}>
      {children}
    </LogParamsContext.Provider>
  );
}
