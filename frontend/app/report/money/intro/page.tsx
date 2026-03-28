"use client"
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import KakaoPayButton from '@/components/KakaoPayButton'

function MoneyIntroContent() {
  const searchParams = useSearchParams()
  const sajuId = searchParams.get('saju_id') || ''

  return (
    <div style={{maxWidth: 480, margin: '0 auto', padding: '24px 20px', fontFamily: 'GmarketSans', background: '#F5F1EA', minHeight: '100vh'}}>
      
      {/* 헤더 */}
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
        <KakaoPayButton
          orderType="money"
          price={5900}
          label="재물운 리포트 보기 — 5,900원"
          sajuId={sajuId}
        />
        <p style={{fontSize: 12, color: '#B0A090', marginTop: 8}}>
          유효기간 없음 · 한 번 구매로 영구 열람
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