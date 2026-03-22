/**
 * 출생지(시 단위) → IANA 타임존.
 * 목록에 없는 국내 지역 id는 모두 Asia/Seoul 로 간주합니다.
 */

export const OVERSEAS_LOCATION_IANA: Record<string, string> = {
  tokyo: "Asia/Tokyo",
  osaka: "Asia/Tokyo",
  nagoya: "Asia/Tokyo",
  sapporo: "Asia/Tokyo",
  fukuoka: "Asia/Tokyo",
  beijing: "Asia/Shanghai",
  shanghai: "Asia/Shanghai",
  guangzhou: "Asia/Shanghai",
  shenzhen: "Asia/Shanghai",
  "hong-kong": "Asia/Hong_Kong",
  taipei: "Asia/Taipei",
  "ho-chi-minh": "Asia/Ho_Chi_Minh",
  hanoi: "Asia/Ho_Chi_Minh",
  bangkok: "Asia/Bangkok",
  singapore: "Asia/Singapore",
  "kuala-lumpur": "Asia/Kuala_Lumpur",
  jakarta: "Asia/Jakarta",
  manila: "Asia/Manila",
  "new-delhi": "Asia/Kolkata",
  sydney: "Australia/Sydney",
  melbourne: "Australia/Melbourne",
  auckland: "Pacific/Auckland",
  "los-angeles": "America/Los_Angeles",
  "san-francisco": "America/Los_Angeles",
  chicago: "America/Chicago",
  "new-york": "America/New_York",
  toronto: "America/Toronto",
  vancouver: "America/Vancouver",
  "mexico-city": "America/Mexico_City",
  "sao-paulo": "America/Sao_Paulo",
  london: "Europe/London",
  paris: "Europe/Paris",
  berlin: "Europe/Berlin",
  madrid: "Europe/Madrid",
  rome: "Europe/Rome",
  moscow: "Europe/Moscow",
  dubai: "Asia/Dubai",
  "tel-aviv": "Asia/Jerusalem",
  cairo: "Africa/Cairo",
  johannesburg: "Africa/Johannesburg",
};

/** 경도 직접 입력은 알 수 없음 → null */
export function ianaForBirthLocationId(id: string): string | null {
  if (id === "custom") return null;
  if (OVERSEAS_LOCATION_IANA[id]) return OVERSEAS_LOCATION_IANA[id];
  return "Asia/Seoul";
}
