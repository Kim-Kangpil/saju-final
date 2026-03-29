module.exports = [
"[project]/OneDrive/Desktop/saju-project-temp/frontend/lib/auth.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
 * 로그인 성공 시 백엔드가 URL fragment로 전달한 토큰을 sessionStorage에 저장하고,
 * API 호출 시 Authorization 헤더로 보냄.
 */ const TOKEN_KEY = "hsaju_token";
const SAJU_CACHE_HYDRATED_KEY = "saju_cache_hydrated_session";
function getStoredToken() {
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
}
function setStoredToken(token) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
function clearStoredToken() {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
function getAuthHeaders() {
    const token = getStoredToken();
    if (!token) return {};
    return {
        Authorization: `Bearer ${token}`
    };
}
}),
"[project]/OneDrive/Desktop/saju-project-temp/frontend/lib/mapFullSajuJsonToResult.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mapFullSajuJsonToResult",
    ()=>mapFullSajuJsonToResult
]);
/**
 * /saju/full 응답 JSON을 /add 페이지의 result(SajuResult) 형태로 변환합니다.
 * 로컬 캐시 동기화 시 재사용합니다.
 */ function hanjaToHangul(h) {
    const map = {
        甲: "갑",
        乙: "을",
        丙: "병",
        丁: "정",
        戊: "무",
        己: "기",
        庚: "경",
        辛: "신",
        壬: "임",
        癸: "계",
        子: "자",
        丑: "축",
        寅: "인",
        卯: "묘",
        辰: "진",
        巳: "사",
        午: "오",
        未: "미",
        申: "신",
        酉: "유",
        戌: "술",
        亥: "해"
    };
    return map[h] ?? "";
}
function splitPillar(text) {
    const hanja1 = text?.[0] ?? "";
    const hanja2 = text?.[1] ?? "";
    return [
        {
            hanja: hanja1,
            hangul: hanjaToHangul(hanja1)
        },
        {
            hanja: hanja2,
            hangul: hanjaToHangul(hanja2)
        }
    ];
}
function mapFullSajuJsonToResult(sajuJson) {
    const hourP = String(sajuJson.hour_pillar ?? "");
    const dayP = String(sajuJson.day_pillar ?? "");
    const monthP = String(sajuJson.month_pillar ?? "");
    const yearP = String(sajuJson.year_pillar ?? "");
    const [hourCheongan, hourJiji] = splitPillar(hourP);
    const [dayCheongan, dayJiji] = splitPillar(dayP);
    const [monthCheongan, monthJiji] = splitPillar(monthP);
    const [yearCheongan, yearJiji] = splitPillar(yearP);
    return {
        hour: {
            label: "시주",
            cheongan: hourCheongan,
            jiji: hourJiji
        },
        day: {
            label: "일주",
            cheongan: dayCheongan,
            jiji: dayJiji
        },
        month: {
            label: "월주",
            cheongan: monthCheongan,
            jiji: monthJiji
        },
        year: {
            label: "년주",
            cheongan: yearCheongan,
            jiji: yearJiji
        },
        twelve_states: sajuJson.twelve_states,
        jijanggan: sajuJson.jijanggan,
        harmony_clash: sajuJson.harmony_clash ?? null
    };
}
}),
"[project]/OneDrive/Desktop/saju-project-temp/frontend/lib/sajuStorage.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteSaju",
    ()=>deleteSaju,
    "formatBirthDate",
    ()=>formatBirthDate,
    "formatBirthTime",
    ()=>formatBirthTime,
    "getSajuById",
    ()=>getSajuById,
    "getSavedSajuList",
    ()=>getSavedSajuList,
    "hydrateLocalSajuCacheFromServerRows",
    ()=>hydrateLocalSajuCacheFromServerRows,
    "pickSavedSajuForChat",
    ()=>pickSavedSajuForChat,
    "refreshLocalSajuIfMissingFields",
    ()=>refreshLocalSajuIfMissingFields,
    "saveSaju",
    ()=>saveSaju,
    "savedSajuToChatApiPayload",
    ()=>savedSajuToChatApiPayload,
    "syncSavedSajuListWithServer",
    ()=>syncSavedSajuListWithServer,
    "updateLastViewed",
    ()=>updateLastViewed,
    "updateSaju",
    ()=>updateSaju
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/lib/auth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$lib$2f$mapFullSajuJsonToResult$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/lib/mapFullSajuJsonToResult.ts [app-ssr] (ecmascript)");
;
;
const STORAGE_KEY = 'saved_saju_list';
const MAX_SAJU_COUNT = 5;
const API_BASE = ("TURBOPACK compile-time value", "http://localhost:8000") || "https://saju-backend-eqd6.onrender.com";
function rowToBirthFields(row) {
    const parts = (row.birthdate || "").split("-").map(Number);
    const y = parts[0];
    const m = parts[1];
    const d = parts[2];
    const birthYmd = y && m && d ? `${String(y)}${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}` : "";
    const timePart = (row.birth_time || "").trim();
    let birthHm = "1200";
    let timeUnknown = true;
    if (timePart && /^\d{1,2}:\d{1,2}$/.test(timePart)) {
        const [h, mi] = timePart.split(":").map(Number);
        if (!Number.isNaN(h) && !Number.isNaN(mi)) {
            birthHm = `${String(h).padStart(2, "0")}${String(mi).padStart(2, "0")}`;
            timeUnknown = false;
        }
    }
    const calendar = row.calendar_type === "음력" ? "lunar" : "solar";
    const gender = row.gender === "남자" ? "M" : "F";
    return {
        birthYmd,
        birthHm,
        timeUnknown,
        calendar,
        gender
    };
}
function sameBirthIdentity(a, b) {
    return a.birthYmd === b.birthYmd && a.birthHm === b.birthHm && a.gender === b.gender && a.calendar === b.calendar;
}
async function fetchFullForRow(row) {
    const { birthYmd, birthHm, timeUnknown, calendar, gender } = rowToBirthFields(row);
    if (birthYmd.length !== 8) return null;
    const y = Number(birthYmd.slice(0, 4));
    const m = Number(birthYmd.slice(4, 6));
    const d = Number(birthYmd.slice(6, 8));
    const hour = timeUnknown ? null : Number(birthHm.slice(0, 2));
    const minute = timeUnknown ? null : Number(birthHm.slice(2, 4));
    const body = {
        calendar_type: calendar,
        year: y,
        month: m,
        day: d,
        hour,
        minute,
        gender,
        is_leap_month: false,
        time_unknown: timeUnknown
    };
    const tz = (row.iana_timezone || "").trim();
    if (tz) body.iana_timezone = tz;
    try {
        const res = await fetch(`${API_BASE}/saju/full`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });
        const json = await res.json().catch(()=>null);
        if (!res.ok || !json) return null;
        return json;
    } catch  {
        return null;
    }
}
function getSavedSajuList() {
    if ("TURBOPACK compile-time truthy", 1) return [];
    //TURBOPACK unreachable
    ;
}
function pickSavedSajuForChat(list, sajuIdFromUrl) {
    if (!list.length) return null;
    const raw = (sajuIdFromUrl || "").trim();
    if (raw) {
        const found = list.find((s)=>{
            if (String(s.id) === raw) return true;
            if (String(s.id) === `srv-${raw}`) return true;
            if (String(s.id).startsWith("srv-") && String(s.id).slice(4) === raw) return true;
            return false;
        });
        if (found) return found;
    }
    return list[0] ?? null;
}
function savedSajuToChatApiPayload(s) {
    if (!s || s.result == null) return undefined;
    return {
        name: s.name,
        birthYmd: s.birthYmd,
        birthHm: s.birthHm,
        gender: s.gender,
        calendar: s.calendar,
        timeUnknown: s.timeUnknown,
        result: s.result
    };
}
function saveSaju(saju) {
    try {
        const list = getSavedSajuList();
        const newId = saju.id?.trim() || Date.now().toString();
        const existingIdx = list.findIndex((s)=>s.id === newId);
        const isNewSlot = existingIdx === -1;
        // 신규 행만 개수 제한 (같은 id 갱신은 허용)
        if (isNewSlot && list.length >= MAX_SAJU_COUNT) {
            return {
                success: false,
                message: `최대 ${MAX_SAJU_COUNT}개까지만 저장할 수 있습니다. 기존 사주를 삭제해주세요.`
            };
        }
        const newSaju = {
            name: saju.name,
            birthYmd: saju.birthYmd,
            birthHm: saju.birthHm,
            gender: saju.gender,
            calendar: saju.calendar,
            timeUnknown: saju.timeUnknown,
            result: saju.result,
            lastViewed: saju.lastViewed,
            id: newId,
            createdAt: saju.createdAt || new Date().toISOString()
        };
        let next;
        if (existingIdx >= 0) {
            next = [
                ...list
            ];
            next[existingIdx] = {
                ...next[existingIdx],
                ...newSaju
            };
        } else {
            next = [
                newSaju,
                ...list
            ];
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return {
            success: true,
            message: "사주가 저장되었습니다."
        };
    } catch (error) {
        console.error("사주 저장 실패:", error);
        return {
            success: false,
            message: "저장 중 오류가 발생했습니다."
        };
    }
}
async function hydrateLocalSajuCacheFromServerRows(rows) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
    const serverRows = undefined;
    const serverSaved = undefined;
    const row = undefined;
    const prev = undefined;
    const localOnly = undefined;
    const filteredLocal = undefined;
    const merged = undefined;
}
async function syncSavedSajuListWithServer() {
    if ("TURBOPACK compile-time truthy", 1) return {
        ok: false,
        count: 0
    };
    //TURBOPACK unreachable
    ;
}
function updateSaju(id, updates) {
    try {
        const list = getSavedSajuList();
        const index = list.findIndex((s)=>s.id === id);
        if (index === -1) {
            return {
                success: false,
                message: '사주를 찾을 수 없습니다.'
            };
        }
        list[index] = {
            ...list[index],
            ...updates
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return {
            success: true,
            message: '사주가 수정되었습니다.'
        };
    } catch (error) {
        console.error('사주 수정 실패:', error);
        return {
            success: false,
            message: '수정 중 오류가 발생했습니다.'
        };
    }
}
function deleteSaju(id) {
    try {
        const list = getSavedSajuList();
        const filtered = list.filter((s)=>s.id !== id);
        if (list.length === filtered.length) {
            return {
                success: false,
                message: '사주를 찾을 수 없습니다.'
            };
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return {
            success: true,
            message: '사주가 삭제되었습니다.'
        };
    } catch (error) {
        console.error('사주 삭제 실패:', error);
        return {
            success: false,
            message: '삭제 중 오류가 발생했습니다.'
        };
    }
}
function getSajuById(id) {
    const list = getSavedSajuList();
    return list.find((s)=>s.id === id) || null;
}
function updateLastViewed(id) {
    const list = getSavedSajuList();
    const index = list.findIndex((s)=>s.id === id);
    if (index !== -1) {
        list[index].lastViewed = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
}
function formatBirthDate(ymd) {
    if (ymd.length !== 8) return ymd;
    const year = ymd.slice(0, 4);
    const month = ymd.slice(4, 6);
    const day = ymd.slice(6, 8);
    return `${year}년 ${month}월 ${day}일`;
}
async function refreshLocalSajuIfMissingFields() {
    if ("TURBOPACK compile-time truthy", 1) return 0;
    //TURBOPACK unreachable
    ;
    const list = undefined;
    let updated;
    const next = undefined;
    let i;
}
function formatBirthTime(hm) {
    if (hm.length !== 4) return hm;
    const hour = hm.slice(0, 2);
    const minute = hm.slice(2, 4);
    return `${hour}시 ${minute}분`;
}
}),
"[project]/OneDrive/Desktop/saju-project-temp/frontend/hooks/useAuthStatus.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAuthStatus",
    ()=>useAuthStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/lib/auth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$lib$2f$sajuStorage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/lib/sajuStorage.ts [app-ssr] (ecmascript)");
;
;
;
const DEFAULT_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || ("TURBOPACK compile-time value", "http://localhost:8000") || "https://saju-backend-eqd6.onrender.com";
function useAuthStatus(backendBase = DEFAULT_BACKEND) {
    const [isLoggedIn, setIsLoggedIn] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    async function syncOnce() {
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        const hasToken = undefined;
        const localFlag = undefined;
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        syncOnce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        backendBase
    ]);
    return {
        isLoggedIn,
        loading,
        refresh: syncOnce
    };
}
}),
"[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HomePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$lib$2f$sajuStorage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/lib/sajuStorage.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$contexts$2f$LangContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/contexts/LangContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$hooks$2f$useAuthStatus$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/hooks/useAuthStatus.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$locales$2f$ko$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/locales/ko.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$locales$2f$en$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/locales/en.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
// ─────────────────────────────────────────────────────
// 디자인 토큰 (add/page.tsx 와 동일한 S 객체)
// ─────────────────────────────────────────────────────
const S = {
    cream: "#F5F1EA",
    cream2: "#EDE7DB",
    cream3: "#E3D9CB",
    beige: "#D4C9B8",
    beige2: "#C4B8A4",
    ink: "#2C2417",
    ink2: "#4A3F30",
    ink3: "#6B5F4E",
    gold: "#8B7355",
    goldL: "#A8946A",
    red: "#8B2020",
    wood: "#2D6A4F",
    water: "#2563EB",
    earth: "#B45309",
    metal: "#64748B",
    fire: "#E11D48",
    font: "'Gmarket Sans'"
};
// 만세력 미리보기용 오행 색상 팔레트
const FIVE_ELEMENT_COLORS = {
    wood: {
        text: "#27500A",
        bg: "#C0DD97",
        border: "#3B6D11"
    },
    fire: {
        text: "#712B13",
        bg: "#F0997B",
        border: "#993C1D"
    },
    earth: {
        text: "#633806",
        bg: "#FAC775",
        border: "#854F0B"
    },
    metal: {
        text: "#444441",
        bg: "#B4B2A9",
        border: "#5F5E5A"
    },
    water: {
        text: "#0C447C",
        bg: "#85B7EB",
        border: "#185FA5"
    }
};
// ─────────────────────────────────────────────────────
// 데이터
// ─────────────────────────────────────────────────────
const REVIEWS = [
    {
        name: "이○희",
        age: "28세",
        tag: "직장운",
        stars: 5,
        text: "대운 설명이 너무 정확해서 소름돋았어요. 지금 제 상황이랑 딱 맞아서 친구한테도 바로 공유했습니다."
    },
    {
        name: "김○준",
        age: "34세",
        tag: "재물운",
        stars: 5,
        text: "다른 사주 앱들은 그냥 두루뭉술한데 여긴 일간 기준으로 구체적으로 짚어줘서 신뢰가 갔어요."
    },
    {
        name: "박○연",
        age: "26세",
        tag: "연애운",
        stars: 5,
        text: "AI한테 사주 물어볼 수 있다는 게 신기해서 시작했는데 답변이 진짜 사주 선생님 같았어요."
    },
    {
        name: "최○민",
        age: "31세",
        tag: "건강운",
        stars: 5,
        text: "건강 체질 분석이 너무 정확해요. 제가 항상 그 부위가 약하다고 생각했는데 사주에 그대로 나오네요."
    },
    {
        name: "정○아",
        age: "24세",
        tag: "적성",
        stars: 5,
        text: "취업 준비 중인데 적성 분석이 진로 결정에 진짜 도움됐어요. 구체적인 직무까지 나와서 좋았습니다."
    },
    {
        name: "윤○서",
        age: "29세",
        tag: "대운",
        stars: 5,
        text: "만세력을 AI가 자동으로 뽑아주는 게 제일 편했어요. 계산 틀릴까봐 걱정했는데 완전 정확하더라고요."
    }
];
const FEATURES = [
    {
        icon: "🎭",
        title: "타고난 기질",
        desc: "음양오행으로 보는 나의 본성"
    },
    {
        icon: "💰",
        title: "재물운·직업운",
        desc: "십성 기반 재물·적성 분석"
    },
    {
        icon: "🤝",
        title: "인간관계",
        desc: "합충 기반 관계 에너지"
    },
    {
        icon: "🔮",
        title: "공망·귀인",
        desc: "숨겨진 조력자와 공백 분석"
    },
    {
        icon: "🏥",
        title: "체질·건강",
        desc: "오행 체질 맞춤 건강 정보"
    },
    {
        icon: "📜",
        title: "종합 인생 가이드",
        desc: "사주 전체를 한눈에 정리한 요약"
    }
];
const ALL_ANIMALS = [
    "갑자",
    "을축",
    "병인",
    "정묘",
    "무진",
    "기사",
    "경오",
    "신미",
    "임신",
    "계유",
    "갑술",
    "을해",
    "병자",
    "정축",
    "무인",
    "기묘",
    "경진",
    "신사",
    "임오",
    "계미",
    "갑신",
    "을유",
    "병술",
    "정해",
    "무자",
    "기축",
    "경인",
    "신묘",
    "임진",
    "계사",
    "갑오",
    "을미",
    "병신",
    "정유",
    "무술",
    "기해",
    "경자",
    "신축",
    "임인",
    "계묘",
    "갑진",
    "을사",
    "병오",
    "정미",
    "무신",
    "기유",
    "경술",
    "신해",
    "임자",
    "계축",
    "갑인",
    "을묘",
    "병진",
    "정사",
    "무오",
    "기미",
    "경신",
    "신유",
    "임술",
    "계해"
];
const CHAT_BUBBLES = [
    {
        q: "나는 언제쯤 이직하면 좋을까?",
        a: "현재 경금 대운에서 편관이 강하게 작용 중이에요. 내년 을사년에 식신이 들어오는 시점이 변화에 유리합니다."
    },
    {
        q: "올해 재물운 어때?",
        a: "월지 편재가 세운과 삼합을 이루는 하반기가 재물 유입에 유리해요. 다만 겁재 충을 주의하세요."
    },
    {
        q: "나랑 맞는 사람 유형이 있어?",
        a: "일간 갑목 기준으로 기토 정재와 합이 잘 맞아요. 안정적이고 현실적인 분과 잘 어울립니다."
    }
];
// ─────────────────────────────────────────────────────
// 카운터 훅
// ─────────────────────────────────────────────────────
function useCounter(target) {
    const [count, setCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const animated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const observer = new IntersectionObserver(([entry])=>{
            if (entry.isIntersecting && !animated.current) {
                animated.current = true;
                const duration = 1400;
                const start = performance.now();
                const animate = (now)=>{
                    const p = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - p, 3);
                    setCount(Math.floor(eased * target));
                    if (p < 1) requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            }
        }, {
            threshold: 0.4
        });
        if (ref.current) observer.observe(ref.current);
        return ()=>observer.disconnect();
    }, [
        target
    ]);
    return {
        count,
        ref
    };
}
function HomePage({ params }) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["use"])(params ?? Promise.resolve({}));
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const { isLoggedIn } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$hooks$2f$useAuthStatus$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuthStatus"])();
    const [animals, setAnimals] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [animalRound, setAnimalRound] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [chatIdx, setChatIdx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [reviewScroll, setReviewScroll] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const reviewRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { lang, setLang, t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$contexts$2f$LangContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLang"])();
    const messages = lang === "ko" ? __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$locales$2f$ko$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] : __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$locales$2f$en$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"];
    const [langMenuOpen, setLangMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [betaFeatures, setBetaFeatures] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // 베타 혜택 확인
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isLoggedIn) return;
        const fetchBetaFeatures = async ()=>{
            try {
                const res = await fetch(`${("TURBOPACK compile-time value", "http://localhost:8000") || "http://localhost:8000"}/api/beta/features`, {
                    credentials: "include",
                    headers: {
                        Accept: "application/json"
                    }
                });
                const data = await res.json();
                if (data.features) {
                    setBetaFeatures(data.features);
                }
            } catch (error) {
                console.error("베타 혜택 확인 오류:", error);
            }
        };
        fetchBetaFeatures();
    }, [
        isLoggedIn
    ]);
    const getTodayCount = ()=>{
        if ("TURBOPACK compile-time truthy", 1) return 128;
        //TURBOPACK unreachable
        ;
        const today = undefined;
        const stored = undefined;
        const v = undefined;
    };
    const baseCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(getTodayCount());
    const { count, ref: counterRef } = useCounter(baseCount.current);
    const { count: reviewCount, ref: reviewCountRef } = useCounter(2847);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const shuffled = [
            ...ALL_ANIMALS
        ].sort(()=>Math.random() - 0.5);
        setAnimals(shuffled.slice(0, 6));
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const id = setInterval(()=>{
            setAnimals([
                ...ALL_ANIMALS
            ].sort(()=>Math.random() - 0.5).slice(0, 6));
            setAnimalRound((r)=>r + 1);
        }, 3200);
        return ()=>clearInterval(id);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const id = setInterval(()=>{
            setChatIdx((i)=>(i + 1) % CHAT_BUBBLES.length);
        }, 5800);
        return ()=>clearInterval(id);
    }, []);
    function handleStart() {
        if (!isLoggedIn) {
            router.push("/start");
            return;
        }
        const saved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$lib$2f$sajuStorage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSavedSajuList"])();
        router.push(saved?.length > 0 ? "/saju-list" : "/saju-add");
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        :root {
          --cream:  ${S.cream};
          --cream2: ${S.cream2};
          --cream3: ${S.cream3};
          --beige:  ${S.beige};
          --beige2: ${S.beige2};
          --ink:    ${S.ink};
          --ink2:   ${S.ink2};
          --ink3:   ${S.ink3};
          --gold:   ${S.gold};
          --goldL:  ${S.goldL};
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }

        body {
          font-family: ${S.font};
          background: var(--cream) url('/images/texture_paper_6.png');
          background-repeat: repeat;
          background-size: auto;
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        .serif { font-family: ${S.font}; }

        /* ── 공통 레이아웃 ── */
        .page {
          max-width: 480px;
          margin: 0 auto;
          padding-bottom: 80px;
          position: relative;
          background: var(--cream) url('/images/texture_paper_6.png');
          background-repeat: repeat;
          background-size: auto;
        }

        @media (min-width: 900px) {
          .page {
            max-width: 1200px;
            padding-bottom: 0;
          }
          .pc-layout {
            display: flex;
            justify-content: center;
            min-height: 100dvh;
          }
          .pc-sidebar {
            display: none;
          }
          .pc-main {
            width: 100%;
            max-width: 960px;
            margin: 0 auto;
            padding: 0 0 80px;
            background: var(--cream) url('/images/texture_paper_6.png');
            background-repeat: repeat;
            background-size: auto;
          }
        }

        /* ── 헤더 ── */
        .hd {
          position: sticky;
          top: 0;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          background: rgba(245,241,234,0.96);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--beige);
        }

        .hd-logo {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .hd-logo-mark {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1.5px solid var(--beige);
          background: var(--cream2);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .hd-logo-text {
          font-family: ${S.font};
          font-size: 16px;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: 0.04em;
        }

        .hd-btn {
          padding: 7px 16px;
          border-radius: 999px;
          border: 1px solid var(--beige2);
          background: transparent;
          font-family: ${S.font};
          font-size: 12px;
          font-weight: 700;
          color: var(--ink);
          cursor: pointer;
          transition: background .15s;
          letter-spacing: 0.02em;
        }
        .hd-btn:hover { background: var(--cream2); }

        .hd-btn-fill {
          padding: 7px 16px;
          border-radius: 999px;
          border: none;
          background: var(--gold);
          font-family: ${S.font};
          font-size: 12px;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          transition: opacity .15s;
          letter-spacing: 0.02em;
          margin-left: 6px;
        }
        .hd-btn-fill:hover { opacity: .88; }

        /* ── 섹션 공통 ── */
        .sec {
          padding: 36px 20px;
          border-bottom: 1px solid var(--beige);
          background: var(--cream) url('/images/texture_paper_6.png');
          background-repeat: repeat;
          background-size: auto;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 11px;
          border-radius: 999px;
          border: 1px solid var(--beige);
          background: var(--cream2);
          font-size: 11px;
          font-weight: 700;
          color: var(--ink3);
          letter-spacing: 0.07em;
          margin-bottom: 14px;
        }

        .badge-gold {
          border-color: var(--goldL);
          background: #fdf8f0;
          color: var(--gold);
        }

        .sec-title {
          font-family: ${S.font};
          font-size: clamp(1.45rem, 4.5vw, 1.75rem);
          font-weight: 900;
          color: var(--ink);
          line-height: 1.32;
          letter-spacing: -0.02em;
          margin-bottom: 10px;
        }

        .sec-sub {
          font-size: 13px;
          color: var(--ink3);
          line-height: 1.75;
        }

        /* ── 히어로 ── */
        .hero {
          padding: 44px 20px 36px;
          text-align: center;
          background: var(--cream) url('/images/texture_paper_6.png');
          background-repeat: repeat;
          background-size: auto;
          border-bottom: 1px solid var(--beige);
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: none;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 13px;
          border-radius: 999px;
          border: 1px solid var(--goldL);
          background: #fdf8f0;
          font-size: 11px;
          font-weight: 700;
          color: var(--gold);
          letter-spacing: 0.08em;
          margin-bottom: 22px;
        }

        .hero-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--gold);
          animation: blink 2s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: .3; }
        }

        .hero-logo {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          border: 2px solid var(--beige);
          background: var(--cream2);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          margin: 0 auto 22px;
          animation: floatY 4s ease-in-out infinite;
        }

        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }

        .hero-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-title {
          font-family: ${S.font};
          font-size: clamp(1.65rem, 5.5vw, 2.1rem);
          font-weight: 900;
          color: var(--ink);
          line-height: 1.28;
          letter-spacing: -0.025em;
          margin-bottom: 12px;
        }

        .hero-title em {
          font-style: normal;
          color: var(--gold);
        }

        .hero-desc {
          font-size: 13.5px;
          color: var(--ink3);
          line-height: 1.8;
          margin-bottom: 28px;
        }

        /* ── 문제 제기 섹션 ─ */
        .problem-sec {
          background: var(--ink);
          padding: 48px 20px;
          text-align: center;
        }

        .problem-label {
          font-size: 11px;
          color: rgba(245,241,234,.5);
          letter-spacing: 0.12em;
          margin-bottom: 16px;
          font-weight: 700;
        }

        .problem-main {
          font-family: ${S.font};
          font-size: clamp(1.35rem, 4.5vw, 1.65rem);
          font-weight: 900;
          color: var(--cream);
          line-height: 1.4;
          margin-bottom: 10px;
        }

        .problem-sub {
          font-family: ${S.font};
          font-size: clamp(1.35rem, 4.5vw, 1.65rem);
          font-weight: 900;
          color: var(--goldL);
          line-height: 1.4;
          margin-bottom: 32px;
        }

        .problem-divider {
          width: 40px;
          height: 1px;
          background: rgba(245,241,234,.2);
          margin: 0 auto 28px;
        }

        .problem-desc {
          font-size: 13px;
          color: rgba(245,241,234,.6);
          line-height: 1.85;
          text-align: center;
        }

        /* ── 범용 AI vs 사주 전문 AI ─ */
        .compare-sec {
          background: var(--cream);
          padding: 44px 20px;
          border-bottom: 1px solid var(--beige);
        }

        .compare-title {
          font-family: ${S.font};
          font-size: clamp(1.3rem, 4vw, 1.55rem);
          font-weight: 900;
          color: var(--ink);
          line-height: 1.4;
          margin-bottom: 28px;
        }

        .compare-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .compare-card {
          flex: 1;
          padding: 20px 16px;
          border-radius: 14px;
        }

        .compare-left {
          background: #fff;
          border: 1px solid var(--beige);
          opacity: 0.55;
          transform: scale(0.97);
        }

        .compare-right {
          background: var(--ink);
          border: 1.5px solid var(--gold);
          box-shadow: 0 0 0 1px var(--gold), 0 8px 24px rgba(139,115,85,.2);
          animation: compareFadeInScale .6s cubic-bezier(.34,1.56,.64,1) .2s both;
        }

        .compare-label {
          font-size: 10px;
          font-weight: 800;
          color: var(--muted);
          letter-spacing: 0.1em;
          margin-bottom: 14px;
          text-transform: uppercase;
        }

        .compare-label-right {
          color: var(--goldL);
        }

        .compare-chip-col {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .compare-chip {
          padding: 6px 12px;
          border-radius: 6px;
          background: var(--cream2);
          border: 1px solid var(--beige);
          font-size: 12px;
          color: var(--ink3);
        }

        .compare-note {
          font-size: 11px;
          color: var(--muted);
          margin-top: 14px;
        }

        .compare-arrow {
          font-size: 20px;
          color: var(--beige2);
          flex-shrink: 0;
          animation: compareArrowFade .4s ease .1s both;
        }

        .compare-logo-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 10px;
        }

        .compare-logo {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 1.5px solid var(--gold);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .compare-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .compare-service-name {
          font-family: ${S.font};
          font-size: 14px;
          font-weight: 700;
          color: var(--cream);
          text-align: center;
          margin-bottom: 14px;
        }

        .compare-right-note {
          font-size: 11px;
          color: rgba(245,241,234,.55);
          margin-top: 0;
          text-align: center;
        }

        .engine-card {
          margin-top: 28px;
          background: var(--cream2);
          border: 1px solid var(--beige);
          border-radius: 12px;
          padding: 18px 16px;
        }

        .engine-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-align: center;
        }

        .engine-row span {
          font-family: ${S.font};
          font-size: 13px;
          font-weight: 700;
          color: var(--ink);
        }

        .engine-x {
          font-size: 16px;
          color: var(--beige2);
        }

        .engine-sub {
          font-size: 12px;
          color: var(--ink3);
          margin-top: 10px;
          text-align: center;
        }

        @keyframes compareFadeInScale {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes compareArrowFade {
          from { opacity: 0; transform: translateX(-4px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .hero-btns {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 320px;
          margin: 0 auto 24px;
        }

        .btn-primary {
          width: 100%;
          padding: 15px;
          border-radius: 12px;
          border: none;
          background: var(--ink);
          color: var(--cream);
          font-family: ${S.font};
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: opacity .15s, transform .1s;
        }
        .btn-primary:active { transform: scale(.98); opacity: .9; }

        .btn-secondary {
          width: 100%;
          padding: 13px;
          border-radius: 12px;
          border: 1.5px solid var(--beige2);
          background: transparent;
          color: var(--ink3);
          font-family: ${S.font};
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background .15s;
          letter-spacing: 0.01em;
        }
        .btn-secondary:hover { background: var(--cream2); }

        .counter-row {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 16px;
          border-radius: 999px;
          border: 1px solid var(--beige);
          background: var(--cream2);
        }

        .counter-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4CAF50;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: .7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.35); }
        }

        /* ── 국내 최초 뱃지 ── */
        .first-band {
          background: var(--ink);
          color: var(--cream);
          padding: 18px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
          text-align: center;
        }

        .first-band-tag {
          padding: 4px 10px;
          border-radius: 4px;
          background: var(--gold);
          font-size: 10px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 0.1em;
          flex-shrink: 0;
        }

        .first-band-text {
          font-family: ${S.font};
          font-size: 13px;
          font-weight: 700;
          color: var(--cream);
          line-height: 1.6;
          letter-spacing: 0.01em;
          flex: 0 1 620px;
          text-align: center;
        }

        /* ── 채팅 미리보기 ── */
        .chat-preview {
          background: #fff;
          border: 1px solid var(--beige);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 2px 16px rgba(44,36,23,0.07);
        }

        .chat-preview-hd {
          background: var(--cream2);
          border-bottom: 1px solid var(--beige);
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .chat-preview-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: var(--cream3);
          border: 1px solid var(--beige);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          flex-shrink: 0;
        }

        .chat-preview-name {
          font-size: 11px;
          font-weight: 700;
          color: var(--ink);
        }

        .chat-preview-body {
          padding: 16px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 120px;
        }

        .chat-bubble-user {
          align-self: flex-end;
          background: var(--ink);
          color: var(--cream);
          padding: 9px 13px;
          border-radius: 12px;
          border-bottom-right-radius: 3px;
          font-size: 13px;
          line-height: 1.6;
          max-width: 80%;
          word-break: keep-all;
          animation: fadeInUp .4s ease both;
        }

        .chat-bubble-ai {
          align-self: flex-start;
          background: var(--cream2);
          color: var(--ink2);
          padding: 9px 13px;
          border-radius: 12px;
          border-bottom-left-radius: 3px;
          font-size: 13px;
          line-height: 1.45;
          max-width: 600px;
          width: 100%;
          word-break: keep-all;
          white-space: pre-line;
          margin-bottom: 8px;
          text-align: left;
          animation: fadeInUp .4s .15s ease both;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── 만세력 미리보기 테이블 ── */
        .manseryeok-preview {
          border: 1.5px solid var(--beige);
          border-radius: 12px;
          overflow: hidden;
          margin-top: 16px;
        }

        .msr-header {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          background: var(--cream2);
          border-bottom: 1.5px solid var(--beige);
        }

        .msr-header-cell {
          padding: 7px 4px;
          text-align: center;
          font-size: 10px;
          font-weight: 700;
          color: var(--ink3);
          letter-spacing: 0.08em;
        }

        .msr-header-cell:not(:last-child) { border-right: 1px solid var(--beige); }

        .msr-body {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }

        .msr-cell {
          padding: 12px 4px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .msr-cell:not(:last-child) { border-right: 1px solid var(--cream3); }

        .msr-sipsung {
          font-size: 9px;
          color: var(--ink3);
          height: 14px;
        }

        .msr-char {
          font-family: ${S.font};
          font-size: 22px;
          font-weight: 700;
        }

        .msr-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,.06);
          table-layout: fixed;
        }
        .msr-table th,
        .msr-table td {
          border: 1px solid var(--beige);
          padding: 10px 6px;
          text-align: center;
          height: 70px;
        }
        .msr-table th:first-child,
        .msr-table td:first-child {
          width: 72px;
        }
        .msr-table th { background: var(--cream2); font-weight: 700; color: var(--ink); }
        .msr-table .msr-row-label td { font-size: 12px; color: var(--ink3); text-align: center; }
        .msr-table .msr-pillar-box {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border-radius: 0;
          color: #fff;
          font-weight: 700;
          font-size: 20px;
        }

        @media (max-width: 480px) {
          .msr-table th,
          .msr-table td {
            height: 60px;
            padding: 8px 4px;
          }
          .msr-table th:first-child,
          .msr-table td:first-child {
            width: 64px;
            font-size: 10px;
          }
          .msr-table .msr-row-label td {
            font-size: 11px;
          }
          .msr-table .msr-pillar-box {
            font-size: 18px;
          }
        }

        /* ── 피처 그리드 ── */
        .feature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 18px;
        }

        .feature-card {
          padding: 14px 13px;
          background: #fff;
          border: 1px solid var(--beige);
          border-radius: 11px;
          transition: border-color .15s, box-shadow .15s;
          cursor: default;
        }

        .feature-card:hover {
          border-color: var(--beige2);
          box-shadow: 0 2px 12px rgba(44,36,23,0.06);
        }

        .feature-icon { font-size: 18px; margin-bottom: 7px; display: block; }
        .feature-title { font-size: 12px; font-weight: 700; color: var(--ink); margin-bottom: 3px; }
        .feature-desc { font-size: 11px; color: var(--ink3); line-height: 1.5; }

        /* ── 동물 갤러리 ── */
        .animal-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 7px;
          margin-top: 18px;
        }

        .animal-cell {
          aspect-ratio: 1;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--beige);
          background: var(--cream2);
        }

        .animal-cell img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        @keyframes cardFlip {
          from { opacity: 0; transform: perspective(280px) rotateY(-70deg); }
          to { opacity: 1; transform: perspective(280px) rotateY(0); }
        }

        .animal-flip { animation: cardFlip .28s ease-out both; }

        /* ── 리뷰 ── */
        .review-scroll {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding: 4px 0 12px;
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
          cursor: grab;
        }

        .review-scroll::-webkit-scrollbar { display: none; }

        .review-card {
          flex: 0 0 260px;
          background: #fff;
          border: 1px solid var(--beige);
          border-radius: 12px;
          padding: 16px 14px;
          box-shadow: 0 1px 8px rgba(44,36,23,0.05);
        }

        .review-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .review-name {
          font-size: 12px;
          font-weight: 700;
          color: var(--ink);
        }

        .review-age {
          font-size: 11px;
          color: var(--ink3);
          margin-left: 5px;
        }

        .review-tag {
          padding: 3px 8px;
          border-radius: 999px;
          background: var(--cream2);
          border: 1px solid var(--beige);
          font-size: 10px;
          font-weight: 700;
          color: var(--ink3);
        }

        .review-stars {
          color: #E6A817;
          font-size: 12px;
          margin-bottom: 8px;
          letter-spacing: 1px;
        }

        .review-text {
          font-size: 12.5px;
          color: var(--ink2);
          line-height: 1.75;
          word-break: keep-all;
        }

        /* ── 신뢰 지표 ── */
        .trust-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 18px;
        }

        .trust-card {
          background: #fff;
          border: 1px solid var(--beige);
          border-radius: 12px;
          padding: 18px 14px;
          text-align: center;
        }

        .trust-num {
          font-family: ${S.font};
          font-size: 26px;
          font-weight: 900;
          color: var(--gold);
          line-height: 1;
          margin-bottom: 5px;
        }

        .trust-label {
          font-size: 11px;
          color: var(--ink3);
          font-weight: 600;
          line-height: 1.5;
        }

        /* ── 최종 CTA ── */
        .cta-sec {
          padding: 48px 20px 52px;
          text-align: center;
          background: var(--ink);
          position: relative;
          overflow: hidden;
        }

        .cta-sec::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url('/images/hanji-bg.png');
          background-repeat: repeat;
          background-size: auto;
          opacity: 0.08;
          pointer-events: none;
        }

        .cta-title {
          font-family: ${S.font};
          font-size: clamp(1.4rem, 4.5vw, 1.7rem);
          font-weight: 900;
          color: var(--cream);
          line-height: 1.35;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
        }

        .cta-sub {
          font-size: 13px;
          color: rgba(245,241,234,.65);
          line-height: 1.75;
          margin-bottom: 28px;
        }

        .cta-btn {
          width: 100%;
          max-width: 320px;
          padding: 16px;
          border-radius: 12px;
          border: none;
          background: var(--gold);
          color: #fff;
          font-family: ${S.font};
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity .15s, transform .1s;
          letter-spacing: 0.02em;
          margin-bottom: 12px;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        .cta-btn:active { transform: scale(.98); opacity: .9; }

        .cta-chat-btn {
          width: 100%;
          max-width: 320px;
          padding: 13px;
          border-radius: 12px;
          border: 1.5px solid rgba(245,241,234,.3);
          background: transparent;
          color: rgba(245,241,234,.8);
          font-family: ${S.font};
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: border-color .15s, background .15s;
          letter-spacing: 0.01em;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        .cta-chat-btn:hover {
          background: rgba(245,241,234,.08);
          border-color: rgba(245,241,234,.5);
        }

        /* ── 푸터 ── */
        .footer {
          padding: 24px 20px;
          text-align: center;
          background: var(--cream) url('/images/texture_paper_6.png');
          background-repeat: repeat;
          background-size: auto;
          border-top: 1px solid var(--beige);
        }

        .footer-text {
          font-size: 10px;
          color: var(--beige2);
          line-height: 1.7;
        }

        /* ── 플로팅 CTA (모바일) ── */
        .floating-cta {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 50;
          display: flex;
          gap: 8px;
          padding: 0 16px;
          width: 100%;
          max-width: 400px;
        }

        @media (min-width: 1024px) {
          .floating-cta { display: none; }
        }

        .floating-btn-main {
          flex: 1;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: var(--ink);
          color: var(--cream);
          font-family: ${S.font};
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(44,36,23,0.25);
          transition: opacity .15s;
        }
        .floating-btn-main:active { opacity: .88; }

        .floating-btn-chat {
          padding: 14px 18px;
          border-radius: 12px;
          border: 1.5px solid var(--beige2);
          background: rgba(245,241,234,.95);
          color: var(--ink);
          font-family: ${S.font};
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(44,36,23,0.12);
          transition: background .15s;
          white-space: nowrap;
        }
        .floating-btn-chat:hover { background: var(--cream2); }

        /* ── 구분선 장식 ── */
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 4px 0;
        }

        .divider-line { flex: 1; height: 1px; background: var(--beige); }
        .divider-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--beige2); }

        /* ── PC 사이드바 고정 ── */
        .pc-sticky-cta {
          display: none;
        }

        @media (min-width: 900px) {
          .pc-sticky-cta {
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 28px 24px;
            border-bottom: 1px solid var(--beige);
          }
        }

        /* fade in 섹션 */
        .reveal {
          opacity: 0;
          transform: translateY(14px);
          animation: revealUp .55s ease forwards;
        }

        @keyframes revealUp {
          to { opacity: 1; transform: translateY(0); }
        }

        .reveal:nth-child(1) { animation-delay: .05s; }
        .reveal:nth-child(2) { animation-delay: .1s; }
        .reveal:nth-child(3) { animation-delay: .15s; }
        .reveal:nth-child(4) { animation-delay: .2s; }
        .reveal:nth-child(5) { animation-delay: .25s; }
      `
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                lineNumber: 219,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "hd",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "hd-logo",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "hd-logo-mark",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: "/images/yin-yang-logo.png",
                                    alt: "태극",
                                    style: {
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover"
                                    },
                                    onError: (e)=>{
                                        e.currentTarget.style.display = "none";
                                        e.currentTarget.parentElement.textContent = "☯";
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                    lineNumber: 1347,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                lineNumber: 1346,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "hd-logo-text",
                                children: "한양사주"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                lineNumber: 1354,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                        lineNumber: 1345,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            position: "relative"
                        },
                        children: [
                            betaFeatures && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    padding: "4px 8px",
                                    borderRadius: 999,
                                    background: betaFeatures.is_admin ? "linear-gradient(135deg, #f59e0b, #d97706)" : "linear-gradient(135deg, #10b981, #059669)",
                                    border: betaFeatures.is_admin ? "1px solid #d97706" : "1px solid #047857",
                                    boxShadow: betaFeatures.is_admin ? "0 2px 8px rgba(245, 158, 11, 0.3)" : "0 2px 8px rgba(16, 185, 129, 0.3)"
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: "white",
                                        letterSpacing: "0.05em"
                                    },
                                    children: betaFeatures.is_admin ? "👑 관리자" : "🎉 베타 테스터"
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                    lineNumber: 1373,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                lineNumber: 1359,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    position: "relative"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setLangMenuOpen((o)=>!o),
                                        style: {
                                            padding: "4px 9px",
                                            borderRadius: 999,
                                            border: `1px solid ${S.beige2}`,
                                            background: "rgba(255,255,255,0.7)",
                                            fontFamily: S.font,
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: S.ink3,
                                            letterSpacing: "0.08em"
                                        },
                                        children: lang === "ko" ? "언어 ▾" : "Language ▾"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1385,
                                        columnNumber: 13
                                    }, this),
                                    langMenuOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            position: "absolute",
                                            right: 0,
                                            marginTop: 4,
                                            minWidth: 90,
                                            borderRadius: 8,
                                            border: `1px solid ${S.beige2}`,
                                            background: "rgba(255,255,255,0.98)",
                                            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                                            padding: 4,
                                            zIndex: 40
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>{
                                                    setLang("ko");
                                                    setLangMenuOpen(false);
                                                },
                                                style: {
                                                    width: "100%",
                                                    textAlign: "left",
                                                    padding: "6px 8px",
                                                    borderRadius: 6,
                                                    border: "none",
                                                    background: lang === "ko" ? "rgba(0,0,0,0.05)" : "transparent",
                                                    fontFamily: S.font,
                                                    fontSize: 12,
                                                    color: S.ink,
                                                    cursor: "pointer"
                                                },
                                                children: "한국어"
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                lineNumber: 1417,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>{
                                                    setLang("en");
                                                    setLangMenuOpen(false);
                                                },
                                                style: {
                                                    width: "100%",
                                                    textAlign: "left",
                                                    padding: "6px 8px",
                                                    borderRadius: 6,
                                                    border: "none",
                                                    background: lang === "en" ? "rgba(0,0,0,0.05)" : "transparent",
                                                    fontFamily: S.font,
                                                    fontSize: 12,
                                                    color: S.ink,
                                                    cursor: "pointer"
                                                },
                                                children: "English"
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                lineNumber: 1438,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1403,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                lineNumber: 1384,
                                columnNumber: 11
                            }, this),
                            isLoggedIn ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "hd-btn-fill",
                                onClick: ()=>router.push("/chat"),
                                children: "채팅 시작"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                lineNumber: 1463,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "hd-btn",
                                        onClick: ()=>router.push("/start"),
                                        children: "로그인"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1466,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "hd-btn-fill",
                                        onClick: ()=>router.push("/start"),
                                        children: "무료 시작"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1467,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                        lineNumber: 1356,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                lineNumber: 1344,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "pc-layout",
                style: {
                    display: "block"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "pc-sidebar",
                        style: {
                            display: "none"
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "pc-sticky-cta",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "serif",
                                    style: {
                                        fontSize: 15,
                                        fontWeight: 700,
                                        color: S.ink,
                                        lineHeight: 1.5,
                                        whiteSpace: "pre-line"
                                    },
                                    children: t("cta.title")
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                    lineNumber: 1478,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "btn-primary",
                                    onClick: handleStart,
                                    children: t("cta.primary")
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                    lineNumber: 1481,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "btn-secondary",
                                    onClick: ()=>router.push("/chat"),
                                    children: t("cta.secondary")
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                    lineNumber: 1484,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                            lineNumber: 1477,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                        lineNumber: 1476,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "pc-main",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "hero",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "hero-eyebrow",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "hero-dot"
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                lineNumber: 1496,
                                                columnNumber: 15
                                            }, this),
                                            t("hero.badge")
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1495,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "hero-logo",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: "/images/yin-yang-logo.png",
                                            alt: "한양사주",
                                            onError: (e)=>{
                                                e.currentTarget.style.display = "none";
                                                e.currentTarget.parentElement.textContent = "☯";
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                            lineNumber: 1501,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1500,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "hero-title reveal",
                                        style: {
                                            whiteSpace: "pre-line"
                                        },
                                        children: t("hero.title")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1508,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "hero-desc reveal",
                                        style: {
                                            whiteSpace: "pre-line"
                                        },
                                        children: t("hero.sub")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1512,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "hero-btns reveal",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "btn-primary",
                                                onClick: handleStart,
                                                children: t("hero.cta_primary")
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                lineNumber: 1517,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "btn-secondary",
                                                onClick: ()=>router.push("/chat"),
                                                children: t("hero.cta_secondary")
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                lineNumber: 1520,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1516,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        ref: counterRef,
                                        className: "counter-row reveal",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "counter-dot"
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                lineNumber: 1526,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 12,
                                                    color: S.ink3,
                                                    fontWeight: 500
                                                },
                                                children: t("hero.counter", {
                                                    count: count.toLocaleString()
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                lineNumber: 1527,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1525,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                lineNumber: 1494,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                style: {
                                    padding: '20px',
                                    textAlign: 'center'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        background: 'linear-gradient(135deg, #e8f5e8 0%, #d4e8d4 100%)',
                                        borderRadius: 16,
                                        padding: 24,
                                        maxWidth: 400,
                                        margin: '0 auto',
                                        border: '2px solid #2d5a2d',
                                        boxShadow: '0 4px 12px rgba(45, 90, 45, 0.1)'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: 14,
                                                fontWeight: 700,
                                                color: '#2d5a2d',
                                                marginBottom: 8
                                            },
                                            children: "베타 테스터 모집"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                            lineNumber: 1544,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            style: {
                                                fontSize: 18,
                                                fontWeight: 700,
                                                color: '#2d5a2d',
                                                marginBottom: 8
                                            },
                                            children: "채팅 + 기본 리포트 무제한!"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                            lineNumber: 1547,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: 13,
                                                color: '#2d5a2d',
                                                marginBottom: 16,
                                                lineHeight: 1.5
                                            },
                                            children: [
                                                "베타 테스터가 되어",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                    lineNumber: 1551,
                                                    columnNumber: 27
                                                }, this),
                                                "AI 채팅과 기본 리포트를 무제한으로 이용하세요"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                            lineNumber: 1550,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>router.push('/saju-mypage'),
                                            style: {
                                                background: '#2d5a2d',
                                                color: 'white',
                                                border: 'none',
                                                padding: '12px 24px',
                                                borderRadius: 8,
                                                fontSize: 14,
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            },
                                            onMouseOver: (e)=>e.currentTarget.style.transform = 'scale(1.05)',
                                            onMouseOut: (e)=>e.currentTarget.style.transform = 'scale(1)',
                                            children: "쿠폰 받기"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                            lineNumber: 1554,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                    lineNumber: 1535,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                lineNumber: 1534,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "problem-sec",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "problem-label",
                                        children: t("problem.eyebrow")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1577,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "problem-main",
                                        style: {
                                            whiteSpace: "pre-line"
                                        },
                                        children: t("problem.title")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1578,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "problem-sub",
                                        style: {
                                            whiteSpace: "pre-line"
                                        },
                                        children: t("problem.title_gold")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1581,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "problem-divider"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1584,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "problem-desc",
                                        style: {
                                            whiteSpace: "pre-line"
                                        },
                                        children: t("problem.body")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1585,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                lineNumber: 1576,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "compare-sec",
                                style: {
                                    textAlign: "center"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "badge",
                                        children: t("compare.badge")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1592,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "compare-title",
                                        style: {
                                            whiteSpace: "pre-line"
                                        },
                                        children: t("compare.title")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1593,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "compare-row",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "compare-card compare-left",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "compare-label",
                                                        children: t("compare.left_label")
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1599,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "compare-chip-col",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "compare-chip",
                                                                children: "ChatGPT"
                                                            }, void 0, false, {
                                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                lineNumber: 1601,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "compare-chip",
                                                                children: "Claude"
                                                            }, void 0, false, {
                                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                lineNumber: 1602,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "compare-chip",
                                                                children: "Gemini"
                                                            }, void 0, false, {
                                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                lineNumber: 1603,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1600,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "compare-note",
                                                        children: t("compare.left_note")
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1605,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                lineNumber: 1598,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "compare-arrow",
                                                children: "→"
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                lineNumber: 1608,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "compare-card compare-right",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "compare-label compare-label-right",
                                                        children: t("compare.right_label")
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1611,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "compare-logo-wrap",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "compare-logo",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                src: "/images/yin-yang-logo.png",
                                                                alt: "한양사주",
                                                                onError: (e)=>{
                                                                    e.currentTarget.style.display = "none";
                                                                    e.currentTarget.parentElement.textContent = "☯";
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                lineNumber: 1614,
                                                                columnNumber: 21
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                            lineNumber: 1613,
                                                            columnNumber: 19
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1612,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "compare-service-name",
                                                        children: t("compare.right_name")
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1621,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "compare-right-note",
                                                        children: t("compare.right_note")
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1622,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                lineNumber: 1610,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1597,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "engine-card",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "engine-row",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: t("compare.engine_a")
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1628,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "engine-x",
                                                        children: "×"
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1629,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: t("compare.engine_b")
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1630,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                lineNumber: 1627,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "engine-sub",
                                                children: t("compare.engine_sub")
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                lineNumber: 1632,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1626,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                lineNumber: 1591,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "sec",
                                style: {
                                    textAlign: "center"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "badge badge-gold",
                                        style: {
                                            marginLeft: "auto",
                                            marginRight: "auto"
                                        },
                                        children: t("chat_preview.badge")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1638,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "sec-title",
                                        style: {
                                            whiteSpace: "pre-line"
                                        },
                                        children: t("chat_preview.title")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1641,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "sec-sub",
                                        style: {
                                            marginBottom: 18,
                                            whiteSpace: "pre-line"
                                        },
                                        children: t("chat_preview.sub")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1644,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "chat-preview",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "chat-preview-hd",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "chat-preview-avatar",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                            src: "/images/yin-yang-logo.png",
                                                            alt: "",
                                                            onError: (e)=>{
                                                                e.currentTarget.style.display = "none";
                                                                e.currentTarget.parentElement.textContent = "☯";
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                            lineNumber: 1651,
                                                            columnNumber: 19
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1650,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "chat-preview-name",
                                                        children: t("chat_preview.ai_name")
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1657,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: 10,
                                                            color: S.ink3,
                                                            marginLeft: "auto"
                                                        },
                                                        children: t("chat_preview.ai_status")
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1658,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                lineNumber: 1649,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "chat-preview-body",
                                                children: (()=>{
                                                    const bubbles = messages.chat_preview.bubbles;
                                                    const b = bubbles[chatIdx] || bubbles[0];
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "chat-bubble-user",
                                                                children: b.q
                                                            }, void 0, false, {
                                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                lineNumber: 1668,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "chat-bubble-ai",
                                                                children: b.a
                                                            }, void 0, false, {
                                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                lineNumber: 1669,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true);
                                                })()
                                            }, chatIdx, false, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                lineNumber: 1662,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    padding: "10px 14px",
                                                    borderTop: `1px solid ${S.cream3}`
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>router.push("/chat"),
                                                    style: {
                                                        width: "100%",
                                                        padding: "10px",
                                                        borderRadius: 8,
                                                        border: `1px solid ${S.beige}`,
                                                        background: S.cream,
                                                        font: "inherit",
                                                        fontSize: 13,
                                                        color: S.ink3,
                                                        cursor: "pointer",
                                                        fontFamily: S.font
                                                    },
                                                    children: t("chat_preview.cta")
                                                }, void 0, false, {
                                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                    lineNumber: 1675,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                lineNumber: 1674,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1648,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                lineNumber: 1637,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "sec",
                                style: {
                                    textAlign: "center"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "badge",
                                        children: t("manseryeok.badge")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1698,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "sec-title",
                                        style: {
                                            whiteSpace: "pre-line"
                                        },
                                        children: t("manseryeok.title")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1699,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "sec-sub",
                                        style: {
                                            marginBottom: 4,
                                            whiteSpace: "pre-line"
                                        },
                                        children: t("manseryeok.sub")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1702,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "manseryeok-preview",
                                        style: {
                                            marginTop: 16
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                            className: "msr-table",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                style: {
                                                                    width: 80
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                lineNumber: 1711,
                                                                columnNumber: 21
                                                            }, this),
                                                            messages.manseryeok.headers.map((h)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    children: h
                                                                }, h, false, {
                                                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                    lineNumber: 1713,
                                                                    columnNumber: 23
                                                                }, this))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1710,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                    lineNumber: 1709,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            className: "msr-row-label",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontSize: 11,
                                                                        color: S.ink3,
                                                                        textAlign: "center"
                                                                    },
                                                                    children: "십성(천간)"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                    lineNumber: 1720,
                                                                    columnNumber: 21
                                                                }, this),
                                                                messages.manseryeok.sipsung_top.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        children: s
                                                                    }, i, false, {
                                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                        lineNumber: 1722,
                                                                        columnNumber: 23
                                                                    }, this))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                            lineNumber: 1719,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontSize: 11,
                                                                        color: S.ink3,
                                                                        textAlign: "center"
                                                                    },
                                                                    children: "천간"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                    lineNumber: 1727,
                                                                    columnNumber: 21
                                                                }, this),
                                                                [
                                                                    {
                                                                        char: "계癸",
                                                                        el: "water"
                                                                    },
                                                                    {
                                                                        char: "기己",
                                                                        el: "earth"
                                                                    },
                                                                    {
                                                                        char: "갑甲",
                                                                        el: "wood"
                                                                    },
                                                                    {
                                                                        char: "을乙",
                                                                        el: "wood"
                                                                    }
                                                                ].map((c, i)=>{
                                                                    const col = FIVE_ELEMENT_COLORS[c.el];
                                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        style: {
                                                                            padding: 4,
                                                                            verticalAlign: "middle"
                                                                        },
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "msr-pillar-box",
                                                                            style: {
                                                                                background: col.bg,
                                                                                color: col.text,
                                                                                border: `1px solid ${col.border}`
                                                                            },
                                                                            children: c.char
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                            lineNumber: 1737,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    }, i, false, {
                                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                        lineNumber: 1736,
                                                                        columnNumber: 25
                                                                    }, this);
                                                                })
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                            lineNumber: 1726,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontSize: 11,
                                                                        color: S.ink3,
                                                                        textAlign: "center"
                                                                    },
                                                                    children: "지지"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                    lineNumber: 1753,
                                                                    columnNumber: 21
                                                                }, this),
                                                                [
                                                                    {
                                                                        char: "유酉",
                                                                        el: "metal"
                                                                    },
                                                                    {
                                                                        char: "미未",
                                                                        el: "earth"
                                                                    },
                                                                    {
                                                                        char: "신申",
                                                                        el: "metal"
                                                                    },
                                                                    {
                                                                        char: "사巳",
                                                                        el: "fire"
                                                                    }
                                                                ].map((c, i)=>{
                                                                    const col = FIVE_ELEMENT_COLORS[c.el];
                                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        style: {
                                                                            padding: 4,
                                                                            verticalAlign: "middle"
                                                                        },
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "msr-pillar-box",
                                                                            style: {
                                                                                background: col.bg,
                                                                                color: col.text,
                                                                                border: `1px solid ${col.border}`
                                                                            },
                                                                            children: c.char
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                            lineNumber: 1763,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    }, i, false, {
                                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                        lineNumber: 1762,
                                                                        columnNumber: 25
                                                                    }, this);
                                                                })
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                            lineNumber: 1752,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            className: "msr-row-label",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontSize: 11,
                                                                        color: S.ink3,
                                                                        textAlign: "center"
                                                                    },
                                                                    children: "십성(지지)"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                    lineNumber: 1779,
                                                                    columnNumber: 21
                                                                }, this),
                                                                messages.manseryeok.sipsung_bot.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        children: s
                                                                    }, i, false, {
                                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                        lineNumber: 1781,
                                                                        columnNumber: 23
                                                                    }, this))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                            lineNumber: 1778,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontSize: 11,
                                                                        color: S.ink3,
                                                                        textAlign: "center"
                                                                    },
                                                                    children: "지장간"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                    lineNumber: 1786,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontSize: 10,
                                                                        padding: 6,
                                                                        textAlign: "center",
                                                                        lineHeight: 1.5,
                                                                        color: S.ink3
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: "경금 (상관)"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                            lineNumber: 1788,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: "신금 (식신)"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                            lineNumber: 1789,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                    lineNumber: 1787,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontSize: 10,
                                                                        padding: 6,
                                                                        textAlign: "center",
                                                                        lineHeight: 1.5,
                                                                        color: S.ink3
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: "정화 (편인)"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                            lineNumber: 1792,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: "을목 (편관)"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                            lineNumber: 1793,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: "기토 (비견)"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                            lineNumber: 1794,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                    lineNumber: 1791,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontSize: 10,
                                                                        padding: 6,
                                                                        textAlign: "center",
                                                                        lineHeight: 1.5,
                                                                        color: S.ink3
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: "무토 (겁재)"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                            lineNumber: 1797,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: "임수 (정재)"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                            lineNumber: 1798,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: "경금 (상관)"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                            lineNumber: 1799,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                    lineNumber: 1796,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontSize: 10,
                                                                        padding: 6,
                                                                        textAlign: "center",
                                                                        lineHeight: 1.5,
                                                                        color: S.ink3
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: "무토 (겁재)"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                            lineNumber: 1802,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: "경금 (상관)"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                            lineNumber: 1803,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: "병화 (정인)"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                            lineNumber: 1804,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                    lineNumber: 1801,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                            lineNumber: 1785,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            className: "msr-row-label",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontSize: 11,
                                                                        color: S.ink3,
                                                                        textAlign: "center"
                                                                    },
                                                                    children: "십이운성"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                    lineNumber: 1809,
                                                                    columnNumber: 21
                                                                }, this),
                                                                messages.manseryeok.twelve.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        children: s
                                                                    }, i, false, {
                                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                        lineNumber: 1811,
                                                                        columnNumber: 23
                                                                    }, this))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                            lineNumber: 1808,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                    lineNumber: 1717,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                            lineNumber: 1708,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1707,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            fontSize: 11,
                                            color: S.ink3,
                                            marginTop: 10,
                                            textAlign: "center"
                                        },
                                        children: t("manseryeok.note")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1818,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                lineNumber: 1697,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "sec",
                                style: {
                                    textAlign: "center"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "badge",
                                        children: t("features.badge")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1825,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "sec-title",
                                        style: {
                                            whiteSpace: "pre-line"
                                        },
                                        children: t("features.title")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1826,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "feature-grid",
                                        children: messages.features.items.map((f, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "feature-card",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "feature-icon",
                                                        children: f.icon
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1833,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "feature-title",
                                                        children: f.title
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1834,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "feature-desc",
                                                        children: f.desc
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1835,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, idx, true, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                lineNumber: 1832,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1830,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 16,
                                            padding: "12px 14px",
                                            background: S.cream2,
                                            borderRadius: 10,
                                            border: `1px solid ${S.beige}`
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: 12,
                                                color: S.ink3,
                                                lineHeight: 1.7,
                                                whiteSpace: "pre-line"
                                            },
                                            children: [
                                                t("features.more"),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                    lineNumber: 1843,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    style: {
                                                        color: S.gold
                                                    },
                                                    children: t("features.more_strong")
                                                }, void 0, false, {
                                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                    lineNumber: 1844,
                                                    columnNumber: 17
                                                }, this),
                                                t("features.more_suffix")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                            lineNumber: 1841,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1840,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                lineNumber: 1824,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "sec",
                                style: {
                                    textAlign: "center"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "badge",
                                        children: t("animals.badge")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1852,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "sec-title",
                                        style: {
                                            whiteSpace: "pre-line"
                                        },
                                        children: t("animals.title")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1853,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "sec-sub",
                                        style: {
                                            marginBottom: 4,
                                            whiteSpace: "pre-line"
                                        },
                                        children: t("animals.sub")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1856,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "animal-grid",
                                        children: animals.map((a, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "animal-cell",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: animalRound > 0 ? "animal-flip" : "",
                                                    style: {
                                                        width: "100%",
                                                        height: "100%",
                                                        animationDelay: animalRound > 0 ? `${i * 35}ms` : undefined
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: `/images/day_pillars/${a}.png`,
                                                        alt: a,
                                                        loading: "lazy",
                                                        decoding: "async",
                                                        onError: (e)=>{
                                                            e.currentTarget.style.display = "none";
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1868,
                                                        columnNumber: 21
                                                    }, this)
                                                }, `${animalRound}-${i}`, false, {
                                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                    lineNumber: 1863,
                                                    columnNumber: 19
                                                }, this)
                                            }, i, false, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                lineNumber: 1862,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1860,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            fontSize: 11,
                                            color: S.ink3,
                                            textAlign: "center",
                                            marginTop: 10
                                        },
                                        children: t("animals.note")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1879,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                lineNumber: 1851,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "sec",
                                style: {
                                    background: S.cream2,
                                    textAlign: "center"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "badge",
                                        children: t("trust.badge")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1886,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "trust-grid",
                                        children: messages.trust.items.map((item, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "trust-card",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "trust-num",
                                                        children: idx === 0 ? reviewCount.toLocaleString() + "+" : item.val
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1891,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "trust-label",
                                                        style: {
                                                            whiteSpace: "pre-line"
                                                        },
                                                        children: item.lbl.replace("{count}", reviewCount.toLocaleString())
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1894,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, idx, true, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                lineNumber: 1890,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1888,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                lineNumber: 1885,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "sec",
                                style: {
                                    textAlign: "center"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "badge",
                                        children: t("reviews.badge")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1904,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "sec-title",
                                        style: {
                                            fontSize: "1.25rem"
                                        },
                                        children: t("reviews.title")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1905,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        ref: reviewRef,
                                        className: "review-scroll",
                                        style: {
                                            marginTop: 16
                                        },
                                        onMouseDown: (e)=>{
                                            const el = reviewRef.current;
                                            if (!el) return;
                                            let x = e.pageX - el.offsetLeft;
                                            let scrollLeft = el.scrollLeft;
                                            const onMove = (e)=>{
                                                const walk = (e.pageX - el.offsetLeft - x) * 1.2;
                                                el.scrollLeft = scrollLeft - walk;
                                            };
                                            document.addEventListener("mousemove", onMove);
                                            document.addEventListener("mouseup", ()=>document.removeEventListener("mousemove", onMove), {
                                                once: true
                                            });
                                        },
                                        children: messages.reviews.items.map((r, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "review-card",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "review-top",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "review-name",
                                                                        children: r.name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                        lineNumber: 1930,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "review-age",
                                                                        children: r.age
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                        lineNumber: 1931,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                lineNumber: 1929,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "review-tag",
                                                                children: r.tag
                                                            }, void 0, false, {
                                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                lineNumber: 1933,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1928,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "review-stars",
                                                        children: "★".repeat(5)
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1935,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "review-text",
                                                        children: [
                                                            '"',
                                                            r.text,
                                                            '"'
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1936,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, i, true, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                lineNumber: 1927,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1909,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            fontSize: 11,
                                            color: S.beige2,
                                            textAlign: "center",
                                            marginTop: 6
                                        },
                                        children: t("reviews.hint")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1941,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                lineNumber: 1903,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "sec",
                                style: {
                                    textAlign: "center"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "badge",
                                        children: t("core_features.badge")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1948,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "sec-title",
                                        style: {
                                            whiteSpace: "pre-line"
                                        },
                                        children: t("core_features.title")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1949,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 10,
                                            marginTop: 18
                                        },
                                        children: messages.core_features.items.slice(0, 3).map((item, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    background: "#fff",
                                                    border: `1px solid ${S.beige}`,
                                                    borderRadius: 13,
                                                    padding: "18px 16px",
                                                    display: "flex",
                                                    gap: 14,
                                                    alignItems: "flex-start"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            width: 42,
                                                            height: 42,
                                                            borderRadius: 10,
                                                            background: S.cream2,
                                                            border: `1px solid ${S.beige}`,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontSize: 20,
                                                            flexShrink: 0
                                                        },
                                                        children: item.icon
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1967,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            flex: 1
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: 7,
                                                                    marginBottom: 5,
                                                                    flexWrap: "wrap"
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            fontFamily: S.font,
                                                                            fontSize: 14,
                                                                            fontWeight: 700,
                                                                            color: S.ink
                                                                        },
                                                                        children: item.title
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                        lineNumber: 1983,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    item.tag && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            padding: "2px 8px",
                                                                            borderRadius: 4,
                                                                            background: S.gold,
                                                                            color: "#fff",
                                                                            fontSize: 9,
                                                                            fontWeight: 800,
                                                                            letterSpacing: "0.08em"
                                                                        },
                                                                        children: item.tag
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                        lineNumber: 1987,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                lineNumber: 1982,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                style: {
                                                                    fontSize: 12.5,
                                                                    color: S.ink3,
                                                                    lineHeight: 1.75,
                                                                    wordBreak: "keep-all",
                                                                    textAlign: "left"
                                                                },
                                                                children: item.desc
                                                            }, void 0, false, {
                                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                                lineNumber: 2000,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                        lineNumber: 1981,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, idx, true, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                                lineNumber: 1955,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 1953,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                lineNumber: 1947,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "sec",
                                style: {
                                    background: S.cream2,
                                    display: "none"
                                },
                                "aria-hidden": true,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "badge",
                                        children: t("pricing.badge")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 2011,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "sec-title",
                                        style: {
                                            fontSize: "1.25rem",
                                            whiteSpace: "pre-line"
                                        },
                                        children: t("pricing.title")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 2012,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 10,
                                            marginTop: 18
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 2015,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                lineNumber: 2010,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "cta-sec",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            fontSize: 11,
                                            color: "rgba(245,241,234,.5)",
                                            letterSpacing: "0.12em",
                                            marginBottom: 14,
                                            fontWeight: 700
                                        },
                                        children: t("cta.eyebrow")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 2020,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "cta-title",
                                        style: {
                                            whiteSpace: "pre-line"
                                        },
                                        children: t("cta.title")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 2023,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "cta-sub",
                                        style: {
                                            whiteSpace: "pre-line"
                                        },
                                        children: t("cta.sub")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 2026,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "cta-btn",
                                        onClick: handleStart,
                                        children: t("cta.primary")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 2030,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "cta-chat-btn",
                                        onClick: ()=>router.push("/chat"),
                                        children: t("cta.secondary")
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                        lineNumber: 2033,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                lineNumber: 2019,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                                className: "footer",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "footer-text",
                                    style: {
                                        whiteSpace: "pre-line"
                                    },
                                    children: [
                                        t("footer.copy"),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                            lineNumber: 2042,
                                            columnNumber: 15
                                        }, this),
                                        t("footer.sub")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                    lineNumber: 2040,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                                lineNumber: 2039,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                        lineNumber: 1491,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                lineNumber: 1473,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "floating-cta",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "floating-btn-main",
                        onClick: handleStart,
                        children: "무료 사주 분석"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                        lineNumber: 2054,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "floating-btn-chat",
                        onClick: ()=>router.push("/chat"),
                        children: "AI 대화"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                        lineNumber: 2057,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/home/page.tsx",
                lineNumber: 2053,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
];

//# sourceMappingURL=OneDrive_Desktop_saju-project-temp_frontend_ddd7d09e._.js.map