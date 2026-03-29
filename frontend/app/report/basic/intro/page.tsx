"use client"
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import KakaoPayButton from '@/components/KakaoPayButton'
import { ReportIntroHeader } from '@/components/ReportIntroHeader'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://saju-backend-eqd6.onrender.com'

function BasicIntroContent() {
  const searchParams = useSearchParams()
  const sajuId = searchParams.get('saju_id') || ''
  const [sajuInfo, setSajuInfo] = useState<{ name?: string; birth_ymd?: string } | null>(null)

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

      <div style={{background: 'white', borderRadius: 16, padding: 20, marginBottom: 24, position: 'relative', overflow: 'hidden'}}>
        <h2 style={{fontSize: 15, fontWeight: 700, color: '#3D3530', marginBottom: 12}}>
          미리보기
        </h2>
        <div style={{filter: 'blur(6px)', fontSize: 13, color: '#3D3530', lineHeight: 1.8}}>
          <p style={{marginBottom: 12}}>
            <strong>나의 성향 분석</strong><br/>
            당신은 감정 표현이 풍부하고, 즉흥적인 결정보다는 신중한 판단을 선호하는 편입니다. 외향적 에너지가 강하며...
          </p>
          <p style={{marginBottom: 12}}>
            <strong>반복되는 문제 패턴</strong><br/>
            높은 기대 → 과도한 몰입 → 에너지 소진 → 회복 기간의 순환 구조가 보입니다. 이 패턴을 인식하면...
          </p>
          <p>
            <strong>재물 흐름</strong><br/>
            수입은 안정적으로 들어오지만, 관계나 감정 소비로 인한 지출이 많은 편입니다. 재물 누수 포인트를...
          </p>
        </div>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, white 90%)'}} />
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
        <KakaoPayButton
          orderType="basic"
          price={1900}
          label="기본 리포트 확인하기 · 1,900원"
          sajuId={sajuId}
        />
        <p style={{fontSize: 10, color: '#C4B5A0', marginTop: 6}}>
          한 번 구매로 영구 열람 가능
        </p>
      </div>
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
