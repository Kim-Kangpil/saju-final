"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[450px]">
        {/* 타이틀 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#556b2f] mb-2">
            개인정보처리방침
          </h1>
          <p className="text-sm text-[#556b2f] opacity-70">
            최종 수정일: 2026년 2월 11일
          </p>
        </div>

        {/* 본문 카드 */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border-4 border-[#c1d8c3]">
          <div className="space-y-6 text-[#556b2f]">
            {/* 1. 수집하는 개인정보 */}
            <section>
              <h2 className="text-lg font-bold mb-3">1. 수집하는 개인정보</h2>
              <p className="text-sm leading-relaxed mb-2">
                회사는 서비스 제공을 위해 다음의 개인정보를 수집합니다:
              </p>
              <ul className="list-disc list-inside text-sm leading-relaxed space-y-1 ml-4">
                <li>필수 정보: 이메일, 비밀번호, 생년월일, 출생시간</li>
                <li>선택 정보: 성별, 출생지</li>
              </ul>
            </section>

            {/* 2. 이용 목적 */}
            <section>
              <h2 className="text-lg font-bold mb-3">2. 개인정보의 이용 목적</h2>
              <ul className="list-disc list-inside text-sm leading-relaxed space-y-1 ml-4">
                <li>사주팔자 분석 및 맞춤형 해석 제공</li>
                <li>서비스 이용 기록 관리</li>
                <li>고객 문의 응대 및 공지사항 전달</li>
              </ul>
            </section>

            {/* 3. 보유 기간 */}
            <section>
              <h2 className="text-lg font-bold mb-3">3. 개인정보의 보유 및 이용기간</h2>
              <p className="text-sm leading-relaxed">
                회원 탈퇴 시까지 보유하며, 탈퇴 후 즉시 파기합니다. 단, 관련 법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.
              </p>
            </section>

            {/* 4. 제3자 제공 */}
            <section>
              <h2 className="text-lg font-bold mb-3">4. 개인정보의 제3자 제공</h2>
              <p className="text-sm leading-relaxed">
                회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 단, 법령에 의하거나 이용자의 동의가 있는 경우 예외로 합니다.
              </p>
            </section>

            {/* 5. 이용자의 권리 */}
            <section>
              <h2 className="text-lg font-bold mb-3">5. 이용자의 권리</h2>
              <p className="text-sm leading-relaxed">
                이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며, 가입 해지를 요청할 수 있습니다.
              </p>
            </section>

            {/* 6. 개인정보 보호책임자 */}
            <section>
              <h2 className="text-lg font-bold mb-3">6. 개인정보 보호책임자</h2>
              <p className="text-sm leading-relaxed">
                성명: 김강필<br />
                이메일: kkp00922@gmail.com<br />
                소속: 한양사주
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