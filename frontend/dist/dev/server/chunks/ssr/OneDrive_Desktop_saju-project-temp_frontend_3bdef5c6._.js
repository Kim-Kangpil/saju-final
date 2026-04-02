module.exports = [
"[project]/OneDrive/Desktop/saju-project-temp/frontend/components/PersonalityRadarCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PersonalityRadarCard",
    ()=>PersonalityRadarCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const AXES = [
    "감정",
    "즉흥",
    "외향",
    "실행",
    "안정"
];
const AXIS_PAIRS = {
    감정: [
        "감정형",
        "이성형"
    ],
    즉흥: [
        "즉흥형",
        "계획형"
    ],
    외향: [
        "외향형",
        "내향형"
    ],
    실행: [
        "실행형",
        "고민형"
    ],
    안정: [
        "안정형",
        "변화형"
    ]
};
const AXIS_DESC = {
    감정: [
        "감수성이 높고 공감 능력이 뛰어나요",
        "논리와 데이터로 판단하는 편이에요"
    ],
    즉흥: [
        "즉흥적이고 유연하게 흘러가는 편이에요",
        "계획을 세우고 체계적으로 움직여요"
    ],
    외향: [
        "사람들과 함께할 때 에너지가 올라가요",
        "혼자만의 시간이 있어야 회복이 돼요"
    ],
    실행: [
        "생각보다 행동이 먼저 나오는 편이에요",
        "신중하게 고민하고 나서 움직여요"
    ],
    안정: [
        "안정적이고 익숙한 환경을 선호해요",
        "변화와 새로운 도전을 즐겨요"
    ]
};
function PersonalityRadarCard({ ruleSummary }) {
    const scores = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const vd = ruleSummary?.visual_data?.personality_radar;
        if (vd && typeof vd === "object") return vd;
        return {
            감정: 50,
            즉흥: 50,
            외향: 50,
            실행: 50,
            안정: 50
        };
    }, [
        ruleSummary
    ]);
    const CX = 140;
    const CY = 140;
    const R = 86;
    const N = AXES.length;
    const toXY = (i, r)=>{
        const rad = (360 / N * i - 90) * (Math.PI / 180);
        return {
            x: CX + r * Math.cos(rad),
            y: CY + r * Math.sin(rad)
        };
    };
    // intensity = 0~1 (거리를 반지름으로: 중립=중심, 강함=외곽)
    const getIntensity = (ax)=>Math.abs((scores[ax] ?? 50) - 50) / 50;
    const isLeft = (ax)=>(scores[ax] ?? 50) >= 50;
    const getDominant = (ax)=>AXIS_PAIRS[ax][isLeft(ax) ? 0 : 1];
    const getLevel = (intensity)=>{
        if (intensity > 0.62) return "매우 강함";
        if (intensity > 0.38) return "강함";
        if (intensity > 0.18) return "보통";
        return "중립";
    };
    // 데이터 폴리곤: intensity * R
    const dataPoints = AXES.map((ax, i)=>toXY(i, getIntensity(ax) * R));
    const dataPts = dataPoints.map((p)=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const labelR = R + 40;
    const strongest = AXES.reduce((a, b)=>getIntensity(a) >= getIntensity(b) ? a : b, AXES[0]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            width: "100%",
            background: "#fff",
            borderRadius: 16,
            padding: "20px 12px 16px",
            border: "1px solid #E3D9CB"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#6B5F4E",
                    letterSpacing: "0.08em",
                    textAlign: "center"
                },
                children: "나의 성향 지도"
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/PersonalityRadarCard.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    fontSize: 10,
                    color: "#A8946A",
                    textAlign: "center",
                    marginTop: 3,
                    marginBottom: 10
                },
                children: "중심에서 멀수록 그 성향이 강해요"
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/PersonalityRadarCard.tsx",
                lineNumber: 88,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                width: "100%",
                viewBox: "-36 -30 352 348",
                preserveAspectRatio: "xMidYMid meet",
                style: {
                    display: "block",
                    overflow: "visible",
                    maxWidth: 340,
                    margin: "0 auto"
                },
                children: [
                    [
                        0.33,
                        0.66,
                        1
                    ].map((ratio, ri)=>{
                        const bpts = AXES.map((_, i)=>{
                            const p = toXY(i, R * ratio);
                            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
                        }).join(" ");
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                            points: bpts,
                            fill: "none",
                            stroke: ri === 2 ? "#D4C9B8" : "#EDE6DC",
                            strokeWidth: ri === 2 ? 1.5 : 1,
                            strokeDasharray: ri < 2 ? "3,3" : "0"
                        }, ri, false, {
                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/PersonalityRadarCard.tsx",
                            lineNumber: 113,
                            columnNumber: 13
                        }, this);
                    }),
                    AXES.map((_, i)=>{
                        const p = toXY(i, R);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                            x1: CX,
                            y1: CY,
                            x2: p.x.toFixed(1),
                            y2: p.y.toFixed(1),
                            stroke: "#E3D9CB",
                            strokeWidth: 1
                        }, i, false, {
                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/PersonalityRadarCard.tsx",
                            lineNumber: 128,
                            columnNumber: 13
                        }, this);
                    }),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        cx: CX,
                        cy: CY,
                        r: 5,
                        fill: "#D4C9B8"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/PersonalityRadarCard.tsx",
                        lineNumber: 141,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                        points: dataPts,
                        fill: "rgba(139,115,85,0.16)",
                        stroke: "#8B7355",
                        strokeWidth: 2,
                        strokeLinejoin: "round"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/PersonalityRadarCard.tsx",
                        lineNumber: 144,
                        columnNumber: 9
                    }, this),
                    dataPoints.map((p, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                            cx: p.x.toFixed(1),
                            cy: p.y.toFixed(1),
                            r: 4,
                            fill: "#8B7355",
                            stroke: "#fff",
                            strokeWidth: 1.5
                        }, i, false, {
                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/PersonalityRadarCard.tsx",
                            lineNumber: 154,
                            columnNumber: 11
                        }, this)),
                    AXES.map((ax, i)=>{
                        const { x, y } = toXY(i, labelR);
                        const label = getDominant(ax);
                        const intensity = getIntensity(ax);
                        const strong = intensity > 0.38;
                        let ta = "middle";
                        if (x < CX - 12) ta = "end";
                        else if (x > CX + 12) ta = "start";
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                            x: x.toFixed(1),
                            y: (y + 4).toFixed(1),
                            textAnchor: ta,
                            fontSize: strong ? 11 : 10,
                            fontWeight: strong ? 800 : 600,
                            fill: strong ? "#5C4A30" : "#8B7355",
                            fontFamily: "'Gmarket Sans', sans-serif",
                            children: label
                        }, ax, false, {
                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/PersonalityRadarCard.tsx",
                            lineNumber: 175,
                            columnNumber: 13
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/PersonalityRadarCard.tsx",
                lineNumber: 100,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: 7,
                    marginTop: 10,
                    padding: "0 6px"
                },
                children: AXES.map((ax)=>{
                    const intensity = getIntensity(ax);
                    const dominant = getDominant(ax);
                    const level = getLevel(intensity);
                    const barPct = Math.round(intensity * 100);
                    const strong = intensity > 0.38;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 8
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    width: 46,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: "#5C4A30",
                                    textAlign: "right",
                                    flexShrink: 0
                                },
                                children: dominant
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/PersonalityRadarCard.tsx",
                                lineNumber: 209,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    flex: 1,
                                    height: 7,
                                    background: "#EDE6DC",
                                    borderRadius: 4,
                                    overflow: "hidden"
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        width: `${barPct}%`,
                                        height: "100%",
                                        background: strong ? "linear-gradient(90deg, #8B7355, #5C4A30)" : "#C4B8A4",
                                        borderRadius: 4
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/PersonalityRadarCard.tsx",
                                    lineNumber: 230,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/PersonalityRadarCard.tsx",
                                lineNumber: 221,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    width: 56,
                                    fontSize: 10,
                                    color: strong ? "#5C4A30" : "#A8946A",
                                    textAlign: "left",
                                    flexShrink: 0
                                },
                                children: level
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/PersonalityRadarCard.tsx",
                                lineNumber: 241,
                                columnNumber: 15
                            }, this)
                        ]
                    }, ax, true, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/PersonalityRadarCard.tsx",
                        lineNumber: 208,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/PersonalityRadarCard.tsx",
                lineNumber: 192,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 12,
                    padding: "10px 12px",
                    background: "#F5F1EA",
                    borderRadius: 10,
                    border: "1px solid #E3D9CB"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        fontSize: 11,
                        color: "#5C4A30",
                        lineHeight: 1.65
                    },
                    children: [
                        "가장 두드러지는 성향은 ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                            children: getDominant(strongest)
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/PersonalityRadarCard.tsx",
                            lineNumber: 268,
                            columnNumber: 24
                        }, this),
                        "이에요.",
                        " ",
                        AXIS_DESC[strongest][isLeft(strongest) ? 0 : 1],
                        "."
                    ]
                }, void 0, true, {
                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/PersonalityRadarCard.tsx",
                    lineNumber: 267,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/PersonalityRadarCard.tsx",
                lineNumber: 258,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/PersonalityRadarCard.tsx",
        lineNumber: 68,
        columnNumber: 5
    }, this);
}
}),
"[project]/OneDrive/Desktop/saju-project-temp/frontend/components/ProblemLoopCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProblemLoopCard",
    ()=>ProblemLoopCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const TYPE_INFO = {
    pressure_avoidance: {
        title: "압박 회피형",
        desc: "부담을 느끼는 순간 본능적으로 피하려는 패턴이에요",
        hint: "과제를 작게 쪼개면 압박감이 줄고 실행이 쉬워져요"
    },
    solo_conflict: {
        title: "독립 충돌형",
        desc: "혼자 추진하다가 관계에서 반복적으로 마찰이 생겨요",
        hint: "함께할 포인트를 미리 설계하면 충돌이 줄어들어요"
    },
    money_exhaustion: {
        title: "기회 소진형",
        desc: "돈 기회는 오는데 에너지가 따라가지 못하는 구조예요",
        hint: "에너지를 먼저 관리해야 재물 흐름도 잡혀요"
    },
    wanderlust: {
        title: "이동 반복형",
        desc: "새 시작을 즐기지만 한 곳에 오래 정착하기 어려워요",
        hint: "관심사를 하나로 집중할 때 결과가 달라지기 시작해요"
    },
    expression_conflict: {
        title: "표현 충돌형",
        desc: "할 말이 있지만 표현할 때마다 충돌이 반복돼요",
        hint: "타이밍과 방식을 선택하면 같은 말도 다르게 전달돼요"
    },
    overthinking: {
        title: "과잉 고민형",
        desc: "생각이 너무 많아 실행이 계속 미뤄지는 패턴이에요",
        hint: "60% 판단에서 움직이는 연습이 삶의 흐름을 바꿔요"
    },
    goal_drift: {
        title: "목표 흔들림형",
        desc: "목표를 세우지만 중간에 흔들려 방향을 잃는 구조예요",
        hint: "3개월 단위로 목표를 쪼개면 방향이 오래 유지돼요"
    }
};
const STEP_COLORS = [
    "#C4B8A4",
    "#A8946A",
    "#8B7355",
    "#5C4A30"
];
function ProblemLoopCard({ ruleSummary }) {
    const { steps, typeTitle, typeDesc, hint } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const vd = ruleSummary?.visual_data?.problem_loop;
        if (vd && Array.isArray(vd.steps)) {
            const t = vd.type || "goal_drift";
            const info = TYPE_INFO[t] ?? TYPE_INFO.goal_drift;
            return {
                steps: vd.steps.map((s)=>String(s)),
                typeTitle: info.title,
                typeDesc: info.desc,
                hint: info.hint
            };
        }
        const info = TYPE_INFO.goal_drift;
        return {
            steps: [
                "목표 세움",
                "중간 흔들림",
                "방향 잃음",
                "다시 목표"
            ],
            typeTitle: info.title,
            typeDesc: info.desc,
            hint: info.hint
        };
    }, [
        ruleSummary
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            width: "100%",
            background: "#fff",
            borderRadius: 16,
            padding: "20px 16px",
            border: "1px solid #E3D9CB"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    textAlign: "center",
                    marginBottom: 4
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#6B5F4E",
                            letterSpacing: "0.08em"
                        },
                        children: "반복되는 패턴"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/ProblemLoopCard.tsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontSize: 14,
                            fontWeight: 800,
                            color: "#5C4A30",
                            marginTop: 5
                        },
                        children: typeTitle
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/ProblemLoopCard.tsx",
                        lineNumber: 92,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/ProblemLoopCard.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    fontSize: 11,
                    color: "#8B7355",
                    textAlign: "center",
                    marginBottom: 18,
                    lineHeight: 1.65
                },
                children: typeDesc
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/ProblemLoopCard.tsx",
                lineNumber: 103,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0,
                    overflowX: "auto",
                    padding: "4px 0 8px"
                },
                children: steps.map((step, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            alignItems: "center",
                            flexShrink: 0
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 4
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: 58,
                                            height: 58,
                                            borderRadius: "50%",
                                            background: i === steps.length - 1 ? "#F5F1EA" : `rgba(92,74,48,${0.08 + i * 0.14})`,
                                            border: i === steps.length - 1 ? "2px dashed #C4B8A4" : `2.5px solid ${STEP_COLORS[Math.min(i, STEP_COLORS.length - 1)]}`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: STEP_COLORS[Math.min(i, STEP_COLORS.length - 1)],
                                            textAlign: "center",
                                            lineHeight: 1.3,
                                            padding: 4
                                        },
                                        children: step
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/ProblemLoopCard.tsx",
                                        lineNumber: 139,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: 9,
                                            color: "#C4B8A4",
                                            fontWeight: 600
                                        },
                                        children: [
                                            i + 1,
                                            "단계"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/ProblemLoopCard.tsx",
                                        lineNumber: 165,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/ProblemLoopCard.tsx",
                                lineNumber: 131,
                                columnNumber: 13
                            }, this),
                            i < steps.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 14,
                                    color: "#C4B8A4",
                                    margin: "0 2px",
                                    paddingBottom: 16
                                },
                                children: "→"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/ProblemLoopCard.tsx",
                                lineNumber: 173,
                                columnNumber: 15
                            }, this),
                            i === steps.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 12,
                                    color: "#C4B8A4",
                                    margin: "0 2px",
                                    paddingBottom: 16
                                },
                                children: "↩"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/ProblemLoopCard.tsx",
                                lineNumber: 185,
                                columnNumber: 15
                            }, this)
                        ]
                    }, i, true, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/ProblemLoopCard.tsx",
                        lineNumber: 127,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/ProblemLoopCard.tsx",
                lineNumber: 116,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: "10px 12px",
                    background: "#F5F1EA",
                    borderRadius: 10,
                    border: "1px solid #E3D9CB"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        fontSize: 11,
                        color: "#5C4A30",
                        lineHeight: 1.65
                    },
                    children: [
                        "💡 ",
                        hint
                    ]
                }, void 0, true, {
                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/ProblemLoopCard.tsx",
                    lineNumber: 209,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/ProblemLoopCard.tsx",
                lineNumber: 201,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/ProblemLoopCard.tsx",
        lineNumber: 71,
        columnNumber: 5
    }, this);
}
}),
"[project]/OneDrive/Desktop/saju-project-temp/frontend/components/MoneyFlowCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MoneyFlowCard",
    ()=>MoneyFlowCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const TYPE_INSIGHT = {
    variable_income: "큰 기회 앞에서 빛나는 구조예요. 번 것을 모으는 시스템을 따로 만들면 자산이 쌓여요.",
    stable_accumulation: "꾸준함이 자산이 되는 구조예요. 가끔은 큰 기회 앞에서 과감해지는 연습도 필요해요.",
    high_opportunity_low_energy: "기회는 충분히 오는 편이에요. 에너지를 먼저 채워야 기회를 제대로 잡을 수 있어요.",
    self_earning: "스스로 벌고 관리하는 능력이 있어요. 레버리지를 활용하면 더 빠르게 늘어날 수 있어요.",
    balanced: "안정적인 흐름의 구조예요. 작은 투자나 부수입을 연결하면 속도가 붙기 시작해요."
};
function MoneyFlowCard({ ruleSummary }) {
    const { steps, leakLabel, typeLabel, type } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const vd = ruleSummary?.visual_data?.money_flow;
        if (vd && Array.isArray(vd.steps)) {
            return {
                steps: vd.steps,
                leakLabel: vd.leakLabel || "큰 변화 없이 유지되는 구조",
                typeLabel: vd.typeLabel || "균형 수입형",
                type: vd.type || "balanced"
            };
        }
        return {
            steps: [
                {
                    label: "일로 수입",
                    sub: "본업 중심",
                    isLeak: false
                },
                {
                    label: "꾸준히 쌓임",
                    sub: "안정적",
                    isLeak: false
                },
                {
                    label: "필요한 곳 씀",
                    sub: "균형 있게",
                    isLeak: false
                },
                {
                    label: "조금씩 늘어남",
                    sub: "천천히",
                    isLeak: false
                }
            ],
            leakLabel: "큰 변화 없이 유지되는 구조",
            typeLabel: "균형 수입형",
            type: "balanced"
        };
    }, [
        ruleSummary
    ]);
    const insight = TYPE_INSIGHT[type] ?? TYPE_INSIGHT.balanced;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            width: "100%",
            background: "#fff",
            borderRadius: 16,
            padding: "20px 16px",
            border: "1px solid #E3D9CB"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 6
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#6B5F4E",
                            letterSpacing: "0.08em"
                        },
                        children: "돈 흐름 구조"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/MoneyFlowCard.tsx",
                        lineNumber: 72,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#8B7355",
                            background: "#F5F1EA",
                            padding: "3px 10px",
                            borderRadius: 99,
                            border: "1px solid #D4C9B8"
                        },
                        children: typeLabel
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/MoneyFlowCard.tsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/MoneyFlowCard.tsx",
                lineNumber: 64,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    fontSize: 11,
                    color: "#8B7355",
                    marginBottom: 14,
                    lineHeight: 1.6
                },
                children: leakLabel
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/MoneyFlowCard.tsx",
                lineNumber: 98,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: 0
                },
                children: steps.map((step, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    padding: "10px 12px",
                                    borderRadius: 10,
                                    background: step.isLeak ? "#FDF4F4" : "#F5F1EA",
                                    border: `1px solid ${step.isLeak ? "#E5C0C0" : "#E3D9CB"}`
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: 30,
                                            height: 30,
                                            borderRadius: "50%",
                                            background: step.isLeak ? "#8B2020" : "#8B7355",
                                            color: "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 11,
                                            fontWeight: 700,
                                            flexShrink: 0
                                        },
                                        children: i + 1
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/MoneyFlowCard.tsx",
                                        lineNumber: 124,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            flex: 1
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    color: step.isLeak ? "#8B2020" : "#2C2417",
                                                    marginBottom: 1
                                                },
                                                children: [
                                                    step.label,
                                                    step.isLeak && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: 9,
                                                            fontWeight: 700,
                                                            color: "#8B2020",
                                                            background: "#FDE8E8",
                                                            padding: "1px 5px",
                                                            borderRadius: 4,
                                                            marginLeft: 6
                                                        },
                                                        children: "누수 포인트"
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/MoneyFlowCard.tsx",
                                                        lineNumber: 152,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/MoneyFlowCard.tsx",
                                                lineNumber: 142,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    fontSize: 11,
                                                    color: "#6B5F4E"
                                                },
                                                children: step.sub
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/MoneyFlowCard.tsx",
                                                lineNumber: 167,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/MoneyFlowCard.tsx",
                                        lineNumber: 141,
                                        columnNumber: 15
                                    }, this),
                                    step.isLeak && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: 15
                                        },
                                        children: "⚠️"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/MoneyFlowCard.tsx",
                                        lineNumber: 169,
                                        columnNumber: 31
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/MoneyFlowCard.tsx",
                                lineNumber: 113,
                                columnNumber: 13
                            }, this),
                            i < steps.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: 1,
                                    height: 8,
                                    background: "#D4C9B8",
                                    margin: "0 auto"
                                }
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/MoneyFlowCard.tsx",
                                lineNumber: 172,
                                columnNumber: 15
                            }, this)
                        ]
                    }, i, true, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/MoneyFlowCard.tsx",
                        lineNumber: 112,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/MoneyFlowCard.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 12,
                    padding: "10px 12px",
                    background: "#F5F1EA",
                    borderRadius: 10,
                    border: "1px solid #D4C9B8"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        fontSize: 11,
                        color: "#5C4A30",
                        lineHeight: 1.65
                    },
                    children: [
                        "💡 ",
                        insight
                    ]
                }, void 0, true, {
                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/MoneyFlowCard.tsx",
                    lineNumber: 195,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/MoneyFlowCard.tsx",
                lineNumber: 186,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/components/MoneyFlowCard.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this);
}
}),
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
 * 로그인 성공 시 백엔드가 URL fragment로 전달한 토큰을 localStorage에 저장하고,
 * API 호출 시 Authorization 헤더로 보냄.
 * ※ sessionStorage는 iOS Safari / 카카오·인스타 인앱 브라우저에서
 *   앱 전환(카카오페이 결제 등) 시 초기화되므로 localStorage 사용.
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
"[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BasicV2ReportPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/@iconify/react/dist/iconify.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$components$2f$PersonalityRadarCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/components/PersonalityRadarCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$components$2f$ProblemLoopCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/components/ProblemLoopCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$components$2f$MoneyFlowCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/components/MoneyFlowCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/saju-project-temp/frontend/lib/auth.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://saju-backend-eqd6.onrender.com";
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
    goldLight: "#A8946A"
};
const LOADING_STEPS = [
    {
        upTo: 12,
        icon: "📅",
        msg: "생년월일·시각을 불러오고 있어요"
    },
    {
        upTo: 25,
        icon: "🔢",
        msg: "만세력으로 사주팔자를 세우는 중이에요"
    },
    {
        upTo: 40,
        icon: "⚖️",
        msg: "일간의 강약과 오행 균형을 분석해요"
    },
    {
        upTo: 55,
        icon: "🌊",
        msg: "대운 흐름과 시기를 읽고 있어요"
    },
    {
        upTo: 70,
        icon: "🧠",
        msg: "성향·패턴·돈 구조를 파악하는 중이에요"
    },
    {
        upTo: 85,
        icon: "✍️",
        msg: "AI가 당신의 언어로 바꾸고 있어요"
    },
    {
        upTo: 95,
        icon: "🔮",
        msg: "마지막 문장을 다듬는 중이에요"
    },
    {
        upTo: 100,
        icon: "✨",
        msg: "거의 완성됐어요\n최대 1분 정도 걸릴 수 있어요 🙏"
    }
];
function getLoadingStep(progress) {
    return LOADING_STEPS.find((s)=>progress < s.upTo) ?? LOADING_STEPS[LOADING_STEPS.length - 1];
}
// ** 마크다운 → HTML 변환 (bold만)
function renderMarkdown(text) {
    if (!text) return "";
    return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br />");
}
// 마크다운 텍스트를 줄 단위로 파싱 → bullet / 일반 단락 구분
function MarkdownBody({ text, style }) {
    if (!text) return null;
    const lines = text.split("\n");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            flexDirection: "column",
            gap: 6,
            ...style
        },
        children: lines.map((line, i)=>{
            const trimmed = line.trim();
            if (!trimmed) return null;
            const isBullet = /^[-•·]\s/.test(trimmed);
            const content = isBullet ? trimmed.replace(/^[-•·]\s/, "") : trimmed;
            const html = content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
            return isBullet ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            color: S.gold,
                            fontSize: 16,
                            lineHeight: 1.6,
                            flexShrink: 0
                        },
                        children: "•"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 66,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: 14,
                            color: S.ink2,
                            lineHeight: 1.8,
                            wordBreak: "keep-all"
                        },
                        dangerouslySetInnerHTML: {
                            __html: html
                        }
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 67,
                        columnNumber: 13
                    }, this)
                ]
            }, i, true, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                lineNumber: 65,
                columnNumber: 11
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    fontSize: 14,
                    color: S.ink2,
                    lineHeight: 1.9,
                    wordBreak: "keep-all",
                    margin: 0
                },
                dangerouslySetInnerHTML: {
                    __html: html
                }
            }, i, false, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                lineNumber: 73,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
        lineNumber: 57,
        columnNumber: 5
    }, this);
}
const HANJA_TO_HANGUL = {
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
function hanjaToHangul(h) {
    return HANJA_TO_HANGUL[h] ?? "";
}
function hanjaToElement(h) {
    const wood = new Set([
        "甲",
        "乙",
        "寅",
        "卯"
    ]);
    const fire = new Set([
        "丙",
        "丁",
        "巳",
        "午"
    ]);
    const earth = new Set([
        "戊",
        "己",
        "辰",
        "戌",
        "丑",
        "未"
    ]);
    const metal = new Set([
        "庚",
        "辛",
        "申",
        "酉"
    ]);
    const water = new Set([
        "壬",
        "癸",
        "子",
        "亥"
    ]);
    if (wood.has(h)) return "wood";
    if (fire.has(h)) return "fire";
    if (earth.has(h)) return "earth";
    if (metal.has(h)) return "metal";
    if (water.has(h)) return "water";
    return "none";
}
const ELEMENT_PALETTE = {
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
        bg: "#FFFFFF",
        border: "#D4C9B8"
    },
    water: {
        text: "#444441",
        bg: "#B4B2A9",
        border: "#5F5E5A"
    },
    none: {
        text: "#2C2417",
        bg: "#EDE7DB",
        border: "#D4C9B8"
    }
};
function stemMeta(stem) {
    const map = {
        甲: {
            el: "wood",
            pol: "yang"
        },
        乙: {
            el: "wood",
            pol: "yin"
        },
        丙: {
            el: "fire",
            pol: "yang"
        },
        丁: {
            el: "fire",
            pol: "yin"
        },
        戊: {
            el: "earth",
            pol: "yang"
        },
        己: {
            el: "earth",
            pol: "yin"
        },
        庚: {
            el: "metal",
            pol: "yang"
        },
        辛: {
            el: "metal",
            pol: "yin"
        },
        壬: {
            el: "water",
            pol: "yang"
        },
        癸: {
            el: "water",
            pol: "yin"
        }
    };
    return map[stem] ?? null;
}
function produces(a, b) {
    return ({
        wood: "fire",
        fire: "earth",
        earth: "metal",
        metal: "water",
        water: "wood"
    })[a] === b;
}
function controls(a, b) {
    return ({
        wood: "earth",
        fire: "metal",
        earth: "water",
        metal: "wood",
        water: "fire"
    })[a] === b;
}
function tenGod(dayStem, target) {
    const dm = stemMeta(dayStem), tm = stemMeta(target);
    if (!dm || !tm) return "";
    const same = dm.pol === tm.pol;
    if (dm.el === tm.el) return same ? "비견" : "겁재";
    if (produces(dm.el, tm.el)) return same ? "식신" : "상관";
    if (produces(tm.el, dm.el)) return same ? "편인" : "정인";
    if (controls(dm.el, tm.el)) return same ? "편재" : "정재";
    if (controls(tm.el, dm.el)) return same ? "편관" : "정관";
    return "";
}
function branchMainStem(branch) {
    return ({
        子: "癸",
        丑: "己",
        寅: "甲",
        卯: "乙",
        辰: "戊",
        巳: "丙",
        午: "丁",
        未: "己",
        申: "庚",
        酉: "辛",
        戌: "戊",
        亥: "壬"
    })[branch] ?? "";
}
// comprehensive 텍스트 → 섹션 파싱 (이모지로 시작하는 줄이 섹션 제목)
function parseV2ComprehensiveSections(text) {
    if (!text) return [];
    const lines = text.split("\n");
    const sections = [];
    let current = null;
    for (const line of lines){
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (/^[🔮🧠💪🔁💰🧭❤️⏰✅💼🤝📝📊✨🌊⚡🎯🌱🌟]/u.test(trimmed)) {
            if (current) sections.push(current);
            current = {
                title: trimmed,
                body: ""
            };
        } else if (current) {
            current.body += (current.body ? "\n" : "") + trimmed;
        }
    }
    if (current) sections.push(current);
    return sections;
}
function getVisualCard(title) {
    if (/🧠/.test(title)) return "personality";
    if (/🔁/.test(title)) return "problem";
    if (/💰/.test(title)) return "money";
    return undefined;
}
// 섹션 제목에서 이모지만 추출
function extractIcon(title) {
    const match = title.match(/^(\S+)\s/);
    return match ? match[1] : "";
}
// 아코디언 한 섹션
function SectionAccordion({ icon, title, body, defaultOpen, visualCard, ruleSummary, ctaLabel, ctaHref, ctaTitle, ctaOnClick }) {
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(defaultOpen);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            background: "#fff",
            borderRadius: 14,
            border: `1px solid ${S.beige}`,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(44,36,23,0.05)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>setOpen((v)=>!v),
                style: {
                    width: "100%",
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left"
                },
                children: [
                    icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: 18
                        },
                        children: icon
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 264,
                        columnNumber: 18
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: 14,
                            fontWeight: 700,
                            color: S.ink,
                            flex: 1
                        },
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 265,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].span, {
                        animate: {
                            rotate: open ? 180 : 0
                        },
                        transition: {
                            duration: 0.2
                        },
                        style: {
                            color: S.ink3,
                            flexShrink: 0
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            width: "12",
                            height: "12",
                            viewBox: "0 0 12 12",
                            fill: "none",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M2 4.5L6 8.5L10 4.5",
                                stroke: "currentColor",
                                strokeWidth: "1.6",
                                strokeLinecap: "round",
                                strokeLinejoin: "round"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 272,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                            lineNumber: 271,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 266,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                lineNumber: 249,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                initial: false,
                children: open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        height: 0,
                        opacity: 0
                    },
                    animate: {
                        height: "auto",
                        opacity: 1
                    },
                    exit: {
                        height: 0,
                        opacity: 0
                    },
                    transition: {
                        duration: 0.22
                    },
                    style: {
                        overflow: open ? "visible" : "hidden"
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: "0 18px 18px",
                            borderTop: `1px solid ${S.cream3}`,
                            paddingTop: 14
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MarkdownBody, {
                                text: body
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 287,
                                columnNumber: 15
                            }, this),
                            visualCard === "personality" && ruleSummary && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 16
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$components$2f$PersonalityRadarCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PersonalityRadarCard"], {
                                    ruleSummary: ruleSummary
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                    lineNumber: 290,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 289,
                                columnNumber: 17
                            }, this),
                            visualCard === "problem" && ruleSummary && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 16
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$components$2f$ProblemLoopCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProblemLoopCard"], {
                                    ruleSummary: ruleSummary
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                    lineNumber: 295,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 294,
                                columnNumber: 17
                            }, this),
                            visualCard === "money" && ruleSummary && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 16
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$components$2f$MoneyFlowCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MoneyFlowCard"], {
                                    ruleSummary: ruleSummary
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                    lineNumber: 300,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 299,
                                columnNumber: 17
                            }, this),
                            ctaLabel && ctaHref && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 20,
                                    background: "#FBF8F3",
                                    border: "1px solid #D4C9B8",
                                    borderRadius: 14,
                                    padding: "16px 18px"
                                },
                                children: [
                                    ctaTitle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: S.ink,
                                            margin: "0 0 12px"
                                        },
                                        children: ctaTitle
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                        lineNumber: 312,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: ctaOnClick ? undefined : ctaHref,
                                        onClick: ctaOnClick ? (e)=>{
                                            e.preventDefault();
                                            ctaOnClick();
                                        } : undefined,
                                        style: {
                                            display: "block",
                                            padding: "12px 0",
                                            borderRadius: 10,
                                            background: S.gold,
                                            color: "#fff",
                                            fontSize: 14,
                                            fontWeight: 700,
                                            textAlign: "center",
                                            textDecoration: "none",
                                            cursor: "pointer"
                                        },
                                        children: ctaLabel
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                        lineNumber: 314,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 304,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 286,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                    lineNumber: 279,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                lineNumber: 277,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
        lineNumber: 240,
        columnNumber: 5
    }, this);
}
// ─── 오행 한국어 매핑 ───
const ELEMENT_KO = {
    wood: "목(木)",
    fire: "화(火)",
    earth: "토(土)",
    metal: "금(金)",
    water: "수(水)"
};
const ELEMENT_COLORS = {
    wood: "#3B6D11",
    fire: "#993C1D",
    earth: "#854F0B",
    metal: "#555",
    water: "#3B5FA0"
};
const ELEMENT_BG = {
    wood: "#C0DD97",
    fire: "#F0997B",
    earth: "#FAC775",
    metal: "#E8E8E8",
    water: "#B4CFE8"
};
function computeOhaengRatio(pillars) {
    const counts = {
        wood: 0,
        fire: 0,
        earth: 0,
        metal: 0,
        water: 0
    };
    const all = [
        pillars.year,
        pillars.month,
        pillars.day,
        pillars.hour
    ].join("");
    for (const ch of all){
        const el = hanjaToElement(ch);
        if (el !== "none") counts[el]++;
    }
    return counts;
}
// ─── 핵심 카드 ───
function HeroCard({ pillarStrings, yongshin, geokguk, sajuId, onSaveImage }) {
    const ratio = computeOhaengRatio(pillarStrings);
    const total = Object.values(ratio).reduce((a, b)=>a + b, 0) || 1;
    const dayPillar = pillarStrings.day;
    const dayHanja = dayPillar.slice(0, 2);
    const dayHangul = dayHanja.split("").map(hanjaToHangul).join("");
    const handleKakaoShare = ()=>{
        const url = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : "";
        if (("TURBOPACK compile-time value", "undefined") !== "undefined" && window.Kakao?.isInitialized?.()) //TURBOPACK unreachable
        ;
        else if (navigator.share) {
            navigator.share({
                title: "내 사주 핵심 카드",
                url
            }).catch(()=>{});
        } else {
            navigator.clipboard?.writeText(url).then(()=>alert("링크가 복사됐어요!")).catch(()=>{});
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            background: "linear-gradient(135deg, #2C2417 0%, #4A3F30 100%)",
            borderRadius: 20,
            padding: "22px 20px 18px",
            marginBottom: 16,
            boxShadow: "0 4px 20px rgba(44,36,23,0.25)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    gap: 8,
                    marginBottom: 14,
                    flexWrap: "wrap"
                },
                children: [
                    {
                        label: "일주",
                        value: `${dayHanja}(${dayHangul})`
                    },
                    {
                        label: "용신",
                        value: yongshin
                    },
                    {
                        label: "격국",
                        value: geokguk
                    }
                ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: "rgba(255,255,255,0.12)",
                            borderRadius: 8,
                            padding: "6px 12px",
                            display: "flex",
                            alignItems: "center",
                            gap: 6
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: 10,
                                    color: "#C4B8A4",
                                    fontWeight: 600
                                },
                                children: item.label
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 421,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: 13,
                                    color: "#F5F1EA",
                                    fontWeight: 700
                                },
                                children: item.value
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 422,
                                columnNumber: 13
                            }, this)
                        ]
                    }, item.label, true, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 417,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                lineNumber: 411,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: 14
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontSize: 11,
                            color: "#A8946A",
                            marginBottom: 8,
                            letterSpacing: "0.05em"
                        },
                        children: "오행 비율"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 429,
                        columnNumber: 9
                    }, this),
                    [
                        "wood",
                        "fire",
                        "earth",
                        "metal",
                        "water"
                    ].map((el)=>{
                        const pct = Math.round(ratio[el] / total * 100);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 5
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: 11,
                                        color: "#C4B8A4",
                                        width: 42,
                                        flexShrink: 0
                                    },
                                    children: ELEMENT_KO[el].split("(")[0]
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                    lineNumber: 434,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        flex: 1,
                                        height: 8,
                                        background: "rgba(255,255,255,0.1)",
                                        borderRadius: 99,
                                        overflow: "hidden"
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            width: 0
                                        },
                                        animate: {
                                            width: `${pct}%`
                                        },
                                        transition: {
                                            duration: 0.8,
                                            ease: "easeOut"
                                        },
                                        style: {
                                            height: "100%",
                                            background: ELEMENT_BG[el],
                                            borderRadius: 99
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                        lineNumber: 436,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                    lineNumber: 435,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: 11,
                                        color: "#F5F1EA",
                                        width: 28,
                                        textAlign: "right",
                                        flexShrink: 0
                                    },
                                    children: [
                                        pct,
                                        "%"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                    lineNumber: 443,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, el, true, {
                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                            lineNumber: 433,
                            columnNumber: 13
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                lineNumber: 428,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    gap: 8
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: onSaveImage,
                        style: {
                            flex: 1,
                            padding: "10px 0",
                            borderRadius: 8,
                            background: "rgba(255,255,255,0.15)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            color: "#F5F1EA",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer"
                        },
                        children: "📸 이미지 저장"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 451,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: handleKakaoShare,
                        style: {
                            flex: 1,
                            padding: "10px 0",
                            borderRadius: 8,
                            background: "#FEE500",
                            border: "none",
                            color: "#3C1E1E",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer"
                        },
                        children: "💬 카카오 공유"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 462,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                lineNumber: 450,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
        lineNumber: 403,
        columnNumber: 5
    }, this);
}
// ─── 대운 미리보기 ───
// currentDaeun: 백엔드에서 계산한 현재 대운 문자열 (예: "28세 甲子(갑자)")
// 프론트에서 연도·나이 계산 금지 — 규칙 엔진이 내려주는 값 그대로 사용
function DaeunPreview({ currentDaeun, sajuId, isGuest, router }) {
    const m = currentDaeun.match(/^(\d+)세\s+([^(]+)\(([^)]+)\)/);
    if (!m) return null;
    const currentEntry = {
        startAge: parseInt(m[1], 10),
        ganji: m[2].trim(),
        hangul: m[3].trim()
    };
    const endAge = currentEntry.startAge + 9;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            background: "#fff",
            borderRadius: 14,
            border: `1px solid ${S.beige}`,
            padding: "16px 18px",
            marginBottom: 16,
            boxShadow: "0 2px 8px rgba(44,36,23,0.05)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: 13,
                            fontWeight: 700,
                            color: S.ink
                        },
                        children: "🌊 현재 대운"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 499,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: 11,
                            color: S.ink3
                        },
                        children: [
                            currentEntry.startAge,
                            "세 ~ ",
                            endAge,
                            "세"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 500,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                lineNumber: 498,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 12
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: `linear-gradient(135deg, ${S.ink} 0%, ${S.ink2} 100%)`,
                            borderRadius: 12,
                            padding: "10px 16px",
                            textAlign: "center"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 20,
                                    fontWeight: 700,
                                    color: "#F5F1EA",
                                    letterSpacing: 2
                                },
                                children: currentEntry.ganji
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 507,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 11,
                                    color: "#C4B8A4",
                                    marginTop: 2
                                },
                                children: currentEntry.hangul
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 508,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 503,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 13,
                                    color: S.ink2,
                                    lineHeight: 1.6,
                                    margin: 0
                                },
                                children: [
                                    "현재 ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: [
                                            currentEntry.ganji,
                                            "(",
                                            currentEntry.hangul,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                        lineNumber: 512,
                                        columnNumber: 16
                                    }, this),
                                    " 대운 흐름 속에 있어요."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 511,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 12,
                                    color: S.ink3,
                                    margin: "4px 0 0"
                                },
                                children: [
                                    currentEntry.startAge,
                                    "세부터 ",
                                    endAge,
                                    "세까지 이어져요"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 514,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 510,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                lineNumber: 502,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>isGuest ? router.push("/start?redirect=deep") : router.push(`/report/deep/intro?saju_id=${sajuId}`),
                style: {
                    marginTop: 12,
                    width: "100%",
                    padding: "10px 0",
                    borderRadius: 8,
                    background: S.cream2,
                    border: `1px solid ${S.beige}`,
                    color: S.ink,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4
                },
                children: isGuest ? "로그인하고 전체 대운 흐름 보기 →" : "전체 대운 흐름 보기 →"
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                lineNumber: 519,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
        lineNumber: 493,
        columnNumber: 5
    }, this);
}
// ─── 상품 목록 그리드 ───
function ProductGrid({ sajuId, router, isGuest }) {
    const products = [
        {
            icon: "💰",
            label: "재물운 리포트",
            sub: "2,900원",
            key: "money"
        },
        {
            icon: "❤️",
            label: "연애운 리포트",
            sub: "2,900원",
            key: "love"
        },
        {
            icon: "🧭",
            label: "직업운 리포트",
            sub: "2,900원",
            key: "career"
        },
        {
            icon: "🔮",
            label: "심화 리포트",
            sub: "4,900원",
            key: "deep"
        },
        {
            icon: "💬",
            label: "AI 채팅",
            sub: "무료 3회 제공",
            key: "chat"
        },
        {
            icon: "💑",
            label: "궁합 분석",
            sub: "2,900원",
            key: "couple"
        }
    ];
    function handleClick(key) {
        if (isGuest) {
            const redirectMap = {
                money: "/report/money/intro",
                love: "/report/love/intro",
                career: "/report/career/intro",
                deep: "/report/deep/intro",
                chat: "/chat",
                couple: "/report/couple/intro"
            };
            localStorage.setItem("purchase_redirect", redirectMap[key] || "/home");
            router.push("/start");
            return;
        }
        const hrefMap = {
            money: `/report/money/intro?saju_id=${sajuId}`,
            love: `/report/love/intro?saju_id=${sajuId}`,
            career: `/report/career/intro?saju_id=${sajuId}`,
            deep: `/report/deep/intro?saju_id=${sajuId}`,
            chat: `/chat?saju_id=${sajuId}`,
            couple: `/report/couple/intro?saju_id=${sajuId}`
        };
        router.push(hrefMap[key] || "/home");
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            marginTop: 24,
            marginBottom: 8
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    fontSize: 13,
                    fontWeight: 700,
                    color: S.ink,
                    marginBottom: 12
                },
                children: "📦 더 깊이 알아보기"
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                lineNumber: 580,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8
                },
                children: products.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>handleClick(p.key),
                        style: {
                            padding: "14px 12px",
                            borderRadius: 12,
                            background: "#fff",
                            border: `1px solid ${S.beige}`,
                            textAlign: "left",
                            cursor: "pointer",
                            boxShadow: "0 1px 4px rgba(44,36,23,0.06)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 20,
                                    marginBottom: 4
                                },
                                children: p.icon
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 594,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: S.ink,
                                    marginBottom: 2
                                },
                                children: p.label
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 595,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 11,
                                    color: S.gold
                                },
                                children: p.sub
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 596,
                                columnNumber: 13
                            }, this)
                        ]
                    }, p.label, true, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 583,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                lineNumber: 581,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
        lineNumber: 579,
        columnNumber: 5
    }, this);
}
function BasicV2ReportContent() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const sajuId = searchParams.get("saju_id") || "";
    const shareToken = searchParams.get("share_token") || "";
    const isSharedView = !!shareToken && !sajuId;
    const isGuest = searchParams.get("guest") === "true";
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [sajuInfo, setSajuInfo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [v2Result, setV2Result] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [pillarStrings, setPillarStrings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [basicInfoOpen, setBasicInfoOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [sajuTableOpen, setSajuTableOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [fakeProgress, setFakeProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [fullRawData, setFullRawData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [freeChatRemaining, setFreeChatRemaining] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const cardRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const progressIntervalRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [stuckAt95, setStuckAt95] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const stuckTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const loadFnRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const loadingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(true);
    // 로딩 progress
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!loading) {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current);
            setFakeProgress(100);
            setStuckAt95(false);
            return;
        }
        setFakeProgress(0);
        setStuckAt95(false);
        progressIntervalRef.current = setInterval(()=>{
            setFakeProgress((prev)=>{
                if (prev >= 95) {
                    // 95% 도달 시 10초 후 "오래 걸리고 있어요" 메시지 표시
                    if (!stuckTimerRef.current) {
                        stuckTimerRef.current = setTimeout(()=>setStuckAt95(true), 10000);
                    }
                    return prev;
                }
                const inc = prev < 30 ? 3 : prev < 60 ? 1.8 : prev < 80 ? 1 : 0.4;
                return Math.min(95, prev + inc);
            });
        }, 150);
        return ()=>{
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            if (stuckTimerRef.current) {
                clearTimeout(stuckTimerRef.current);
                stuckTimerRef.current = null;
            }
        };
    }, [
        loading
    ]);
    // 데이터 로드 및 v2 분석
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isGuest) {
            const loadGuestData = async ()=>{
                loadingRef.current = true;
                setLoading(true);
                setError(null);
                try {
                    const rawResult = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : null;
                    const rawInput = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : null;
                    if ("TURBOPACK compile-time truthy", 1) throw new Error("게스트 사주 데이터를 찾을 수 없어요.\n다시 입력해 주세요.");
                    const fullData = JSON.parse(rawResult);
                    const inputData = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : {};
                    setSajuInfo(inputData);
                    setResult(fullData);
                    setFullRawData(fullData);
                    const raw = fullData;
                    const yearPillar = raw.year_pillar || `${fullData.year?.cheongan?.hanja || ""}${fullData.year?.jiji?.hanja || ""}`;
                    const monthPillar = raw.month_pillar || `${fullData.month?.cheongan?.hanja || ""}${fullData.month?.jiji?.hanja || ""}`;
                    const dayPillar = raw.day_pillar || `${fullData.day?.cheongan?.hanja || ""}${fullData.day?.jiji?.hanja || ""}`;
                    const hourPillar = raw.hour_pillar || `${fullData.hour?.cheongan?.hanja || ""}${fullData.hour?.jiji?.hanja || ""}`;
                    setPillarStrings({
                        hour: hourPillar,
                        day: dayPillar,
                        month: monthPillar,
                        year: yearPillar
                    });
                    const genderCode = inputData.gender === "남자" ? "M" : "F";
                    const solarBirthYear = typeof raw.solar_datetime_used === "string" ? parseInt(raw.solar_datetime_used.slice(0, 4), 10) : undefined;
                    const v2Res = await fetch(`${API_BASE}/saju/analyze-guest`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            year_pillar: yearPillar,
                            month_pillar: monthPillar,
                            day_pillar: dayPillar,
                            hour_pillar: hourPillar,
                            gender: genderCode,
                            birthdate: inputData.birthdate,
                            solar_birth_year: solarBirthYear,
                            daeun_list: Array.isArray(raw.daeun_list) ? raw.daeun_list : [],
                            daeun_direction: typeof raw.daeun_direction === "string" ? raw.daeun_direction : "순행",
                            current_daeun: typeof raw.current_daeun === "string" ? raw.current_daeun : null,
                            ten_gods: raw.ten_gods && typeof raw.ten_gods === "object" ? raw.ten_gods : {},
                            strength: raw.strength !== undefined ? raw.strength : {},
                            harmony_clash: raw.harmony_clash && typeof raw.harmony_clash === "object" ? raw.harmony_clash : {},
                            sinsal: raw.sinsal && typeof raw.sinsal === "object" ? raw.sinsal : {},
                            twelve_states: raw.twelve_states && typeof raw.twelve_states === "object" ? raw.twelve_states : {},
                            tone: "empathy"
                        })
                    });
                    if (!v2Res.ok) {
                        const errBody = await v2Res.json().catch(()=>({}));
                        if (v2Res.status === 429) throw new Error(errBody.detail || "하루 무료 분석 3회를 모두 사용했어요.");
                        throw new Error("AI 분석에 실패했습니다.");
                    }
                    const v2Data = await v2Res.json();
                    setV2Result(v2Data);
                } catch (err) {
                    setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
                } finally{
                    loadingRef.current = false;
                    setLoading(false);
                }
            };
            loadFnRef.current = loadGuestData;
            loadGuestData();
            return;
        }
        if (!sajuId && !shareToken) {
            setError("사주 ID가 필요합니다.");
            setLoading(false);
            return;
        }
        const loadAndAnalyze = async ()=>{
            loadingRef.current = true;
            setLoading(true);
            setError(null);
            try {
                // 공유 토큰으로 접근하는 경우 (인증 불필요)
                let resolvedSajuId = sajuId;
                let sajuData;
                if (isSharedView) {
                    const sharedRes = await fetch(`${API_BASE}/api/saju/shared/${shareToken}`);
                    if (!sharedRes.ok) throw new Error("유효하지 않은 공유 링크입니다.");
                    sajuData = await sharedRes.json();
                    resolvedSajuId = String(sajuData.id);
                } else {
                    const res = await fetch(`${API_BASE}/api/saju/${sajuId}`, {
                        credentials: "include",
                        headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAuthHeaders"])()
                    });
                    if (!res.ok) throw new Error("사주 데이터를 불러올 수 없습니다.");
                    sajuData = await res.json();
                }
                setSajuInfo(sajuData);
                const [y, m, d] = (sajuData.birthdate || "").split("-").map(Number);
                const timePart = (sajuData.birth_time || "").trim();
                let hour = 12, minute = 0;
                if (timePart && /^\d{1,2}:\d{1,2}$/.test(timePart)) {
                    const [h, mi] = timePart.split(":").map(Number);
                    hour = h;
                    minute = mi ?? 0;
                }
                const calendar = sajuData.calendar_type === "음력" ? "lunar" : "solar";
                const gender = sajuData.gender === "남자" ? "M" : "F";
                const fullRes = await fetch(`${API_BASE}/saju/full`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        calendar_type: calendar,
                        year: y,
                        month: m,
                        day: d,
                        hour,
                        minute,
                        gender
                    })
                });
                if (!fullRes.ok) throw new Error("사주 계산에 실패했습니다.");
                const fullData = await fullRes.json();
                setResult(fullData);
                setFullRawData(fullData);
                const raw = fullData;
                const yearPillar = raw.year_pillar || `${fullData.year?.cheongan?.hanja || ""}${fullData.year?.jiji?.hanja || ""}`;
                const monthPillar = raw.month_pillar || `${fullData.month?.cheongan?.hanja || ""}${fullData.month?.jiji?.hanja || ""}`;
                const dayPillar = raw.day_pillar || `${fullData.day?.cheongan?.hanja || ""}${fullData.day?.jiji?.hanja || ""}`;
                const hourPillar = raw.hour_pillar || `${fullData.hour?.cheongan?.hanja || ""}${fullData.hour?.jiji?.hanja || ""}`;
                setPillarStrings({
                    hour: hourPillar,
                    day: dayPillar,
                    month: monthPillar,
                    year: yearPillar
                });
                // 공유 뷰: analyze-v2 호출 없이 캐시에서 직접 가져옴
                if (isSharedView) {
                    const cacheKey = `v2_${resolvedSajuId}`;
                    const [mainRes, cvRes, sectRes] = await Promise.all([
                        fetch(`${API_BASE}/saju/report-cache?cache_key=${cacheKey}&section_key=v2_comprehensive`),
                        fetch(`${API_BASE}/saju/report-cache?cache_key=${cacheKey}&section_key=v2_core_values`),
                        fetch(`${API_BASE}/saju/report-cache?cache_key=${cacheKey}&section_key=v2_sections`)
                    ]);
                    const [mainData, cvData, sectData] = await Promise.all([
                        mainRes.json(),
                        cvRes.json(),
                        sectRes.json()
                    ]);
                    if (!mainData.found) throw new Error("리포트가 아직 생성되지 않았어요.\n공유한 사람이 먼저 리포트를 열람한 뒤 공유해 주세요.");
                    let sections = {};
                    if (sectData.found && sectData.content) {
                        try {
                            sections = JSON.parse(sectData.content);
                        } catch  {}
                    }
                    setV2Result({
                        comprehensive: mainData.content || "",
                        core_values: cvData.content || "",
                        section_personality: sections.section_personality || "",
                        section_strength: sections.section_strength || "",
                        section_problem: sections.section_problem || "",
                        section_money: sections.section_money || "",
                        section_career: sections.section_career || "",
                        section_relationship: sections.section_relationship || "",
                        section_current: sections.section_current || "",
                        rule_summary: {}
                    });
                    return;
                }
                const v2Res = await fetch(`${API_BASE}/saju/analyze-v2`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAuthHeaders"])()
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        year_pillar: yearPillar,
                        month_pillar: monthPillar,
                        day_pillar: dayPillar,
                        hour_pillar: hourPillar,
                        gender,
                        birthdate: sajuData.birthdate,
                        daeun_list: Array.isArray(raw.daeun_list) ? raw.daeun_list : [],
                        daeun_direction: typeof raw.daeun_direction === "string" ? raw.daeun_direction : "순행",
                        current_daeun: typeof raw.current_daeun === "string" ? raw.current_daeun : null,
                        ten_gods: raw.ten_gods && typeof raw.ten_gods === "object" ? raw.ten_gods : {},
                        strength: raw.strength !== undefined ? raw.strength : {},
                        harmony_clash: raw.harmony_clash && typeof raw.harmony_clash === "object" ? raw.harmony_clash : {},
                        sinsal: raw.sinsal && typeof raw.sinsal === "object" ? raw.sinsal : {},
                        twelve_states: raw.twelve_states && typeof raw.twelve_states === "object" ? raw.twelve_states : {},
                        tone: "empathy",
                        cache_key: `v2_${sajuId}`
                    })
                });
                if (!v2Res.ok) throw new Error("AI 분석에 실패했습니다.");
                const v2Data = await v2Res.json();
                setV2Result(v2Data);
            } catch (err) {
                // 네트워크 오류 + 백그라운드 상태 → 조용히 대기 (복귀 시 자동 재시도)
                const isNetworkError = err instanceof TypeError || err instanceof Error && /network|fetch|load/i.test(err.message);
                if (isNetworkError && document.hidden) {
                    // 백그라운드로 이동하는 바람에 실패 → 복귀 시 visibilitychange가 재시도함
                    return;
                }
                setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
            } finally{
                loadingRef.current = false;
                setLoading(false);
            }
        };
        loadFnRef.current = loadAndAnalyze;
        loadAndAnalyze();
    }, [
        sajuId,
        shareToken,
        isGuest
    ]);
    // 백그라운드 복귀 시 자동 재시도
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const onVisible = ()=>{
            if (!document.hidden && loadingRef.current && loadFnRef.current) {
                loadFnRef.current();
            }
        };
        document.addEventListener("visibilitychange", onVisible);
        return ()=>document.removeEventListener("visibilitychange", onVisible);
    }, []);
    // 무료 채팅 남은 횟수 조회
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetch(`${API_BASE}/api/payment/status`, {
            credentials: "include",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAuthHeaders"])()
        }).then((r)=>r.json()).then((d)=>{
            const limit = d.chat_limit ?? 3;
            const used = d.daily_chat_count ?? 0;
            setFreeChatRemaining(Math.max(0, limit - used));
        }).catch(()=>setFreeChatRemaining(3));
    }, []);
    const birthYmd = sajuInfo?.birthdate?.replace(/-/g, "");
    const birthHm = sajuInfo?.birth_time?.replace(":", "") || "1200";
    const gender = sajuInfo?.gender === "남자" ? "M" : "F";
    const calendar = sajuInfo?.calendar_type === "음력" ? "lunar" : "solar";
    const timeUnknown = !sajuInfo?.birth_time;
    const handleShare = async ()=>{
        if (isSharedView || isGuest) return;
        try {
            const res = await fetch(`${API_BASE}/api/saju/${sajuId}/share`, {
                method: "POST",
                credentials: "include",
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAuthHeaders"])()
            });
            if (!res.ok) throw new Error("share_failed");
            const { share_token } = await res.json();
            const origin = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : "";
            const shareUrl = `${origin}/report/basic/v2?share_token=${share_token}`;
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: "사주 기본 분석 리포트",
                        url: shareUrl
                    });
                    return;
                } catch  {}
            }
            await navigator.clipboard.writeText(shareUrl).catch(()=>{});
            alert("공유 링크가 복사됐어요!\n누구나 열람할 수 있어요.");
        } catch  {
            alert("공유 링크 생성에 실패했어요. 다시 시도해 주세요.");
        }
    };
    const handleSaveImage = async ()=>{
        if (!cardRef.current) return;
        try {
            const html2canvas = (await __turbopack_context__.A("[project]/OneDrive/Desktop/saju-project-temp/frontend/node_modules/html2canvas/dist/html2canvas.esm.js [app-ssr] (ecmascript, async loader)")).default;
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: null,
                scale: 2
            });
            const link = document.createElement("a");
            link.download = "saju-core-card.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch  {
            alert("이미지 저장에 실패했어요. 다시 시도해 주세요.");
        }
    };
    // 용신/격국 계산
    const yongshinLabel = (()=>{
        const elements = fullRawData?.yongshin?.final_yongshin ?? [];
        const KO = {
            wood: "목",
            fire: "화",
            earth: "토",
            metal: "금",
            water: "수"
        };
        return elements.map((e)=>KO[e] ?? e).join("·") || "분석 중";
    })();
    const geokgukLabel = (()=>{
        const tg = fullRawData?.ten_gods;
        const mb = tg?.month_branch ?? "";
        return mb ? `${mb}격` : "분석 중";
    })();
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                maxWidth: 480,
                margin: "0 auto",
                padding: "40px 20px",
                textAlign: "center",
                background: S.cream,
                minHeight: "100vh"
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        fontSize: 48,
                        marginBottom: 16
                    },
                    children: "⚠️"
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                    lineNumber: 940,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        fontSize: 16,
                        color: S.ink,
                        marginBottom: 20
                    },
                    children: error
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                    lineNumber: 941,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>router.push("/saju-list"),
                    style: {
                        padding: "12px 24px",
                        background: S.gold,
                        color: "#fff",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer"
                    },
                    children: "사주 목록으로"
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                    lineNumber: 942,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
            lineNumber: 939,
            columnNumber: 7
        }, this);
    }
    const loadingStep = getLoadingStep(fakeProgress);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            maxWidth: 520,
            margin: "0 auto",
            background: S.cream,
            minHeight: "100vh",
            fontFamily: "'Gmarket Sans', sans-serif"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                style: {
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    borderBottom: `1px solid ${S.beige}`,
                    background: "#fff"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>router.back(),
                        style: {
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 4
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
                            icon: "mdi:chevron-left",
                            width: 24,
                            color: S.ink
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                            lineNumber: 959,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 958,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        style: {
                            fontSize: 20,
                            fontWeight: 700,
                            color: S.ink,
                            flex: 1
                        },
                        children: "✨ 기본 분석 리포트"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 961,
                        columnNumber: 9
                    }, this),
                    isSharedView && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: 11,
                            color: S.gold,
                            border: `1px solid ${S.gold}`,
                            borderRadius: 6,
                            padding: "2px 8px",
                            flexShrink: 0
                        },
                        children: "공유됨"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 963,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                lineNumber: 957,
                columnNumber: 7
            }, this),
            loading ? /* ── 로딩 UI ── */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "calc(100vh - 57px)",
                    padding: "0 32px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            scale: 0.6,
                            opacity: 0
                        },
                        animate: {
                            scale: 1,
                            opacity: 1
                        },
                        exit: {
                            scale: 0.6,
                            opacity: 0
                        },
                        transition: {
                            duration: 0.35
                        },
                        style: {
                            fontSize: 52,
                            marginBottom: 28,
                            lineHeight: 1
                        },
                        children: loadingStep.icon
                    }, loadingStep.icon, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 971,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                        mode: "wait",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].p, {
                            initial: {
                                y: 8,
                                opacity: 0
                            },
                            animate: {
                                y: 0,
                                opacity: 1
                            },
                            exit: {
                                y: -8,
                                opacity: 0
                            },
                            transition: {
                                duration: 0.3
                            },
                            style: {
                                fontSize: 15,
                                fontWeight: 700,
                                color: S.ink2,
                                textAlign: "center",
                                marginBottom: 8,
                                lineHeight: 1.6
                            },
                            children: loadingStep.msg
                        }, loadingStep.msg, false, {
                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                            lineNumber: 984,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 983,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontSize: 12,
                            color: S.ink3,
                            marginBottom: stuckAt95 ? 12 : 32,
                            textAlign: "center"
                        },
                        children: "AI가 사주 데이터를 바탕으로 분석하고 있어요"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 996,
                        columnNumber: 11
                    }, this),
                    stuckAt95 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontSize: 12,
                            color: S.gold,
                            marginBottom: 32,
                            textAlign: "center",
                            lineHeight: 1.7,
                            padding: "10px 16px",
                            background: "#FBF8F3",
                            borderRadius: 10,
                            border: `1px solid ${S.beige}`
                        },
                        children: [
                            "생각보다 오래 걸리고 있어요.",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 1001,
                                columnNumber: 31
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "앱을 닫지 말고 잠시만 기다려 주세요."
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 1002,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 1002,
                                columnNumber: 53
                            }, this),
                            "최대 1분 안에 완성돼요 🔮"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 1000,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            width: "100%",
                            maxWidth: 300
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    height: 6,
                                    background: S.cream3,
                                    borderRadius: 99,
                                    overflow: "hidden",
                                    marginBottom: 8
                                },
                                children: fakeProgress < 95 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                    style: {
                                        height: "100%",
                                        background: `linear-gradient(90deg, ${S.gold}, ${S.goldLight})`,
                                        borderRadius: 99
                                    },
                                    animate: {
                                        width: `${fakeProgress}%`
                                    },
                                    transition: {
                                        duration: 0.4,
                                        ease: "easeOut"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                    lineNumber: 1011,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        position: "relative",
                                        height: "100%",
                                        width: "95%",
                                        background: `linear-gradient(90deg, ${S.gold}, ${S.goldLight})`,
                                        borderRadius: 99
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                        style: {
                                            position: "absolute",
                                            top: 0,
                                            height: "100%",
                                            width: "40%",
                                            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)"
                                        },
                                        animate: {
                                            x: [
                                                "-100%",
                                                "200%"
                                            ]
                                        },
                                        transition: {
                                            duration: 1.0,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                        lineNumber: 1018,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                    lineNumber: 1017,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 1009,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    justifyContent: "space-between"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: 11,
                                            color: S.ink3
                                        },
                                        children: "분석 중"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                        lineNumber: 1027,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: S.gold
                                        },
                                        children: [
                                            Math.floor(fakeProgress),
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                        lineNumber: 1028,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 1026,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 1008,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            gap: 6,
                            marginTop: 28
                        },
                        children: LOADING_STEPS.slice(0, -1).map((step, i)=>{
                            const stepPct = (i + 1) / (LOADING_STEPS.length - 1) * 95;
                            const active = fakeProgress >= stepPct - 5;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                animate: {
                                    background: active ? S.gold : S.beige,
                                    scale: active ? 1.2 : 1
                                },
                                transition: {
                                    duration: 0.3
                                },
                                style: {
                                    width: 7,
                                    height: 7,
                                    borderRadius: 99
                                }
                            }, i, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 1038,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 1033,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                lineNumber: 969,
                columnNumber: 9
            }, this) : /* ── 결과 UI ── */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: "16px 14px"
                },
                children: [
                    v2Result && pillarStrings && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: cardRef,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(HeroCard, {
                            pillarStrings: pillarStrings,
                            yongshin: yongshinLabel,
                            geokguk: geokgukLabel,
                            sajuId: sajuId,
                            onSaveImage: handleSaveImage
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                            lineNumber: 1054,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 1053,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            border: `1px solid ${S.beige}`,
                            borderRadius: 12,
                            overflow: "hidden",
                            background: "#fff",
                            marginBottom: 10,
                            boxShadow: "0 1px 4px rgba(44,36,23,0.05)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setBasicInfoOpen((v)=>!v),
                                style: {
                                    width: "100%",
                                    padding: "12px 16px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: S.ink
                                        },
                                        children: "기본 정보"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                        lineNumber: 1071,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].span, {
                                        animate: {
                                            rotate: basicInfoOpen ? 180 : 0
                                        },
                                        transition: {
                                            duration: 0.15
                                        },
                                        style: {
                                            color: S.ink3
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            width: "11",
                                            height: "11",
                                            viewBox: "0 0 12 12",
                                            fill: "none",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M2 4.5L6 8.5L10 4.5",
                                                stroke: "currentColor",
                                                strokeWidth: "1.6",
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round"
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                lineNumber: 1073,
                                                columnNumber: 77
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                            lineNumber: 1073,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                        lineNumber: 1072,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 1066,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                initial: false,
                                children: basicInfoOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        height: 0,
                                        opacity: 0
                                    },
                                    animate: {
                                        height: "auto",
                                        opacity: 1
                                    },
                                    exit: {
                                        height: 0,
                                        opacity: 0
                                    },
                                    transition: {
                                        duration: 0.18
                                    },
                                    style: {
                                        overflow: "hidden"
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: "12px 16px 14px",
                                            borderTop: `1px solid ${S.cream3}`
                                        },
                                        children: [
                                            {
                                                label: "생년월일",
                                                value: birthYmd ? `${birthYmd.slice(0, 4)}.${birthYmd.slice(4, 6)}.${birthYmd.slice(6, 8)}` : "—"
                                            },
                                            {
                                                label: "시각",
                                                value: timeUnknown ? "미상" : ("TURBOPACK compile-time truthy", 1) ? `${birthHm.slice(0, 2)}:${birthHm.slice(2, 4)}` : "TURBOPACK unreachable"
                                            },
                                            {
                                                label: "성별",
                                                value: gender === "M" ? "남자" : "여자"
                                            },
                                            {
                                                label: "달력",
                                                value: calendar === "solar" ? "양력" : "음력"
                                            }
                                        ].map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    paddingBottom: 8,
                                                    marginBottom: 8,
                                                    borderBottom: `1px solid ${S.cream3}`
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: 12,
                                                            color: S.ink3
                                                        },
                                                        children: row.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                        lineNumber: 1087,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: 13,
                                                            fontWeight: 600,
                                                            color: S.ink
                                                        },
                                                        children: row.value
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                        lineNumber: 1088,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, row.label, true, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                lineNumber: 1086,
                                                columnNumber: 23
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                        lineNumber: 1079,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                    lineNumber: 1078,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 1076,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 1065,
                        columnNumber: 11
                    }, this),
                    pillarStrings && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            border: `1px solid ${S.beige}`,
                            borderRadius: 12,
                            overflow: "hidden",
                            background: "#fff",
                            marginBottom: 20,
                            boxShadow: "0 1px 4px rgba(44,36,23,0.05)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setSajuTableOpen((v)=>!v),
                                style: {
                                    width: "100%",
                                    padding: "12px 16px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: S.ink
                                        },
                                        children: "내 사주팔자"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                        lineNumber: 1105,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].span, {
                                        animate: {
                                            rotate: sajuTableOpen ? 180 : 0
                                        },
                                        transition: {
                                            duration: 0.15
                                        },
                                        style: {
                                            color: S.ink3
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            width: "11",
                                            height: "11",
                                            viewBox: "0 0 12 12",
                                            fill: "none",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M2 4.5L6 8.5L10 4.5",
                                                stroke: "currentColor",
                                                strokeWidth: "1.6",
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round"
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                lineNumber: 1107,
                                                columnNumber: 79
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                            lineNumber: 1107,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                        lineNumber: 1106,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 1100,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                initial: false,
                                children: sajuTableOpen && (()=>{
                                    const blocks = [
                                        {
                                            label: "시주",
                                            val: pillarStrings.hour
                                        },
                                        {
                                            label: "일주",
                                            val: pillarStrings.day
                                        },
                                        {
                                            label: "월주",
                                            val: pillarStrings.month
                                        },
                                        {
                                            label: "년주",
                                            val: pillarStrings.year
                                        }
                                    ].filter((b)=>b.val && b.val.length >= 2);
                                    const dayStem = pillarStrings.day[0] ?? "";
                                    const tdBase = {
                                        fontSize: 11,
                                        color: S.ink2,
                                        textAlign: "center",
                                        border: `1px solid ${S.beige}`,
                                        padding: "6px 4px"
                                    };
                                    const thBase = {
                                        background: S.cream2,
                                        border: `1px solid ${S.beige}`,
                                        padding: "7px 4px",
                                        textAlign: "center",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: S.ink
                                    };
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            height: 0,
                                            opacity: 0
                                        },
                                        animate: {
                                            height: "auto",
                                            opacity: 1
                                        },
                                        exit: {
                                            height: 0,
                                            opacity: 0
                                        },
                                        transition: {
                                            duration: 0.18
                                        },
                                        style: {
                                            overflow: "hidden"
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                padding: "12px 12px 14px",
                                                borderTop: `1px solid ${S.cream3}`,
                                                overflowX: "auto"
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                                style: {
                                                    width: "100%",
                                                    borderCollapse: "collapse",
                                                    fontSize: 12,
                                                    tableLayout: "fixed"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    style: {
                                                                        ...thBase,
                                                                        width: 64
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                                    lineNumber: 1127,
                                                                    columnNumber: 31
                                                                }, this),
                                                                blocks.map((b)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                        style: thBase,
                                                                        children: b.label
                                                                    }, b.label, false, {
                                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                                        lineNumber: 1128,
                                                                        columnNumber: 48
                                                                    }, this))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                            lineNumber: 1126,
                                                            columnNumber: 29
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                        lineNumber: 1125,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        style: tdBase,
                                                                        children: "십성"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                                        lineNumber: 1134,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    blocks.map((b)=>{
                                                                        const stem = b.val[0] ?? "";
                                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                            style: {
                                                                                ...tdBase,
                                                                                fontWeight: 600,
                                                                                fontSize: 12
                                                                            },
                                                                            children: tenGod(dayStem, stem)
                                                                        }, b.label, false, {
                                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                                            lineNumber: 1137,
                                                                            columnNumber: 40
                                                                        }, this);
                                                                    })
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                                lineNumber: 1133,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        style: tdBase,
                                                                        children: "천간"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                                        lineNumber: 1142,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    blocks.map((b)=>{
                                                                        const stem = b.val[0] ?? "";
                                                                        const col = ELEMENT_PALETTE[hanjaToElement(stem)] ?? ELEMENT_PALETTE.none;
                                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                            style: {
                                                                                padding: 4,
                                                                                verticalAlign: "middle",
                                                                                border: `1px solid ${S.beige}`
                                                                            },
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                style: {
                                                                                    padding: "10px 6px",
                                                                                    borderRadius: 8,
                                                                                    textAlign: "center",
                                                                                    background: col.bg,
                                                                                    color: col.text,
                                                                                    fontWeight: 700,
                                                                                    border: `1px solid ${col.border}`
                                                                                },
                                                                                children: [
                                                                                    stem,
                                                                                    hanjaToHangul(stem)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                                                lineNumber: 1148,
                                                                                columnNumber: 37
                                                                            }, this)
                                                                        }, b.label, false, {
                                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                                            lineNumber: 1147,
                                                                            columnNumber: 35
                                                                        }, this);
                                                                    })
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                                lineNumber: 1141,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        style: tdBase,
                                                                        children: "지지"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                                        lineNumber: 1157,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    blocks.map((b)=>{
                                                                        const branch = b.val[1] ?? "";
                                                                        const col = ELEMENT_PALETTE[hanjaToElement(branch)] ?? ELEMENT_PALETTE.none;
                                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                            style: {
                                                                                padding: 4,
                                                                                verticalAlign: "middle",
                                                                                border: `1px solid ${S.beige}`
                                                                            },
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                style: {
                                                                                    padding: "10px 6px",
                                                                                    borderRadius: 8,
                                                                                    textAlign: "center",
                                                                                    background: col.bg,
                                                                                    color: col.text,
                                                                                    fontWeight: 700,
                                                                                    border: `1px solid ${col.border}`
                                                                                },
                                                                                children: [
                                                                                    branch,
                                                                                    hanjaToHangul(branch)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                                                lineNumber: 1163,
                                                                                columnNumber: 37
                                                                            }, this)
                                                                        }, b.label, false, {
                                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                                            lineNumber: 1162,
                                                                            columnNumber: 35
                                                                        }, this);
                                                                    })
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                                lineNumber: 1156,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        style: tdBase,
                                                                        children: "십성(지지)"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                                        lineNumber: 1172,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    blocks.map((b)=>{
                                                                        const ms = branchMainStem(b.val[1] ?? "");
                                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                            style: {
                                                                                ...tdBase,
                                                                                fontWeight: 600,
                                                                                fontSize: 12
                                                                            },
                                                                            children: ms ? tenGod(dayStem, ms) : ""
                                                                        }, b.label, false, {
                                                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                                            lineNumber: 1175,
                                                                            columnNumber: 40
                                                                        }, this);
                                                                    })
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                                lineNumber: 1171,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                        lineNumber: 1131,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                                lineNumber: 1124,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                            lineNumber: 1123,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                        lineNumber: 1122,
                                        columnNumber: 21
                                    }, this);
                                })()
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 1110,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 1099,
                        columnNumber: 13
                    }, this),
                    v2Result?.gyeok?.gyeok_name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: "#fff",
                            borderRadius: 14,
                            padding: "16px 18px",
                            marginBottom: 16,
                            border: `1px solid ${S.beige}`,
                            boxShadow: "0 1px 4px rgba(44,36,23,0.05)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    marginBottom: 10
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: 18
                                        },
                                        children: "🏛️"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                        lineNumber: 1192,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: S.ink
                                        },
                                        children: "나의 格 (타고난 틀)"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                        lineNumber: 1193,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            marginLeft: "auto",
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color: "#fff",
                                            background: S.gold,
                                            padding: "2px 9px",
                                            borderRadius: 20
                                        },
                                        children: v2Result.gyeok.gyeok_name
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                        lineNumber: 1194,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 1191,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 13,
                                    color: S.ink2,
                                    lineHeight: 1.8,
                                    margin: "0 0 8px",
                                    wordBreak: "keep-all"
                                },
                                children: v2Result.gyeok.desc
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 1198,
                                columnNumber: 15
                            }, this),
                            v2Result.gyeok.good && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 12,
                                    color: "#4B7A4B",
                                    background: "#F0FDF4",
                                    borderRadius: 8,
                                    padding: "7px 10px",
                                    margin: 0
                                },
                                children: [
                                    "✓ ",
                                    v2Result.gyeok.good
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 1202,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 1190,
                        columnNumber: 13
                    }, this),
                    fullRawData?.current_daeun && !isSharedView && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(DaeunPreview, {
                        currentDaeun: fullRawData.current_daeun,
                        sajuId: sajuId,
                        isGuest: isGuest,
                        router: router
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 1211,
                        columnNumber: 13
                    }, this),
                    v2Result && (()=>{
                        const sections = parseV2ComprehensiveSections(v2Result.comprehensive);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                flexDirection: "column",
                                gap: 10
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        fontSize: 11,
                                        color: S.ink3,
                                        textAlign: "center",
                                        marginBottom: 4,
                                        letterSpacing: "0.05em"
                                    },
                                    children: "AI 분석 결과 · 섹션을 탭해서 펼쳐보세요"
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                    lineNumber: 1224,
                                    columnNumber: 17
                                }, this),
                                sections.map((sec, idx)=>{
                                    const icon = extractIcon(sec.title);
                                    const titleText = icon ? sec.title.replace(icon, "").trim() : sec.title;
                                    const isMoney = /💰/.test(sec.title);
                                    const isLove = /❤️/.test(sec.title);
                                    const isCareer = /🧭/.test(sec.title);
                                    const ctaConfig = (()=>{
                                        if (isMoney) return {
                                            title: "💰 재물운을 더 깊이 보고 싶다면",
                                            label: "재물 특화 리포트 보기 — 2,900원",
                                            href: isGuest ? undefined : `/report/money/intro?saju_id=${sajuId}`,
                                            guestRedirect: isGuest ? "/report/money/intro" : undefined
                                        };
                                        if (isLove) return {
                                            title: "❤️ 연애·결혼 운도 궁금하다면",
                                            label: "연애 특화 리포트 보기 — 2,900원",
                                            href: isGuest ? undefined : `/report/love/intro?saju_id=${sajuId}`,
                                            guestRedirect: isGuest ? "/report/love/intro" : undefined
                                        };
                                        if (isCareer) return {
                                            title: "💼 직업·커리어 방향도 알고 싶다면",
                                            label: "직업 특화 리포트 보기 — 2,900원",
                                            href: isGuest ? undefined : `/report/career/intro?saju_id=${sajuId}`,
                                            guestRedirect: isGuest ? "/report/career/intro" : undefined
                                        };
                                        return null;
                                    })();
                                    const showCTA = ctaConfig && !isSharedView;
                                    const guestCtaClick = showCTA && ctaConfig.guestRedirect ? ()=>{
                                        localStorage.setItem("purchase_redirect", ctaConfig.guestRedirect);
                                        router.push("/start");
                                    } : undefined;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionAccordion, {
                                        icon: icon,
                                        title: titleText,
                                        body: sec.body,
                                        defaultOpen: idx < 2,
                                        visualCard: getVisualCard(sec.title),
                                        ruleSummary: v2Result.rule_summary,
                                        ctaTitle: showCTA ? ctaConfig.title : undefined,
                                        ctaLabel: showCTA ? ctaConfig.label : undefined,
                                        ctaHref: showCTA ? ctaConfig.href : undefined,
                                        ctaOnClick: guestCtaClick
                                    }, sec.title, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                        lineNumber: 1262,
                                        columnNumber: 21
                                    }, this);
                                })
                            ]
                        }, void 0, true, {
                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                            lineNumber: 1223,
                            columnNumber: 15
                        }, this);
                    })(),
                    v2Result && !isGuest && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 24,
                            marginBottom: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 10
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    gap: 10
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: handleShare,
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            padding: '10px 20px',
                                            borderRadius: 10,
                                            border: `1.5px solid ${S.beige}`,
                                            background: '#fff',
                                            color: S.ink2,
                                            fontSize: 13,
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        },
                                        children: "📤 공유하기"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                        lineNumber: 1285,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            padding: '10px 20px',
                                            borderRadius: 10,
                                            border: '1.5px solid #bbf7d0',
                                            background: '#f0fdf4',
                                            color: '#166534',
                                            fontSize: 13,
                                            fontWeight: 600
                                        },
                                        children: "✅ 저장됨"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                        lineNumber: 1297,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 1284,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 11,
                                    color: S.gold,
                                    textAlign: 'center'
                                },
                                children: "리포트는 자동 저장돼요. 언제든 다시 열람 가능해요."
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 1306,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 1283,
                        columnNumber: 13
                    }, this),
                    v2Result && !isSharedView && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 20,
                            background: "#FBF8F3",
                            border: "1px solid #D4C9B8",
                            borderRadius: 14,
                            padding: "16px 18px"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: S.ink,
                                    margin: "0 0 6px"
                                },
                                children: "AI에게 직접 물어보세요"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 1321,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 13,
                                    color: S.ink3,
                                    lineHeight: 1.7,
                                    margin: "0 0 14px"
                                },
                                children: "궁금한 게 생기면 AI 사주 상담이 답해줘요. 무료 3회 제공."
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 1322,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: `/chat${!isGuest && sajuId ? `?saju_id=${sajuId}` : ""}`,
                                style: {
                                    display: "block",
                                    padding: "12px 0",
                                    borderRadius: 10,
                                    background: S.gold,
                                    color: "#fff",
                                    fontSize: 14,
                                    fontWeight: 700,
                                    textAlign: "center",
                                    textDecoration: "none"
                                },
                                children: "AI 상담 시작하기"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                                lineNumber: 1325,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 1314,
                        columnNumber: 13
                    }, this),
                    v2Result && !isSharedView && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ProductGrid, {
                        sajuId: sajuId,
                        router: router,
                        isGuest: isGuest
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 1346,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            height: 80
                        }
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                        lineNumber: 1349,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                lineNumber: 1050,
                columnNumber: 9
            }, this),
            !loading && v2Result && !isSharedView && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: "fixed",
                    bottom: 24,
                    right: 16,
                    zIndex: 100
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: ()=>router.push(isGuest ? "/start?redirect=chat" : `/chat?saju_id=${sajuId}`),
                    style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "12px 18px",
                        borderRadius: 99,
                        background: "linear-gradient(135deg, #2C2417 0%, #4A3F30 100%)",
                        border: "none",
                        color: "#F5F1EA",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 20px rgba(44,36,23,0.4)"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontSize: 18
                            },
                            children: "💬"
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                            lineNumber: 1370,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "AI에게 바로 질문하기"
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                            lineNumber: 1371,
                            columnNumber: 13
                        }, this),
                        freeChatRemaining !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                background: freeChatRemaining > 0 ? "#A8946A" : "#888",
                                color: "#fff",
                                fontSize: 10,
                                fontWeight: 700,
                                borderRadius: 99,
                                padding: "2px 7px",
                                minWidth: 20,
                                textAlign: "center"
                            },
                            children: freeChatRemaining > 0 ? `${freeChatRemaining}회 무료` : "소진"
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                            lineNumber: 1373,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                    lineNumber: 1358,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
                lineNumber: 1355,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
        lineNumber: 955,
        columnNumber: 5
    }, this);
}
function BasicV2ReportPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Suspense"], {
        fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                padding: 40,
                textAlign: "center"
            },
            children: "로딩 중..."
        }, void 0, false, {
            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
            lineNumber: 1390,
            columnNumber: 25
        }, void 0),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$saju$2d$project$2d$temp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BasicV2ReportContent, {}, void 0, false, {
            fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
            lineNumber: 1391,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/OneDrive/Desktop/saju-project-temp/frontend/app/report/basic/v2/page.tsx",
        lineNumber: 1390,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=OneDrive_Desktop_saju-project-temp_frontend_3bdef5c6._.js.map