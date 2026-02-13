'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    calendarType: 'solar',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    birthHour: '',
    birthMinute: '',
    timeUnknown: false,
    gender: '',
    agreePrivacy: false,
    agreeTerms: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('회원가입이 완료되었습니다!');
    window.location.href = '/login';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md">
        {/* 로고/타이틀 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#556b2f] mb-2">
            회원가입
          </h1>
          <p className="text-sm sm:text-base text-[#556b2f] opacity-70">
            한양사주에 오신 것을 환영합니다
          </p>
        </div>

        {/* 회원가입 폼 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-[#d4a373]">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* 이메일 입력 */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#556b2f] mb-2"
              >
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 sm:py-4 text-base border-2 border-[#d4a373] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#556b2f] text-[#556b2f] touch-manipulation"
                placeholder="example@email.com"
              />
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#556b2f] mb-2"
              >
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-3 sm:py-4 text-base border-2 border-[#d4a373] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#556b2f] text-[#556b2f] touch-manipulation"
                placeholder="8자 이상"
              />
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label
                htmlFor="passwordConfirm"
                className="block text-sm font-semibold text-[#556b2f] mb-2"
              >
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="passwordConfirm"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 sm:py-4 text-base border-2 border-[#d4a373] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#556b2f] text-[#556b2f] touch-manipulation"
                placeholder="비밀번호 재입력"
              />
            </div>

            {/* 이름 입력 */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-[#556b2f] mb-2"
              >
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 sm:py-4 text-base border-2 border-[#d4a373] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#556b2f] text-[#556b2f] touch-manipulation"
                placeholder="홍길동"
              />
            </div>

            {/* ✅ 1. 양력/음력 선택 - 선택 시 확실하게 표시 */}
            <div>
              <label className="block text-sm font-semibold text-[#556b2f] mb-2">
                양력/음력 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, calendarType: 'solar' }))}
                  className={formData.calendarType === 'solar'
                    ? 'py-3 border-2 border-[#556b2f] bg-[#556b2f] text-white rounded-xl text-center font-semibold transition-all shadow-md touch-manipulation'
                    : 'py-3 border-2 border-[#d4a373] bg-white text-[#556b2f] opacity-60 rounded-xl text-center transition-all touch-manipulation hover:opacity-100'
                  }
                >
                  양력
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, calendarType: 'lunar' }))}
                  className={formData.calendarType === 'lunar'
                    ? 'py-3 border-2 border-[#556b2f] bg-[#556b2f] text-white rounded-xl text-center font-semibold transition-all shadow-md touch-manipulation'
                    : 'py-3 border-2 border-[#d4a373] bg-white text-[#556b2f] opacity-60 rounded-xl text-center transition-all touch-manipulation hover:opacity-100'
                  }
                >
                  음력
                </button>
              </div>
            </div>

            {/* ✅ 2. 생년월일 입력 - 세로 너비 축소 */}
            <div>
              <label className="block text-sm font-semibold text-[#556b2f] mb-2">
                생년월일 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {/* 년 */}
                <div className="flex-1">
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="birthYear"
                    value={formData.birthYear}
                    onChange={handleChange}
                    placeholder="1990"
                    required
                    maxLength={4}
                    className="w-full px-3 py-2.5 text-sm text-center border-2 border-[#d4a373] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#556b2f] text-[#556b2f] touch-manipulation"
                  />
                </div>
                <span className="text-sm text-[#556b2f] font-medium">년</span>

                {/* 월 */}
                <div className="flex-1">
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="birthMonth"
                    value={formData.birthMonth}
                    onChange={handleChange}
                    placeholder="01"
                    required
                    maxLength={2}
                    className="w-full px-3 py-2.5 text-sm text-center border-2 border-[#d4a373] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#556b2f] text-[#556b2f] touch-manipulation"
                  />
                </div>
                <span className="text-sm text-[#556b2f] font-medium">월</span>

                {/* 일 */}
                <div className="flex-1">
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="birthDay"
                    value={formData.birthDay}
                    onChange={handleChange}
                    placeholder="01"
                    required
                    maxLength={2}
                    className="w-full px-3 py-2.5 text-sm text-center border-2 border-[#d4a373] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#556b2f] text-[#556b2f] touch-manipulation"
                  />
                </div>
                <span className="text-sm text-[#556b2f] font-medium">일</span>
              </div>
            </div>

            {/* ✅ 3. 태어난 시간 입력 - 자연스러운 크기 */}
            <div>
              <label className="block text-sm font-semibold text-[#556b2f] mb-2">
                태어난 시간
              </label>
              <div className="flex items-center gap-2">
                {/* 시 */}
                <div className="w-24">
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="birthHour"
                    value={formData.birthHour}
                    onChange={handleChange}
                    placeholder="09"
                    required={!formData.timeUnknown}
                    disabled={formData.timeUnknown}
                    maxLength={2}
                    className="w-full px-3 py-2.5 text-sm text-center border-2 border-[#d4a373] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#556b2f] text-[#556b2f] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed touch-manipulation"
                  />
                </div>
                <span className="text-sm text-[#556b2f] font-medium">시</span>

                {/* 분 */}
                <div className="w-24">
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="birthMinute"
                    value={formData.birthMinute}
                    onChange={handleChange}
                    placeholder="30"
                    required={!formData.timeUnknown}
                    disabled={formData.timeUnknown}
                    maxLength={2}
                    className="w-full px-3 py-2.5 text-sm text-center border-2 border-[#d4a373] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#556b2f] text-[#556b2f] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed touch-manipulation"
                  />
                </div>
                <span className="text-sm text-[#556b2f] font-medium">분</span>

                {/* 모름 체크박스 */}
                <label className="flex items-center gap-2 ml-2 cursor-pointer touch-manipulation">
                  <input
                    type="checkbox"
                    name="timeUnknown"
                    checked={formData.timeUnknown}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#556b2f] border-[#d4a373] rounded focus:ring-[#556b2f] cursor-pointer"
                  />
                  <span className="text-sm text-[#556b2f] whitespace-nowrap">
                    모름
                  </span>
                </label>
              </div>
              <p className="text-xs text-[#556b2f] opacity-60 mt-2">
                * 사주 풀이를 위해 정확한 생년월일과 시간이 필요합니다
              </p>
            </div>

            {/* ✅ 1. 성별 선택 - 선택 시 확실하게 표시 */}
            <div>
              <label className="block text-sm font-semibold text-[#556b2f] mb-2">
                성별 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={handleChange}
                    required
                    className="sr-only"
                  />
                  <div className={formData.gender === 'male'
                    ? 'py-3 sm:py-4 border-2 border-[#556b2f] bg-[#556b2f] text-white rounded-xl text-center font-semibold transition-all shadow-md touch-manipulation'
                    : 'py-3 sm:py-4 border-2 border-[#d4a373] bg-white text-[#556b2f] opacity-60 rounded-xl text-center transition-all touch-manipulation hover:opacity-100'
                  }>
                    <span className="text-base sm:text-lg">
                      남성
                    </span>
                  </div>
                </label>
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={handleChange}
                    required
                    className="sr-only"
                  />
                  <div className={formData.gender === 'female'
                    ? 'py-3 sm:py-4 border-2 border-[#556b2f] bg-[#556b2f] text-white rounded-xl text-center font-semibold transition-all shadow-md touch-manipulation'
                    : 'py-3 sm:py-4 border-2 border-[#d4a373] bg-white text-[#556b2f] opacity-60 rounded-xl text-center transition-all touch-manipulation hover:opacity-100'
                  }>
                    <span className="text-base sm:text-lg">
                      여성
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* 약관 동의 */}
            <div className="bg-[#faf8f3] rounded-xl p-4 sm:p-5 space-y-3 border border-[#d4a373]">
              <label className="flex items-start cursor-pointer group touch-manipulation">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  required
                  className="mt-1 w-5 h-5 text-[#556b2f] border-[#d4a373] rounded focus:ring-[#556b2f] cursor-pointer flex-shrink-0"
                />
                <span className="ml-3 text-sm text-[#556b2f]">
                  <span className="font-semibold">[필수]</span>{' '}
                  <Link href="/terms" className="underline hover:text-[#6d8c3a]">
                    이용약관
                  </Link>
                  에 동의합니다
                </span>
              </label>
              <label className="flex items-start cursor-pointer group touch-manipulation">
                <input
                  type="checkbox"
                  name="agreePrivacy"
                  checked={formData.agreePrivacy}
                  onChange={handleChange}
                  required
                  className="mt-1 w-5 h-5 text-[#556b2f] border-[#d4a373] rounded focus:ring-[#556b2f] cursor-pointer flex-shrink-0"
                />
                <span className="ml-3 text-sm text-[#556b2f]">
                  <span className="font-semibold">[필수]</span>{' '}
                  <Link href="/privacy" className="underline hover:text-[#6d8c3a]">
                    개인정보처리방침
                  </Link>
                  에 동의합니다
                </span>
              </label>
            </div>

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              className="w-full py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-colors shadow-lg touch-manipulation bg-[#556b2f] text-white hover:bg-[#6d8c3a]"
            >
              회원가입 완료
            </button>
          </form>

          {/* 로그인 링크 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#556b2f] opacity-70">
              이미 계정이 있으신가요?{' '}
              <Link
                href="/login"
                className="font-semibold text-[#556b2f] hover:underline"
              >
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
