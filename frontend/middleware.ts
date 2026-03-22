import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/** true: 베타 코드 필요 / false: 게이트 잠깐 해제(전체 통과) — 다시 막을 때 true로 변경 */
const BETA_GATE_ENABLED = false;

/**
 * 베타 접근 제어
 * - cookie `beta_access=1`이 있어야 사이트 전체 진입 가능
 * - 없으면 `/beta-access`로 리다이렉트
 */
export function middleware(req: NextRequest) {
  if (!BETA_GATE_ENABLED) return NextResponse.next();

  const cookie = req.cookies.get("beta_access")?.value;
  const isAuthorized = cookie === "1";
  if (isAuthorized) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // 베타 접근 페이지/검증 API/정적 리소스는 예외 허용
  if (
    pathname.startsWith("/beta-access") ||
    pathname.startsWith("/api/beta-verify") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/beta-access";
  url.searchParams.set("redirect", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  // 정적 파일/_next 등에는 미들웨어가 실행되지 않도록 제외
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|api/beta-verify|beta-access).*)"],
};

