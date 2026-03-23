"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { getAuthHeaders } from "@/lib/auth";
import { loadReportInputBySajuId } from "@/lib/reportSaju";
import { ReportSection } from "@/components/ReportSection";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://saju-backend-eqd6.onrender.com";

type LoveAnalysis = {
  partner_type?: string;
  pattern?: string;
  current_flow?: string;
  seun_love?: string;
  timing?: string;
  language_points?: string[];
};

function LoveReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sajuId = searchParams.get("saju_id") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<LoveAnalysis>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!sajuId) {
        setError("사주 정보를 찾지 못했어요. 미리보기에서 다시 들어와 주세요.");
        setLoading(false);
        return;
      }
      try {
        const payload = await loadReportInputBySajuId(sajuId);
        if (!payload) throw new Error("사주 데이터를 불러오지 못했어요.");

        const res = await fetch(`${API_BASE}/saju/report/love`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.success) {
          throw new Error(data?.error || "연애운 리포트를 불러오지 못했어요.");
        }
        if (cancelled) return;
        setAnalysis((data.analysis || {}) as LoveAnalysis);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "오류가 발생했어요.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sajuId]);

  const dna = useMemo(() => {
    const fp = analysis?.language_points?.find((x) => x.includes("연인성 위치"));
    return fp || analysis.pattern || "";
  }, [analysis]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F5F1EA",
        fontFamily: "'Gmarket Sans', sans-serif",
        color: "#2C2417",
      }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "12px 16px 40px" }}>
        <header style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0 12px" }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{ border: "none", background: "transparent", color: "#2C2417", padding: 4 }}
          >
            <Icon icon="mdi:chevron-left" width={24} />
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>❤️ 연애운 분석</h1>
        </header>

        <ReportSection title="1. 나의 연애 DNA" loading={loading} error={error} content={dna} />
        <ReportSection title="2. 반복되는 연애 패턴" loading={loading} error={error} content={analysis.pattern} />
        <ReportSection title="3. 잘 맞는 상대 유형" loading={loading} error={error} content={analysis.partner_type} />
        <ReportSection title="4. 현재 연애 흐름" loading={loading} error={error} content={analysis.current_flow} />
        <ReportSection title="5. 올해 연애운" loading={loading} error={error} content={analysis.seun_love} />
        <ReportSection title="6. 인연이 오는 시기" loading={loading} error={error} content={analysis.timing} />
      </div>
    </main>
  );
}

function LoveReportFallback() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F5F1EA",
        fontFamily: "'Gmarket Sans', sans-serif",
        color: "#2C2417",
      }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 16px" }}>
        <ReportSection title="❤️ 연애운 분석" loading content="" />
      </div>
    </main>
  );
}

export default function LoveReportPage() {
  return (
    <Suspense fallback={<LoveReportFallback />}>
      <LoveReportContent />
    </Suspense>
  );
}

