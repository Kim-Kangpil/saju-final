"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { getAuthHeaders } from "@/lib/auth";
import { loadReportInputBySajuId } from "@/lib/reportSaju";
import { ReportSection } from "@/components/ReportSection";
import InicisPayButton from "@/components/InicisPayButton";
import { parseGptSections } from "@/lib/parseGptReportSections";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://saju-backend-eqd6.onrender.com";

const LOADING_STEPS = [
  { upTo: 15, icon: "📅", msg: "생년월일·시각을 불러오고 있어요" },
  { upTo: 30, icon: "💰", msg: "재물과 연결된 오행 구조를 분석해요" },
  { upTo: 50, icon: "📊", msg: "수입·지출 패턴을 파악하는 중이에요" },
  { upTo: 68, icon: "📈", msg: "지금 재물 흐름의 방향을 읽고 있어요" },
  { upTo: 83, icon: "🗓", msg: "올해 재물운의 시기를 계산해요" },
  { upTo: 93, icon: "✍️", msg: "AI가 분석 결과를 정리하고 있어요" },
  { upTo: 100, icon: "✨", msg: "거의 완성됐어요\n잠시만 기다려 주세요 🙏" },
];
function getLoadingStep(p: number) {
  return LOADING_STEPS.find((s) => p < s.upTo) ?? LOADING_STEPS[LOADING_STEPS.length - 1];
}

const SECTION_TITLES = [
  "💰 재물 기질",
  "💵 수입 구조",
  "🕳 지출 패턴",
  "📈 현재 재물 흐름",
  "🗓 올해 재물운",
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
        <div style={{ fontSize: 36, marginBottom: 16 }}>💰</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#2C2417", marginBottom: 8 }}>
          재물운 리포트
        </div>
        <div style={{ fontSize: 13, color: "#6B6B6B", lineHeight: 1.7, marginBottom: 24 }}>
          이 리포트를 보려면 구매가 필요해요.<br />
          한 번 구매하면 언제든 다시 볼 수 있어요.
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#2C2417", marginBottom: 20 }}>
          {price.toLocaleString()}원
        </div>
        <InicisPayButton
          orderType="money"
          price={price}
          label="재물운 리포트 구매"
          sajuId={sajuId}
          onError={setPayErr}
        />
        {payErr && <div style={{ fontSize: 12, color: "#e11d48", marginTop: 8 }}>{payErr}</div>}
        <button
          type="button"
          onClick={onDismiss}
          style={{ marginTop: 14, background: "none", border: "none", fontSize: 13, color: "#A0A0A0", cursor: "pointer" }}
        >
          나중에
        </button>
      </div>
    </div>
  );
}

