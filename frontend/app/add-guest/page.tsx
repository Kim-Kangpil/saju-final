"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://saju-backend-eqd6.onrender.com";

const S = {
  cream: "#F5F1EA",
  cream2: "#EDE7DB",
  cream3: "#E3D9CB",
  beige: "#D4C9B8",
  ink: "#2C2417",
  ink2: "#4A3F30",
  ink3: "#6B5F4E",
  gold: "#8B7355",
  goldLight: "#A8946A",
  red: "#8B2020",
  font: "'Gmarket Sans', sans-serif",
} as const;

export default function AddGuestPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [birthRaw, setBirthRaw] = useState(""); // YYYYMMDD (8자리 숫자)
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [timeRaw, setTimeRaw] = useState(""); // HHMM (4자리 숫자)
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [calendar, setCalendar] = useState<"solar" | "lunar" | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- 생년월일 포맷 헬퍼 ---
  const formatBirth = (value: string) => {
    let raw = value.replace(/\D/g, "").slice(0, 8);
    if (raw.length >= 4) {
      const y = parseInt(raw.slice(0, 4), 10);
      if (y > 2100) raw = raw.slice(0, 3);
    }
    if (raw.length >= 6) {
      const mo = parseInt(raw.slice(4, 6), 10);
      if (mo < 1 || mo > 12) raw = raw.slice(0, 5);
    }
    if (raw.length >= 8) {
      const dd = parseInt(raw.slice(6, 8), 10);
      if (dd < 1 || dd > 31) raw = raw.slice(0, 7);
    }
    return raw;
  };

  const displayBirth = () => {
    if (birthRaw.length < 4) return birthRaw;
    if (birthRaw.length < 6) return `${birthRaw.slice(0, 4)}-${birthRaw.slice(4)}`;
    return `${birthRaw.slice(0, 4)}-${birthRaw.slice(4, 6)}-${birthRaw.slice(6)}`;
  };

  const handleBirthKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Backspace" || birthRaw.length === 0) return;
    e.preventDefault();
    if (birthRaw.length > 6) setBirthRaw(birthRaw.slice(0, 6));
    else if (birthRaw.length > 4) setBirthRaw(birthRaw.slice(0, 4));
    else setBirthRaw(birthRaw.slice(0, -1));
  };

  const displayTime = () => {
    if (timeRaw.length <= 2) return timeRaw;
    return `${timeRaw.slice(0, 2)}:${timeRaw.slice(2)}`;
  };

  // --- 유효성 검사 ---
  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "이름을 입력해 주세요.";
    if (birthRaw.length !== 8) e.birth = "생년월일 8자리를 입력해 주세요.";
    if (!timeUnknown && timeRaw.length !== 4) e.time = "출생 시간 4자리를 입력하거나 '모름'을 선택해 주세요.";
    if (!gender) e.gender = "성별을 선택해 주세요.";
    if (!calendar) e.calendar = "양력/음력을 선택해 주세요.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // --- 제출 ---
  const handleSubmit = async () => {
    if (!validate()) return;

    const year = Number(birthRaw.slice(0, 4));
    const month = Number(birthRaw.slice(4, 6));
    const day = Number(birthRaw.slice(6, 8));

    const effectiveTime = timeUnknown ? "1200" : timeRaw;
    const hour = Number(effectiveTime.slice(0, 2));
    const minute = Number(effectiveTime.slice(2, 4));

    const inputData = {
      name: name.trim(),
      year,
      month,
      day,
      hour,
      minute,
      gender: gender === "male" ? "남자" : "여자",
      calendar_type: calendar === "solar" ? "양력" : "음력",
      time_unknown: timeUnknown,
    };

    const payload = {
      calendar_type: inputData.calendar_type,
      year,
      month,
      day,
      hour: timeUnknown ? null : hour,
      minute: timeUnknown ? null : minute,
      gender: inputData.gender,
      is_leap_month: false,
      time_unknown: timeUnknown,
    };

    sessionStorage.setItem("guest_saju_input", JSON.stringify(inputData));

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${API_BASE}/saju/full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        setErrors({ global: errBody?.detail || "분석에 실패했어요. 다시 시도해 주세요." });
        return;
      }

      const result = await res.json();
      sessionStorage.setItem("guest_saju_result", JSON.stringify(result));
      router.push("/report/basic?guest=true");
    } catch {
      setErrors({ global: "네트워크 오류가 발생했어요. 잠시 후 다시 시도해 주세요." });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    fontSize: 16,
    fontFamily: S.font,
    color: S.ink,
    background: "#fff",
    border: `1.5px solid ${S.beige}`,
    borderRadius: 12,
    outline: "none",
    boxSizing: "border-box",
  };

  const errorInputStyle: React.CSSProperties = {
    ...inputStyle,
    borderColor: S.red,
  };

  const toggleBase: React.CSSProperties = {
    flex: 1,
    padding: "13px 0",
    fontSize: 15,
    fontWeight: 600,
    fontFamily: S.font,
    border: `1.5px solid ${S.beige}`,
    borderRadius: 10,
    cursor: "pointer",
    transition: "all .15s",
    textAlign: "center",
  };

  const toggleActive: React.CSSProperties = {
    ...toggleBase,
    background: S.ink,
    color: "#fff",
    borderColor: S.ink,
  };

  const toggleInactive: React.CSSProperties = {
    ...toggleBase,
    background: "#fff",
    color: S.ink3,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: S.cream,
        fontFamily: S.font,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .guest-input::placeholder { color: #B4A895; }
        .tap { -webkit-tap-highlight-color: transparent; cursor: pointer; }
        .tap:active { opacity: .85; }
        .wrap { width: 100%; max-width: 420px; padding: 0 20px 60px; }
        @media (max-width: 390px) { .wrap { padding: 0 16px 60px; } }
      `}</style>

      {/* 헤더 */}
      <header
        style={{
          width: "100%",
          position: "sticky",
          top: 0,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          background: S.cream,
          borderBottom: `1px solid ${S.cream3}`,
        }}
      >
        <button
          className="tap"
          onClick={() => router.back()}
          style={{
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            color: S.ink,
          }}
        >
          <Icon icon="mdi:chevron-left" width={28} />
        </button>
        <span
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 17,
            fontWeight: 700,
            color: S.ink,
            letterSpacing: "-0.3px",
          }}
        >
          한양사주
        </span>
        <div style={{ width: 40 }} />
      </header>

      <div className="wrap">
        {/* 타이틀 */}
        <div style={{ paddingTop: 28, paddingBottom: 6, textAlign: "center" }}>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: S.ink,
              lineHeight: 1.3,
              letterSpacing: "-0.5px",
            }}
          >
            무료로 내 사주 보기
          </h1>
          <p
            style={{
              marginTop: 10,
              fontSize: 13.5,
              color: S.ink3,
              lineHeight: 1.6,
            }}
          >
            로그인 없이 볼 수 있어요&nbsp;·&nbsp;저장하려면 가입만 하면 돼요
          </p>
        </div>

        {/* 구분선 */}
        <div
          style={{
            margin: "20px 0",
            height: 1,
            background: S.cream3,
          }}
        />

        {/* 폼 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* 이름 */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: S.ink2,
                marginBottom: 8,
              }}
            >
              이름
            </label>
            <input
              className="guest-input"
              style={errors.name ? errorInputStyle : inputStyle}
              placeholder="이름을 입력해 주세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
            />
            {errors.name && (
              <p style={{ marginTop: 6, fontSize: 12.5, color: S.red }}>{errors.name}</p>
            )}
          </div>

          {/* 생년월일 */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: S.ink2,
                marginBottom: 8,
              }}
            >
              생년월일
            </label>
            <input
              className="guest-input"
              type="text"
              inputMode="numeric"
              style={errors.birth ? errorInputStyle : inputStyle}
              placeholder="YYYY-MM-DD"
              value={displayBirth()}
              onChange={(e) => setBirthRaw(formatBirth(e.target.value))}
              onKeyDown={handleBirthKeyDown}
            />
            {errors.birth && (
              <p style={{ marginTop: 6, fontSize: 12.5, color: S.red }}>{errors.birth}</p>
            )}
          </div>

          {/* 출생 시간 */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: S.ink2,
                marginBottom: 8,
              }}
            >
              출생 시간
            </label>
            <input
              className="guest-input"
              type="text"
              inputMode="numeric"
              style={
                timeUnknown
                  ? { ...inputStyle, opacity: 0.4, pointerEvents: "none" }
                  : errors.time
                  ? errorInputStyle
                  : inputStyle
              }
              placeholder="HH:MM"
              value={timeUnknown ? "12:00" : displayTime()}
              onChange={(e) =>
                setTimeRaw(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              disabled={timeUnknown}
            />
            <label
              className="tap"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 10,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={timeUnknown}
                onChange={(e) => {
                  setTimeUnknown(e.target.checked);
                  if (e.target.checked) setErrors((prev) => ({ ...prev, time: "" }));
                }}
                style={{ width: 18, height: 18, accentColor: S.gold, cursor: "pointer" }}
              />
              <span style={{ fontSize: 13.5, color: S.ink3 }}>
                출생 시간을 몰라요 (12:00으로 계산)
              </span>
            </label>
            {errors.time && !timeUnknown && (
              <p style={{ marginTop: 6, fontSize: 12.5, color: S.red }}>{errors.time}</p>
            )}
          </div>

          {/* 성별 */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: S.ink2,
                marginBottom: 8,
              }}
            >
              성별
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="tap"
                style={gender === "male" ? toggleActive : toggleInactive}
                onClick={() => setGender("male")}
              >
                남자
              </button>
              <button
                className="tap"
                style={gender === "female" ? toggleActive : toggleInactive}
                onClick={() => setGender("female")}
              >
                여자
              </button>
            </div>
            {errors.gender && (
              <p style={{ marginTop: 6, fontSize: 12.5, color: S.red }}>{errors.gender}</p>
            )}
          </div>

          {/* 양력/음력 */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: S.ink2,
                marginBottom: 8,
              }}
            >
              양력 / 음력
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="tap"
                style={calendar === "solar" ? toggleActive : toggleInactive}
                onClick={() => setCalendar("solar")}
              >
                양력
              </button>
              <button
                className="tap"
                style={calendar === "lunar" ? toggleActive : toggleInactive}
                onClick={() => setCalendar("lunar")}
              >
                음력
              </button>
            </div>
            {errors.calendar && (
              <p style={{ marginTop: 6, fontSize: 12.5, color: S.red }}>{errors.calendar}</p>
            )}
          </div>

          {/* 전역 에러 */}
          {errors.global && (
            <div
              style={{
                padding: "14px 16px",
                background: "#FFF0F0",
                border: `1px solid ${S.red}`,
                borderRadius: 10,
                fontSize: 13.5,
                color: S.red,
                lineHeight: 1.5,
              }}
            >
              {errors.global}
            </div>
          )}

          {/* 제출 버튼 / 로딩 */}
          {loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                padding: "30px 0",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  border: `3.5px solid ${S.cream3}`,
                  borderTop: `3.5px solid ${S.gold}`,
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <p
                style={{
                  fontSize: 14.5,
                  color: S.ink3,
                  fontWeight: 600,
                  letterSpacing: "-0.2px",
                }}
              >
                AI가 사주를 분석하고 있어요...
              </p>
              <p style={{ fontSize: 12.5, color: S.gold }}>
                보통 3~5초 정도 걸려요
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <button
              className="tap"
              onClick={handleSubmit}
              style={{
                width: "100%",
                padding: "16px 0",
                fontSize: 16.5,
                fontWeight: 700,
                fontFamily: S.font,
                color: "#fff",
                background: S.ink,
                border: "none",
                borderRadius: 14,
                cursor: "pointer",
                letterSpacing: "-0.3px",
                marginTop: 4,
              }}
            >
              내 사주 분석하기
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
