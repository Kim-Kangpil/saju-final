module.exports=[66672,a=>{"use strict";var b=a.i(82134),c=a.i(70419),d=a.i(79856),e=a.i(63050),f=a.i(10539),g=a.i(82706),h=a.i(73316),i=a.i(80869),j=a.i(94197);let k="#F5F1EA",l="#EDE7DB",m="#E3D9CB",n="#D4C9B8",o="#C4B8A4",p="#2C2417",q="#6B5F4E",r="#8B7355",s="'Gmarket Sans'",t={wood:{text:"#27500A",bg:"#C0DD97",border:"#3B6D11"},fire:{text:"#712B13",bg:"#F0997B",border:"#993C1D"},earth:{text:"#633806",bg:"#FAC775",border:"#854F0B"},metal:{text:"#444441",bg:"#B4B2A9",border:"#5F5E5A"},water:{text:"#0C447C",bg:"#85B7EB",border:"#185FA5"}},u=["갑자","을축","병인","정묘","무진","기사","경오","신미","임신","계유","갑술","을해","병자","정축","무인","기묘","경진","신사","임오","계미","갑신","을유","병술","정해","무자","기축","경인","신묘","임진","계사","갑오","을미","병신","정유","무술","기해","경자","신축","임인","계묘","갑진","을사","병오","정미","무신","기유","경술","신해","임자","계축","갑인","을묘","병진","정사","무오","기미","경신","신유","임술","계해"],v=[{q:"나는 언제쯤 이직하면 좋을까?",a:"현재 경금 대운에서 편관이 강하게 작용 중이에요. 내년 을사년에 식신이 들어오는 시점이 변화에 유리합니다."},{q:"올해 재물운 어때?",a:"월지 편재가 세운과 삼합을 이루는 하반기가 재물 유입에 유리해요. 다만 겁재 충을 주의하세요."},{q:"나랑 맞는 사람 유형이 있어?",a:"일간 갑목 기준으로 기토 정재와 합이 잘 맞아요. 안정적이고 현실적인 분과 잘 어울립니다."}];function w(a){let[b,d]=(0,c.useState)(0),e=(0,c.useRef)(null),f=(0,c.useRef)(!1);return(0,c.useEffect)(()=>{let b=new IntersectionObserver(([b])=>{if(b.isIntersecting&&!f.current){f.current=!0;let b=performance.now(),c=e=>{let f=Math.min((e-b)/1400,1);d(Math.floor((1-Math.pow(1-f,3))*a)),f<1&&requestAnimationFrame(c)};requestAnimationFrame(c)}},{threshold:.4});return e.current&&b.observe(e.current),()=>b.disconnect()},[a]),{count:b,ref:e}}function x({params:a}){let x,y,z,A;(0,c.use)(a??Promise.resolve({}));let B=(0,d.useRouter)(),{isLoggedIn:C}=(0,h.useAuthStatus)(),[D,E]=(0,c.useState)([]),[F,G]=(0,c.useState)(0),[H,I]=(0,c.useState)(0),[J,K]=(0,c.useState)(0),L=(0,c.useRef)(null),{lang:M,setLang:N,t:O}=(0,f.useLang)(),P="ko"===M?i.default:j.default,[Q,R]=(0,c.useState)(!1),[S,T]=(0,c.useState)(null);(0,c.useEffect)(()=>{C&&(async()=>{try{let a=await fetch("http://localhost:8000/api/beta/features",{credentials:"include",headers:{Accept:"application/json",...(0,g.getAuthHeaders)()}}),b=await a.json();b.features&&T(b.features)}catch(a){}})()},[C]);let{count:U,ref:V}=w((0,c.useRef)(128).current),{count:W,ref:X}=w(2847);function Y(){if(!C)return void B.push("/start");let a=(0,e.getSavedSajuList)();B.push(a?.length>0?"/saju-list":"/saju-add")}return(0,c.useEffect)(()=>{E([...u].sort(()=>Math.random()-.5).slice(0,6))},[]),(0,c.useEffect)(()=>{let a=setInterval(()=>{E([...u].sort(()=>Math.random()-.5).slice(0,6)),G(a=>a+1)},3200);return()=>clearInterval(a)},[]),(0,c.useEffect)(()=>{let a=setInterval(()=>{I(a=>(a+1)%v.length)},5800);return()=>clearInterval(a)},[]),(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("style",{children:`
        :root {
          --cream:  ${k};
          --cream2: ${l};
          --cream3: ${m};
          --beige:  ${n};
          --beige2: ${o};
          --ink:    ${p};
          --ink2:   #4A3F30;
          --ink3:   ${q};
          --gold:   ${r};
          --goldL:  #A8946A;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }

        body {
          font-family: ${s};
          background: var(--cream) url('/images/texture_paper_6.png');
          background-repeat: repeat;
          background-size: auto;
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        .serif { font-family: ${s}; }

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
          font-family: ${s};
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
          font-family: ${s};
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
          font-family: ${s};
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
          font-family: ${s};
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
          font-family: ${s};
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
          font-family: ${s};
          font-size: clamp(1.35rem, 4.5vw, 1.65rem);
          font-weight: 900;
          color: var(--cream);
          line-height: 1.4;
          margin-bottom: 10px;
        }

        .problem-sub {
          font-family: ${s};
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
          font-family: ${s};
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
          font-family: ${s};
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
          font-family: ${s};
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
          font-family: ${s};
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
          font-family: ${s};
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
          font-family: ${s};
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
          font-family: ${s};
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

        /* ── 리포트 카드 ── */
        /* ── 리포트 안내 ── */
        .report-list {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* 무료 카드 */
        .report-card-free {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border: 1.5px solid #86efac;
          border-radius: 16px;
          padding: 16px;
        }
        .report-card-free-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .report-card-free-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .report-card-free-icon {
          width: 40px; height: 40px;
          background: #fff;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .report-card-free-name {
          font-size: 15px; font-weight: 800; color: #166534;
        }
        .report-card-free-sub {
          font-size: 11px; color: #166534; opacity: 0.7; margin-top: 1px;
        }
        .report-card-free-badge {
          background: #16a34a; color: #fff;
          font-size: 12px; font-weight: 800;
          padding: 5px 12px; border-radius: 999px;
        }
        .report-card-free-items {
          display: flex; flex-wrap: wrap; gap: 6px;
        }
        .report-card-free-item {
          background: rgba(255,255,255,0.7);
          border: 1px solid #86efac;
          border-radius: 999px;
          font-size: 11px; color: #166534; font-weight: 600;
          padding: 4px 10px;
        }

        /* 유료 카드 가로 스크롤 */
        .report-paid-scroll {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .report-paid-scroll::-webkit-scrollbar { display: none; }

        .report-card-paid {
          flex: 0 0 160px;
          background: #fff;
          border: 1px solid var(--beige);
          border-radius: 14px;
          padding: 14px 12px;
          position: relative;
          overflow: hidden;
        }
        .report-card-paid::before {
          content: "";
          position: absolute; top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--accent-color, #8B7355);
          border-radius: 14px 14px 0 0;
        }
        .report-card-paid-icon {
          font-size: 24px; margin-bottom: 6px; display: block;
        }
        .report-card-paid-name {
          font-size: 13px; font-weight: 700; color: var(--ink);
          margin-bottom: 4px;
        }
        .report-card-paid-price {
          font-size: 13px; font-weight: 800; color: var(--gold);
          margin-bottom: 10px;
        }
        .report-card-paid-items {
          display: flex; flex-direction: column; gap: 3px;
        }
        .report-card-paid-item {
          font-size: 10px; color: var(--ink3); line-height: 1.5;
        }

        .report-scroll-hint {
          font-size: 11px; color: var(--ink3);
          text-align: right; margin-top: 4px;
        }

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
          font-family: ${s};
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
          font-family: ${s};
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
          font-family: ${s};
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
          font-family: ${s};
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
          font-family: ${s};
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
          font-family: ${s};
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
      `}),(0,b.jsxs)("header",{className:"hd",children:[(0,b.jsxs)("div",{className:"hd-logo",children:[(0,b.jsx)("div",{className:"hd-logo-mark",children:(0,b.jsx)("img",{src:"/images/yin-yang-logo.png",alt:"태극",style:{width:"100%",height:"100%",objectFit:"cover"},onError:a=>{a.currentTarget.style.display="none",a.currentTarget.parentElement.textContent="☯"}})}),(0,b.jsx)("span",{className:"hd-logo-text",children:"한양사주"})]}),(0,b.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:6,position:"relative"},children:[S&&(0,b.jsx)("div",{style:{display:"flex",alignItems:"center",gap:4,padding:"4px 8px",borderRadius:999,background:S.is_admin?"linear-gradient(135deg, #f59e0b, #d97706)":"linear-gradient(135deg, #10b981, #059669)",border:S.is_admin?"1px solid #d97706":"1px solid #047857",boxShadow:S.is_admin?"0 2px 8px rgba(245, 158, 11, 0.3)":"0 2px 8px rgba(16, 185, 129, 0.3)"},children:(0,b.jsx)("span",{style:{fontSize:10,fontWeight:700,color:"white",letterSpacing:"0.05em"},children:S.is_admin?"👑 관리자":"🎉 베타 테스터"})}),(0,b.jsxs)("div",{style:{position:"relative"},children:[(0,b.jsx)("button",{type:"button",onClick:()=>R(a=>!a),style:{padding:"4px 9px",borderRadius:999,border:`1px solid ${o}`,background:"rgba(255,255,255,0.7)",fontFamily:s,fontSize:10,fontWeight:700,color:q,letterSpacing:"0.08em"},children:"ko"===M?"언어 ▾":"Language ▾"}),Q&&(0,b.jsxs)("div",{style:{position:"absolute",right:0,marginTop:4,minWidth:90,borderRadius:8,border:`1px solid ${o}`,background:"rgba(255,255,255,0.98)",boxShadow:"0 6px 18px rgba(0,0,0,0.12)",padding:4,zIndex:40},children:[(0,b.jsx)("button",{type:"button",onClick:()=>{N("ko"),R(!1)},style:{width:"100%",textAlign:"left",padding:"6px 8px",borderRadius:6,border:"none",background:"ko"===M?"rgba(0,0,0,0.05)":"transparent",fontFamily:s,fontSize:12,color:p,cursor:"pointer"},children:"한국어"}),(0,b.jsx)("button",{type:"button",onClick:()=>{N("en"),R(!1)},style:{width:"100%",textAlign:"left",padding:"6px 8px",borderRadius:6,border:"none",background:"en"===M?"rgba(0,0,0,0.05)":"transparent",fontFamily:s,fontSize:12,color:p,cursor:"pointer"},children:"English"})]})]}),C?(0,b.jsx)("button",{className:"hd-btn-fill",onClick:()=>B.push("/chat"),children:"채팅 시작"}):(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("button",{className:"hd-btn",onClick:()=>B.push("/start"),children:"로그인"}),(0,b.jsx)("button",{className:"hd-btn-fill",onClick:()=>B.push("/start"),children:"무료 시작"})]})]})]}),(0,b.jsxs)("div",{className:"pc-layout",style:{display:"block"},children:[(0,b.jsx)("div",{className:"pc-sidebar",style:{display:"none"},children:(0,b.jsxs)("div",{className:"pc-sticky-cta",children:[(0,b.jsx)("p",{className:"serif",style:{fontSize:15,fontWeight:700,color:p,lineHeight:1.5,whiteSpace:"pre-line"},children:O("cta.title")}),(0,b.jsx)("button",{className:"btn-primary",onClick:Y,children:O("cta.primary")}),(0,b.jsx)("button",{className:"btn-secondary",onClick:()=>B.push("/chat"),children:O("cta.secondary")})]})}),(0,b.jsxs)("div",{className:"pc-main",children:[(0,b.jsxs)("section",{className:"hero",children:[(0,b.jsxs)("div",{className:"hero-eyebrow",children:[(0,b.jsx)("span",{className:"hero-dot"}),O("hero.badge")]}),(0,b.jsx)("div",{className:"hero-logo",children:(0,b.jsx)("img",{src:"/images/yin-yang-logo.png",alt:"한양사주",onError:a=>{a.currentTarget.style.display="none",a.currentTarget.parentElement.textContent="☯"}})}),(0,b.jsx)("h1",{className:"hero-title reveal",style:{whiteSpace:"pre-line"},children:O("hero.title")}),(0,b.jsx)("p",{className:"hero-desc reveal",style:{whiteSpace:"pre-line"},children:O("hero.sub")}),(0,b.jsxs)("div",{className:"hero-btns reveal",children:[(0,b.jsx)("button",{className:"btn-primary",onClick:Y,children:O("hero.cta_primary")}),(0,b.jsx)("button",{className:"btn-secondary",onClick:()=>B.push("/chat"),children:O("hero.cta_secondary")})]}),(0,b.jsxs)("div",{ref:V,className:"counter-row reveal",children:[(0,b.jsx)("div",{className:"counter-dot"}),(0,b.jsx)("span",{style:{fontSize:12,color:q,fontWeight:500},children:O("hero.counter",{count:U.toLocaleString()})})]})]}),(0,b.jsx)("section",{style:{padding:"20px",textAlign:"center"},children:(0,b.jsxs)("div",{style:{background:"linear-gradient(135deg, #e8f5e8 0%, #d4e8d4 100%)",borderRadius:16,padding:24,maxWidth:400,margin:"0 auto",border:"2px solid #2d5a2d",boxShadow:"0 4px 12px rgba(45, 90, 45, 0.1)"},children:[(0,b.jsx)("div",{style:{fontSize:14,fontWeight:700,color:"#2d5a2d",marginBottom:8},children:"베타 테스터 모집"}),(0,b.jsx)("h3",{style:{fontSize:18,fontWeight:700,color:"#2d5a2d",marginBottom:8},children:"채팅 + 기본 리포트 무제한!"}),(0,b.jsxs)("p",{style:{fontSize:13,color:"#2d5a2d",marginBottom:16,lineHeight:1.5},children:["베타 테스터가 되어",(0,b.jsx)("br",{}),"AI 채팅과 기본 리포트를 무제한으로 이용하세요"]}),(0,b.jsx)("button",{onClick:()=>B.push("/saju-mypage"),style:{background:"#2d5a2d",color:"white",border:"none",padding:"12px 24px",borderRadius:8,fontSize:14,fontWeight:700,cursor:"pointer",transition:"all 0.2s"},onMouseOver:a=>a.currentTarget.style.transform="scale(1.05)",onMouseOut:a=>a.currentTarget.style.transform="scale(1)",children:"쿠폰 받기"})]})}),(0,b.jsxs)("section",{className:"problem-sec",children:[(0,b.jsx)("div",{className:"problem-label",children:O("problem.eyebrow")}),(0,b.jsx)("h2",{className:"problem-main",style:{whiteSpace:"pre-line"},children:O("problem.title")}),(0,b.jsx)("h3",{className:"problem-sub",style:{whiteSpace:"pre-line"},children:O("problem.title_gold")}),(0,b.jsx)("div",{className:"problem-divider"}),(0,b.jsx)("p",{className:"problem-desc",style:{whiteSpace:"pre-line"},children:O("problem.body")})]}),(0,b.jsxs)("section",{className:"compare-sec",style:{textAlign:"center"},children:[(0,b.jsx)("div",{className:"badge",children:O("compare.badge")}),(0,b.jsx)("h2",{className:"compare-title",style:{whiteSpace:"pre-line"},children:O("compare.title")}),(0,b.jsxs)("div",{className:"compare-row",children:[(0,b.jsxs)("div",{className:"compare-card compare-left",children:[(0,b.jsx)("div",{className:"compare-label",children:O("compare.left_label")}),(0,b.jsxs)("div",{className:"compare-chip-col",children:[(0,b.jsx)("div",{className:"compare-chip",children:"ChatGPT"}),(0,b.jsx)("div",{className:"compare-chip",children:"Claude"}),(0,b.jsx)("div",{className:"compare-chip",children:"Gemini"})]}),(0,b.jsx)("p",{className:"compare-note",children:O("compare.left_note")})]}),(0,b.jsx)("div",{className:"compare-arrow",children:"→"}),(0,b.jsxs)("div",{className:"compare-card compare-right",children:[(0,b.jsx)("div",{className:"compare-label compare-label-right",children:O("compare.right_label")}),(0,b.jsx)("div",{className:"compare-logo-wrap",children:(0,b.jsx)("div",{className:"compare-logo",children:(0,b.jsx)("img",{src:"/images/yin-yang-logo.png",alt:"한양사주",onError:a=>{a.currentTarget.style.display="none",a.currentTarget.parentElement.textContent="☯"}})})}),(0,b.jsx)("div",{className:"compare-service-name",children:O("compare.right_name")}),(0,b.jsx)("p",{className:"compare-right-note",children:O("compare.right_note")})]})]}),(0,b.jsxs)("div",{className:"engine-card",children:[(0,b.jsxs)("div",{className:"engine-row",children:[(0,b.jsx)("span",{children:O("compare.engine_a")}),(0,b.jsx)("span",{className:"engine-x",children:"×"}),(0,b.jsx)("span",{children:O("compare.engine_b")})]}),(0,b.jsx)("p",{className:"engine-sub",children:O("compare.engine_sub")})]})]}),(0,b.jsxs)("section",{className:"sec",style:{textAlign:"center"},children:[(0,b.jsx)("div",{className:"badge badge-gold",style:{marginLeft:"auto",marginRight:"auto"},children:O("chat_preview.badge")}),(0,b.jsx)("h2",{className:"sec-title",style:{whiteSpace:"pre-line"},children:O("chat_preview.title")}),(0,b.jsx)("p",{className:"sec-sub",style:{marginBottom:18,whiteSpace:"pre-line"},children:O("chat_preview.sub")}),(0,b.jsxs)("div",{className:"chat-preview",children:[(0,b.jsxs)("div",{className:"chat-preview-hd",children:[(0,b.jsx)("div",{className:"chat-preview-avatar",children:(0,b.jsx)("img",{src:"/images/yin-yang-logo.png",alt:"",onError:a=>{a.currentTarget.style.display="none",a.currentTarget.parentElement.textContent="☯"}})}),(0,b.jsx)("span",{className:"chat-preview-name",children:O("chat_preview.ai_name")}),(0,b.jsx)("span",{style:{fontSize:10,color:q,marginLeft:"auto"},children:O("chat_preview.ai_status")})]}),(0,b.jsx)("div",{className:"chat-preview-body",children:(y=(x=P.chat_preview.bubbles)[H]||x[0],(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("div",{className:"chat-bubble-user",children:y.q}),(0,b.jsx)("div",{className:"chat-bubble-ai",children:y.a})]}))},H),(0,b.jsx)("div",{style:{padding:"10px 14px",borderTop:`1px solid ${m}`},children:(0,b.jsx)("button",{onClick:()=>B.push("/chat"),style:{width:"100%",padding:"10px",borderRadius:8,border:`1px solid ${n}`,background:k,font:"inherit",fontSize:13,color:q,cursor:"pointer",fontFamily:s},children:O("chat_preview.cta")})})]})]}),(0,b.jsxs)("section",{className:"sec",style:{textAlign:"center"},children:[(0,b.jsx)("div",{className:"badge",children:O("manseryeok.badge")}),(0,b.jsx)("h2",{className:"sec-title",style:{whiteSpace:"pre-line"},children:O("manseryeok.title")}),(0,b.jsx)("p",{className:"sec-sub",style:{marginBottom:4,whiteSpace:"pre-line"},children:O("manseryeok.sub")}),(0,b.jsx)("div",{className:"manseryeok-preview",style:{marginTop:16},children:(0,b.jsxs)("table",{className:"msr-table",children:[(0,b.jsx)("thead",{children:(0,b.jsxs)("tr",{children:[(0,b.jsx)("th",{style:{width:80}}),P.manseryeok.headers.map(a=>(0,b.jsx)("th",{children:a},a))]})}),(0,b.jsxs)("tbody",{children:[(0,b.jsxs)("tr",{className:"msr-row-label",children:[(0,b.jsx)("td",{style:{fontSize:11,color:q,textAlign:"center"},children:"십성(천간)"}),P.manseryeok.sipsung_top.map((a,c)=>(0,b.jsx)("td",{children:a},c))]}),(0,b.jsxs)("tr",{children:[(0,b.jsx)("td",{style:{fontSize:11,color:q,textAlign:"center"},children:"천간"}),[{char:"계癸",el:"water"},{char:"기己",el:"earth"},{char:"갑甲",el:"wood"},{char:"을乙",el:"wood"}].map((a,c)=>{let d=t[a.el];return(0,b.jsx)("td",{style:{padding:4,verticalAlign:"middle"},children:(0,b.jsx)("div",{className:"msr-pillar-box",style:{background:d.bg,color:d.text,border:`1px solid ${d.border}`},children:a.char})},c)})]}),(0,b.jsxs)("tr",{children:[(0,b.jsx)("td",{style:{fontSize:11,color:q,textAlign:"center"},children:"지지"}),[{char:"유酉",el:"metal"},{char:"미未",el:"earth"},{char:"신申",el:"metal"},{char:"사巳",el:"fire"}].map((a,c)=>{let d=t[a.el];return(0,b.jsx)("td",{style:{padding:4,verticalAlign:"middle"},children:(0,b.jsx)("div",{className:"msr-pillar-box",style:{background:d.bg,color:d.text,border:`1px solid ${d.border}`},children:a.char})},c)})]}),(0,b.jsxs)("tr",{className:"msr-row-label",children:[(0,b.jsx)("td",{style:{fontSize:11,color:q,textAlign:"center"},children:"십성(지지)"}),P.manseryeok.sipsung_bot.map((a,c)=>(0,b.jsx)("td",{children:a},c))]}),(0,b.jsxs)("tr",{children:[(0,b.jsx)("td",{style:{fontSize:11,color:q,textAlign:"center"},children:"지장간"}),(0,b.jsxs)("td",{style:{fontSize:10,padding:6,textAlign:"center",lineHeight:1.5,color:q},children:[(0,b.jsx)("div",{children:"경금 (상관)"}),(0,b.jsx)("div",{children:"신금 (식신)"})]}),(0,b.jsxs)("td",{style:{fontSize:10,padding:6,textAlign:"center",lineHeight:1.5,color:q},children:[(0,b.jsx)("div",{children:"정화 (편인)"}),(0,b.jsx)("div",{children:"을목 (편관)"}),(0,b.jsx)("div",{children:"기토 (비견)"})]}),(0,b.jsxs)("td",{style:{fontSize:10,padding:6,textAlign:"center",lineHeight:1.5,color:q},children:[(0,b.jsx)("div",{children:"무토 (겁재)"}),(0,b.jsx)("div",{children:"임수 (정재)"}),(0,b.jsx)("div",{children:"경금 (상관)"})]}),(0,b.jsxs)("td",{style:{fontSize:10,padding:6,textAlign:"center",lineHeight:1.5,color:q},children:[(0,b.jsx)("div",{children:"무토 (겁재)"}),(0,b.jsx)("div",{children:"경금 (상관)"}),(0,b.jsx)("div",{children:"병화 (정인)"})]})]}),(0,b.jsxs)("tr",{className:"msr-row-label",children:[(0,b.jsx)("td",{style:{fontSize:11,color:q,textAlign:"center"},children:"십이운성"}),P.manseryeok.twelve.map((a,c)=>(0,b.jsx)("td",{children:a},c))]})]})]})}),(0,b.jsx)("p",{style:{fontSize:11,color:q,marginTop:10,textAlign:"center"},children:O("manseryeok.note")})]}),(0,b.jsxs)("section",{className:"sec",style:{textAlign:"center"},children:[(0,b.jsx)("div",{className:"badge",children:O("features.badge")}),(0,b.jsx)("h2",{className:"sec-title",style:{whiteSpace:"pre-line"},children:O("features.title")}),(0,b.jsxs)("div",{className:"report-list",children:[(z=P.features.reports[0],(0,b.jsxs)("div",{className:"report-card-free",children:[(0,b.jsxs)("div",{className:"report-card-free-top",children:[(0,b.jsxs)("div",{className:"report-card-free-left",children:[(0,b.jsx)("div",{className:"report-card-free-icon",children:z.icon}),(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{className:"report-card-free-name",children:z.title}),(0,b.jsx)("div",{className:"report-card-free-sub",children:"로그인 없이 바로 확인"})]})]}),(0,b.jsx)("div",{className:"report-card-free-badge",children:z.price})]}),(0,b.jsx)("div",{className:"report-card-free-items",children:z.items.map((a,c)=>(0,b.jsx)("span",{className:"report-card-free-item",children:a},c))})]})),(A=["#6366f1","#f43f5e","#f59e0b"],(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("div",{className:"report-paid-scroll",children:P.features.reports.slice(1).map((a,c)=>(0,b.jsxs)("div",{className:"report-card-paid",style:{"--accent-color":A[c]},children:[(0,b.jsx)("span",{className:"report-card-paid-icon",children:a.icon}),(0,b.jsx)("div",{className:"report-card-paid-name",children:a.title}),(0,b.jsx)("div",{className:"report-card-paid-price",children:a.price}),(0,b.jsx)("div",{className:"report-card-paid-items",children:a.items.map((a,c)=>(0,b.jsx)("div",{className:"report-card-paid-item",children:a},c))})]},c))}),(0,b.jsx)("p",{className:"report-scroll-hint",children:"← 옆으로 밀어서 더 보기"})]}))]}),(0,b.jsxs)("button",{onClick:()=>B.push("/store"),style:{marginTop:20,width:"100%",padding:"14px 0",borderRadius:14,border:"none",background:"linear-gradient(135deg, #2C2417 0%, #4A3F30 100%)",fontSize:14,fontWeight:700,color:"#F5F1EA",cursor:"pointer",fontFamily:"'Gmarket Sans', sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 14px rgba(44,36,23,0.25)"},children:[(0,b.jsx)("span",{children:"🛒"})," 전체 리포트 보러가기"]})]}),(0,b.jsxs)("section",{className:"sec",style:{textAlign:"center"},children:[(0,b.jsx)("div",{className:"badge",children:O("animals.badge")}),(0,b.jsx)("h2",{className:"sec-title",style:{whiteSpace:"pre-line"},children:O("animals.title")}),(0,b.jsx)("p",{className:"sec-sub",style:{marginBottom:4,whiteSpace:"pre-line"},children:O("animals.sub")}),(0,b.jsx)("div",{className:"animal-grid",children:D.map((a,c)=>(0,b.jsx)("div",{className:"animal-cell",children:(0,b.jsx)("div",{className:F>0?"animal-flip":"",style:{width:"100%",height:"100%",animationDelay:F>0?`${35*c}ms`:void 0},children:(0,b.jsx)("img",{src:`/images/day_pillars/${a}.png`,alt:a,loading:"lazy",decoding:"async",onError:a=>{a.currentTarget.style.display="none"}})},`${F}-${c}`)},c))}),(0,b.jsx)("p",{style:{fontSize:11,color:q,textAlign:"center",marginTop:10},children:O("animals.note")})]}),(0,b.jsxs)("section",{className:"sec",style:{background:l,textAlign:"center"},children:[(0,b.jsx)("div",{className:"badge",children:O("trust.badge")}),(0,b.jsx)("div",{className:"trust-grid",children:P.trust.items.map((a,c)=>(0,b.jsxs)("div",{className:"trust-card",children:[(0,b.jsx)("div",{className:"trust-num",children:0===c?W.toLocaleString()+"+":a.val}),(0,b.jsx)("div",{className:"trust-label",style:{whiteSpace:"pre-line"},children:a.lbl.replace("{count}",W.toLocaleString())})]},c))})]}),(0,b.jsxs)("section",{className:"sec",style:{textAlign:"center"},children:[(0,b.jsx)("div",{className:"badge",children:O("reviews.badge")}),(0,b.jsx)("h2",{className:"sec-title",style:{fontSize:"1.25rem"},children:O("reviews.title")}),(0,b.jsx)("div",{ref:L,className:"review-scroll",style:{marginTop:16},onMouseDown:a=>{let b=L.current;if(!b)return;let c=a.pageX-b.offsetLeft,d=b.scrollLeft,e=a=>{let e=(a.pageX-b.offsetLeft-c)*1.2;b.scrollLeft=d-e};document.addEventListener("mousemove",e),document.addEventListener("mouseup",()=>document.removeEventListener("mousemove",e),{once:!0})},children:P.reviews.items.map((a,c)=>(0,b.jsxs)("div",{className:"review-card",children:[(0,b.jsxs)("div",{className:"review-top",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("span",{className:"review-name",children:a.name}),(0,b.jsx)("span",{className:"review-age",children:a.age})]}),(0,b.jsx)("span",{className:"review-tag",children:a.tag})]}),(0,b.jsx)("div",{className:"review-stars",children:"★".repeat(5)}),(0,b.jsxs)("p",{className:"review-text",children:['"',a.text,'"']})]},c))}),(0,b.jsx)("p",{style:{fontSize:11,color:o,textAlign:"center",marginTop:6},children:O("reviews.hint")})]}),(0,b.jsxs)("section",{className:"sec",style:{textAlign:"center"},children:[(0,b.jsx)("div",{className:"badge",children:O("core_features.badge")}),(0,b.jsx)("h2",{className:"sec-title",style:{whiteSpace:"pre-line"},children:O("core_features.title")}),(0,b.jsx)("div",{style:{display:"flex",flexDirection:"column",gap:10,marginTop:18},children:P.core_features.items.slice(0,3).map((a,c)=>(0,b.jsxs)("div",{style:{background:"#fff",border:`1px solid ${n}`,borderRadius:13,padding:"18px 16px",display:"flex",gap:14,alignItems:"flex-start"},children:[(0,b.jsx)("div",{style:{width:42,height:42,borderRadius:10,background:l,border:`1px solid ${n}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0},children:a.icon}),(0,b.jsxs)("div",{style:{flex:1},children:[(0,b.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:7,marginBottom:5,flexWrap:"wrap"},children:[(0,b.jsx)("span",{style:{fontFamily:s,fontSize:14,fontWeight:700,color:p},children:a.title}),a.tag&&(0,b.jsx)("span",{style:{padding:"2px 8px",borderRadius:4,background:r,color:"#fff",fontSize:9,fontWeight:800,letterSpacing:"0.08em"},children:a.tag})]}),(0,b.jsx)("p",{style:{fontSize:12.5,color:q,lineHeight:1.75,wordBreak:"keep-all",textAlign:"left"},children:a.desc})]})]},c))})]}),(0,b.jsxs)("section",{className:"sec",style:{background:l,display:"none"},"aria-hidden":!0,children:[(0,b.jsx)("div",{className:"badge",children:O("pricing.badge")}),(0,b.jsx)("h2",{className:"sec-title",style:{fontSize:"1.25rem",whiteSpace:"pre-line"},children:O("pricing.title")}),(0,b.jsx)("div",{style:{display:"flex",flexDirection:"column",gap:10,marginTop:18}})]}),(0,b.jsxs)("section",{className:"cta-sec",children:[(0,b.jsx)("p",{style:{fontSize:11,color:"rgba(245,241,234,.5)",letterSpacing:"0.12em",marginBottom:14,fontWeight:700},children:O("cta.eyebrow")}),(0,b.jsx)("h2",{className:"cta-title",style:{whiteSpace:"pre-line"},children:O("cta.title")}),(0,b.jsx)("p",{className:"cta-sub",style:{whiteSpace:"pre-line"},children:O("cta.sub")}),(0,b.jsx)("button",{className:"cta-btn",onClick:Y,children:O("cta.primary")}),(0,b.jsx)("button",{className:"cta-chat-btn",onClick:()=>B.push("/chat"),children:O("cta.secondary")})]}),(0,b.jsx)("footer",{className:"footer",children:(0,b.jsxs)("p",{className:"footer-text",style:{whiteSpace:"pre-line"},children:[O("footer.copy"),(0,b.jsx)("br",{}),O("footer.sub")]})})]})]}),(0,b.jsxs)("div",{className:"floating-cta",children:[(0,b.jsx)("button",{className:"floating-btn-main",onClick:Y,children:"무료 사주 분석"}),(0,b.jsx)("button",{className:"floating-btn-chat",onClick:()=>B.push("/chat"),children:"AI 대화"})]})]})}a.s(["default",()=>x])}];

//# sourceMappingURL=OneDrive_Desktop_saju-project-temp_frontend_app_home_page_tsx_2b8560bb._.js.map