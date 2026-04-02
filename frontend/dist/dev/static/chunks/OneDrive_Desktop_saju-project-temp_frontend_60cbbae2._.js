(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/OneDrive/Desktop/saju-project-temp/frontend/lib/auth.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SAJU_CACHE_HYDRATED_KEY",
    ()=>SAJU_CACHE_HYDRATED_KEY,
    "clearStoredToken",
    ()=>clearStoredToken,
    "getAuthHeaders",
    ()=>getAuthHeaders,
    "getStoredToken",
    ()=>getStoredToken,
    "setStoredToken",
    ()=>setStoredToken
]);
/**
 * 모바일 크로스 도메인에서 쿠키가 안 붙을 때 사용하는 세션 토큰.
 * 로그인 성공 시 백엔드가 URL fragment로 전달한 토큰을 localStorage에 저장하고,
 * API 호출 시 Authorization 헤더로 보냄.
 * ※ sessionStorage는 iOS Safari / 카카오·인스타 인앱 브라우저에서
 *   앱 전환(카카오페이 결제 등) 시 초기화되므로 localStorage 사용.
 */ const TOKEN_KEY = "hsaju_token";
const SAJU_CACHE_HYDRATED_KEY = "saju_cache_hydrated_session";
function getStoredToken() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return localStorage.getItem(TOKEN_KEY);
}
function setStoredToken(token) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    localStorage.setItem(TOKEN_KEY, token);
}
function clearStoredToken() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(SAJU_CACHE_HYDRATED_KEY);
}
function getAuthHeaders() {
    const token = getStoredToken();
    if (!token) return {};
    return {
        Authorization: `Bearer ${token}`
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/OneDrive/Desktop/saju-project-temp/frontend/components/KakaoPayButton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>KakaoPayButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/lib/auth.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const API_BASE = ("TURBOPACK compile-time value", "http://localhost:8000") || "";
function KakaoPayButton({ orderType, price, label, sajuId, onError, onBeforePay, style, fullWidth = true }) {
    _s();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    async function handlePay() {
        onBeforePay?.();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/payment/kakao/ready`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAuthHeaders"])()
                },
                credentials: "include",
                body: JSON.stringify({
                    order_type: orderType,
                    ...sajuId ? {
                        saju_id: sajuId
                    } : {}
                })
            });
            if (res.status === 401) {
                window.location.href = "/start";
                return;
            }
            const data = await res.json();
            // 무료 접근 처리 (베타 쿠폰/관리자 모드)
            if (data.free_access) {
                window.location.href = data.redirect_url;
                return;
            }
            // 결제 준비중 모달
            if (!data.next_redirect_mobile_url && !data.next_redirect_pc_url) {
                // 결제 준비중 모달 표시
                alert("이 리포트는 현재 준비 중입니다.\n베타테스터도 아직 무료로 이용할 수 없으며, 정식 오픈 때 공개될 예정입니다.");
                onError?.("결제 준비에 실패했어요. 잠시 후 다시 시도해주세요.");
                return;
            }
            const isMobile = /Mobi|Android/i.test(navigator.userAgent);
            window.location.href = isMobile ? data.next_redirect_mobile_url || data.next_redirect_pc_url : data.next_redirect_pc_url || data.next_redirect_mobile_url;
        } catch  {
            onError?.("결제 연결 오류가 발생했어요.");
        } finally{
            setLoading(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        disabled: loading,
        onClick: handlePay,
        style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: fullWidth ? "100%" : "auto",
            padding: "14px 20px",
            borderRadius: 12,
            border: "none",
            background: loading ? "#C8A951" : "#FEE500",
            color: "#1A1A1A",
            fontSize: 15,
            fontWeight: 700,
            fontFamily: "'Gmarket Sans', sans-serif",
            cursor: loading ? "wait" : "pointer",
            transition: "opacity .12s ease, transform .12s ease",
            WebkitTapHighlightColor: "transparent",
            ...style
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#1A1A1A",
                    color: "#FEE500",
                    fontSize: 11,
                    fontWeight: 900,
                    flexShrink: 0
                },
                children: "K"
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/KakaoPayButton.tsx",
                lineNumber: 98,
                columnNumber: 7
            }, this),
            loading ? "결제 준비 중..." : label
        ]
    }, void 0, true, {
        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/KakaoPayButton.tsx",
        lineNumber: 73,
        columnNumber: 5
    }, this);
}
_s(KakaoPayButton, "/Rjh5rPqCCqf0XYnTUk9ZNavw3Q=");
_c = KakaoPayButton;
var _c;
__turbopack_context__.k.register(_c, "KakaoPayButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BasicReportPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$components$2f$KakaoPayButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/components/KakaoPayButton.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/lib/auth.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const API_BASE = ("TURBOPACK compile-time value", "http://localhost:8000") || 'https://saju-backend-eqd6.onrender.com';
function BasicReportGate() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const sajuId = searchParams.get('saju_id') || '';
    const [checking, setChecking] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [showPurchase, setShowPurchase] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [price, setPrice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(990);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BasicReportGate.useEffect": ()=>{
            const isGuest = searchParams.get('guest') === 'true';
            if (isGuest) {
                router.replace('/report/basic/v2?guest=true');
                return;
            }
            if (!sajuId) {
                setChecking(false);
                return;
            }
            fetch(`${API_BASE}/api/payment/report-access/basic`, {
                credentials: 'include',
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAuthHeaders"])()
            }).then({
                "BasicReportGate.useEffect": (r)=>r.json()
            }["BasicReportGate.useEffect"]).then({
                "BasicReportGate.useEffect": (d)=>{
                    if (d.has_access) {
                        router.replace(`/report/basic/v2?saju_id=${sajuId}`);
                    } else {
                        setPrice(d.price || 990);
                        setShowPurchase(true);
                        setChecking(false);
                    }
                }
            }["BasicReportGate.useEffect"]).catch({
                "BasicReportGate.useEffect": ()=>{
                    setShowPurchase(true);
                    setChecking(false);
                }
            }["BasicReportGate.useEffect"]);
        }
    }["BasicReportGate.useEffect"], [
        sajuId,
        router
    ]);
    if (checking) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                minHeight: '100vh',
                background: '#F5F1EA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    fontSize: 14,
                    color: '#8B7355',
                    fontFamily: 'var(--font-sans)'
                },
                children: "확인 중..."
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/page.tsx",
                lineNumber: 50,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/page.tsx",
            lineNumber: 49,
            columnNumber: 7
        }, this);
    }
    if (showPurchase) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                position: 'fixed',
                inset: 0,
                zIndex: 200,
                background: 'rgba(44,36,23,0.55)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 20px'
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: '#FBF8F3',
                    borderRadius: 20,
                    padding: '32px 24px 28px',
                    width: '100%',
                    maxWidth: 360,
                    textAlign: 'center',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
                    fontFamily: 'var(--font-sans)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: 36,
                            marginBottom: 16
                        },
                        children: "✨"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/page.tsx",
                        lineNumber: 68,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: 17,
                            fontWeight: 700,
                            color: '#2C2417',
                            marginBottom: 8
                        },
                        children: "기본 분석 리포트"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/page.tsx",
                        lineNumber: 69,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: 13,
                            color: '#6B6B6B',
                            lineHeight: 1.7,
                            marginBottom: 24
                        },
                        children: [
                            "이 리포트를 보려면 구매가 필요해요.",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/page.tsx",
                                lineNumber: 71,
                                columnNumber: 33
                            }, this),
                            "한 번 구매하면 언제든 다시 볼 수 있어요."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/page.tsx",
                        lineNumber: 70,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: 26,
                            fontWeight: 700,
                            color: '#2C2417',
                            marginBottom: 20
                        },
                        children: [
                            price.toLocaleString(),
                            "원"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/page.tsx",
                        lineNumber: 74,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$components$2f$KakaoPayButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        orderType: "basic",
                        price: price,
                        label: "기본 리포트 구매",
                        sajuId: sajuId
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/page.tsx",
                        lineNumber: 77,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>router.back(),
                        style: {
                            marginTop: 14,
                            background: 'none',
                            border: 'none',
                            fontSize: 13,
                            color: '#A0A0A0',
                            cursor: 'pointer'
                        },
                        children: "나중에"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/page.tsx",
                        lineNumber: 78,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/page.tsx",
                lineNumber: 62,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/page.tsx",
            lineNumber: 57,
            columnNumber: 7
        }, this);
    }
    return null;
}
_s(BasicReportGate, "Er31xO9I9OhgikZ31DaRd1JdiNc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"]
    ];
});
_c = BasicReportGate;
function BasicReportPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
        fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                minHeight: '100vh',
                background: '#F5F1EA'
            }
        }, void 0, false, {
            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/page.tsx",
            lineNumber: 95,
            columnNumber: 25
        }, void 0),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BasicReportGate, {}, void 0, false, {
            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/page.tsx",
            lineNumber: 96,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/page.tsx",
        lineNumber: 95,
        columnNumber: 5
    }, this);
}
_c1 = BasicReportPage;
var _c, _c1;
__turbopack_context__.k.register(_c, "BasicReportGate");
__turbopack_context__.k.register(_c1, "BasicReportPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=OneDrive_Desktop_saju-project-temp_frontend_60cbbae2._.js.map