// ── Event Types ──
export const EVENT_TYPES = [
  {
    value: "WEDDING",
    label: "결혼식",
    emoji: "💒",
    description: "결혼식, 약혼식 등",
    gradient: "from-pink-100 to-rose-100 dark:from-pink-950/40 dark:to-rose-950/40",
    selectedGradient: "from-pink-500 to-rose-500",
    ring: "ring-pink-400",
  },
  {
    value: "FUNERAL",
    label: "장례식",
    emoji: "🕯️",
    description: "장례, 추모식 등",
    gradient: "from-purple-100 to-violet-100 dark:from-purple-950/40 dark:to-violet-950/40",
    selectedGradient: "from-purple-500 to-violet-500",
    ring: "ring-purple-400",
  },
  {
    value: "BIRTHDAY",
    label: "생일/잔치",
    emoji: "🎂",
    description: "생일, 돌잔치, 환갑 등",
    gradient: "from-amber-100 to-yellow-100 dark:from-amber-950/40 dark:to-yellow-950/40",
    selectedGradient: "from-amber-500 to-yellow-500",
    ring: "ring-amber-400",
  },
  {
    value: "ETC",
    label: "기타",
    emoji: "🎉",
    description: "집들이, 승진 축하 등",
    gradient: "from-slate-100 to-gray-100 dark:from-slate-900/40 dark:to-gray-900/40",
    selectedGradient: "from-slate-500 to-gray-500",
    ring: "ring-slate-400",
  },
] as const;

export type EventTypeValue = (typeof EVENT_TYPES)[number]["value"];

// ── Amount Badges (받은 금액) ──
export const RECEIVED_AMOUNT_BADGES = [
  { value: 50000, label: "5만원" },
  { value: 100000, label: "10만원" },
  { value: 150000, label: "15만원" },
  { value: 200000, label: "20만원" },
  { value: 250000, label: "25만원" },
  { value: 300000, label: "30만원" },
  { value: 350000, label: "35만원" },
  { value: 500000, label: "50만원" },
] as const;

// ── Amount Badges (보낸 금액) ──
export const SENT_AMOUNT_BADGES = [
  { value: 30000, label: "3만원" },
  { value: 50000, label: "5만원" },
  { value: 100000, label: "10만원" },
  { value: 200000, label: "20만원" },
] as const;

// ── Gold Presets ──
export const GOLD_KARAT_OPTIONS = [
  { value: "24K", label: "24K", description: "순금" },
  { value: "18K", label: "18K", description: "75%" },
  { value: "14K", label: "14K", description: "58.5%" },
] as const;

// ── Relation Suggestions ──
export const RELATION_SUGGESTIONS = [
  "친구",
  "직장 동료",
  "가족",
  "친척",
  "선후배",
  "지인",
] as const;

// ── Event Type Lookup Maps (derived from EVENT_TYPES) ──
export const EVENT_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  EVENT_TYPES.map((t) => [t.value, t.label])
);

export const EVENT_TYPE_EMOJIS: Record<string, string> = Object.fromEntries(
  EVENT_TYPES.map((t) => [t.value, t.emoji])
);

export const EVENT_TYPE_GRADIENTS: Record<string, string> = Object.fromEntries(
  EVENT_TYPES.map((t) => [t.value, t.gradient])
);
