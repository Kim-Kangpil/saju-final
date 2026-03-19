'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';

type FormState = {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  calendarType: 'solar' | 'lunar';
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthHour: string;
  birthMinute: string;
  timeUnknown: boolean;
  gender: '' | 'male' | 'female';
  agreePrivacy: boolean;
  agreeTerms: boolean;
};

export default function Signup({
  params,
}: { params?: Promise<Record<string, string | string[]>> } = {}) {
  use(params ?? Promise.resolve({}));

  const [formData, setFormData] = useState<FormState>({
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
  const [formError, setFormError] = useState('');

  const emailValid = /\S+@\S+\.\S+/.test(formData.email);
  const passwordValid = formData.password.length >= 8;
  const passwordMatch = formData.password && formData.password === formData.passwordConfirm;

  const birthValid = useMemo(() => {
    const y = Number(formData.birthYear);
    const m = Number(formData.birthMonth);
    const d = Number(formData.birthDay);
    if (!y || !m || !d) return false;
    if (y < 1900 || y > new Date().getFullYear()) return false;
    if (m < 1 || m > 12) return false;
    if (d < 1 || d > 31) return false;
    if (formData.timeUnknown) return true;
    const h = Number(formData.birthHour);
    const mi = Number(formData.birthMinute);
    return h >= 0 && h <= 23 && mi >= 0 && mi <= 59;
  }, [formData]);

  const requiredChecked =
    emailValid &&
    passwordValid &&
    passwordMatch &&
    formData.name.trim().length > 0 &&
    birthValid &&
    !!formData.gender &&
    formData.agreeTerms &&
    formData.agreePrivacy;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requiredChecked) {
      setFormError('입력 항목을 다시 확인해주세요. 필수값이 비어있거나 형식이 맞지 않습니다.');
      return;
    }
    setFormError('');
    alert('회원가입이 완료되었습니다!');
    window.location.href = '/start';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const numericFields = new Set([
      'birthYear',
      'birthMonth',
      'birthDay',
      'birthHour',
      'birthMinute',
    ]);
    const normalizedValue = numericFields.has(name) ? value.replace(/\D/g, '') : value;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : normalizedValue
    }));
    if (formError) setFormError('');
  };

  return (
    <main
      className="min-h-screen py-8 px-4"
      style={{
        background: 'var(--bg-base)',
        backgroundImage: "url('/images/hanji-bg.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto',
      }}
    >
      <div className="w-full max-w-md mx-auto">
        <header className="mb-6">
          <Link href="/start" className="inline-flex items-center text-sm text-[var(--text-primary)] opacity-80 hover:opacity-100">
            ← 로그인으로 돌아가기
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-[var(--text-primary)]">회원가입</h1>
          <p className="mt-1 text-sm text-[var(--text-primary)] opacity-70">
            1분이면 가입 완료. 꼭 필요한 정보만 받을게요.
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[var(--border-default)]">
          {formError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <section className="space-y-3">
              <h2 className="text-sm font-bold text-[var(--text-primary)]">계정 정보</h2>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-base border-2 border-[var(--border-default)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] text-[var(--text-primary)]"
                  placeholder="example@email.com"
                />
                {formData.email && !emailValid && (
                  <p className="mt-1 text-xs text-red-600">이메일 형식을 확인해주세요.</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
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
                  className="w-full px-4 py-3 text-base border-2 border-[var(--border-default)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] text-[var(--text-primary)]"
                  placeholder="8자 이상"
                />
                <p className={`mt-1 text-xs ${passwordValid ? 'text-emerald-600' : 'text-[var(--text-primary)] opacity-60'}`}>
                  영문/숫자 조합으로 8자 이상을 권장해요.
                </p>
              </div>

              <div>
                <label htmlFor="passwordConfirm" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                  비밀번호 확인 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="passwordConfirm"
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-base border-2 border-[var(--border-default)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] text-[var(--text-primary)]"
                  placeholder="비밀번호 재입력"
                />
                {formData.passwordConfirm && (
                  <p className={`mt-1 text-xs ${passwordMatch ? 'text-emerald-600' : 'text-red-600'}`}>
                    {passwordMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-base border-2 border-[var(--border-default)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] text-[var(--text-primary)]"
                  placeholder="홍길동"
                />
              </div>
            </section>

            <section className="space-y-3 rounded-xl border border-[var(--border-default)] p-4 bg-[#faf8f3]">
              <h2 className="text-sm font-bold text-[var(--text-primary)]">출생 정보</h2>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                  양력/음력 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, calendarType: 'solar' }))}
                    className={formData.calendarType === 'solar'
                      ? 'py-2.5 border-2 border-[var(--text-primary)] bg-[var(--text-primary)] text-white rounded-lg font-semibold'
                      : 'py-2.5 border-2 border-[var(--border-default)] bg-white text-[var(--text-primary)] rounded-lg'}
                  >
                    양력
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, calendarType: 'lunar' }))}
                    className={formData.calendarType === 'lunar'
                      ? 'py-2.5 border-2 border-[var(--text-primary)] bg-[var(--text-primary)] text-white rounded-lg font-semibold'
                      : 'py-2.5 border-2 border-[var(--border-default)] bg-white text-[var(--text-primary)] rounded-lg'}
                  >
                    음력
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                  생년월일 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    name="birthYear"
                    value={formData.birthYear}
                    onChange={handleChange}
                    placeholder="1990"
                    required
                    maxLength={4}
                    className="w-full px-3 py-2.5 text-sm text-center border-2 border-[var(--border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    name="birthMonth"
                    value={formData.birthMonth}
                    onChange={handleChange}
                    placeholder="01"
                    required
                    maxLength={2}
                    className="w-full px-3 py-2.5 text-sm text-center border-2 border-[var(--border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    name="birthDay"
                    value={formData.birthDay}
                    onChange={handleChange}
                    placeholder="01"
                    required
                    maxLength={2}
                    className="w-full px-3 py-2.5 text-sm text-center border-2 border-[var(--border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-[var(--text-primary)]">태어난 시간</label>
                  <label className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
                    <input
                      type="checkbox"
                      name="timeUnknown"
                      checked={formData.timeUnknown}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-[var(--border-default)]"
                    />
                    모름
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    name="birthHour"
                    value={formData.birthHour}
                    onChange={handleChange}
                    placeholder="시 (00~23)"
                    required={!formData.timeUnknown}
                    disabled={formData.timeUnknown}
                    maxLength={2}
                    className="w-full px-3 py-2.5 text-sm text-center border-2 border-[var(--border-default)] rounded-lg disabled:bg-gray-100 disabled:text-gray-400"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    name="birthMinute"
                    value={formData.birthMinute}
                    onChange={handleChange}
                    placeholder="분 (00~59)"
                    required={!formData.timeUnknown}
                    disabled={formData.timeUnknown}
                    maxLength={2}
                    className="w-full px-3 py-2.5 text-sm text-center border-2 border-[var(--border-default)] rounded-lg disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                  성별 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
                    className={formData.gender === 'male'
                      ? 'py-2.5 border-2 border-[var(--text-primary)] bg-[var(--text-primary)] text-white rounded-lg font-semibold'
                      : 'py-2.5 border-2 border-[var(--border-default)] bg-white text-[var(--text-primary)] rounded-lg'}
                  >
                    남성
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
                    className={formData.gender === 'female'
                      ? 'py-2.5 border-2 border-[var(--text-primary)] bg-[var(--text-primary)] text-white rounded-lg font-semibold'
                      : 'py-2.5 border-2 border-[var(--border-default)] bg-white text-[var(--text-primary)] rounded-lg'}
                  >
                    여성
                  </button>
                </div>
              </div>
            </section>

            <section className="space-y-2 rounded-xl border border-[var(--border-default)] p-4">
              <h2 className="text-sm font-bold text-[var(--text-primary)]">약관 동의</h2>
              <label className="flex items-start gap-3 text-sm text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  required
                  className="mt-0.5 w-5 h-5 rounded border-[var(--border-default)]"
                />
                <span>
                  <strong>[필수]</strong> <Link href="/terms" className="underline">이용약관</Link> 동의
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  name="agreePrivacy"
                  checked={formData.agreePrivacy}
                  onChange={handleChange}
                  required
                  className="mt-0.5 w-5 h-5 rounded border-[var(--border-default)]"
                />
                <span>
                  <strong>[필수]</strong> <Link href="/privacy" className="underline">개인정보처리방침</Link> 동의
                </span>
              </label>
            </section>

            <button
              type="submit"
              disabled={!requiredChecked}
              className="w-full py-3.5 rounded-xl font-bold text-base shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--text-primary)] text-white"
            >
              회원가입 완료
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-[var(--text-primary)] opacity-70">
            이미 계정이 있으신가요?{' '}
            <Link href="/start" className="font-semibold underline">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
