export type Pillar = {
  hanja: string;
  hangul: string;
};

export type PillarBlock = {
  label: string;
  cheongan: Pillar;
  jiji: Pillar;
};

/** /saju/full 등에서 내려오는 합충 분석 (선택) */
export type HarmonyClashPayload = {
  cheongan_hap?: unknown[];
  cheongan_jaenghap?: unknown[];
  cheongan_chung?: unknown[];
  jiji_yukhap?: unknown[];
  jiji_samhap?: unknown[];
  jiji_banhap?: unknown[];
  jiji_chung?: unknown[];
};

export type SajuResult = {
  hour: PillarBlock;
  day: PillarBlock;
  month: PillarBlock;
  year: PillarBlock;
  twelve_states?: Record<string, string>;
  jijanggan?: unknown;
  harmony_clash?: HarmonyClashPayload | null;
};

export type Element = "wood" | "fire" | "earth" | "metal" | "water";
export type Polarity = "yang" | "yin";
