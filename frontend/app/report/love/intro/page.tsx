"use client"
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import InicisPayButton from '@/components/InicisPayButton'
import { ReportIntroHeader } from '@/components/ReportIntroHeader'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://saju-backend-eqd6.onrender.com'

function LoveIntroContent() {
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
    // love 리포트 페이지로 이동
    router.push(`/report/love?saju_id=${sajuId}`)
  }

  return (
    <div style={{maxWidth: 480, margin: '0 auto', padding: '12px 20px 24px', fontFamily: 'var(--font-sans)', background: '#F5F1EA', minHeight: '100vh'}}>
      <ReportIntroHeader title="연애운 리포트" />

      <div style={{textAlign: 'center', marginBottom: 32}}>
        <div style={{fontSize: 48, marginBottom: 12}}>💕</div>
        <h1 style={{fontSize: 22, fontWeight: 700, color: '#3D3530', marginBottom: 8}}>
          연애운 심층 분석 리포트
        </h1>
        <p style={{fontSize: 14, color: '#8B7355'}}>내 사주 기반 맞춤 연애 분석</p>
      </div>

      {/* 이런 분께 추천 */}
      <div style={{background: 'white', borderRadius: 16, padding: 20, marginBottom: 16}}>
        <h2 style={{fontSize: 15, fontWeight: 700, color: '#3D3530', marginBottom: 12}}>
          이런 분께 추천해요
        </h2>
        {[
          '인연이 자꾸 어긋나는 분',
          '현재 연애가 잘 안 풀리는 분',
          '나와 잘 맞는 상대 유형이 궁금한 분',
          '올해 연애운 흐름을 알고 싶은 분',
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
          '❤️ 나의 연애 DNA',
          '👤 잘 맞는 상대 유형',
          '🔄 반복되는 연애 패턴',
          '💫 현재 인연 흐름',
          '🗓 올해(2026) 연애운',
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
          <p style={{fontSize: 12, fontWeight: 700, color: '#8B7355', marginBottom: 6}}>❤️ 나의 연애 DNA</p>
          <p style={{fontSize: 13, color: '#3D3530', lineHeight: 1.8, marginBottom: 6}}>
            당신은 감정이 충분히 쌓인 뒤에야 행동하는 타입입니다. 먼저 다가가기보다
          </p>
          <p style={{fontSize: 13, color: '#3D3530', lineHeight: 1.8, filter: 'blur(4px)', userSelect: 'none'}}>
            상대가 진심인지를 오랫동안 지켜보는 경향이 있고, 이 때문에 좋은 인연을 놓치는 경우가 생깁니다. 연애에서 반복되는 구조는...
          </p>
        </div>

        {/* 섹션 2 */}
        <div style={{marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #F5F1EA', filter: 'blur(3px)', userSelect: 'none'}}>
          <p style={{fontSize: 12, fontWeight: 700, color: '#8B7355', marginBottom: 6}}>🔄 반복되는 연애 패턴</p>
          <p style={{fontSize: 13, color: '#3D3530', lineHeight: 1.8}}>
            깊어지면 멀어지는 패턴이 반복됩니다. 이것은 의지의 문제가 아니라 사주 구조상 관계 에너지의 흐름이 특정 시기마다 리셋되기 때문이고...
          </p>
        </div>

        {/* 섹션 3 */}
        <div style={{marginBottom: 0, filter: 'blur(5px)', userSelect: 'none'}}>
          <p style={{fontSize: 12, fontWeight: 700, color: '#8B7355', marginBottom: 6}}>💫 현재 인연 흐름</p>
          <p style={{fontSize: 13, color: '#3D3530', lineHeight: 1.8}}>
            지금 이 시기 인연의 성격과 올해 연애운의 방향, 지금 만나는 사람 혹은 앞으로 들어올 인연의 유형은...
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
          내 연애 패턴을 알면 관계가 달라져요
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
          orderType="love"
          price={2900}
          label="연애운 리포트 확인하기"
          sajuId={sajuId}
        />

        {/* 관리자용 바로 보기 버튼 */}
        {isAdmin && (
          <button
            type="button"
            onClick={handleAdminViewReport}
            style={{
              marginTop: 12,
              padding: '12px 24px',
              borderRadius: 10,
              border: '2px solid #dc2626',
              background: '#fee2e2',
              color: '#991b1b',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              margin: '12px auto 0',
            }}
          >
            <span>👑</span>
            관리자: 바로 보기
          </button>
        )}

        <p style={{fontSize: 10, color: '#C4B5A0', marginTop: 6}}>
          구매 후 7일간 열람 가능 · 열람한 리포트는 영구 소장
        </p>
      </div>

    </div>
  )
}

export default function LoveIntroPage() {
  return (
    <Suspense>
      <LoveIntroContent />
    </Suspense>
  )
}