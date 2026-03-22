/**
 * 모바일 크로스 도메인에서 쿠키가 안 붙을 때 사용하는 세션 토큰.
 * 로그인 성공 시 백엔드가 URL fragment로 전달한 토큰을 sessionStorage에 저장하고,
 * API 호출 시 Authorization 헤더로 보냄.
 */
const TOKEN_KEY = "hsaju_token";

/** 같은 탭 세션에서 사주 로컬 캐시를 이미 서버와 맞췄는지 (중복 /saju/full 방지) */
export const SAJU_CACHE_HYDRATED_KEY = "saju_cache_hydrated_session";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(SAJU_CACHE_HYDRATED_KEY);
}

/** API 요청 시 사용할 헤더. 쿠키만 쓰는 경우 빈 객체, 토큰이 있으면 Authorization 추가. */
export function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
