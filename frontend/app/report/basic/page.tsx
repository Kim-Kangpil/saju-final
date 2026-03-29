"use client"
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import KakaoPayButton from '@/components/KakaoPayButton'
import { getAuthHeaders } from '@/lib/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://saju-backend-eqd6.onrender.com'

function BasicReportGate() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sajuId = searchParams.get('saju_id') || ''
  const [checking, setChecking] = useState(true)
  const [showPurchase, setShowPurchase] = useState(false)
  const [price, setPrice] = useState(990)

  useEffect(() => {
    if (!sajuId) {
      setChecking(false)
      return
    }
    fetch(`${API_BASE}/api/payment/report-access/basic`, {
      credentials: 'include',
      headers: getAuthHeaders(),
    })
      .then(r => r.json())
      .then(d => {
        if (d.has_access) {
          router.replace(`/report/basic/v2?saju_id=${sajuId}`)
        } else {
          setPrice(d.price || 990)
          setShowPurchase(true)
          setChecking(false)
        }
      })
      .catch(() => {
        setShowPurchase(true)
        setChecking(false)
      })
  }, [sajuId, router])

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F1EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 14, color: '#8B7355', fontFamily: 'var(--font-sans)' }}>확인 중...</p>
      </div>
    )
  }

  if (showPurchase) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(44,36,23,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px',
      }}>
        <div style={{
          background: '#FBF8F3', borderRadius: 20, padding: '32px 24px 28px',
          width: '100%', maxWidth: 360, textAlign: 'center',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          fontFamily: 'var(--font-sans)',
        }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>✨</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#2C2417', marginBottom: 8 }}>기본 분석 리포트</div>
          <div style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.7, marginBottom: 24 }}>
            이 리포트를 보려면 구매가 필요해요.<br />
            한 번 구매하면 언제든 다시 볼 수 있어요.
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#2C2417', marginBottom: 20 }}>
            {price.toLocaleString()}원
          </div>
          <KakaoPayButton orderType="basic" price={price} label="기본 리포트 구매" sajuId={sajuId} />
          <button
            type="button"
            onClick={() => router.back()}
            style={{ marginTop: 14, background: 'none', border: 'none', fontSize: 13, color: '#A0A0A0', cursor: 'pointer' }}
          >
            나중에
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default function BasicReportPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F5F1EA' }} />}>
      <BasicReportGate />
    </Suspense>
  )
}
