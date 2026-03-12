"use client";

import { useRouter } from "next/navigation";

export default function ResultPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#eef4ee] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white border-2 border-[#7a9b7c] shadow-lg p-8 text-center">
        <p className="text-4xl mb-4" aria-hidden>✅</p>
        <h1 className="text-xl font-bold text-[#2d4a1e] mb-2">결제가 완료되었습니다</h1>
        <p className="text-[#556b2f] text-sm mb-6">
          고민분석 결제가 정상적으로 완료되었습니다.
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-full py-3 rounded-xl font-bold text-white bg-[#556b2f] hover:bg-[#6d8b3a] transition-colors"
        >
          홈으로
        </button>
      </div>
    </main>
  );
}
