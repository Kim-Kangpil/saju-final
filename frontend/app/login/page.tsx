'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    useEffect(() => {
        // Kakao SDK 로드
        const script = document.createElement('script');
        script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            if (window.Kakao && !window.Kakao.isInitialized()) {
                // 여기에 카카오 JavaScript 키 입력
                window.Kakao.init('YOUR_JAVASCRIPT_KEY');
            }
        };

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 실제로는 여기서 API 호출
        localStorage.setItem('isLoggedIn', 'true');
        alert('로그인 성공!');
        router.push('/');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleKakaoLogin = () => {
        if (typeof window !== 'undefined' && window.Kakao) {
            window.Kakao.Auth.login({
                success: (authObj: any) => {
                    console.log('Kakao login success:', authObj);
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('loginType', 'kakao');
                    alert('카카오 로그인 성공!');
                    router.push('/');
                },
                fail: (err: any) => {
                    console.error('Kakao login failed:', err);
                    alert('카카오 로그인에 실패했습니다.');
                },
            });
        } else {
            alert('카카오 SDK를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        }
    };

    return (

        <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-yellow-50 flex items-center justify-center">
            <div className="container mx-auto px-4 py-6 sm:py-12">
                <div className="max-w-md mx-auto">
                    <div className="text-center mb-8 sm:mb-12">
                        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-3 sm:mb-4">
                            로그인
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600">
                            나만의 사주 풀이를 확인하세요
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10">
                        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    이메일
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="example@email.com"
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-base"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    비밀번호
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="비밀번호를 입력하세요"
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-base"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                                    />
                                    <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
                                        로그인 상태 유지
                                    </span>
                                </label>
                                <a href="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                                    비밀번호 찾기
                                </a>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-bold text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl active:scale-95 sm:hover:scale-[1.02] transition-all"
                            >
                                로그인
                            </button>

                            <div className="relative py-3 sm:py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">간편 로그인</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleKakaoLogin}
                                className="w-full py-3.5 sm:py-4 bg-[#FEE500] hover:bg-[#FDD835] active:bg-[#FDD835] text-gray-800 font-bold text-base sm:text-lg rounded-xl shadow-md hover:shadow-lg active:scale-95 sm:hover:scale-[1.02] transition-all flex items-center justify-center gap-2 sm:gap-3"
                            >
                                <svg width="20" height="20" viewBox="0 0 18 18" fill="none" className="sm:w-6 sm:h-6">
                                    <path d="M9 0C4.03 0 0 3.34 0 7.47C0 10.07 1.57 12.35 4.03 13.69L3.12 17.25C3.06 17.47 3.29 17.64 3.48 17.52L7.66 14.97C8.1 15.02 8.55 15.05 9 15.05C13.97 15.05 18 11.71 18 7.58C18 3.45 13.97 0 9 0Z" fill="#3C1E1E" />
                                </svg>
                                카카오 로그인
                            </button>
                        </form>

                        <div className="mt-6 sm:mt-8 text-center">
                            <p className="text-sm text-gray-600">
                                아직 회원이 아니신가요?{' '}
                                <a href="/signup" className="text-purple-600 font-semibold hover:text-purple-700 underline">
                                    회원가입
                                </a>
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
                            ← 메인으로 돌아가기
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

declare global {
    interface Window {
        Kakao: any;
    }
}