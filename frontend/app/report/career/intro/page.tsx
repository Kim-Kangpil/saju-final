"use client"
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import InicisPayButton from '@/components/InicisPayButton'
import { ReportIntroHeader } from '@/components/ReportIntroHeader'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://saju-backend-eqd6.onrender.com'

function CareerIntroContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sajuId = searchParams.get('saju_id') || ''
  const [sajuInfo, setSajuInfo] = useState<{ name?: string; birth_ymd?: string } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(false)

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

  // 관리자 여부 확인
  useEffect(() => {
    // 1. localStorage 확인
    const betaFeatures = localStorage.getItem('betaFeatures')
    if (betaFeatures) {
      try {
        const parsed = JSON.parse(betaFeatures)
        if (parsed?.is_admin) {
          setIsAdmin(true)
        }
      } catch {}
    }
    
    // 2. API에서 최신 정보 가져오기
    const checkAdminFeatures = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/beta/features`, {
          credentials: 'include',
        })
        const data = await res.json()
        if (data?.features?.is_admin) {
          setIsAdmin(true)
        }
      } catch {}
    }
    checkAdminFeatures()
  }, [])

  // 관리자용 바로 보기 핸들러
  const handleAdminViewReport = () => {
    if (!sajuId) {
      alert('사주 정보를 찾을 수 없습니다.')
      return
    }
    // career 리포트 페이지로 이동
    router.push(`/report/career?saju_id=${sajuId}`)
  }

  return (
    <div style={{maxWidth: 480, margin: '0 auto', padding: '12px 20px 24px', fontFamily: 'var(--font-sans)', background: '#F5F1EA', minHeight: '100vh'}}>
      <ReportIntroHeader title="직업운 리포트" />

      <div style={{textAlign: 'center', marginBottom: 32}}>
        <div style={{fontSize: 48, marginBottom: 12}}>💼</div>
        <h1 style={{fontSize: 22, fontWeight: 700, color: '#3D3530', marginBottom: 8}}>
          직업운 심층 분석 리포트
        </h1>
        <p style={{fontSize: 14, color: '#8B7355'}}>내 사주 기반 맞춤 직업 분석</p>
      </div>

      {/* 이런 분께 추천 */}
      <div style={{background: 'white', borderRadius: 16, padding: 20, marginBottom: 16}}>
        <h2 style={{fontSize: 15, fontWeight: 700, color: '#3D3530', marginBottom: 12}}>
          이런 분께 추천해요
        </h2>
        {[
          '지금 하는 일이 나와 맞는지 궁금한 분',
          '이직/창업 타이밍 고민 중인 분',
          '내 적성에 맞는 직종을 알고 싶은 분',
          '올해 커리어 흐름을 파악하고 싶은 분',
        ].map((text, i) => (
          <div key={i} style={{display: 'flex', gap: 8, marginBottom: 8, fontSize: 14, color: '#3D3530'}}>
            <span>✓</span><span>{text}</span>
          </div>
        ))}
      </div>

      {/* 포함된 내용 */}
      <div style={{background: 'white', borderRadius: 16, padding: 20, marginBottom: 16}}>
        <h2 style={{fontSize: 15, fontWeight: 700, color: '#3D3530', marginBottom: 12}}>
          리포트에 담긴 것
        </h2>
        {[
          '💼 나의 직업 DNA',
          '🎯 잘 맞는 직종',
          '🏢 조직 vs 독립 판단',
          '📈 현재 커리어 흐름',
          '🗓 올해(2026) 직업운',
          '✅ 실천 조언',
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
          <p style={{fontSize: 12, fontWeight: 700, color: '#8B7355', marginBottom: 6}}>🧭 나의 직업 DNA</p>
          <p style={{fontSize: 13, color: '#3D3530', lineHeight: 1.8, marginBottom: 6}}>
            당신은 조직보다 자율성이 보장된 환경에서 훨씬 높은 성과를 냅니다.
          </p>
          <p style={{fontSize: 13, color: '#3D3530', lineHeight: 1.8, filter: 'blur(4px)', userSelect: 'none'}}>
            타고난 강점이 드러나는 분야와 반대로 에너지가 빠르게 소모되는 환경이 명확히 구분됩니다. 지금 하는 일이 맞는지 안 맞는지의 이유는...
          </p>
        </div>

        {/* 섹션 2 */}
        <div style={{marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #F5F1EA', filter: 'blur(3px)', userSelect: 'none'}}>
          <p style={{fontSize: 12, fontWeight: 700, color: '#8B7355', marginBottom: 6}}>🔄 커리어 반복 패턴</p>
          <p style={{fontSize: 13, color: '#3D3530', lineHeight: 1.8}}>
            열심히 하다가 갑자기 방향을 바꾸는 패턴이 반복됩니다. 이것이 우유부단함이 아닌 사주 구조상 에너지 전환 시기와 관련된 이유는...
          </p>
        </div>

        {/* 섹션 3 */}
        <div style={{marginBottom: 0, filter: 'blur(5px)', userSelect: 'none'}}>
          <p style={{fontSize: 12, fontWeight: 700, color: '#8B7355', marginBottom: 6}}>⏰ 지금 이 시기 직업운</p>
          <p style={{fontSize: 13, color: '#3D3530', lineHeight: 1.8}}>
            현재 대운과 2026년 세운이 커리어에 미치는 영향, 지금 이직·창업·현직 유지 중 어떤 선택이 유리한지는...
          </p>
        </div>

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

      {/* CTA */}
      <div style={{textAlign: 'center'}}>
        <p style={{fontSize: 13, color: '#6B5F4E', marginBottom: 12, fontWeight: 600}}>
          {sajuInfo?.name && sajuInfo?.birth_ymd
            ? `${sajuInfo.name}님 (${sajuInfo.birth_ymd.slice(0, 4)}.${sajuInfo.birth_ymd.slice(4, 6)}.${sajuInfo.birth_ymd.slice(6, 8)}) 맞춤 리포트`
            : '맞춤 리포트'}
        </p>
        <p style={{fontSize: 12, color: '#8B7355', marginBottom: 14, fontWeight: 700}}>
          내 커리어 방향을 알면 선택이 명확해져요
        </p>
        <div style={{marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8}}>
          <span style={{fontSize: 16, color: '#C4B5A0', textDecoration: 'line-through'}}>
            5,900원
          </span>
          <span style={{fontSize: 26, fontWeight: 700, color: '#3D3530'}}>
            2,900원
          </span>
          <span style={{fontSize: 12, fontWeight: 700, color: '#fff', background: '#DC2626', padding: '3px 8px', borderRadius: 6}}>
            51%
          </span>
        </div>
        <InicisPayButton
          orderType="career"
          price={2900}
          label="직업운 리포트 확인하기"
          sajuId={sajuId}
        />
        
        {/* 관리자용 바로 보기 버튼 */}
        {isAdmin && (
          <button
            type="button"
            onClick={handleAdminViewReport}
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
          구매 후 7일간 열람 가능 · 열람한 리포트는 영구 소장
        </p>
      </div>

    </div>
  )
}

export default function CareerIntroPage() {
  return (
    <Suspense>
      <CareerIntroContent />
    </Suspense>
  )
}