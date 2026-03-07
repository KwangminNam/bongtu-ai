import type { GoldKarat } from "@/lib/types";

export type GoldQuantities = Record<GoldKarat, number>;

export const KARATS: GoldKarat[] = ["24K", "18K", "14K"];

export const INITIAL_GOLD_QUANTITIES: GoldQuantities = {
  "24K": 0,
  "18K": 0,
  "14K": 0,
};

export function parseGoldMemo(memo: string | null): {
  goldQuantities: GoldQuantities;
  userMemo: string;
} {
  if (!memo) return { goldQuantities: INITIAL_GOLD_QUANTITIES, userMemo: "" };

  const [goldPart, ...rest] = memo.split(" - ");
  const userMemo = rest.join(" - ").trim();

  const quantities: GoldQuantities = { ...INITIAL_GOLD_QUANTITIES };
  for (const karat of KARATS) {
    const match = goldPart.match(new RegExp(`${karat}\\s+(\\d+)개`));
    if (match) {
      quantities[karat] = Number(match[1]);
    }
  }

  const hasAnyGold = KARATS.some((k) => quantities[k] > 0);
  if (!hasAnyGold) return { goldQuantities: INITIAL_GOLD_QUANTITIES, userMemo: memo };

  return { goldQuantities: quantities, userMemo };
}

export function buildGoldMemo(goldQuantities: GoldQuantities, userMemo: string): string {
  const parts: string[] = [];
  for (const k of KARATS) {
    if (goldQuantities[k] > 0) {
      parts.push(`${k} ${goldQuantities[k]}개`);
    }
  }
  const goldSummary = parts.join(", ");
  if (!goldSummary) return userMemo;
  return userMemo ? `${goldSummary} - ${userMemo}` : goldSummary;
}

export function buildGoldSummary(goldQuantities: GoldQuantities): string {
  const parts: string[] = [];
  for (const k of KARATS) {
    if (goldQuantities[k] > 0) {
      parts.push(`${k} ${goldQuantities[k]}개`);
    }
  }
  return parts.join(", ");
}

export function calcTotalGoldCount(goldQuantities: GoldQuantities): number {
  return goldQuantities["24K"] + goldQuantities["18K"] + goldQuantities["14K"];
}
