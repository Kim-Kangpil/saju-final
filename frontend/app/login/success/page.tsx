"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSavedSajuList } from '@/lib/sajuStorage';

export default function LoginSuccess() {
  const router = useRouter();

  useEffect(() => {
    // 로그인 상태 저장
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loginType', 'kakao');
    localStorage.setItem('loginTime', new Date().toISOString());

    // 첫 로그인 여부 확인
    const isFirstLogin = localStorage.getItem('isFirstLogin') !== 'false';

    // 저장된 사주 개수 확인
    const savedSajuList = getSavedSajuList();

    setTimeout(() => {
      if (isFirstLogin || savedSajuList.length === 0) {
        // 첫 로그인 또는 저장된 사주 없음 → 메인 페이지로 (사주 입력 유도)
        localStorage.setItem('isFirstLogin', 'false');
        localStorage.setItem('showWelcome', 'true'); // 환영 메시지 플래그
        router.push('/');
      } else {
        // 재방문 + 저장된 사주 있음 → 마이페이지로
        router.push('/mypage');
      }
    }, 1500);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50 p-4">
      <div className="w-full max-w-[450px] mx-auto">
        <div className="bg-white border-4 border-[#adc4af] rounded-[24px] p-8 sm:p-12">
          <div className="text-center space-y-6">
            {/* 성공 애니메이션 */}
            <div className="relative">
              <div className="text-8xl animate-bounce">✅</div>
              <div className="absolute -top-4 -right-4 text-4xl animate-ping">✨</div>
              <div className="absolute -bottom-4 -left-4 text-4xl animate-ping" style={{ animationDelay: '0.5s' }}>✨</div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-green-600">로그인 성공!</h1>
              <p className="text-gray-600">환영합니다 🎉</p>
            </div>

            {/* 로딩 스피너 */}
            <div className="flex justify-center gap-2 mt-6">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>

            <p className="text-sm text-gray-500">페이지 이동 중...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
