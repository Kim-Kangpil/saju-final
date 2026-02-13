"use client";

import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-[450px]">
                {/* 타이틀 */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#556b2f] mb-2">
                        이용약관
                    </h1>
                    <p className="text-sm text-[#556b2f] opacity-70">
                        최종 수정일: 2026년 2월 11일
                    </p>
                </div>

                {/* 본문 카드 */}
                <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border-4 border-[#c1d8c3]">
                    <div className="space-y-6 text-[#556b2f]">
                        {/* 제1조 */}
                        <section>
                            <h2 className="text-lg font-bold mb-3">제1조 (목적)</h2>
                            <p className="text-sm leading-relaxed">
                                본 약관은 사주 분석 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                            </p>
                        </section>

                        {/* 제2조 */}
                        <section>
                            <h2 className="text-lg font-bold mb-3">제2조 (서비스의 제공)</h2>
                            <p className="text-sm leading-relaxed mb-2">
                                회사는 다음과 같은 서비스를 제공합니다:
                            </p>
                            <ul className="list-disc list-inside text-sm leading-relaxed space-y-1 ml-4">
                                <li>사주팔자 분석 및 해석</li>
                                <li>음양오행 에너지 분석</li>
                                <li>일주 동물 분석 및 성격 해석</li>
                                <li>AI 기반 맞춤형 사주 해석</li>
                            </ul>
                        </section>

                        {/* 제3조 */}
                        <section>
                            <h2 className="text-lg font-bold mb-3">제3조 (회원가입)</h2>
                            <p className="text-sm leading-relaxed">
                                서비스 이용을 위해서는 회원가입이 필요하며, 이용자는 정확한 정보를 제공해야 합니다. 허위 정보 제공 시 서비스 이용이 제한될 수 있습니다.
                            </p>
                        </section>

                        {/* 제4조 */}
                        <section>
                            <h2 className="text-lg font-bold mb-3">제4조 (개인정보 보호)</h2>
                            <p className="text-sm leading-relaxed">
                                회사는 이용자의 개인정보를 관련 법령에 따라 안전하게 보호하며, 생년월일 및 시간 정보는 사주 분석 목적으로만 사용됩니다. 자세한 내용은 개인정보처리방침을 참조하시기 바랍니다.
                            </p>
                        </section>

                        {/* 제5조 */}
                        <section>
                            <h2 className="text-lg font-bold mb-3">제5조 (서비스의 변경 및 중단)</h2>
                            <p className="text-sm leading-relaxed">
                                회사는 서비스 개선을 위해 내용을 변경하거나 일시 중단할 수 있으며, 사전 공지를 통해 이용자에게 알립니다.
                            </p>
                        </section>

                        {/* 제6조 */}
                        <section>
                            <h2 className="text-lg font-bold mb-3">제6조 (이용자의 의무)</h2>
                            <p className="text-sm leading-relaxed mb-2">
                                이용자는 다음 행위를 해서는 안 됩니다:
                            </p>
                            <ul className="list-disc list-inside text-sm leading-relaxed space-y-1 ml-4">
                                <li>타인의 정보 도용</li>
                                <li>서비스의 부정 이용</li>
                                <li>저작권 침해 행위</li>
                                <li>서비스 운영 방해 행위</li>
                            </ul>
                        </section>

                        {/* 제7조 */}
                        <section>
                            <h2 className="text-lg font-bold mb-3">제7조 (면책사항)</h2>
                            <p className="text-sm leading-relaxed">
                                본 서비스의 사주 분석 결과는 참고용이며, 회사는 이를 기반으로 한 이용자의 의사결정에 대해 책임을 지지 않습니다. 사주는 전통적인 해석 방법을 따르며, 과학적 근거가 아닌 문화적 관습임을 명시합니다.
                            </p>
                        </section>

                        {/* 제8조 */}
                        <section>
                            <h2 className="text-lg font-bold mb-3">제8조 (분쟁 해결)</h2>
                            <p className="text-sm leading-relaxed">
                                서비스 이용과 관련한 분쟁은 대한민국 법률에 따르며, 관할 법원은 회사의 소재지를 기준으로 합니다.
                            </p>
                        </section>
                    </div>

                    {/* 하단 버튼 */}
                    <div className="mt-8 pt-6 border-t-2 border-[#c1d8c3] flex justify-center">
                        <Link
                            href="/home"
                            className="px-6 py-3 bg-[#f4e5a1] text-[#556b2f] rounded-xl font-bold hover:bg-[#f0d97f] transition-colors shadow-lg"
                        >
                            홈으로 돌아가기
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
