export type Pillar = {
  hanja: string;
  hangul: string;
};

export type PillarBlock = {
  label: string;
  cheongan: Pillar;
  jiji: Pillar;
};

export type SajuResult = {
  hour: PillarBlock;
  day: PillarBlock;
  month: PillarBlock;
  year: PillarBlock;
};

export type Element = "wood" | "fire" | "earth" | "metal" | "water";
export type Polarity = "yang" | "yin";
