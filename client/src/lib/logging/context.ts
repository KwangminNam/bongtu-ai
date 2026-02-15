"use client";

import { createContext, useContext } from "react";
import type { LogParams } from "./types";

export const LogParamsContext = createContext<LogParams>({});

export const useLogParams = () => useContext(LogParamsContext);
