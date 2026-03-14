/**
 * 모바일 크로스 도메인에서 쿠키가 안 붙을 때 사용하는 세션 토큰.
 * 로그인 성공 시 백엔드가 URL fragment로 전달한 토큰을 sessionStorage에 저장하고,
 * API 호출 시 Authorization 헤더로 보냄.
 */
const TOKEN_KEY = "hsaju_token";

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
}

/** API 요청 시 사용할 헤더. 쿠키만 쓰는 경우 빈 객체, 토큰이 있으면 Authorization 추가. */
export function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
