"use client"
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import InicisPayButton from '@/components/InicisPayButton'
import { ReportIntroHeader } from '@/components/ReportIntroHeader'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://saju-backend-eqd6.onrender.com'

function MoneyIntroContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sajuId = searchParams.get('saju_id') || ''
  const [sajuInfo, setSajuInfo] = useState<{ name?: string; birth_ymd?: string } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

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
    const betaFeatures = localStorage.getItem('betaFeatures')
    if (betaFeatures) {
      try {
        const parsed = JSON.parse(betaFeatures)
        if (parsed?.is_admin) setIsAdmin(true)
      } catch {}
    }

    const checkAdminFeatures = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/beta/features`, { credentials: 'include' })
        const data = await res.json()
        if (data?.features?.is_admin) setIsAdmin(true)
      } catch {}
    }
    checkAdminFeatures()
  }, [])

  const handleAdminViewReport = () => {
    if (!sajuId) {
      alert('사주 정보를 찾을 수 없습니다.')
      return
    }
    router.push(`/report/money?saju_id=${sajuId}`)
  }

  return (
    <div style={{maxWidth: 480, margin: '0 auto', padding: '12px 20px 24px', fontFamily: 'var(--font-sans)', background: '#F5F1EA', minHeight: '100vh'}}>
      <ReportIntroHeader title="재물운 리포트" />

      <div style={{textAlign: 'center', marginBottom: 32}}>
        <div style={{fontSize: 48, marginBottom: 12}}>💰</div>
        <h1 style={{fontSize: 22, fontWeight: 700, color: '#3D3530', marginBottom: 8}}>
          재물운 심층 분석 리포트
        </h1>
        <p style={{fontSize: 14, color: '#8B7355'}}>내 사주 기반 맞춤 재물 분석</p>
      </div>

      {/* 이런 분께 추천 */}
      <div style={{background: 'white', borderRadius: 16, padding: 20, marginBottom: 16}}>
        <h2 style={{fontSize: 15, fontWeight: 700, color: '#3D3530', marginBottom: 12}}>
          이런 분께 추천해요
        </h2>
        {[
          '돈이 벌리는데 이상하게 안 모이는 분',
          '지금 투자/이직 타이밍인지 고민 중인 분',
          '내가 왜 이렇게 돈을 쓰는지 궁금한 분',
          '올해 재물운 흐름을 미리 파악하고 싶은 분',
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
          '💰 나의 재물 DNA — 왜 이런 패턴인지',
          '💵 돈 버는 방식과 수입 구조',
          '🕳 누수 포인트 — 돈 새는 이유',
          '📈 현재 재물 대운 흐름',
          '🗓 올해(2026) 재물운',
          '✅ 지금 당장 실천 조언',
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
          <p style={{fontSize: 12, fontWeight: 700, color: '#8B7355', marginBottom: 6}}>💰 나의 재물 DNA</p>
          <p style={{fontSize: 13, color: '#3D3530', lineHeight: 1.8, marginBottom: 6}}>
            당신의 돈 흐름은 한 방보다 꾸준한 축적형에 가깝습니다. 수입이 들어오는 방식과
          </p>
          <p style={{fontSize: 13, color: '#3D3530', lineHeight: 1.8, filter: 'blur(4px)', userSelect: 'none'}}>
            지출이 몰리는 패턴이 반복되는 이유가 있습니다. 사주 구조상 재물을 모으는 방식과 새는 포인트가 명확하게 나타납니다...
          </p>
        </div>

        {/* 섹션 2 */}
        <div style={{marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #F5F1EA', filter: 'blur(3px)', userSelect: 'none'}}>
          <p style={{fontSize: 12, fontWeight: 700, color: '#8B7355', marginBottom: 6}}>🕳 돈이 새는 이유</p>
          <p style={{fontSize: 13, color: '#3D3530', lineHeight: 1.8}}>
            버는 만큼 모이지 않는 이유가 사주에 있습니다. 특정 시기마다 큰 지출이 생기는 패턴, 충동 소비의 구조, 재물 누수의 근본 원인은...
          </p>
        </div>

        {/* 섹션 3 */}
        <div style={{marginBottom: 0, filter: 'blur(5px)', userSelect: 'none'}}>
          <p style={{fontSize: 12, fontWeight: 700, color: '#8B7355', marginBottom: 6}}>📈 올해 재물운 흐름</p>
          <p style={{fontSize: 13, color: '#3D3530', lineHeight: 1.8}}>
            2026년 재물운의 방향성과 투자·이직 타이밍, 지금 이 시기에 집중해야 할 재물 전략은...
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
          내 재물운 '대박' 시기, 미리 알아보세요.
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
          orderType="money"
          price={2900}
          label="재물운 리포트 확인하기"
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

export default function MoneyIntroPage() {
  return (
    <Suspense>
      <MoneyIntroContent />
    </Suspense>
  )
}