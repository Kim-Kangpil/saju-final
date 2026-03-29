"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { getAuthHeaders } from "@/lib/auth";
import { loadReportInputBySajuId } from "@/lib/reportSaju";
import { ReportSection } from "@/components/ReportSection";
import KakaoPayButton from "@/components/KakaoPayButton";
import { parseGptSections } from "@/lib/parseGptReportSections";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://saju-backend-eqd6.onrender.com";

const SECTION_TITLES = [
  "💼 일하는 방식",
  "🎯 잘 맞는 직종",
  "🏢 조직 vs 독립",
  "📈 현재 커리어 흐름",
  "🗓 올해 직업운",
  "✅ 실천 조언",
];

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
        <div style={{ fontSize: 36, marginBottom: 16 }}>💼</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#2C2417", marginBottom: 8 }}>직업운 리포트</div>
        <div style={{ fontSize: 13, color: "#6B6B6B", lineHeight: 1.7, marginBottom: 24 }}>
          이 리포트를 보려면 구매가 필요해요.<br />
          한 번 구매하면 언제든 다시 볼 수 있어요.
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#2C2417", marginBottom: 20 }}>
          {price.toLocaleString()}원
        </div>
        <KakaoPayButton orderType="career" price={price} label="직업운 리포트 구매" sajuId={sajuId} onError={setPayErr} />
        {payErr && <div style={{ fontSize: 12, color: "#e11d48", marginTop: 8 }}>{payErr}</div>}
        <button type="button" onClick={onDismiss}
          style={{ marginTop: 14, background: "none", border: "none", fontSize: 13, color: "#A0A0A0", cursor: "pointer" }}>
          나중에
        </button>
      </div>
    </div>
  );
}

function CareerAddonModal({
  price,
  sajuId,
  onDismiss,
}: { price: number; sajuId: string; onDismiss: () => void }) {
  const [payErr, setPayErr] = useState<string | null>(null);
  const saveReturn = () => {
    if (typeof window !== "undefined" && sajuId) {
      localStorage.setItem("kakao_pay_report_return", `/report/career?saju_id=${encodeURIComponent(sajuId)}`);
    }
  };
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
        fontFamily: "var(--font-sans), 'Gmarket Sans', sans-serif",
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#2C2417", marginBottom: 10 }}>더 직설적인 분석</div>
        <div style={{ fontSize: 13, color: "#6B6B6B", lineHeight: 1.7, marginBottom: 20 }}>
          위로·완충 없이, 같은 사실을 더 건조하게 풀어드려요.<br />
          분량·구성은 지금 보신 리포트와 같아요.
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#2C2417", marginBottom: 18 }}>+{price.toLocaleString()}원</div>
        <KakaoPayButton
          orderType="career_realistic"
          price={price}
          label="추가 구매"
          sajuId={sajuId}
          onBeforePay={saveReturn}
          onError={setPayErr}
        />
        {payErr && <div style={{ fontSize: 12, color: "#e11d48", marginTop: 8 }}>{payErr}</div>}
        <button type="button" onClick={onDismiss}
          style={{ marginTop: 14, background: "none", border: "none", fontSize: 13, color: "#A0A0A0", cursor: "pointer" }}>닫기</button>
      </div>
    </div>
  );
}

function CareerReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sajuId = searchParams.get("saju_id") || "";
  const variantParam = searchParams.get("variant") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionsMain, setSectionsMain] = useState<string[]>(new Array(6).fill(""));
  const [sectionsRealistic, setSectionsRealistic] = useState<string[]>(new Array(6).fill(""));
  const [loadingRealistic, setLoadingRealistic] = useState(false);
  const [realisticError, setRealisticError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"main" | "realistic">("main");
  const [showPurchase, setShowPurchase] = useState(false);
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [purchasePrice, setPurchasePrice] = useState(5900);
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasDirectAddon, setHasDirectAddon] = useState(false);
  const [addonPrice, setAddonPrice] = useState(990);
  const realisticFetchedRef = useRef(false);

  useEffect(() => {
    realisticFetchedRef.current = false;
    setSectionsRealistic(new Array(6).fill(""));
  }, [sajuId]);

  useEffect(() => {
    if (variantParam === "realistic") setActiveView("realistic");
  }, [variantParam]);

  useEffect(() => {
    if (!sajuId) return;
    fetch(`${API_BASE}/api/payment/report-access/career`, { credentials: "include", headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => {
        if (!d.has_access) { setPurchasePrice(d.price || 5900); setShowPurchase(true); setLoading(false); }
        if (typeof d.has_direct_addon === "boolean") setHasDirectAddon(d.has_direct_addon);
        if (d.direct_addon_price) setAddonPrice(d.direct_addon_price);
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
        const res = await fetch(`${API_BASE}/saju/report/career`, {
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
        if (!res.ok || !data?.success) throw new Error(data?.error || "직업운 리포트를 불러오지 못했어요.");
        if (cancelled) return;
        setSectionsMain(parseGptSections(data.content || "", 6));
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "오류가 발생했어요.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [sajuId, accessChecked, showPurchase]);

  useEffect(() => {
    if (!accessChecked || showPurchase || !hasDirectAddon || activeView !== "realistic") return;
    if (realisticFetchedRef.current) return;
    let cancelled = false;
    (async () => {
      setLoadingRealistic(true);
      setRealisticError(null);
      try {
        const payload = await loadReportInputBySajuId(sajuId);
        if (!payload) throw new Error("사주 데이터를 불러오지 못했어요.");
        const res = await fetch(`${API_BASE}/saju/report/career-realistic`, {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => null);
        if (res.status === 403) {
          const detail = typeof data?.detail === "string"
            ? (() => { try { return JSON.parse(data.detail); } catch { return {}; } })()
            : (data?.detail || {});
          if (detail.error === "purchase_required") { setRealisticError("추가 구매가 필요해요."); return; }
        }
        if (!res.ok || !data?.success) throw new Error(data?.error || "불러오지 못했어요.");
        if (!cancelled) {
          realisticFetchedRef.current = true;
          setSectionsRealistic(parseGptSections(data.content || "", 6));
        }
      } catch (e: any) {
        if (!cancelled) setRealisticError(e?.message || "오류가 발생했어요.");
      } finally {
        if (!cancelled) setLoadingRealistic(false);
      }
    })();
    return () => { cancelled = true; };
  }, [accessChecked, showPurchase, hasDirectAddon, activeView, sajuId]);

  const showCta = accessChecked && !showPurchase && !loading && !error;
  const displaySections = activeView === "main" ? sectionsMain : sectionsRealistic;
  const displayLoading = activeView === "main" ? loading : loadingRealistic;
  const displayError = activeView === "main" ? error : realisticError;

  return (
    <main style={{ minHeight: "100vh", background: "#F5F1EA", fontFamily: "var(--font-sans), 'Gmarket Sans', sans-serif", color: "#2C2417" }}>
      {showPurchase && (
        <PurchaseModal price={purchasePrice} sajuId={sajuId} onDismiss={() => { setShowPurchase(false); router.back(); }} />
      )}
      {showAddonModal && sajuId && (
        <CareerAddonModal price={addonPrice} sajuId={sajuId} onDismiss={() => setShowAddonModal(false)} />
      )}
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "12px 16px 40px" }}>
        <header style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0 12px" }}>
          <button type="button" onClick={() => router.back()}
            style={{ border: "none", background: "transparent", color: "#2C2417", padding: 4 }}>
            <Icon icon="mdi:chevron-left" width={24} />
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>💼 직업운 분석</h1>
        </header>

        {hasDirectAddon && !showPurchase && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button type="button" onClick={() => setActiveView("main")}
              style={{
                flex: 1, padding: "10px 12px", borderRadius: 12, border: "1.5px solid #E0DDCF",
                background: activeView === "main" ? "#2C2417" : "#FBF8F3",
                color: activeView === "main" ? "#fff" : "#2C2417",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>지금 보신 분석</button>
            <button type="button" onClick={() => setActiveView("realistic")}
              style={{
                flex: 1, padding: "10px 12px", borderRadius: 12, border: "1.5px solid #E0DDCF",
                background: activeView === "realistic" ? "#2C2417" : "#FBF8F3",
                color: activeView === "realistic" ? "#fff" : "#2C2417",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>더 직설적인 분석</button>
          </div>
        )}

        {SECTION_TITLES.map((title, i) => (
          <ReportSection key={`${activeView}-${title}`} title={title} loading={displayLoading} error={displayError} content={displaySections[i]} />
        ))}

        {showCta && !hasDirectAddon && (
          <section style={{
            marginTop: 28, padding: "22px 18px", borderRadius: 16,
            background: "#FBF8F3", border: "1.5px solid #E8E0D4",
          }}>
            <p style={{ fontSize: 14, color: "#2C2417", lineHeight: 1.75, margin: "0 0 16px" }}>
              위로나 완충 없이, 같은 내용을 더 건조하게 보고 싶다면 추가로 열 수 있어요.
              글자 수·섹션 구성은 지금과 동일해요.
            </p>
            <button type="button" onClick={() => setShowAddonModal(true)}
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12, border: "none",
                background: "#2C2417", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
              }}>더 직설적인 분석 · +{addonPrice.toLocaleString()}원</button>
          </section>
        )}

        {/* 공유/저장 */}
        {!showPurchase && !loading && !error && (
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={async () => {
                  const url = window.location.href;
                  if (navigator.share) {
                    try { await navigator.share({ title: '직업운 분석 리포트', url }); } catch {}
                  } else {
                    await navigator.clipboard.writeText(url).catch(() => {});
                    alert('링크가 복사됐어요!');
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 20px', borderRadius: 10,
                  border: '1.5px solid #E8E0D4', background: '#FBF8F3',
                  color: '#4A3F30', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                📤 공유하기
              </button>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 20px', borderRadius: 10,
                border: '1.5px solid #bbf7d0', background: '#f0fdf4',
                color: '#166534', fontSize: 13, fontWeight: 600,
              }}>
                ✅ 저장됨
              </div>
            </div>
            <p style={{ fontSize: 11, color: '#A8946A', textAlign: 'center' }}>
              리포트는 자동 저장돼요. 언제든 다시 열람 가능해요.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function CareerReportFallback() {
  return (
    <main style={{ minHeight: "100vh", background: "#F5F1EA", fontFamily: "'Gmarket Sans', sans-serif", color: "#2C2417" }}>
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
