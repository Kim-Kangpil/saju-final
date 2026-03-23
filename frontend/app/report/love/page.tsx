"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { getAuthHeaders } from "@/lib/auth";
import { loadReportInputBySajuId } from "@/lib/reportSaju";
import { ReportSection } from "@/components/ReportSection";
import KakaoPayButton from "@/components/KakaoPayButton";

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

function PurchaseModal({ price, sajuId, onDismiss }: { price: number; sajuId: string; onDismiss: () => void }) {
  const [payErr, setPayErr] = useState<string | null>(null);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(44,36,23,0.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px",
    }}>
      <div style={{
        background: "#FBF8F3", borderRadius: 20, padding: "32px 24px 28px",
        width: "100%", maxWidth: 360, textAlign: "center",
        boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
        fontFamily: "'Gmarket Sans', sans-serif",
      }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>❤️</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#2C2417", marginBottom: 8 }}>연애운 리포트</div>
        <div style={{ fontSize: 13, color: "#6B6B6B", lineHeight: 1.7, marginBottom: 24 }}>
          이 리포트를 보려면 구매가 필요해요.<br />
          한 번 구매하면 언제든 다시 볼 수 있어요.
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#2C2417", marginBottom: 20 }}>
          {price.toLocaleString()}원
        </div>
        <KakaoPayButton orderType="love" price={price} label="연애운 리포트 구매" sajuId={sajuId} onError={setPayErr} />
        {payErr && <div style={{ fontSize: 12, color: "#e11d48", marginTop: 8 }}>{payErr}</div>}
        <button type="button" onClick={onDismiss}
          style={{ marginTop: 14, background: "none", border: "none", fontSize: 13, color: "#A0A0A0", cursor: "pointer" }}>
          나중에
        </button>
      </div>
    </div>
  );
}

function LoveReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sajuId = searchParams.get("saju_id") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<LoveAnalysis>({});
  const [showPurchase, setShowPurchase] = useState(false);
  const [purchasePrice, setPurchasePrice] = useState(5900);
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    if (!sajuId) return;
    fetch(`${API_BASE}/api/payment/report-access/love`, { credentials: "include", headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => {
        if (!d.has_access) { setPurchasePrice(d.price || 5900); setShowPurchase(true); setLoading(false); }
        setAccessChecked(true);
      })
      .catch(() => setAccessChecked(true));
  }, [sajuId]);

  useEffect(() => {
    if (!accessChecked || showPurchase) return;
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
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => null);
        if (res.status === 403) {
          const detail = typeof data?.detail === "string"
            ? (() => { try { return JSON.parse(data.detail); } catch { return {}; } })()
            : (data?.detail || {});
          if (detail.error === "purchase_required") {
            setPurchasePrice(detail.price || 5900); setShowPurchase(true); setLoading(false); return;
          }
        }
        if (!res.ok || !data?.success) throw new Error(data?.error || "연애운 리포트를 불러오지 못했어요.");
        if (cancelled) return;
        setAnalysis((data.analysis || {}) as LoveAnalysis);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "오류가 발생했어요.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [sajuId, accessChecked, showPurchase]);

  const dna = useMemo(() => {
    const fp = analysis?.language_points?.find((x) => x.includes("연인성 위치"));
    return fp || analysis.pattern || "";
  }, [analysis]);

  return (
    <main style={{ minHeight: "100vh", background: "#F5F1EA", fontFamily: "'Gmarket Sans', sans-serif", color: "#2C2417" }}>
      {showPurchase && (
        <PurchaseModal price={purchasePrice} sajuId={sajuId} onDismiss={() => { setShowPurchase(false); router.back(); }} />
      )}
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "12px 16px 40px" }}>
        <header style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0 12px" }}>
          <button type="button" onClick={() => router.back()}
            style={{ border: "none", background: "transparent", color: "#2C2417", padding: 4 }}>
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
    <main style={{ minHeight: "100vh", background: "#F5F1EA", fontFamily: "'Gmarket Sans', sans-serif", color: "#2C2417" }}>
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
