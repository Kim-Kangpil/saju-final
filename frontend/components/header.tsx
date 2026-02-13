"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Header() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn');
        setIsLoggedIn(loggedIn === 'true');
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loginType');
        setIsLoggedIn(false);
        alert('로그아웃되었습니다.');
        router.push('/home'); // ✅ / → /home 변경
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#c1d8c3] border-b-4 border-[#adc4af] shadow-lg">
            <div className="w-full max-w-[450px] mx-auto px-4 py-3 flex items-center justify-between">
                {/* ✅ 로고 클릭 시 /home으로 */}
                <button
                    onClick={() => router.push('/home')}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                    <img
                        src="/images/ham_icon.png"
                        alt="햄스터"
                        className="w-10 h-10 object-contain"
                    />
                    <span className="text-base font-bold text-[#556b2f]">한양사주</span>
                </button>

                {/* 오른쪽: 로그인/회원가입 또는 사주보기/로그아웃 */}
                <div className="flex items-center gap-2">
                    {isLoggedIn ? (
                        <>
                            {/* ✅ 사주보기 버튼 추가 */}
                            <button
                                onClick={() => router.push('/')}
                                className="px-3 py-2 text-sm font-bold text-[#556b2f] bg-white/50 hover:bg-white rounded-lg transition-colors"
                            >
                                사주보기
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-3 py-2 text-sm font-bold text-[#556b2f] bg-white/50 hover:bg-white rounded-lg transition-colors"
                            >
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => router.push('/login')}
                                className="px-3 py-2 text-sm font-bold text-[#556b2f] bg-white/50 hover:bg-white rounded-lg transition-colors"
                            >
                                로그인
                            </button>
                            <button
                                onClick={() => router.push('/signup')}
                                className="px-3 py-2 text-sm font-bold bg-[#556b2f] text-white rounded-lg hover:bg-[#6d8b3a] transition-colors"
                            >
                                회원가입
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}