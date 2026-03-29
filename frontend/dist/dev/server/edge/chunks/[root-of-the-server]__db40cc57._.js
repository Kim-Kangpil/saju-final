(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__db40cc57._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/OneDrive/Desktop/saju-project-temp/frontend/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
/** true: 베타 코드 필요 / false: 게이트 잠깐 해제(전체 통과) — 다시 막을 때 true로 변경 */ const BETA_GATE_ENABLED = true;
function middleware(req) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const cookie = req.cookies.get("beta_access")?.value;
    const isAuthorized = cookie === "1";
    if (isAuthorized) return __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    const { pathname } = req.nextUrl;
    // 베타 접근 페이지/검증 API/정적 리소스는 예외 허용
    if (pathname.startsWith("/beta-access") || pathname.startsWith("/api/beta-verify") || pathname.startsWith("/_next") || pathname.startsWith("/images") || pathname === "/favicon.ico") {
        return __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    const url = req.nextUrl.clone();
    url.pathname = "/beta-access";
    url.searchParams.set("redirect", req.nextUrl.pathname + req.nextUrl.search);
    return __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url);
}
const config = {
    // 정적 파일/_next 등에는 미들웨어가 실행되지 않도록 제외
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|images|api/beta-verify|beta-access).*)"
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__db40cc57._.js.map