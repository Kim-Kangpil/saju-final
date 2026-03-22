import { getAuthHeaders } from "./auth";
import { mapFullSajuJsonToResult } from "./mapFullSajuJsonToResult";

// 사주 데이터 타입 정의
export interface SavedSaju {
  id: string;
  name: string; // 사용자가 지정한 이름 (예: "내 사주", "엄마 사주")
  birthYmd: string; // YYYYMMDD
  birthHm: string; // HHMM
  gender: 'M' | 'F';
  calendar: 'solar' | 'lunar';
  timeUnknown: boolean;
  result: any; // 사주 결과 데이터
  createdAt: string; // 저장 날짜
  lastViewed?: string; // 마지막 조회 날짜
}

const STORAGE_KEY = 'saved_saju_list';
const MAX_SAJU_COUNT = 5;

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://saju-backend-eqd6.onrender.com";

/** 백엔드 /api/saju/list 한 행 */
export type ServerSajuRow = {
  id: number;
  name: string;
  relation: string | null;
  birthdate: string;
  birth_time: string | null;
  calendar_type: string;
  gender: string;
  created_at: string;
  iana_timezone?: string | null;
};

function rowToBirthFields(row: ServerSajuRow): {
  birthYmd: string;
  birthHm: string;
  timeUnknown: boolean;
  calendar: "solar" | "lunar";
  gender: "M" | "F";
} {
  const parts = (row.birthdate || "").split("-").map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  const birthYmd =
    y && m && d
      ? `${String(y)}${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}`
      : "";

  const timePart = (row.birth_time || "").trim();
  let birthHm = "1200";
  let timeUnknown = true;
  if (timePart && /^\d{1,2}:\d{1,2}$/.test(timePart)) {
    const [h, mi] = timePart.split(":").map(Number);
    if (!Number.isNaN(h) && !Number.isNaN(mi)) {
      birthHm = `${String(h).padStart(2, "0")}${String(mi).padStart(2, "0")}`;
      timeUnknown = false;
    }
  }

  const calendar = row.calendar_type === "음력" ? "lunar" : "solar";
  const gender = row.gender === "남자" ? "M" : "F";

  return { birthYmd, birthHm, timeUnknown, calendar, gender };
}

function sameBirthIdentity(
  a: { birthYmd: string; birthHm: string; gender: string; calendar: string },
  b: { birthYmd: string; birthHm: string; gender: string; calendar: string }
): boolean {
  return (
    a.birthYmd === b.birthYmd &&
    a.birthHm === b.birthHm &&
    a.gender === b.gender &&
    a.calendar === b.calendar
  );
}

async function fetchFullForRow(
  row: ServerSajuRow
): Promise<Record<string, unknown> | null> {
  const { birthYmd, birthHm, timeUnknown, calendar, gender } =
    rowToBirthFields(row);
  if (birthYmd.length !== 8) return null;

  const y = Number(birthYmd.slice(0, 4));
  const m = Number(birthYmd.slice(4, 6));
  const d = Number(birthYmd.slice(6, 8));
  const hour = timeUnknown ? null : Number(birthHm.slice(0, 2));
  const minute = timeUnknown ? null : Number(birthHm.slice(2, 4));

  const body: Record<string, unknown> = {
    calendar_type: calendar,
    year: y,
    month: m,
    day: d,
    hour,
    minute,
    gender,
    is_leap_month: false,
    time_unknown: timeUnknown,
  };
  const tz = (row.iana_timezone || "").trim();
  if (tz) body.iana_timezone = tz;

  try {
    const res = await fetch(`${API_BASE}/saju/full`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;
    if (!res.ok || !json) return null;
    return json;
  } catch {
    return null;
  }
}

/**
 * 저장된 사주 목록 가져오기
 */
export function getSavedSajuList(): SavedSaju[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('사주 목록 불러오기 실패:', error);
    return [];
  }
}

/**
 * 채팅 등: URL `saju_id`(서버 숫자 id 또는 로컬 id 문자열)로 목록에서 한 건 선택.
 * 없거나 매칭 실패 시 목록의 첫 번째(최신) 반환.
 */
export function pickSavedSajuForChat(
  list: SavedSaju[],
  sajuIdFromUrl: string | null | undefined
): SavedSaju | null {
  if (!list.length) return null;
  const raw = (sajuIdFromUrl || "").trim();
  if (raw) {
    const found = list.find((s) => {
      if (String(s.id) === raw) return true;
      if (String(s.id) === `srv-${raw}`) return true;
      if (String(s.id).startsWith("srv-") && String(s.id).slice(4) === raw)
        return true;
      return false;
    });
    if (found) return found;
  }
  return list[0] ?? null;
}

/**
 * /api/chat 의 body.saju — route.ts 에서 result 가 있어야 등록 사주로 인식됨.
 */