function AddonModal({
  price,
  sajuId,
  onDismiss,
}: { price: number; sajuId: string; onDismiss: () => void }) {
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
        fontFamily: "var(--font-sans), 'Gmarket Sans', sans-serif",
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#2C2417", marginBottom: 10 }}>
          더 직설적인 분석
        </div>
        <div style={{ fontSize: 13, color: "#6B6B6B", lineHeight: 1.7, marginBottom: 20 }}>
          위로·완충 없이, 같은 사실을 더 건조하게 풀어드려요.<br />
          분량·구성은 지금 보신 리포트와 같아요.
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#2C2417", marginBottom: 18 }}>
          +{price.toLocaleString()}원
        </div>
        <InicisPayButton
          orderType="money_realistic"
          price={price}
          label="추가 구매"
          sajuId={sajuId}
          onError={setPayErr}
        />
        {payErr && <div style={{ fontSize: 12, color: "#e11d48", marginTop: 8 }}>{payErr}</div>}
        <button
          type="button"
          onClick={onDismiss}
          style={{ marginTop: 14, background: "none", border: "none", fontSize: 13, color: "#A0A0A0", cursor: "pointer" }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}

function MoneyReportContent() {
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
  const [fakeProgress, setFakeProgress] = useState(0);
  const [stuckAt95, setStuckAt95] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stuckTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!loading) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current);
      setFakeProgress(100);
      return;
    }
    setFakeProgress(0);
    setStuckAt95(false);
    progressIntervalRef.current = setInterval(() => {
      setFakeProgress((prev) => {
        if (prev >= 95) {
          if (!stuckTimerRef.current) stuckTimerRef.current = setTimeout(() => setStuckAt95(true), 12000);
          return prev;
        }
        const inc = prev < 30 ? 3 : prev < 60 ? 1.5 : prev < 80 ? 0.8 : 0.3;
        return Math.min(95, prev + inc);
      });
    }, 150);
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (stuckTimerRef.current) { clearTimeout(stuckTimerRef.current); stuckTimerRef.current = null; }
    };
  }, [loading]);

  useEffect(() => {
    realisticFetchedRef.current = false;
    setSectionsRealistic(new Array(6).fill(""));
  }, [sajuId]);

  useEffect(() => {
    if (variantParam === "realistic") setActiveView("realistic");
  }, [variantParam]);

  useEffect(() => {
    if (!sajuId) return;
    fetch(`${API_BASE}/api/payment/report-access/money`, {
      credentials: "include",
      headers: getAuthHeaders(),
    })
      .then(r => r.json())
      .then(d => {
        if (!d.has_access) {
          setPurchasePrice(d.price || 5900);
          setShowPurchase(true);
          setLoading(false);
        }
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

        const res = await fetch(`${API_BASE}/saju/report/money`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => null);
        if (res.status === 403) {
          const detail = typeof data?.detail === "string"
            ? (() => { try { return JSON.parse(data.detail); } catch { return {}; } })()
            : (data?.detail || {});
          if (detail.error === "purchase_required") {
            setPurchasePrice(detail.price || 5900);
            setShowPurchase(true);
            setLoading(false);
            return;
          }
        }
        if (!res.ok || !data?.success) {
          throw new Error(data?.error || "재물운 리포트를 불러오지 못했어요.");
        }
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
        const res = await fetch(`${API_BASE}/saju/report/money-realistic`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => null);
        if (res.status === 403) {
          const detail = typeof data?.detail === "string"
            ? (() => { try { return JSON.parse(data.detail); } catch { return {}; } })()
            : (data?.detail || {});
          if (detail.error === "purchase_required") {
            setRealisticError("추가 구매가 필요해요.");
            return;
          }
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
  const loadingStep = getLoadingStep(fakeProgress);

  if (loading) {
    return (
      <div style={{ maxWidth: 520, margin: "0 auto", background: "#F5F1EA", minHeight: "100vh", fontFamily: "'Gmarket Sans', sans-serif" }}>
        <header style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #D4C9B8", background: "#fff" }}>
          <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <Icon icon="mdi:chevron-left" width={24} color="#2C2417" />
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#2C2417", flex: 1 }}>💰 재물운 분석</h1>
        </header>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 57px)", padding: "0 32px" }}>
          <motion.div key={loadingStep.icon} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.35 }}
            style={{ fontSize: 52, marginBottom: 28, lineHeight: 1 }}>
            {loadingStep.icon}
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.p key={loadingStep.msg} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.3 }}
              style={{ fontSize: 15, fontWeight: 700, color: "#4A3F30", textAlign: "center", marginBottom: 8, lineHeight: 1.6, whiteSpace: "pre-line" }}>
              {loadingStep.msg}
            </motion.p>
          </AnimatePresence>
          <p style={{ fontSize: 12, color: "#6B5F4E", marginBottom: stuckAt95 ? 12 : 32, textAlign: "center" }}>
            AI가 재물 데이터를 분석하고 있어요
          </p>
          {stuckAt95 && (
            <p style={{ fontSize: 12, color: "#8B7355", marginBottom: 32, textAlign: "center", lineHeight: 1.7, padding: "10px 16px", background: "#FBF8F3", borderRadius: 10, border: "1px solid #D4C9B8" }}>
              생각보다 오래 걸리고 있어요.<br />
              <strong>앱을 닫지 말고 잠시만 기다려 주세요.</strong><br />
              최대 1분 안에 완성돼요 💰
            </p>
          )}
          <div style={{ width: "100%", maxWidth: 300 }}>
            <div style={{ height: 6, background: "#E3D9CB", borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
              {fakeProgress < 95 ? (
                <motion.div style={{ height: "100%", background: "linear-gradient(90deg, #8B7355, #A8946A)", borderRadius: 99 }}
                  animate={{ width: `${fakeProgress}%` }} transition={{ duration: 0.4, ease: "easeOut" }} />
              ) : (
                <div style={{ position: "relative", height: "100%", width: "95%", background: "linear-gradient(90deg, #8B7355, #A8946A)", borderRadius: 99 }}>
                  <motion.div style={{ position: "absolute", top: 0, height: "100%", width: "40%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)" }}
                    animate={{ x: ["-100%", "200%"] }} transition={{ duration: 1.0, repeat: Infinity, ease: "linear" }} />
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, color: "#6B5F4E" }}>분석 중</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#8B7355" }}>{Math.floor(fakeProgress)}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#F5F1EA", fontFamily: "var(--font-sans), 'Gmarket Sans', sans-serif", color: "#2C2417" }}>
      {showPurchase && (
        <PurchaseModal
          price={purchasePrice}
          sajuId={sajuId}
          onDismiss={() => { setShowPurchase(false); router.back(); }}
        />
      )}
      {showAddonModal && sajuId && (
        <AddonModal price={addonPrice} sajuId={sajuId} onDismiss={() => setShowAddonModal(false)} />
      )}
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

        {hasDirectAddon && !showPurchase && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => setActiveView("main")}
              style={{
                flex: 1, padding: "10px 12px", borderRadius: 12, border: "1.5px solid #E0DDCF",
                background: activeView === "main" ? "#2C2417" : "#FBF8F3",
                color: activeView === "main" ? "#fff" : "#2C2417",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}
            >
              지금 보신 분석
            </button>
            <button
              type="button"
              onClick={() => setActiveView("realistic")}
              style={{
                flex: 1, padding: "10px 12px", borderRadius: 12, border: "1.5px solid #E0DDCF",
                background: activeView === "realistic" ? "#2C2417" : "#FBF8F3",
                color: activeView === "realistic" ? "#fff" : "#2C2417",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}
            >
              더 직설적인 분석
            </button>
          </div>
        )}

        {SECTION_TITLES.map((title, i) => (
          <ReportSection
            key={`${activeView}-${title}`}
            title={title}
            loading={displayLoading}
            error={displayError}
            content={displaySections[i]}
          />
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
            <button
              type="button"
              onClick={() => setShowAddonModal(true)}
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12, border: "none",
                background: "#2C2417", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
              }}
            >
              더 직설적인 분석 · +{addonPrice.toLocaleString()}원
            </button>
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
                    try { await navigator.share({ title: '재물운 분석 리포트', url }); } catch {}
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

function MoneyReportFallback() {
  return (
    <main style={{ minHeight: "100vh", background: "#F5F1EA", fontFamily: "'Gmarket Sans', sans-serif", color: "#2C2417" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 16px" }}>
        <ReportSection title="💰 재물운 분석" loading content="" />
      </div>
    </main>
  );
}

export default function MoneyReportPage() {
  return (
    <Suspense fallback={<MoneyReportFallback />}>
      <MoneyReportContent />
    </Suspense>
  );
}
