import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  const expected = (process.env.BETA_ACCESS_CODE || "").trim();
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "서버 환경변수 `BETA_ACCESS_CODE`가 설정되지 않았습니다." },
      { status: 503 },
    );
  }

  if (!code || code !== expected) {
    return NextResponse.json({ ok: false, error: "코드가 올바르지 않습니다." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("beta_access", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30일
  });
  return res;
}

