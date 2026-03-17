"use client";

import { use, useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://saju-backend-eqd6.onrender.com";

export default function ContactPage({
  params,
}: { params?: Promise<Record<string, string | string[]>> } = {}) {
  use(params ?? Promise.resolve({}));
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 한양사주 디자인 토큰 (add 페이지 톤과 맞춤)
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
  } as const;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject || "기타",
          message: formData.message,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setSubmitError(data.detail || "문의 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
      if (data?.ok) {
        setSubmitSuccess(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setSubmitSuccess(false), 4000);
      } else {
        setSubmitError("문의 전송에 실패했습니다.");
      }
    } catch {
      setSubmitError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const messageLen = (formData.message || "").trim().length;
  const isValid =
    formData.name.trim().length >= 2 &&
    formData.email.trim().length >= 5 &&
    !!formData.subject &&
    messageLen >= 10;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: S.cream,
        backgroundImage: "url('/images/hanji-bg.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
        padding: "22px 16px 28px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420, margin: "0 auto" }}>
        {/* 헤더 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
            padding: "6px 2px",
          }}
        >
          <Link
            href="/home"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              borderRadius: 999,
              border: `1px solid ${S.beige}`,
              background: "rgba(255,255,255,0.55)",
              color: S.ink2,
              fontSize: 12,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            ← 홈
          </Link>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", color: S.gold }}>
              CONTACT
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: S.ink, letterSpacing: "-0.02em" }}>
              문의하기
            </div>
          </div>
        </div>

        {/* 카드 */}
        <div
          style={{
            position: "relative",
            background: "#fff",
            borderRadius: 18,
            border: `1px solid ${S.beige}`,
            boxShadow: "0 10px 40px rgba(44,36,23,0.10)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "url('/images/hanji-bg.png')",
              backgroundRepeat: "repeat",
              backgroundSize: "auto",
              opacity: 0.05,
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", padding: "18px 16px 16px" }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: S.ink, marginBottom: 4 }}>
                빠르게 답변드릴게요
              </div>
              <div style={{ fontSize: 12, color: S.ink3, lineHeight: 1.6 }}>
                서비스 이용 중 불편했던 점, 개선 아이디어, 오류 제보 모두 좋아요.
              </div>
            </div>

            {submitSuccess && (
              <div
                style={{
                  marginBottom: 12,
                  borderRadius: 14,
                  border: "1px solid rgba(45,106,79,0.35)",
                  background: "rgba(45,106,79,0.06)",
                  padding: "12px 12px",
                  color: S.ink2,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 2 }}>전송 완료</div>
                <div style={{ fontSize: 12, color: S.ink3, lineHeight: 1.5 }}>
                  확인 후 최대한 빠르게 답변드릴게요.
                </div>
              </div>
            )}

            {submitError && (
              <div
                style={{
                  marginBottom: 12,
                  borderRadius: 14,
                  border: "1px solid rgba(139,32,32,0.28)",
                  background: "rgba(139,32,32,0.06)",
                  padding: "12px 12px",
                  color: S.ink2,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 800, color: "#8B2020" }}>{submitError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: S.ink2, marginBottom: 6 }}>
                    이름 <span style={{ color: "#8B2020" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="홍길동"
                    style={{
                      width: "100%",
                      padding: "12px 12px",
                      borderRadius: 12,
                      border: `1px solid ${S.beige}`,
                      background: S.cream,
                      color: S.ink,
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: S.ink2, marginBottom: 6 }}>
                    이메일 <span style={{ color: "#8B2020" }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="example@email.com"
                    style={{
                      width: "100%",
                      padding: "12px 12px",
                      borderRadius: 12,
                      border: `1px solid ${S.beige}`,
                      background: S.cream,
                      color: S.ink,
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: S.ink2, marginBottom: 6 }}>
                  문의 유형 <span style={{ color: "#8B2020" }}>*</span>
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 12px",
                    borderRadius: 12,
                    border: `1px solid ${S.beige}`,
                    background: S.cream,
                    color: S.ink,
                    fontSize: 14,
                    outline: "none",
                  }}
                >
                  <option value="">선택하세요</option>
                  <option value="서비스 이용 문의">서비스 이용 문의</option>
                  <option value="오류/버그 제보">오류/버그 제보</option>
                  <option value="결제/환불">결제/환불</option>
                  <option value="건의사항">건의사항</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, fontWeight: 800, color: S.ink2, marginBottom: 6 }}>
                  <span>
                    문의 내용 <span style={{ color: "#8B2020" }}>*</span>
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: messageLen < 10 ? S.ink3 : S.gold }}>
                    {messageLen}/1000
                  </span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={7}
                  placeholder="어떤 상황에서 문제가 발생했는지, 화면/기기/브라우저 정보를 함께 적어주시면 더 빨리 해결할 수 있어요."
                  style={{
                    width: "100%",
                    padding: "12px 12px",
                    borderRadius: 12,
                    border: `1px solid ${S.beige}`,
                    background: S.cream,
                    color: S.ink,
                    fontSize: 14,
                    outline: "none",
                    resize: "none",
                    lineHeight: 1.6,
                  }}
                  maxLength={1000}
                />
                {messageLen > 0 && messageLen < 10 && (
                  <div style={{ marginTop: 6, fontSize: 11, color: S.ink3 }}>
                    내용은 최소 10자 이상 적어주세요.
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                style={{
                  width: "100%",
                  padding: "14px 12px",
                  borderRadius: 14,
                  border: "none",
                  cursor: isSubmitting || !isValid ? "not-allowed" : "pointer",
                  background: isSubmitting || !isValid ? S.cream3 : S.gold,
                  color: isSubmitting || !isValid ? S.ink3 : "#fff",
                  fontSize: 14,
                  fontWeight: 900,
                  letterSpacing: "-0.01em",
                  boxShadow: isSubmitting || !isValid ? "none" : "0 10px 24px rgba(139,115,85,0.25)",
                  transition: "transform .08s ease, filter .15s ease",
                }}
              >
                {isSubmitting ? "전송 중..." : "문의 보내기"}
              </button>
            </form>

            {/* 안내 카드 */}
            <div
              style={{
                marginTop: 14,
                borderRadius: 16,
                border: `1px solid ${S.beige}`,
                background: S.cream2,
                padding: "12px 12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: S.ink, marginBottom: 2 }}>
                    직접 이메일로도 가능해요
                  </div>
                  <div style={{ fontSize: 12, color: S.ink3, lineHeight: 1.5 }}>
                    <a href="mailto:ksh00922@gmail.com" style={{ color: S.ink2, textDecoration: "underline", fontWeight: 800 }}>
                      ksh00922@gmail.com
                    </a>
                    <div style={{ fontSize: 11, marginTop: 3 }}>
                      평일 09:00–18:00 (주말/공휴일 제외)
                    </div>
                  </div>
                </div>
                <div
                  aria-hidden
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    border: `1px solid ${S.beige}`,
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: S.gold,
                    fontSize: 18,
                    fontWeight: 900,
                  }}
                >
                  ✉
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, textAlign: "center", fontSize: 12, color: S.ink3 }}>
          전송 후 1–2영업일 내에 답변 드릴게요.
        </div>
      </div>
    </div>
  );
}
