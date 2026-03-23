"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { getAuthHeaders } from "@/lib/auth";
import { loadReportInputBySajuId } from "@/lib/reportSaju";
import { ReportSection } from "@/components/ReportSection";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://saju-backend-eqd6.onrender.com";

type CareerAnalysis = {
  work_style?: string;
  best_field?: string;
  org_vs_independent?: string;
  current_flow?: string;
  seun_career?: string;
  language_points?: string[];
};

function CareerReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sajuId = searchParams.get("saju_id") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CareerAnalysis>({});

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

        const res = await fetch(`${API_BASE}/saju/report/career`, {
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
          throw new Error(data?.error || "직업운 리포트를 불러오지 못했어요.");
        }
        if (cancelled) return;
        setAnalysis((data.analysis || {}) as CareerAnalysis);
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
    const fp = analysis?.language_points?.find((x) => x.includes("식상 구조") || x.includes("관성 구조"));
    return fp || analysis.work_style || "";
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
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>💼 직업운 분석</h1>
        </header>

        <ReportSection title="1. 나의 직업 DNA" loading={loading} error={error} content={dna} />
        <ReportSection title="2. 일하는 방식" loading={loading} error={error} content={analysis.work_style} />
        <ReportSection title="3. 잘 맞는 직종" loading={loading} error={error} content={analysis.best_field} />
        <ReportSection title="4. 조직 vs 독립" loading={loading} error={error} content={analysis.org_vs_independent} />
        <ReportSection title="5. 현재 커리어 흐름" loading={loading} error={error} content={analysis.current_flow} />
        <ReportSection title="6. 올해 직업운" loading={loading} error={error} content={analysis.seun_career} />
      </div>
    </main>
  );
}

function CareerReportFallback() {
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
        <ReportSection title="💼 직업운 분석" loading content="" />
      </div>
    </main>
  );
}

export default function CareerReportPage() {
  return (
    <Suspense fallback={<CareerReportFallback />}>
      <CareerReportContent />
    </Suspense>
  );
}

