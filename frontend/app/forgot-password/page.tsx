'use client';

import { useState } from 'react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-yellow-50 flex items-center justify-center">
                <div className="container mx-auto px-4">
                    <div className="max-w-md mx-auto">
                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-8 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">이메일을 확인하세요</h2>
                            <p className="text-gray-600 mb-6">
                                {email}로 비밀번호 재설정 링크를 보냈습니다.
                            </p>
                            <a
                                href="/login"
                                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                            >
                                로그인으로 돌아가기
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-yellow-50 flex items-center justify-center">
            <div className="container mx-auto px-4 py-6 sm:py-12">
                <div className="max-w-md mx-auto">
                    <div className="text-center mb-8 sm:mb-12">
                        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-3 sm:mb-4">
                            비밀번호 찾기
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600">
                            가입하신 이메일 주소를 입력해주세요
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@email.com"
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-base"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    * 비밀번호 재설정 링크를 보내드립니다
                                </p>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-bold text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl active:scale-95 sm:hover:scale-[1.02] transition-all"
                            >
                                재설정 링크 보내기
                            </button>

                            <div className="text-center">
                                <a href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                                    ← 로그인으로 돌아가기
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}