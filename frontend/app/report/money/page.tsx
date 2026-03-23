"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { getAuthHeaders } from "@/lib/auth";
import { loadReportInputBySajuId } from "@/lib/reportSaju";
import { ReportSection } from "@/components/ReportSection";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://saju-backend-eqd6.onrender.com";

type MoneyAnalysis = {
  pattern?: string;
  leak_point?: string;
  current_flow?: string;
  seun_money?: string;
  advice?: string;
  language_points?: string[];
};

export default function MoneyReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sajuId = searchParams.get("saju_id") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MoneyAnalysis>({});

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

        const res = await fetch(`${API_BASE}/saju/report/money`, {
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
          throw new Error(data?.error || "재물운 리포트를 불러오지 못했어요.");
        }
        if (cancelled) return;
        setAnalysis((data.analysis || {}) as MoneyAnalysis);
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

  const moneyWay = useMemo(() => {
    if (analysis?.language_points?.length) {
      const hit = analysis.language_points.find((x) => x.includes("식상생재") || x.includes("재성 위치"));
      if (hit) return hit;
    }
    return analysis.pattern || "";
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
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>💰 재물운 분석</h1>
        </header>

        <ReportSection title="1. 나의 재물 DNA" loading={loading} error={error} content={analysis.pattern} />
        <ReportSection title="2. 돈 버는 방식" loading={loading} error={error} content={moneyWay} />
        <ReportSection title="3. 누수 포인트" loading={loading} error={error} content={analysis.leak_point} />
        <ReportSection title="4. 현재 재물 흐름" loading={loading} error={error} content={analysis.current_flow} />
        <ReportSection title="5. 올해 재물운" loading={loading} error={error} content={analysis.seun_money} />
        <ReportSection title="6. 재물 늘리는 방법" loading={loading} error={error} content={analysis.advice} />
      </div>
    </main>
  );
}

