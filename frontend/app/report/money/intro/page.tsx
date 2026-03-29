"use client"
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import KakaoPayButton from '@/components/KakaoPayButton'
import { ReportIntroHeader } from '@/components/ReportIntroHeader'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://saju-backend-eqd6.onrender.com'

function MoneyIntroContent() {
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

      {/* 블러 미리보기 */}
      <div style={{background: 'white', borderRadius: 16, padding: 20, marginBottom: 24, position: 'relative', overflow: 'hidden'}}>
        <h2 style={{fontSize: 15, fontWeight: 700, color: '#3D3530', marginBottom: 12}}>
          미리보기
        </h2>
        <div style={{filter: 'blur(6px)', fontSize: 13, color: '#3D3530', lineHeight: 1.8}}>
          당신의 재물 구조는 한 번에 크게 들어오기보다 꾸준히 쌓이는 타입입니다.
          돈이 들어오다 흩어지는 패턴이 반복되는 이유는 사주 구조상 재성보다
          식상이 먼저 작동하기 때문입니다. 지금 이 시기는 수입 구조를 만드는 것이
          저축보다 훨씬 중요한 시점입니다...
        </div>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
          background: 'linear-gradient(transparent, white)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 12
        }}>
          <span style={{fontSize: 13, color: '#8B7355'}}>구매 후 전체 내용 확인</span>
        </div>
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
        <KakaoPayButton
          orderType="money"
          price={2900}
          label="재물운 리포트 확인하기"
          sajuId={sajuId}
        />
        <p style={{fontSize: 10, color: '#C4B5A0', marginTop: 6}}>
          한 번 구매로 영구 열람 가능
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