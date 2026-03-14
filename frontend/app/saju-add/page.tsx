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
    const onlyNum = value.replace(/\D/g, "").slice(0, 8);
    setBirthRaw(onlyNum);
    return onlyNum;
  };

  const displayBirth = () => {
    if (birthRaw.length < 4) return birthRaw;
    if (birthRaw.length < 6) return `${birthRaw.slice(0, 4)}-${birthRaw.slice(4)}`;
    if (birthRaw.length <= 8)
      return `${birthRaw.slice(0, 4)}-${birthRaw.slice(4, 6)}-${birthRaw.slice(6)}`;
    return birthRaw;
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
    return { name, relation, birthdate, birth_time, calendar_type, gender: genderText };
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
    const { name: n, relation: r, birthdate, birth_time, calendar_type, gender: genderText } = getPayload();
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
        router.push("/login");
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

  return (
    <main
      style={{
        background: "#eef4ee",
        minHeight: "100vh",
        fontFamily: "'Gowun Dodum', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gowun+Dodum&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .sans  { font-family: 'Gowun Dodum', sans-serif; }
        .tap {
          transition: transform .15s ease, opacity .15s ease, box-shadow .15s ease;
          -webkit-tap-highlight-color: transparent;
          cursor: pointer;
        }
        .tap:active { transform: scale(.97); opacity: .9; box-shadow: 0 4px 10px rgba(0,0,0,.12); }
        .wrap {
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          padding: 0 20px 40px;
        }
        @media (max-width: 390px) {
          .wrap { padding: 0 16px 40px; }
        }
      `}</style>

      <div className="wrap">
        {/* 헤더 – saju-list와 동일 */}
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
            background: "#c1d8c3",
            borderBottom: "3px solid #adc4af",
          }}
        >
          <button
            onClick={() => router.push("/home")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <HamIcon
              style={{ width: 40, height: 40, objectFit: "contain" }}
              alt="햄스터"
            />
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#2d4a1e",
                letterSpacing: "0.04em",
              }}
            >
              한양사주
            </span>
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {/* 씨앗 캐시 (클릭 시 충전 페이지) */}
            <button
              type="button"
              onClick={() => router.push("/seed-charge")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.85)",
                border: "1.5px solid #adc4af",
                cursor: "pointer",
              }}
            >
              <Icon icon="mdi:seed-outline" width={18} />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#345024",
                }}
              >
                0
              </span>
            </button>

            {/* 해바라기 멤버십 (클릭 시 멤버십 페이지) */}
            <button
              type="button"
              onClick={() => router.push("/membership")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.85)",
                border: "1.5px solid #adc4af",
                cursor: "pointer",
              }}
            >
              <Icon icon="fluent-emoji-flat:sunflower" width={18} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#345024" }}>멤버십</span>
            </button>

            {/* 햄버거 메뉴 아이콘 */}
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
              }}
            >
              <Icon icon="mdi:menu" width={22} style={{ marginLeft: 14 }} />
            </button>
          </div>
        </header>

        {/* 새 사주 입력 섹션 */}
        <section
          className="sans"
          style={{
            position: "relative",
            background: "#ffffff",
            borderRadius: 0,
            border: "1.5px solid #c8dac8",
            padding: "20px 20px 24px",
            margin: "0 -20px 0",
            boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
          }}
        >
          <h1
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#1a2e0e",
              marginBottom: 14,
            }}
          >
            새로운 사주 추가
          </h1>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {/* 1. 이름 (필수) */}
            <div>
              <label
                style={{
                  fontSize: 13,
                  color: "#1a2e0e",
                  marginBottom: 6,
                  display: "block",
                }}
              >
                이름{" "}
                <span style={{ color: "#e11d48", fontWeight: 700 }}>＊</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 14,
                  border: errors.name
                    ? "1.5px solid #e11d48"
                    : "1.5px solid #c8dac8",
                  fontSize: 14,
                  outline: "none",
                  background: "#ffffff",
                }}
              />
            </div>

            {/* 2. 나와의 관계 (선택) */}
            <div>
              <label
                style={{
                  fontSize: 13,
                  color: "#1a2e0e",
                  marginBottom: 6,
                  display: "block",
                }}
              >
                나와의 관계{" "}
                <span style={{ fontSize: 11, color: "#6b7280" }}> (선택)</span>
              </label>
              <input
                type="text"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder="예: 나, 엄마, 친구 등"
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 14,
                  border: "1.5px solid #c8dac8",
                  fontSize: 14,
                  outline: "none",
                  background: "#ffffff",
                }}
              />
            </div>

            {/* 3. 생년월일 (필수) */}
            <div>
              <label
                style={{
                  fontSize: 13,
                  color: "#1a2e0e",
                  marginBottom: 6,
                  display: "block",
                }}
              >
                생년월일 (8자리 숫자){" "}
                <span style={{ color: "#e11d48", fontWeight: 700 }}>＊</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={displayBirth()}
                onChange={(e) => formatBirth(e.target.value)}
                placeholder="예: 19981231"
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 14,
                  border: errors.birth
                    ? "1.5px solid #e11d48"
                    : "1.5px solid #c8dac8",
                  fontSize: 14,
                  outline: "none",
                  background: "#ffffff",
                }}
              />
            </div>

            {/* 4. 태어난 시간 (필수) */}
            <div>
              <label
                style={{
                  fontSize: 13,
                  color: "#1a2e0e",
                  marginBottom: 6,
                  display: "block",
                }}
              >
                태어난 시간{" "}
                <span style={{ color: "#e11d48", fontWeight: 700 }}>＊</span>
              </label>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: knowTime === "yes" ? 8 : 0,
                }}
              >
                <button
                  type="button"
                  className="tap sans"
                  onClick={() => setKnowTime("yes")}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    borderRadius: 14,
                    border: "1.5px solid #adc4af",
                    background: knowTime === "yes" ? "#c1d8c3" : "#ffffff",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#1a2e0e",
                  }}
                >
                  알아요
                </button>
                <button
                  type="button"
                  className="tap sans"
                  onClick={() => setKnowTime("no")}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    borderRadius: 14,
                    border: "1.5px solid #adc4af",
                    background: knowTime === "no" ? "#c1d8c3" : "#ffffff",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#1a2e0e",
                  }}
                >
                  몰라요
                </button>
              </div>

              {knowTime === "yes" && (
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayTime()}
                  onChange={(e) => formatTime(e.target.value)}
                  placeholder="예: 1430 → 14:30"
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 14,
                    border: errors.time
                      ? "1.5px solid #e11d48"
                      : "1.5px solid #c8dac8",
                    fontSize: 14,
                    outline: "none",
                    background: "#ffffff",
                  }}
                />
              )}
            </div>

            {/* 5. 양력 / 음력 (필수) */}
            <div>
              <label
                style={{
                  fontSize: 13,
                  color: "#1a2e0e",
                  marginBottom: 6,
                  display: "block",
                }}
              >
                양력 / 음력{" "}
                <span style={{ color: "#e11d48", fontWeight: 700 }}>＊</span>
              </label>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  className="tap sans"
                  onClick={() => setCalendarType("solar")}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    borderRadius: 14,
                    border: errors.calendar
                      ? "1.5px solid #e11d48"
                      : "1.5px solid #adc4af",
                    background:
                      calendarType === "solar" ? "#c1d8c3" : "#ffffff",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#1a2e0e",
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
                    padding: "8px 10px",
                    borderRadius: 14,
                    border: errors.calendar
                      ? "1.5px solid #e11d48"
                      : "1.5px solid #adc4af",
                    background:
                      calendarType === "lunar" ? "#c1d8c3" : "#ffffff",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#1a2e0e",
                  }}
                >
                  음력
                </button>
              </div>
            </div>

            {/* 6. 성별 (필수) */}
            <div>
              <label
                style={{
                  fontSize: 13,
                  color: "#1a2e0e",
                  marginBottom: 6,
                  display: "block",
                }}
              >
                성별{" "}
                <span style={{ color: "#e11d48", fontWeight: 700 }}>＊</span>
              </label>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  className="tap sans"
                  onClick={() => setGender("male")}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    borderRadius: 14,
                    border: errors.gender
                      ? "1.5px solid #e11d48"
                      : "1.5px solid #adc4af",
                    background: gender === "male" ? "#c1d8c3" : "#ffffff",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#1a2e0e",
                  }}
                >
                  남자
                </button>
                <button
                  type="button"
                  className="tap sans"
                  onClick={() => setGender("female")}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    borderRadius: 14,
                    border: errors.gender
                      ? "1.5px solid #e11d48"
                      : "1.5px solid #adc4af",
                    background: gender === "female" ? "#c1d8c3" : "#ffffff",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#1a2e0e",
                  }}
                >
                  여자
                </button>
              </div>
            </div>
          </div>

          {errors.global && (
            <p
              style={{
                marginTop: 10,
                fontSize: 12,
                color: "#e11d48",
              }}
            >
              필수 항목을 입력해주세요.
            </p>
          )}

          {/* 7. 하단 버튼들 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginTop: 18,
            }}
          >
            <button
              type="button"
              onClick={handleSave}
              className="tap sans"
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 14,
                border: "1.5px solid #adc4af",
                background: "#c1d8c3",
                fontSize: 14,
                fontWeight: 700,
                color: "#1a2e0e",
              }}
            >
              저장하기
            </button>

            <button
              type="button"
              onClick={goList}
              className="tap sans"
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 14,
                border: "1.5px solid #adc4af",
                background: "#ffffff",
                fontSize: 14,
                fontWeight: 700,
                color: "#1a2e0e",
              }}
            >
              취소
            </button>

            <button
              type="button"
              onClick={goList}
              className="sans"
              style={{
                marginTop: 4,
                padding: 6,
                border: "none",
                background: "transparent",
                fontSize: 13,
                fontWeight: 600,
                color: "#556b2f",
                textDecoration: "underline",
              }}
            >
              사주 목록으로 돌아가기
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
            background: "rgba(0,0,0,0.5)",
          }}
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="sans"
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 24,
              width: "100%",
              maxWidth: 360,
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="confirm-modal-title"
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#1a2e0e",
                marginBottom: 16,
              }}
            >
              입력 내용을 확인해주세요
            </h2>
            <dl
              style={{
                margin: 0,
                fontSize: 14,
                color: "#1a2e0e",
                lineHeight: 1.7,
              }}
            >
              <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <dt style={{ margin: 0, minWidth: 90, color: "#556b2f" }}>이름</dt>
                <dd style={{ margin: 0 }}>{name || "-"}</dd>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <dt style={{ margin: 0, minWidth: 90, color: "#556b2f" }}>나와의 관계</dt>
                <dd style={{ margin: 0 }}>{relation || "-"}</dd>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <dt style={{ margin: 0, minWidth: 90, color: "#556b2f" }}>생년월일</dt>
                <dd style={{ margin: 0 }}>{birthdateDisplay} ({calendarLabel})</dd>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <dt style={{ margin: 0, minWidth: 90, color: "#556b2f" }}>태어난 시간</dt>
                <dd style={{ margin: 0 }}>{timeDisplay}</dd>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <dt style={{ margin: 0, minWidth: 90, color: "#556b2f" }}>성별</dt>
                <dd style={{ margin: 0 }}>{genderDisplay}</dd>
              </div>
            </dl>
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 20,
              }}
            >
              <button
                type="button"
                className="tap sans"
                onClick={() => setShowConfirmModal(false)}
                style={{
                  flex: 1,
                  padding: "11px 14px",
                  borderRadius: 14,
                  border: "1.5px solid #adc4af",
                  background: "#ffffff",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#1a2e0e",
                }}
              >
                수정하기
              </button>
              <button
                type="button"
                className="tap sans"
                onClick={handleConfirmSave}
                style={{
                  flex: 1,
                  padding: "11px 14px",
                  borderRadius: 14,
                  border: "1.5px solid #adc4af",
                  background: "#c1d8c3",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#1a2e0e",
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

