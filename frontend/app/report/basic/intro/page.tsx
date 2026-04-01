"use client"
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { ReportIntroHeader } from '@/components/ReportIntroHeader'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://saju-backend-eqd6.onrender.com'

function BasicIntroContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
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

  const handleViewReport = () => {
    if (!sajuId) {
      alert('사주 정보를 찾을 수 없습니다.')
      return
    }
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
          '🔮 인생 요약 — 사주로 본 나의 전체 그림',
          '🧠 타고난 성향 — 나는 어떤 사람인가',
          '💪 나의 무기 — 타고난 강점과 재능',
          '🔁 반복 패턴 — 계속 되풀이되는 상황의 원인',
          '💰 돈과 재물 — 돈이 들어오고 나가는 구조',
          '🧭 일과 진로 — 나에게 맞는 방향',
          '❤️ 관계와 인연 — 사람을 대하는 방식',
          '⏰ 지금 이 시기 — 현재 대운·세운 흐름',
          '✅ 지금 할 것 — 실천 조언',
        ].map((text, i) => (
          <div key={i} style={{fontSize: 14, color: '#3D3530', marginBottom: 8, paddingBottom: 8, borderBottom: i < 8 ? '1px solid #F5F1EA' : 'none'}}>
            {text}
          </div>
        ))}
      </div>

      {/* 분량 안내 */}
      <div style={{background: 'white', borderRadius: 16, padding: 20, marginBottom: 24}}>
        <div style={{display: 'flex', alignItems: 'flex-start', gap: 12}}>
          <span style={{fontSize: 24, flexShrink: 0}}>📄</span>
          <div>
            <p style={{fontSize: 14, fontWeight: 700, color: '#3D3530', marginBottom: 6}}>약 5,000자 분량</p>
            <p style={{fontSize: 13, color: '#6B5F4E', lineHeight: 1.7}}>
              9개 섹션에 걸쳐 내 사주의 전체 그림을 풀어드려요. 섹션마다 아코디언으로 펼쳐볼 수 있고, 성향·패턴·돈 흐름은 시각 차트도 함께 제공돼요.
            </p>
          </div>
        </div>
      </div>

      <div style={{textAlign: 'center'}}>
        <p style={{fontSize: 13, color: '#6B5F4E', marginBottom: 12, fontWeight: 600}}>
          {sajuInfo?.name && sajuInfo?.birth_ymd
            ? `${sajuInfo.name}님 (${sajuInfo.birth_ymd.slice(0, 4)}.${sajuInfo.birth_ymd.slice(4, 6)}.${sajuInfo.birth_ymd.slice(6, 8)}) 맞춤 리포트`
            : '맞춤 리포트'}
        </p>

        {/* 무료 뱃지 */}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16}}>
          <span style={{fontSize: 26, fontWeight: 700, color: '#3D3530'}}>무료</span>
          <span style={{fontSize: 12, fontWeight: 700, color: '#fff', background: '#059669', padding: '3px 8px', borderRadius: 6}}>
            FREE
          </span>
        </div>

        <button
          type="button"
          onClick={handleViewReport}
          style={{
            width: '100%',
            padding: '15px 24px',
            borderRadius: 14,
            border: 'none',
            background: '#3D3530',
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          무료로 리포트 보기
        </button>

        <p style={{fontSize: 12, color: '#8B7355', marginTop: 10}}>
          로그인 후 즉시 열람 · 무제한 재열람 가능
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
