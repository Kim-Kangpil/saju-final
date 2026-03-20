"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function BetaAccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTarget = useMemo(() => {
    const raw = searchParams.get("redirect");
    return raw && raw.startsWith("/") ? raw : "/";
  }, [searchParams]);

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    setErr(null);
    setOk(false);
  }, []);

  async function onVerify() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/beta-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "인증에 실패했어요.");
      }
      setOk(true);

      // 쿠키가 반영된 뒤 리다이렉트
      router.replace(redirectTarget);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "인증 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F2EDE4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#FFFCF7",
          border: "1px solid #D8D2C8",
          borderRadius: 14,
          padding: 18,
          boxShadow: "0 8px 24px rgba(0,0,0,.06)",
        }}
      >
        <h1 style={{ fontSize: 18, fontWeight: 900, marginBottom: 6 }}>베타 접근 인증</h1>
        <p style={{ fontSize: 12, color: "#7A776F", lineHeight: 1.7, marginBottom: 14 }}>
          사이트 전체는 베타 기간 동안 코드 인증이 필요합니다.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ fontSize: 12, fontWeight: 800, color: "#2C2A26" }}>접근 코드</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="예: HANYANG2025"
            style={{
              padding: "12px 12px",
              borderRadius: 10,
              border: "1px solid #C8C2B6",
              background: "#FFFCF7",
              fontSize: 14,
              outline: "none",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !busy) onVerify();
            }}
            autoFocus
          />

          {err && (
            <div
              style={{
                border: "1px solid #D4C9B8",
                background: "#F5F1EA",
                padding: 10,
                borderRadius: 10,
                color: "#4A3F30",
                fontSize: 12,
                lineHeight: 1.6,
              }}
              role="alert"
            >
              {err}
            </div>
          )}

          {ok && (
            <div
              style={{
                border: "1px solid #D4C9B8",
                background: "#F5F1EA",
                padding: 10,
                borderRadius: 10,
                color: "#4A3F30",
                fontSize: 12,
                lineHeight: 1.6,
                fontWeight: 800,
              }}
            >
              인증 완료! 이동 중...
            </div>
          )}

          <button
            type="button"
            onClick={onVerify}
            disabled={busy || !code.trim()}
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              border: "none",
              background: "#4A6741",
              color: "#fff",
              fontWeight: 900,
              cursor: busy || !code.trim() ? "not-allowed" : "pointer",
              opacity: busy || !code.trim() ? 0.7 : 1,
            }}
          >
            {busy ? "확인 중..." : "접근하기"}
          </button>
        </div>

        <p style={{ fontSize: 11, color: "#7A776F", marginTop: 12, lineHeight: 1.6 }}>
          (서버에서 코드 검증 후 쿠키가 발급됩니다.)
        </p>
      </div>
    </main>
  );
}

