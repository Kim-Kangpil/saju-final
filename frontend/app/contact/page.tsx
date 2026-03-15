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

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-[450px]">
                {/* 타이틀 */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
                        문의하기
                    </h1>
                    <p className="text-sm text-[var(--text-primary)] opacity-70">
                        궁금한 점이나 건의사항을 남겨주세요
                    </p>
                </div>

                {/* 문의 폼 카드 */}
                <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border-4 border-[#c1d8c3]">
                    {/* 성공 메시지 */}
                    {submitSuccess && (
                        <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                            <p className="text-green-700 font-semibold text-center">
                                ✅ 문의가 성공적으로 전송되었습니다!
                            </p>
                            <p className="text-sm text-green-600 mt-1 text-center">
                                빠른 시일 내에 답변 드리겠습니다.
                            </p>
                        </div>
                    )}

                    {submitError && (
                        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                            <p className="text-red-700 font-semibold text-center">{submitError}</p>
                        </div>
                    )}

                    {/* 문의 폼 */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* 이름 */}
                        <div>
                            <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                                이름 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 text-base border-2 border-[#c1d8c3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] text-[var(--text-primary)] touch-manipulation"
                                placeholder="홍길동"
                            />
                        </div>

                        {/* 이메일 */}
                        <div>
                            <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                                이메일 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 text-base border-2 border-[#c1d8c3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] text-[var(--text-primary)] touch-manipulation"
                                placeholder="example@email.com"
                            />
                        </div>

                        {/* 문의 유형 */}
                        <div>
                            <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                                문의 유형 <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 text-base border-2 border-[#c1d8c3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] text-[var(--text-primary)] touch-manipulation"
                            >
                                <option value="">선택하세요</option>
                                <option value="service">서비스 이용 문의</option>
                                <option value="technical">기술적 문제</option>
                                <option value="billing">결제 관련</option>
                                <option value="suggestion">건의사항</option>
                                <option value="other">기타</option>
                            </select>
                        </div>

                        {/* 문의 내용 */}
                        <div>
                            <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                                문의 내용 <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={6}
                                className="w-full px-4 py-3 text-base border-2 border-[#c1d8c3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] text-[var(--text-primary)] resize-none touch-manipulation"
                                placeholder="자세한 문의 내용을 입력해주세요"
                            />
                        </div>

                        {/* 제출 버튼 */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg touch-manipulation ${isSubmitting
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-[#f4e5a1] text-[var(--text-primary)] hover:bg-[#f0d97f]"
                                }`}
                        >
                            {isSubmitting ? "전송 중..." : "문의 보내기"}
                        </button>
                    </form>

                    {/* 하단 안내 */}
                    <div className="mt-6 pt-6 border-t-2 border-[#c1d8c3]">
                        <div className="bg-[#f5f5dc] rounded-xl p-4">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">
                                📧 직접 이메일 보내기
                            </h3>
                            <p className="text-xs text-[var(--text-primary)] opacity-70 mb-1">
                                이메일: <a href="mailto:ksh00922@gmail.com" className="underline">ksh00922@gmail.com</a>
                            </p>
                            <p className="text-xs text-[var(--text-primary)] opacity-70">
                                평일 09:00 - 18:00 (주말 및 공휴일 제외)
                            </p>
                        </div>

                        <div className="mt-4 text-center">
                            <Link
                                href="/home"
                                className="text-sm text-[var(--text-primary)] hover:underline"
                            >
                                ← 홈으로 돌아가기
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