export function savedSajuToChatApiPayload(
  s: SavedSaju | null | undefined
):
  | {
      name: string;
      birthYmd: string;
      birthHm: string;
      gender: "M" | "F";
      calendar: "solar" | "lunar";
      timeUnknown: boolean;
      result: unknown;
    }
  | undefined {
  if (!s || s.result == null) return undefined;
  return {
    name: s.name,
    birthYmd: s.birthYmd,
    birthHm: s.birthHm,
    gender: s.gender,
    calendar: s.calendar,
    timeUnknown: s.timeUnknown,
    result: s.result,
  };
}

/**
 * 새 사주 저장하기
 * - id를 넘기면 해당 id 사용(서버 저장 직후 `srv-{saju_id}` 로 맞춤)
 * - createdAt을 넘기면 그대로 사용
 */
export function saveSaju(
  saju: Omit<SavedSaju, "id" | "createdAt"> & {
    id?: string;
    createdAt?: string;
  }
): { success: boolean; message: string } {
  try {
    const list = getSavedSajuList();

    const newId = saju.id?.trim() || Date.now().toString();
    const existingIdx = list.findIndex((s) => s.id === newId);
    const isNewSlot = existingIdx === -1;

    // 신규 행만 개수 제한 (같은 id 갱신은 허용)
    if (isNewSlot && list.length >= MAX_SAJU_COUNT) {
      return {
        success: false,
        message: `최대 ${MAX_SAJU_COUNT}개까지만 저장할 수 있습니다. 기존 사주를 삭제해주세요.`,
      };
    }

    const newSaju: SavedSaju = {
      name: saju.name,
      birthYmd: saju.birthYmd,
      birthHm: saju.birthHm,
      gender: saju.gender,
      calendar: saju.calendar,
      timeUnknown: saju.timeUnknown,
      result: saju.result,
      lastViewed: saju.lastViewed,
      id: newId,
      createdAt: saju.createdAt || new Date().toISOString(),
    };

    let next: SavedSaju[];
    if (existingIdx >= 0) {
      next = [...list];
      next[existingIdx] = { ...next[existingIdx], ...newSaju };
    } else {
      next = [newSaju, ...list];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    
    return {
      success: true,
      message: "사주가 저장되었습니다.",
    };
  } catch (error) {
    console.error("사주 저장 실패:", error);
    return {
      success: false,
      message: "저장 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 서버에서 받은 사주 목록으로 로컬 캐시를 갱신합니다.
 * - DB 행은 id `srv-{id}` 로 저장되어 재로그인 후에도 동일 건으로 인식됩니다.
 * - 서버에 없는 로컬 전용 항목(id가 srv- 로 시작하지 않음)은, 생년월일·시간·성별·달력이
 *   서버 행과 겹치지 않는 경우만 유지합니다 (DB 우선).
 */
export async function hydrateLocalSajuCacheFromServerRows(
  rows: ServerSajuRow[]
): Promise<void> {
  if (typeof window === "undefined") return;

  const serverRows = Array.isArray(rows) ? rows : [];
  const serverSaved: SavedSaju[] = [];

  for (const row of serverRows.slice(0, MAX_SAJU_COUNT)) {
    const fields = rowToBirthFields(row);
    const fullJson = await fetchFullForRow(row);
    if (!fullJson) continue;
    // mapFullSajuJsonToResult는 UI용 pillar 구조(cheongan/jiji)를 만든다.
    // fullJson의 원본 필드(daeun_list, sinsal, ten_gods, strength 등)도 함께 보존해야
    // route.ts buildSajuContext가 GPT에 전달할 수 있다.
    const result = { ...fullJson, ...mapFullSajuJsonToResult(fullJson) };
    serverSaved.push({
      id: `srv-${row.id}`,
      name: row.name || "저장된 사주",
      birthYmd: fields.birthYmd,
      birthHm: fields.birthHm,
      gender: fields.gender,
      calendar: fields.calendar,
      timeUnknown: fields.timeUnknown,
      result,
      createdAt: row.created_at || new Date().toISOString(),
    });
  }

  const prev = getSavedSajuList();
  const localOnly = prev.filter((s) => !String(s.id).startsWith("srv-"));
  const filteredLocal = localOnly.filter((s) => {
    const ident = {
      birthYmd: s.birthYmd,
      birthHm: s.birthHm,
      gender: s.gender,
      calendar: s.calendar,
    };
    return !serverSaved.some((srv) => sameBirthIdentity(ident, srv));
  });

  const merged = [...serverSaved, ...filteredLocal].slice(0, MAX_SAJU_COUNT);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
}

/**
 * 로그인 세션으로 서버 사주 목록을 가져와 로컬 캐시와 맞춥니다.
 */
export async function syncSavedSajuListWithServer(): Promise<{
  ok: boolean;
  count: number;
}> {
  if (typeof window === "undefined") return { ok: false, count: 0 };

  try {
    const res = await fetch(`${API_BASE}/api/saju/list`, {
      credentials: "include",
      headers: getAuthHeaders(),
    });
    if (!res.ok) return { ok: false, count: 0 };

    const data = (await res.json().catch(() => [])) as unknown;
    const rows = Array.isArray(data) ? (data as ServerSajuRow[]) : [];
    await hydrateLocalSajuCacheFromServerRows(rows);
    return { ok: true, count: rows.length };
  } catch (e) {
    console.warn("syncSavedSajuListWithServer:", e);
    return { ok: false, count: 0 };
  }
}

/**
 * 사주 수정하기
 */
export function updateSaju(id: string, updates: Partial<SavedSaju>): { success: boolean; message: string } {
  try {
    const list = getSavedSajuList();
    const index = list.findIndex(s => s.id === id);
    
    if (index === -1) {
      return {
        success: false,
        message: '사주를 찾을 수 없습니다.'
      };
    }
    
    list[index] = { ...list[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    
    return {
      success: true,
      message: '사주가 수정되었습니다.'
    };
  } catch (error) {
    console.error('사주 수정 실패:', error);
    return {
      success: false,
      message: '수정 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 사주 삭제하기
 */
export function deleteSaju(id: string): { success: boolean; message: string } {
  try {
    const list = getSavedSajuList();
    const filtered = list.filter(s => s.id !== id);
    
    if (list.length === filtered.length) {
      return {
        success: false,
        message: '사주를 찾을 수 없습니다.'
      };
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    return {
      success: true,
      message: '사주가 삭제되었습니다.'
    };
  } catch (error) {
    console.error('사주 삭제 실패:', error);
    return {
      success: false,
      message: '삭제 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 특정 사주 가져오기
 */
export function getSajuById(id: string): SavedSaju | null {
  const list = getSavedSajuList();
  return list.find(s => s.id === id) || null;
}

/**
 * 마지막 조회 시간 업데이트
 */
export function updateLastViewed(id: string): void {
  const list = getSavedSajuList();
  const index = list.findIndex(s => s.id === id);
  
  if (index !== -1) {
    list[index].lastViewed = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

/**
 * 생년월일 포맷팅 (YYYYMMDD → YYYY년 MM월 DD일)
 */
export function formatBirthDate(ymd: string): string {
  if (ymd.length !== 8) return ymd;
  const year = ymd.slice(0, 4);
  const month = ymd.slice(4, 6);
  const day = ymd.slice(6, 8);
  return `${year}년 ${month}월 ${day}일`;
}

/**
 * 로컬에 저장된 사주 중 daeun_list 등 필수 필드가 없는 항목을
 * 백엔드에서 다시 받아 갱신합니다. (구버전 데이터 마이그레이션)
 *
 * 업데이트된 항목 수를 반환합니다.
 */
export async function refreshLocalSajuIfMissingFields(): Promise<number> {
  if (typeof window === "undefined") return 0;

  const list = getSavedSajuList();
  if (!list.length) return 0;

  let updated = 0;
  const next = [...list];

  for (let i = 0; i < next.length; i++) {
    const s = next[i];
    const ymd = String(s.birthYmd || "").replace(/\D/g, "");
    if (ymd.length < 8) continue;

    const result = s.result as Record<string, unknown> | null | undefined;
    // daeun_list가 이미 있으면 스킵
    if (Array.isArray(result?.daeun_list) && result.daeun_list.length > 0) continue;

    const hm = String(s.birthHm ?? "1200").padStart(4, "0");
    try {
      const res = await fetch(`${API_BASE}/saju/full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calendar_type: s.calendar === "lunar" ? "lunar" : "solar",
          year: parseInt(ymd.slice(0, 4), 10),
          month: parseInt(ymd.slice(4, 6), 10),
          day: parseInt(ymd.slice(6, 8), 10),
          hour: s.timeUnknown ? null : parseInt(hm.slice(0, 2), 10),
          minute: s.timeUnknown ? null : parseInt(hm.slice(2, 4), 10),
          gender: s.gender,
          time_unknown: Boolean(s.timeUnknown),
          is_leap_month: false,
        }),
      });
      if (!res.ok) continue;
      const fullJson = (await res.json()) as Record<string, unknown>;
      // 기존 result(UI 구조)와 새 fullJson(원본 전체)을 merge
      next[i] = {
        ...s,
        result: { ...(result ?? {}), ...fullJson },
      };
      updated++;
    } catch {
      // 실패 시 조용히 다음 항목으로
    }
  }

  if (updated > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return updated;
}

/**
 * 시간 포맷팅 (HHMM → HH시 MM분)
 */
export function formatBirthTime(hm: string): string {
  if (hm.length !== 4) return hm;
  const hour = hm.slice(0, 2);
  const minute = hm.slice(2, 4);
  return `${hour}시 ${minute}분`;
}
