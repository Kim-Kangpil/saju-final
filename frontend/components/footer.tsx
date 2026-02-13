"use client";

import Link from "next/link";

export default function Footer() {
    return (
        <footer className="w-full bg-gradient-to-b from-transparent to-[#f8f4e6] py-6 sm:py-8 px-4 sm:px-6 mt-8">
            <div className="max-w-[450px] mx-auto">
                {/* 사업자 정보 섹션 */}
                <div className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs text-gray-600 text-center mb-3 sm:mb-4">
                    <p className="leading-relaxed">
                        <span className="font-semibold">상호명:</span> 한양사주
                        <span className="hidden sm:inline"> | </span>
                        <span className="block sm:inline mt-0.5 sm:mt-0">
                            <span className="font-semibold">대표자:</span> 김강필
                        </span>
                    </p>
                    <p className="leading-relaxed">
                        <span className="font-semibold">사업자등록번호:</span>{" "}
                        <span className="font-mono">889-28-01406</span>
                    </p>
                    <p className="leading-relaxed px-2 sm:px-0">
                        <span className="font-semibold">주소:</span> 경기도 안산시 상록구 학사4길 9-1, 302호(사동, 쁘띠메종)
                    </p>
                    <p className="leading-relaxed">
                        <span className="font-semibold">이메일:</span>{" "}
                        <a
                            href="mailto:kkp00922@gmail.com"
                            className="text-blue-600 hover:text-blue-800 underline break-all"
                        >
                            kkp00922@gmail.com
                        </a>
                    </p>
                </div>

                {/* 하단 링크 - Next.js Link로 변경 */}
                <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-600 mb-2 sm:mb-3 border-t border-gray-300 pt-2 sm:pt-3">
                    <Link href="/privacy" className="hover:text-gray-900 hover:underline whitespace-nowrap">
                        개인정보 처리방침
                    </Link>
                    <span className="text-gray-400">|</span>
                    <Link href="/terms" className="hover:text-gray-900 hover:underline whitespace-nowrap">
                        이용약관
                    </Link>
                    <span className="text-gray-400">|</span>
                    <Link href="/contact" className="hover:text-gray-900 hover:underline whitespace-nowrap">
                        문의하기
                    </Link>
                </div>

                {/* 저작권 */}
                <div className="text-center">
                    <p className="text-[9px] sm:text-[10px] text-gray-500">
                        © 2026 한양사주. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}