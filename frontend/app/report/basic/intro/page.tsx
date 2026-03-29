"use client"
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import KakaoPayButton from '@/components/KakaoPayButton'
import { ReportIntroHeader } from '@/components/ReportIntroHeader'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://saju-backend-eqd6.onrender.com'

function BasicIntroContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sajuId = searchParams.get('saju_id') || ''
  const [sajuInfo, setSajuInfo] = useState<{ name?: string; birth_ymd?: string } | null>(null)
  const [isBetaTester, setIsBetaTester] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fakeProgress, setFakeProgress] = useState(0)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!sajuId) return
    fetch(`${API_BASE}/api/saju/${sajuId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data?.name || data?.birthdate) {
          const ymd = data.birthdate ? data.birthdate.replace(/-/g, '') : ''
          setSajuInfo({ name: data.name, birth_ymd: ymd })
        }
      })
      .catch(() => {})
  }, [sajuId])

  // 베타테스터/관리자 여부 확인
  useEffect(() => {
    // 1. localStorage 캐시 먼저 확인
    const stored = localStorage.getItem('betaFeatures')
    if (stored) {
      try {
        const f = JSON.parse(stored)
        if (f?.is_beta_tester === true) setIsBetaTester(true)
        if (f?.is_admin === true) setIsAdmin(true)
      } catch {}
    }

    // 2. API로 최신 정보 확인 (항상 덮어씀)
    const checkFeatures = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/beta/features`, { credentials: 'include' })
        const data = await res.json()
        const f = data?.features
        if (f) {
          localStorage.setItem('betaFeatures', JSON.stringify(f))
          setIsBetaTester(f.is_beta_tester === true)
          setIsAdmin(f.is_admin === true)
        } else {
          // 로그인 안 됐거나 혜택 없음
          setIsBetaTester(false)
          setIsAdmin(false)
        }
      } catch {}
    }
    checkFeatures()
  }, [])

  // 로딩 progress 애니메이션 (95%까지 증가, 이후 shimmer)
  useEffect(() => {
    if (!loading) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      setFakeProgress(0)
      return
    }

    setFakeProgress(0)
    progressIntervalRef.current = setInterval(() => {
      setFakeProgress(prev => {
        if (prev >= 95) return prev
        const inc = prev < 40 ? 2.5 : prev < 70 ? 1.5 : prev < 85 ? 0.8 : 0.3
        return Math.min(95, prev + inc)
      })
    }, 150)

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [loading])

  // 베타테스터용: 결제 건너뛰고 바로 v2 리포트 보기
  const handleBetaViewReport = async () => {
    console.log('[Beta] 버튼 클릭됨, sajuId:', sajuId)
    if (!sajuId) {
      alert('사주 정보를 찾을 수 없습니다.')
      return
    }
    // 바로 v2 리포트 페이지로 이동
    router.push(`/report/basic/v2?saju_id=${sajuId}`)
  }

  return (
    <div style={{maxWidth: 480, margin: '0 auto', padding: '12px 20px 24px', fontFamily: 'var(--font-sans)', background: '#F5F1EA', minHeight: '100vh'}}>
      <ReportIntroHeader title="기본 리포트" />

      <div style={{textAlign: 'center', marginBottom: 32}}>
        <div style={{fontSize: 48, marginBottom: 12}}>✨</div>
        <h1 style={{fontSize: 22, fontWeight: 700, color: '#3D3530', marginBottom: 8}}>
          사주 기본 분석 리포트
        </h1>
        <p style={{fontSize: 14, color: '#8B7355'}}>내 사주 기반 맞춤 기본 분석</p>
      </div>

      <div style={{background: 'white', borderRadius: 16, padding: 20, marginBottom: 16}}>
        <h2 style={{fontSize: 15, fontWeight: 700, color: '#3D3530', marginBottom: 12}}>
          이런 분께 추천해요
        </h2>
        {[
          '내 성향과 강점을 객관적으로 알고 싶은 분',
          '반복되는 문제 패턴을 파악하고 싶은 분',
          '재물·일·관계 전반을 한눈에 보고 싶은 분',
          '지금 내가 어떤 흐름에 있는지 궁금한 분',
        ].map((text, i) => (
          <div key={i} style={{display: 'flex', gap: 8, marginBottom: 8, fontSize: 14, color: '#3D3530'}}>
            <span>✓</span><span>{text}</span>
          </div>
        ))}
      </div>

      <div style={{background: 'white', borderRadius: 16, padding: 20, marginBottom: 16}}>
        <h2 style={{fontSize: 15, fontWeight: 700, color: '#3D3530', marginBottom: 12}}>
          리포트에 담긴 것
        </h2>
        {[
          '🧭 나의 성향 분석 — 5가지 축 레이더 차트',
          '🔁 반복되는 문제 패턴 — 4단계 순환 구조',
          '💰 재물 흐름 — 돈이 들어오고 나가는 방식',
          '💼 일과 직업 — 내게 맞는 방향',
          '🤝 관계와 인연 — 사람을 대하는 방식',
          '📝 종합 조언 — 지금 해야 할 것',
        ].map((text, i) => (
          <div key={i} style={{fontSize: 14, color: '#3D3530', marginBottom: 8, paddingBottom: 8, borderBottom: i < 5 ? '1px solid #F5F1EA' : 'none'}}>
            {text}
          </div>
        ))}
      </div>

      {/* 미리보기 */}
      <div style={{background: 'white', borderRadius: 16, padding: '18px 18px 0', marginBottom: 24, position: 'relative', overflow: 'hidden'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14}}>
          <span style={{fontSize: 13, fontWeight: 700, color: '#3D3530'}}>미리보기</span>
          <span style={{fontSize: 11, color: '#8B7355', background: '#F5F1EA', padding: '2px 8px', borderRadius: 20}}>구매 후 전체 열람</span>
        </div>

        {/* 섹션 1: 첫 줄 선명 */}
        <div style={{marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #F5F1EA'}}>
          <p style={{fontSize: 12, fontWeight: 700, color: '#8B7355', marginBottom: 6}}>🧠 타고난 성향</p>
          <p style={{fontSize: 13, color: '#3D3530', lineHeight: 1.8, marginBottom: 6}}>
            당신은 감정보다 구조와 논리를 먼저 읽는 편입니다. 결정할 때 속도보다 정확성을 택하고,
          </p>
          <p style={{fontSize: 13, color: '#3D3530', lineHeight: 1.8, filter: 'blur(4px)', userSelect: 'none'}}>
            주변 사람들은 당신을 침착하다고 보지만 내면에는 강한 감정의 흐름이 있습니다. 이 간극이 종종 오해를 만들고...
          </p>
        </div>

        {/* 섹션 2: 제목만 선명, 내용 흐림 */}
        <div style={{marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #F5F1EA', filter: 'blur(3px)', userSelect: 'none'}}>
          <p style={{fontSize: 12, fontWeight: 700, color: '#8B7355', marginBottom: 6}}>🔁 반복되는 문제 패턴</p>
          <p style={{fontSize: 13, color: '#3D3530', lineHeight: 1.8}}>
            높은 기대 → 과도한 몰입 → 에너지 소진 → 회복 기간이 반복됩니다. 이 순환이 생기는 이유는 사주 구조상 의지력이 감정보다 먼저 소모되기 때문이고, 이를 인식하는 것만으로도 패턴이 달라집니다...
          </p>
        </div>

        {/* 섹션 3: 완전 흐림 */}
        <div style={{marginBottom: 0, filter: 'blur(5px)', userSelect: 'none'}}>
          <p style={{fontSize: 12, fontWeight: 700, color: '#8B7355', marginBottom: 6}}>💰 돈 흐름 구조</p>
          <p style={{fontSize: 13, color: '#3D3530', lineHeight: 1.8}}>
            수입 구조는 꾸준한 축적형이지만 특정 시기에 큰 지출이 몰리는 패턴이 있습니다. 재물이 새는 포인트와 올해 재물운의 방향은...
          </p>
        </div>

        {/* 잠금 오버레이 */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
          background: 'linear-gradient(transparent, white 60%)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 16,
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
            <span style={{fontSize: 14}}>🔒</span>
            <span style={{fontSize: 12, color: '#8B7355', fontWeight: 600}}>구매 후 전체 내용 확인</span>
          </div>
        </div>
        <div style={{height: 60}} />
      </div>

      <div style={{textAlign: 'center'}}>
        <p style={{fontSize: 13, color: '#6B5F4E', marginBottom: 12, fontWeight: 600}}>
          {sajuInfo?.name && sajuInfo?.birth_ymd
            ? `${sajuInfo.name}님 (${sajuInfo.birth_ymd.slice(0, 4)}.${sajuInfo.birth_ymd.slice(4, 6)}.${sajuInfo.birth_ymd.slice(6, 8)}) 맞춤 리포트`
            : '맞춤 리포트'}
        </p>
        <p style={{fontSize: 12, color: '#8B7355', marginBottom: 14, fontWeight: 700}}>
          내 사주 전체 그림을 한눈에 파악하세요.
        </p>
        <div style={{marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8}}>
          <span style={{fontSize: 16, color: '#C4B5A0', textDecoration: 'line-through'}}>
            1,900원
          </span>
          <span style={{fontSize: 26, fontWeight: 700, color: '#3D3530'}}>
            990원
          </span>
          <span style={{fontSize: 12, fontWeight: 700, color: '#fff', background: '#DC2626', padding: '3px 8px', borderRadius: 6}}>
            48%
          </span>
        </div>
        
        {/* 일반 결제 버튼 */}
        <KakaoPayButton
          orderType="basic"
          price={990}
          label="기본 리포트 확인하기"
          sajuId={sajuId}
        />
        
        {/* 베타테스터용 무료 버튼 - 관리자 제외 */}
        {isBetaTester && !isAdmin && (
          <button
            type="button"
            onClick={handleBetaViewReport}
            disabled={loading}
            style={{
              marginTop: 12,
              padding: '12px 24px',
              borderRadius: 10,
              border: '2px solid #d97706',
              background: loading ? '#f3f4f6' : '#fef3c7',
              color: '#92400e',
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              margin: '12px auto 0',
            }}
          >
            <span>⚡</span>
            {loading ? '리포트 불러오는 중...' : '베타테스터: 무료로 바로 보기'}
          </button>
        )}
        
        {/* 관리자용 바로 보기 버튼 */}
        {isAdmin && (
          <button
            type="button"
            onClick={handleBetaViewReport}
            disabled={loading}
            style={{
              marginTop: 12,
              padding: '12px 24px',
              borderRadius: 10,
              border: '2px solid #dc2626',
              background: loading ? '#f3f4f6' : '#fee2e2',
              color: '#991b1b',
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              margin: '12px auto 0',
            }}
          >
            <span>👑</span>
            {loading ? '리포트 불러오는 중...' : '관리자: 바로 보기'}
          </button>
        )}
        
        <p style={{fontSize: 10, color: '#C4B5A0', marginTop: 6}}>
          한 번 구매로 영구 열람 가능
        </p>
      </div>

      {/* 로딩 오버레이 - 95%까지 progress bar, 이후 shimmer */}
      {loading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: '#F5F1EA',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
          fontFamily: "'Gmarket Sans', sans-serif"
        }}>
          <div style={{ width: '100%', maxWidth: 360, textAlign: 'center' }}>
            {/* 제목 — 95% 이상이면 pulse 애니메이션 */}
            {fakeProgress >= 95 ? (
              <motion.p
                style={{ fontSize: 13, fontWeight: 600, color: '#6B5F4E', letterSpacing: '0.1em', marginBottom: 32 }}
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                거의 다 됐어요
              </motion.p>
            ) : (
              <p style={{ fontSize: 13, fontWeight: 600, color: '#6B5F4E', letterSpacing: '0.1em', marginBottom: 32 }}>
                리포트를 준비하고 있어요
              </p>
            )}

            {/* progress bar */}
            <div style={{ marginBottom: 14 }}>
              {fakeProgress < 95 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: '#6B5F4E' }}>
                    {fakeProgress < 20 ? '사주 데이터를 불러오는 중'
                      : fakeProgress < 50 ? '만세력을 계산하는 중'
                      : fakeProgress < 75 ? '리포트를 구성하는 중'
                      : '거의 완료되었어요'}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#8B7355' }}>
                    {Math.floor(fakeProgress)}%
                  </span>
                </div>
              )}

              {/* 95% 미만: 일반 progress bar / 95% 이상: shimmer */}
              {fakeProgress < 95 ? (
                <div style={{ height: 8, background: '#E3D9CB', borderRadius: 99, overflow: 'hidden' }}>
                  <motion.div
                    style={{ height: '100%', background: 'linear-gradient(90deg, #8B7355, #A8946A)', borderRadius: 99 }}
                    initial={{ width: 0 }}
                    animate={{ width: `${fakeProgress}%` }}
                    transition={{ duration: 0.3, ease: 'linear' }}
                  />
                </div>
              ) : (
                <div style={{ height: 8, background: '#E3D9CB', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
                  {/* 95% 채워진 기본 바 */}
                  <div style={{ position: 'absolute', inset: 0, width: '95%', background: 'linear-gradient(90deg, #8B7355, #A8946A)', borderRadius: 99 }} />
                  {/* shimmer 광택 */}
                  <motion.div
                    style={{ position: 'absolute', top: 0, height: '100%', width: '35%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)', borderRadius: 99 }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              )}
            </div>

            {/* 서브 메시지 */}
            <p style={{ fontSize: 12, color: '#8B7355', lineHeight: 1.7 }}>
              {fakeProgress >= 95
                ? '사주 데이터를 정리하고 있어요.\n곧 리포트가 열립니다 :)'
                : '당신의 사주를 분석하고 있어요'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BasicIntroPage() {
  return (
    <Suspense fallback={<div style={{padding: 24, textAlign: 'center', fontFamily: 'var(--font-sans)'}}>로딩 중...</div>}>
      <BasicIntroContent />
    </Suspense>
  )
}
