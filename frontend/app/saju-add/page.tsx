"use client";

import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { HamIcon } from "@/components/HamIcon";
import { Icon } from "@iconify/react";
import { getAuthHeaders } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://saju-backend-eqd6.onrender.com";

export default function SajuAddPage({
  params,
}: { params?: Promise<Record<string, string | string[]>> } = {}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();

  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [birthRaw, setBirthRaw] = useState(""); // 8자리 숫자만
  const [knowTime, setKnowTime] = useState<"yes" | "no">("no");
  const [timeRaw, setTimeRaw] = useState(""); // 4자리 숫자만
  const [calendarType, setCalendarType] = useState<"solar" | "lunar" | null>(null);
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [city, setCity] = useState("서울");
  const [longitude, setLongitude] = useState("");
  const [useLongitudeCorrection, setUseLongitudeCorrection] = useState(false);
  const [useEquationOfTime, setUseEquationOfTime] = useState(false);
  const [timeAccuracy, setTimeAccuracy] = useState<"exact" | "approx" | "unknown">("unknown");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [errors, setErrors] = useState({
    name: false,
    birth: false,
    time: false,
    calendar: false,
    gender: false,
    global: false,
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const formatBirth = (value: string) => {
    let raw = value.replace(/\D/g, "").slice(0, 8);

    // YYYY: 1800 ~ 2100
    if (raw.length >= 4) {
      const year = parseInt(raw.slice(0, 4), 10);
      if (year < 1800 || year > 2100) raw = raw.slice(0, 3);
    }
    // MM: 01 ~ 12
    if (raw.length >= 6) {
      const month = parseInt(raw.slice(4, 6), 10);
      if (month < 1 || month > 12) raw = raw.slice(0, 5);
    }
    // DD: 01 ~ 31
    if (raw.length >= 8) {
      const day = parseInt(raw.slice(6, 8), 10);
      if (day < 1 || day > 31) raw = raw.slice(0, 7);
    }

    setBirthRaw(raw);
    return raw;
  };

  const displayBirth = () => {
    if (birthRaw.length < 4) return birthRaw;
    if (birthRaw.length < 6) return `${birthRaw.slice(0, 4)}-${birthRaw.slice(4)}`;
    if (birthRaw.length <= 8)
      return `${birthRaw.slice(0, 4)}-${birthRaw.slice(4, 6)}-${birthRaw.slice(6)}`;
    return birthRaw;
  };

  /** 백스페이스 시: 하이픈(-)과 그 뒤 마지막 숫자를 한 번에 제거 (예: 2000-09-12 → 2000-09) */
  const handleBirthKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Backspace" || birthRaw.length === 0) return;
    const len = birthRaw.length;
    if (len > 6) {
      // 일(日) 구간: 7~8자 → 한 번에 6자로 (예: 2000-09-1 또는 2000-09-12 → 2000-09)
      e.preventDefault();
      setBirthRaw(birthRaw.slice(0, 6));
    } else if (len > 4) {
      // 월(月) 구간: 5~6자 → 한 번에 4자로 (예: 2000-09 → 2000)
      e.preventDefault();
      setBirthRaw(birthRaw.slice(0, 4));
    } else if (len >= 1) {
      // 년(年) 구간: 한 자씩 제거
      e.preventDefault();
      setBirthRaw(birthRaw.slice(0, -1));
    }
  };

  const formatTime = (value: string) => {
    const onlyNum = value.replace(/\D/g, "").slice(0, 4);
    setTimeRaw(onlyNum);
    return onlyNum;
  };

  const displayTime = () => {
    if (timeRaw.length <= 2) return timeRaw;
    return `${timeRaw.slice(0, 2)}:${timeRaw.slice(2)}`;
  };

  const getPayload = () => {
    const birthdate = `${birthRaw.slice(0, 4)}-${birthRaw.slice(
      4,
      6
    )}-${birthRaw.slice(6, 8)}`;
    const birth_time =
      knowTime === "yes"
        ? `${timeRaw.slice(0, 2)}:${timeRaw.slice(2, 4)}`
        : null;
    const calendar_type = calendarType === "solar" ? "양력" : "음력";
    const genderText = gender === "male" ? "남자" : "여자";
    return {
      name,
      relation,
      birthdate,
      birth_time,
      calendar_type,
      gender: genderText,
      city: city.trim() || null,
      longitude: longitude.trim() || null,
      use_longitude_correction: useLongitudeCorrection,
      use_equation_of_time: useEquationOfTime,
      time_accuracy: timeAccuracy,
    };
  };

  const handleSave = () => {
    const newErrors = {
      name: !name.trim(),
      birth: birthRaw.length !== 8,
      time: knowTime === "yes" ? timeRaw.length !== 4 : true,
      calendar: !calendarType,
      gender: !gender,
    };
    const hasError =
      newErrors.name ||
      newErrors.birth ||
      newErrors.time ||
      newErrors.calendar ||
      newErrors.gender;
    setErrors({
      name: newErrors.name,
      birth: newErrors.birth,
      time: newErrors.time,
      calendar: newErrors.calendar,
      gender: newErrors.gender,
      global: hasError,
    });
    if (hasError) {
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    const {
      name: n,
      relation: r,
      birthdate,
      birth_time,
      calendar_type,
      gender: genderText,
      city: payloadCity,
      longitude: payloadLongitude,
      use_longitude_correction,
      use_equation_of_time,
      time_accuracy,
    } = getPayload();
    try {
      const res = await fetch(`${API_BASE}/api/saju/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          name: n,
          relation: r,
          birthdate,
          birth_time,
          calendar_type,
          gender: genderText,
          city: payloadCity,
          longitude: payloadLongitude,
          use_longitude_correction,
          use_equation_of_time,
          time_accuracy,
        }),
      });
      const body = await res.json().catch(() => ({}));
      console.log("[api/saju/save] status:", res.status, "body:", body);

      if (res.status === 401) {
        alert(
          "로그인 상태를 서버에서 확인하지 못했습니다.\n\n" +
          "서버의 FRONTEND_URL·CORS_ORIGINS가 실제 접속 주소(예: https://www.hsaju.com)와 일치하는지 확인해 주세요."
        );
        setShowConfirmModal(false);
        router.push("/start");
        return;
      }

      if (!res.ok) {
        alert("저장에 실패했습니다.");
        return;
      }

      if (body?.success && body?.saju_id != null) {
        setShowConfirmModal(false);
        router.push(`/saju-preview?id=${body.saju_id}`);
      } else if (body?.success) {
        setShowConfirmModal(false);
        router.push("/saju-list");
      } else {
        alert("저장에 실패했습니다.");
      }
    } catch (e) {
      console.error("SAJU SAVE ERROR", e);
      alert("저장에 실패했습니다.");
    }
  };

  const goList = () => router.push("/saju-list");

  const birthdateDisplay = `${birthRaw.slice(0, 4)}-${birthRaw.slice(4, 6)}-${birthRaw.slice(6, 8)}`;
  const calendarLabel = calendarType === "solar" ? "양력" : "음력";
  const timeDisplay = knowTime === "yes" && timeRaw.length === 4
    ? `${timeRaw.slice(0, 2)}:${timeRaw.slice(2, 4)}`
    : "모름";
  const genderDisplay = gender === "male" ? "남자" : "여자";

  const inputBg = "var(--bg-input)";
  const textDark = "var(--text-primary)";
  const borderSelected = "#333333";
  const borderField = "#B4A292";
  const placeholderColor = "#A09D94";
  const radius = 12;

  return (
    <main
      style={{
        minHeight: "100vh",
        fontFamily: "var(--font-sans)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        backgroundColor: "var(--bg-base)",
        backgroundImage: "url('/images/hanji-bg.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
      }}
    >
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .sans { font-family: var(--font-sans); }
        .tap {
          transition: transform .15s ease, opacity .15s ease;
          -webkit-tap-highlight-color: transparent;
          cursor: pointer;
        }
        .tap:active { transform: scale(.97); opacity: .9; }
        .wrap {
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          padding: 0 20px 40px;
        }
        @media (max-width: 390px) {
          .wrap { padding: 0 16px 40px; }
        }
        .saju-add-input::placeholder {
          color: #A09D94;
        }
      `}</style>

      <div className="wrap">
        {/* 헤더 – 시안: 흰 배경, 다크 텍스트, 한양사주 AI */}
        <header
          className="sans"
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            margin: "0 -20px 16px",
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border-default)",
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: textDark,
            }}
          >
            <Icon icon="mdi:chevron-left" width={28} />
          </button>
          <span
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 18,
              fontWeight: 700,
              color: textDark,
            }}
          >
            한양사주 AI
          </span>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {/* 분석권 (클릭 시 충전 페이지) */}
            <button
              type="button"
              onClick={() => router.push("/seed-charge")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 10px",
                borderRadius: 999,
                background: inputBg,
                border: "1.5px solid var(--border-default)",
                cursor: "pointer",
                color: textDark,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <Icon icon="mdi:ticket-confirmation-outline" width={18} />
              <span>0</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/membership")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 10px",
                borderRadius: 999,
                background: inputBg,
                border: "1.5px solid var(--border-default)",
                cursor: "pointer",
                color: textDark,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <Icon icon="mdi:crown" width={18} />
              <span>한양사주 Pro</span>
            </button>

            <button
              type="button"
              className="tap"
              aria-label="메뉴 열기"
              onClick={() => router.push("/saju-mypage")}
              style={{
                padding: 8,
                borderRadius: 10,
                border: "none",
                background: "transparent",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: textDark,
              }}
            >
              <Icon icon="mdi:menu" width={22} />
            </button>
          </div>
        </header>

        {/* 새 사주 입력 섹션 – 시안: 베이지 배경, 라운드 입력/버튼 */}
        <section
          className="sans"
          style={{
            position: "relative",
            padding: "8px 0 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* 1. 성별 – 버튼 각각 분리 */}
            <div>
              <label style={{ fontSize: 14, color: textDark, marginBottom: 8, display: "block", fontWeight: 600 }}>
                성별 <span style={{ color: "#e11d48" }}>*</span>
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  className="tap sans"
                  onClick={() => setGender("female")}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: radius,
                    border: gender === "female" ? `3px solid ${borderSelected}` : `1.5px solid ${borderField}`,
                    background: inputBg,
                    fontSize: 14,
                    fontWeight: 600,
                    color: textDark,
                  }}
                >
                  여자
                </button>
                <button
                  type="button"
                  className="tap sans"
                  onClick={() => setGender("male")}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: radius,
                    border: gender === "male" ? `3px solid ${borderSelected}` : `1.5px solid ${borderField}`,
                    background: inputBg,
                    fontSize: 14,
                    fontWeight: 600,
                    color: textDark,
                  }}
                >
                  남자
                </button>
              </div>
              {errors.gender && <p style={{ marginTop: 6, fontSize: 12, color: "#e11d48" }}>성별을 선택해주세요.</p>}
            </div>

            {/* 2. 양/음력 – 버튼 각각 분리 */}
            <div>
              <label style={{ fontSize: 14, color: textDark, marginBottom: 8, display: "block", fontWeight: 600 }}>
                양/음력 <span style={{ color: "#e11d48" }}>*</span>
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  className="tap sans"
                  onClick={() => setCalendarType("solar")}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: radius,
                    border: calendarType === "solar" ? `3px solid ${borderSelected}` : `1.5px solid ${borderField}`,
                    background: inputBg,
                    fontSize: 14,
                    fontWeight: 600,
                    color: textDark,
                  }}
                >
                  양력
                </button>
                <button
                  type="button"
                  className="tap sans"
                  onClick={() => setCalendarType("lunar")}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: radius,
                    border: calendarType === "lunar" ? `3px solid ${borderSelected}` : `1.5px solid ${borderField}`,
                    background: inputBg,
                    fontSize: 14,
                    fontWeight: 600,
                    color: textDark,
                  }}
                >
                  음력
                </button>
              </div>
              {errors.calendar && <p style={{ marginTop: 6, fontSize: 12, color: "#e11d48" }}>양력/음력을 선택해주세요.</p>}
            </div>

            {/* 3. 출생 시간 여부 → 생년월일(8자리) → (시간 알면) 4자리 입력 */}
            <div>
              <label style={{ fontSize: 14, color: textDark, marginBottom: 8, display: "block", fontWeight: 600 }}>
                출생 시간을 아시나요? <span style={{ color: "#e11d48" }}>*</span>
              </label>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <button
                  type="button"
                  className="tap sans"
                  onClick={() => setKnowTime("yes")}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: radius,
                    border: knowTime === "yes" ? `3px solid ${borderSelected}` : `1.5px solid ${borderField}`,
                    background: inputBg,
                    fontSize: 14,
                    fontWeight: 600,
                    color: textDark,
                  }}
                >
                  알아요
                </button>
                <button
                  type="button"
                  className="tap sans"
                  onClick={() => { setKnowTime("no"); setTimeRaw(""); }}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: radius,
                    border: knowTime === "no" ? `3px solid ${borderSelected}` : `1.5px solid ${borderField}`,
                    background: inputBg,
                    fontSize: 14,
                    fontWeight: 600,
                    color: textDark,
                  }}
                >
                  모르겠어요
                </button>
              </div>

              <label style={{ fontSize: 14, color: textDark, marginBottom: 8, display: "block", fontWeight: 600 }}>
                생년월일 <span style={{ color: "#e11d48" }}>*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={displayBirth()}
                onChange={(e) => formatBirth(e.target.value)}
                onKeyDown={handleBirthKeyDown}
                placeholder="예: 19900101 (8자리)"
                className="saju-add-input"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: radius,
                  border: errors.birth ? "1.5px solid #e11d48" : `1.5px solid ${borderField}`,
                  fontSize: 14,
                  outline: "none",
                  background: inputBg,
                  color: textDark,
                }}
              />
              {errors.birth && <p style={{ marginTop: 6, fontSize: 12, color: "#e11d48" }}>생년월일 8자리를 입력해주세요.</p>}

              {knowTime === "yes" && (
                <>
                  <label style={{ fontSize: 14, color: textDark, marginTop: 16, marginBottom: 8, display: "block", fontWeight: 600 }}>
                    출생 시간 <span style={{ color: "#e11d48" }}>*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={displayTime()}
                    onChange={(e) => formatTime(e.target.value)}
                    placeholder="예: 1430 → 14시 30분"
                    className="saju-add-input"
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      borderRadius: radius,
                      border: errors.time ? "1.5px solid #e11d48" : `1.5px solid ${borderField}`,
                      fontSize: 14,
                      outline: "none",
                      background: inputBg,
                      color: textDark,
                    }}
                  />
                  {errors.time && <p style={{ marginTop: 6, fontSize: 12, color: "#e11d48" }}>시간 4자리를 입력해주세요.</p>}
                </>
              )}
            </div>

            {/* 4. 고급 옵션 (기본 닫힘) */}
            <div>
              <button
                type="button"
                className="tap sans"
                onClick={() => setShowAdvancedOptions((v) => !v)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: radius,
                  border: `1.5px solid ${borderField}`,
                  background: inputBg,
                  color: textDark,
                  fontSize: 14,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>고급 옵션</span>
                <Icon icon={showAdvancedOptions ? "mdi:chevron-up" : "mdi:chevron-down"} width={18} />
              </button>

              {showAdvancedOptions && (
                <div
                  style={{
                    marginTop: 10,
                    padding: "12px",
                    borderRadius: radius,
                    border: `1.5px solid ${borderField}`,
                    background: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div>
                    <label style={{ fontSize: 13, color: textDark, marginBottom: 6, display: "block", fontWeight: 600 }}>
                      출생지 선택
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="saju-add-input"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: `1.5px solid ${borderField}`,
                        fontSize: 14,
                        outline: "none",
                        background: inputBg,
                        color: textDark,
                      }}
                    >
                      <option value="서울">서울</option>
                      <option value="부산">부산</option>
                      <option value="대구">대구</option>
                      <option value="해외">해외</option>
                    </select>
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <label style={{ fontSize: 13, color: textDark, fontWeight: 600 }}>정밀 시간 보정 적용</label>
                      <button
                        type="button"
                        className="tap sans"
                        onClick={() => {
                          const next = !(useLongitudeCorrection && useEquationOfTime);
                          setUseLongitudeCorrection(next);
                          setUseEquationOfTime(next);
                        }}
                        style={{
                          minWidth: 64,
                          padding: "7px 10px",
                          borderRadius: 999,
                          border: `1.5px solid ${useLongitudeCorrection && useEquationOfTime ? borderSelected : borderField}`,
                          background: useLongitudeCorrection && useEquationOfTime ? "#333333" : inputBg,
                          color: useLongitudeCorrection && useEquationOfTime ? "#fff" : textDark,
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        {useLongitudeCorrection && useEquationOfTime ? "ON" : "OFF"}
                      </button>
                    </div>
                    <p style={{ marginTop: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                      태양 기준 시간으로 계산하여 더 정확한 시주를 제공합니다
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 5. 이름 (기능 유지) */}
            <div>
              <label style={{ fontSize: 14, color: textDark, marginBottom: 8, display: "block", fontWeight: 600 }}>
                이름 <span style={{ color: "#e11d48" }}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="saju-add-input"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: radius,
                  border: errors.name ? "1.5px solid #e11d48" : `1.5px solid ${borderField}`,
                  fontSize: 14,
                  outline: "none",
                  background: inputBg,
                  color: textDark,
                }}
              />
              {errors.name && <p style={{ marginTop: 6, fontSize: 12, color: "#e11d48" }}>이름을 입력해주세요.</p>}
            </div>

            {/* 5. 나와의 관계 (기능 유지) */}
            <div>
              <label style={{ fontSize: 14, color: textDark, marginBottom: 8, display: "block", fontWeight: 600 }}>
                나와의 관계 <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>(선택)</span>
              </label>
              <input
                type="text"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder="예: 나, 엄마, 친구 등"
                className="saju-add-input"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: radius,
                  border: `1.5px solid ${borderField}`,
                  fontSize: 14,
                  outline: "none",
                  background: inputBg,
                  color: textDark,
                }}
              />
            </div>
          </div>

          {errors.global && (
            <p style={{ marginTop: 10, fontSize: 12, color: "#e11d48" }}>
              필수 항목을 입력해주세요.
            </p>
          )}

          {/* 하단 버튼 – 시안: 만세력 불러오기, 저장하기 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
            <button
              type="button"
              onClick={goList}
              className="tap sans"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: radius,
                border: `1.5px solid ${borderField}`,
                background: inputBg,
                fontSize: 14,
                fontWeight: 700,
                color: textDark,
              }}
            >
              만세력 불러오기
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="tap sans"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: radius,
                border: `1.5px solid ${borderField}`,
                background: inputBg,
                fontSize: 14,
                fontWeight: 700,
                color: textDark,
              }}
            >
              저장하기
            </button>
          </div>
        </section>
      </div>

      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            background: "rgba(0,0,0,0.4)",
          }}
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="sans"
            style={{
              background: "var(--bg-base)",
              borderRadius: 16,
              padding: 24,
              width: "100%",
              maxWidth: 360,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="confirm-modal-title"
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: textDark,
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              입력하신 프로필을 확인해주세요.
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>성별</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: radius, background: inputBg, color: textDark, fontSize: 14, border: `1.5px solid ${borderField}` }}>
                  <Icon icon="mdi:account-outline" width={20} />
                  {genderDisplay}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>양/음력</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: radius, background: inputBg, color: textDark, fontSize: 14, border: `1.5px solid ${borderField}` }}>
                  <Icon icon="mdi:white-balance-sunny" width={20} />
                  {calendarLabel}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>생년월일시</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: radius, background: inputBg, color: textDark, fontSize: 14, border: `1.5px solid ${borderField}` }}>
                  <Icon icon="mdi:calendar" width={20} />
                  {birthdateDisplay} {timeDisplay !== "모름" ? `(${timeDisplay})` : ""}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>출생지</label>
                <div style={{ padding: "12px 14px", borderRadius: radius, background: inputBg, color: textDark, fontSize: 14, border: `1.5px solid ${borderField}` }}>
                  {city || "서울"}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>정밀 시간 보정</label>
                <div style={{ padding: "12px 14px", borderRadius: radius, background: inputBg, color: textDark, fontSize: 14, border: `1.5px solid ${borderField}` }}>
                  {useLongitudeCorrection && useEquationOfTime ? "ON" : "OFF"}
                </div>
              </div>
              {name && (
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>이름</label>
                  <div style={{ padding: "12px 14px", borderRadius: radius, background: inputBg, color: textDark, fontSize: 14, border: `1.5px solid ${borderField}` }}>{name}</div>
                </div>
              )}
              {relation && (
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>나와의 관계</label>
                  <div style={{ padding: "12px 14px", borderRadius: radius, background: inputBg, color: textDark, fontSize: 14, border: `1.5px solid ${borderField}` }}>{relation}</div>
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
              <button
                type="button"
                className="tap sans"
                onClick={() => setShowConfirmModal(false)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: radius,
                  border: `1.5px solid ${borderField}`,
                  background: inputBg,
                  fontSize: 14,
                  fontWeight: 700,
                  color: textDark,
                }}
              >
                다시 입력하기
              </button>
              <button
                type="button"
                className="tap sans"
                onClick={handleConfirmSave}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: radius,
                  border: `1.5px solid ${borderField}`,
                  background: inputBg,
                  fontSize: 14,
                  fontWeight: 700,
                  color: textDark,
                }}
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

