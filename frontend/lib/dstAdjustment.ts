/**
 * 서머타임(일광절약시간) 보정 — 시주 계산과 동일한 방향으로 “시계를 당김” 분 수.
 * 한국: backend/logic/test.py KST_DST_PERIODS 와 동일 구간.
 * 해외: Luxon + IANA (그 지역 법정 시계 기준).
 */
import { DateTime } from "luxon";

/** [년,월,일,시,분] — 한국 현지 시계 기준, 구간은 [시작, 끝) */
const KOREA_DST_PERIODS: readonly [readonly [number, number, number, number, number], readonly [number, number, number, number, number]][] =
  [
    [
      [1948, 6, 1, 0, 0],
      [1948, 9, 13, 0, 0],
    ],
    [
      [1949, 4, 1, 0, 0],
      [1949, 9, 11, 0, 0],
    ],
    [
      [1950, 4, 1, 0, 0],
      [1950, 9, 11, 0, 0],
    ],
    [
      [1951, 5, 6, 0, 0],
      [1951, 9, 9, 0, 0],
    ],
    [
      [1987, 5, 10, 2, 0],
      [1987, 10, 11, 3, 0],
    ],
    [
      [1988, 5, 8, 2, 0],
      [1988, 10, 9, 3, 0],
    ],
  ];

function cmp5(
  y: number,
  m: number,
  d: number,
  h: number,
  mi: number,
  y2: number,
  m2: number,
  d2: number,
  h2: number,
  mi2: number
): number {
  if (y !== y2) return y < y2 ? -1 : 1;
  if (m !== m2) return m < m2 ? -1 : 1;
  if (d !== d2) return d < d2 ? -1 : 1;
  if (h !== h2) return h < h2 ? -1 : 1;
  if (mi !== mi2) return mi < mi2 ? -1 : 1;
  return 0;
}

/** 한국 시계 기준으로 서머타임 구간이면 true (브라우저 로컬 타임존 무관) */
export function isKoreaDstWallTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): boolean {
  for (const [start, end] of KOREA_DST_PERIODS) {
    const c1 = cmp5(year, month, day, hour, minute, ...start);
    const c2 = cmp5(year, month, day, hour, minute, ...end);
    if (c1 >= 0 && c2 < 0) return true;
  }
  return false;
}

/** 한국: 서머타임이면 60분 당김(= 시주 계산에서 빼는 분과 동일) */
export function koreaSummerTimeMinutesToSubtract(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): number {
  return isKoreaDstWallTime(year, month, day, hour, minute) ? 60 : 0;
}

function findStandardOffsetMinutes(zone: string, year: number): number {
  for (let month = 1; month <= 12; month++) {
    const t = DateTime.fromObject(
      { year, month, day: 15, hour: 12, minute: 0 },
      { zone }
    );
    if (t.isValid && !t.isInDST) return t.offset;
  }
  const t = DateTime.fromObject({ year, month: 1, day: 15, hour: 12, minute: 0 }, { zone });
  return t.isValid ? t.offset : 0;
}

/**
 * IANA 구역에서, 입력한 벽시계 시각이 서머타임이면 “표준시로 맞출 때” 빼야 할 분.
 * (한국 Asia/Seoul 은 역사 데이터가 불완전할 수 있어 위 한국 표를 씁니다.)
 */
export function ianaSummerTimeMinutesToSubtract(
  iana: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): number {
  if (!iana || iana === "Asia/Seoul") {
    return koreaSummerTimeMinutesToSubtract(year, month, day, hour, minute);
  }
  const dt = DateTime.fromObject({ year, month, day, hour, minute }, { zone: iana });
  if (!dt.isValid) return 0;
  if (!dt.isInDST) return 0;
  const std = findStandardOffsetMinutes(iana, year);
  const diff = dt.offset - std;
  return diff > 0 ? Math.round(diff) : 0;
}

export type SummerTimeInfo = {
  /** 시주 맞출 때 벽시계에서 빼는 분 (0이면 해당 없음) */
  minutesToSubtract: number;
  /** 그날·그시각이 서머타임이었는지 */
  wasDst: boolean;
};

export function getSummerTimeInfo(
  iana: string | null,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): SummerTimeInfo | null {
  if (!Number.isFinite(year) || month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (!iana) return null;
  const minutesToSubtract = ianaSummerTimeMinutesToSubtract(iana, year, month, day, hour, minute);
  return {
    minutesToSubtract,
    wasDst: minutesToSubtract > 0,
  };
}

/** 확인 모달·도움말용 짧은 문장 */
export function describeSummerTimeForUi(
  iana: string | null,
  info: SummerTimeInfo | null,
  hasBirthTime: boolean
): string {
  if (!iana) {
    return "도시를 목록에서 고르면 그 나라 기준으로 서머타임을 자동으로 확인해요.";
  }
  if (!hasBirthTime) {
    return "출생 시각을 입력하면 그때 기준 서머타임을 반영해 시주를 맞춰요.";
  }
  if (!info) return "날짜·시각을 다시 확인해 주세요.";
  if (!info.wasDst) {
    return "선택한 지역 기준으로, 그날 그 시각엔 서머타임이 적용되지 않았어요.";
  }
  return `선택한 지역 기준으로 서머타임이었어요. 시주 계산에서 시계를 약 ${info.minutesToSubtract}분 당겨 맞춰요.`;
}
