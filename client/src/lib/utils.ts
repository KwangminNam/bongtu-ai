import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAmount(amount: number, giftType?: string): string {
  if (giftType === "gold") return `${amount}개`;
  return `${amount.toLocaleString()}원`;
}
