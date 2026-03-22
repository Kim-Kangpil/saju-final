/**
 * /saju/full 응답 JSON을 /add 페이지의 result(SajuResult) 형태로 변환합니다.
 * 로컬 캐시 동기화 시 재사용합니다.
 */
function hanjaToHangul(h: string): string {
  const map: Record<string, string> = {
    甲: "갑",
    乙: "을",
    丙: "병",
    丁: "정",
    戊: "무",
    己: "기",
    庚: "경",
    辛: "신",
    壬: "임",
    癸: "계",
    子: "자",
    丑: "축",
    寅: "인",
    卯: "묘",
    辰: "진",
    巳: "사",
    午: "오",
    未: "미",
    申: "신",
    酉: "유",
    戌: "술",
    亥: "해",
  };
  return map[h] ?? "";
}

type Pillar = { hanja: string; hangul: string };

function splitPillar(text: string): [Pillar, Pillar] {
  const hanja1 = text?.[0] ?? "";
  const hanja2 = text?.[1] ?? "";
  return [
    { hanja: hanja1, hangul: hanjaToHangul(hanja1) },
    { hanja: hanja2, hangul: hanjaToHangul(hanja2) },
  ];
}

/** add/page setResult와 동일한 구조 */
export function mapFullSajuJsonToResult(sajuJson: Record<string, unknown>): {
  hour: { label: string; cheongan: Pillar; jiji: Pillar };
  day: { label: string; cheongan: Pillar; jiji: Pillar };
  month: { label: string; cheongan: Pillar; jiji: Pillar };
  year: { label: string; cheongan: Pillar; jiji: Pillar };
  twelve_states: unknown;
  jijanggan: unknown;
  harmony_clash: unknown;
} {
  const hourP = String(sajuJson.hour_pillar ?? "");
  const dayP = String(sajuJson.day_pillar ?? "");
  const monthP = String(sajuJson.month_pillar ?? "");
  const yearP = String(sajuJson.year_pillar ?? "");

  const [hourCheongan, hourJiji] = splitPillar(hourP);
  const [dayCheongan, dayJiji] = splitPillar(dayP);
  const [monthCheongan, monthJiji] = splitPillar(monthP);
  const [yearCheongan, yearJiji] = splitPillar(yearP);

  return {
    hour: { label: "시주", cheongan: hourCheongan, jiji: hourJiji },
    day: { label: "일주", cheongan: dayCheongan, jiji: dayJiji },
    month: { label: "월주", cheongan: monthCheongan, jiji: monthJiji },
    year: { label: "년주", cheongan: yearCheongan, jiji: yearJiji },
    twelve_states: sajuJson.twelve_states,
    jijanggan: sajuJson.jijanggan,
    harmony_clash: sajuJson.harmony_clash ?? null,
  };
}
