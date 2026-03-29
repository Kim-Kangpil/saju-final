"use client"
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import KakaoPayButton from '@/components/KakaoPayButton'
import { ReportIntroHeader } from '@/components/ReportIntroHeader'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://saju-backend-eqd6.onrender.com'

function LoveIntroContent() {
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

      {/* 블러 미리보기 */}
      <div style={{background: 'white', borderRadius: 16, padding: 20, marginBottom: 24, position: 'relative', overflow: 'hidden'}}>
        <h2 style={{fontSize: 15, fontWeight: 700, color: '#3D3530', marginBottom: 12}}>
          미리보기
        </h2>
        <div style={{filter: 'blur(6px)', fontSize: 13, color: '#3D3530', lineHeight: 1.8}}>
          당신의 연애 구조는 한 번에 크게 들어오기보다 꾸준히 쌓이는 타입입니다.
          인연이 들어오다 흩어지는 패턴이 반복되는 이유는 사주 구조상 연애보다
          개인적인 성장이 먼저 작동하기 때문입니다. 지금 이 시기는 관계의
          깊이를 만드는 것이 겉으로 드러나는 것보다 훨씬 중요한 시점입니다...
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
          내 연애 패턴을 알면 관계가 달라져요
        </p>
        <div style={{marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8}}>
          <span style={{fontSize: 16, color: '#C4B5A0', textDecoration: 'line-through'}}>
            9,900원
          </span>
          <span style={{fontSize: 26, fontWeight: 700, color: '#3D3530'}}>
            5,900원
          </span>
          <span style={{fontSize: 12, fontWeight: 700, color: '#fff', background: '#DC2626', padding: '3px 8px', borderRadius: 6}}>
            40%
          </span>
        </div>
        <KakaoPayButton
          orderType="love"
          price={5900}
          label="연애운 리포트 확인하기"
          sajuId={sajuId}
        />
        <p style={{fontSize: 10, color: '#C4B5A0', marginTop: 6}}>
          한 번 구매로 영구 열람 가능
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