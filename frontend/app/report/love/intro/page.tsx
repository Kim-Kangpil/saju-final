"use client"
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import KakaoPayButton from '@/components/KakaoPayButton'

function LoveIntroContent() {
  const searchParams = useSearchParams()
  const sajuId = searchParams.get('saju_id') || ''

  return (
    <div style={{maxWidth: 480, margin: '0 auto', padding: '24px 20px', fontFamily: 'GmarketSans', background: '#F5F1EA', minHeight: '100vh'}}>
      
      {/* 헤더 */}
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
        <KakaoPayButton
          orderType="love"
          price={5900}
          label="연애운 리포트 보기 — 5,900원"
          sajuId={sajuId}
        />
        <p style={{fontSize: 12, color: '#B0A090', marginTop: 8}}>
          유효기간 없음 · 한 번 구매로 영구 열람
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