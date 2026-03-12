"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  getSavedSajuList,
  deleteSaju,
  SavedSaju,
  updateLastViewed,
} from "@/lib/sajuStorage";
import SajuCard from "@/components/SajuCard";
import { HamIcon } from "@/components/HamIcon";

export default function MyPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sajuList, setSajuList] = useState<SavedSaju[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    if (!loggedIn) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    const list = getSavedSajuList();
    setSajuList(list);
    setIsLoading(false);
  }, [router]);

  const handleView = (saju: SavedSaju) => {
    updateLastViewed(saju.id);
    sessionStorage.setItem("loadedSaju", JSON.stringify(saju));
    router.push("/add?loaded=" + saju.id);
  };

  const handleEdit = (saju: SavedSaju) => {
    sessionStorage.setItem("editingSaju", JSON.stringify(saju));
    router.push("/add?edit=" + saju.id);
  };

  const handleDelete = (id: string) => {
    const result = deleteSaju(id);

    if (result.success) {
      setSajuList(getSavedSajuList());
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleNewSaju = () => {
    router.push("/add");
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loginType");
    alert("로그아웃되었습니다.");
    router.push("/home");
  };

  if (!isLoggedIn) return null;

  return (
    <main
      className="min-h-screen p-4 flex flex-col items-center justify-center relative"
      style={{ position: "relative", zIndex: 10 }}
    >
      <div className="w-full max-w-[450px] mx-auto px-2 sm:px-0">
        <div className="border-4 border-[#adc4af] rounded-[24px] overflow-hidden shadow-xl relative z-10 bg-white">
          {/* home 헤더 통일 */}
          <div className="bg-[#c1d8c3] px-4 py-3 flex justify-between items-center border-b-4 border-[#adc4af]">
            <button
              onClick={() => router.push("/home")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <HamIcon alt="햄스터" className="w-10 h-10 object-contain" />
              <span className="text-base font-bold text-[#556b2f]">
                한양사주
              </span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm font-bold text-[#556b2f] bg-white hover:bg-white/80 rounded-lg transition-colors shadow-sm"
              >
                로그아웃
              </button>
            </div>
          </div>

          {/* 본문 */}
          <div className="p-5 bg-white">
            {/* 타이틀 카드 */}
            <div className="border-4 border-[#adc4af] rounded-2xl bg-white overflow-hidden shadow-none p-5 mb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-[#556b2f] mb-1">
                    마이페이지 📋
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600">
                    저장된 사주 관리 (최대 5개)
                  </p>
                </div>

                <button
                  onClick={() => router.push("/add")}
                  className="px-3 py-2 text-sm font-bold bg-[#556b2f] text-white rounded-xl hover:bg-[#6d8b3a] transition-colors shadow-sm whitespace-nowrap"
                >
                  사주추가
                </button>
              </div>
            </div>

            {/* 새 사주 보기 버튼 */}
            <div className="mb-4">
              <button
                onClick={handleNewSaju}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-gray-900 font-bold text-lg rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
              >
                🔮 새 사주 보기
              </button>
            </div>

            {/* 목록 영역 */}
            {isLoading ? (
              <div className="text-center py-16 border-4 border-[#adc4af] rounded-2xl bg-white">
                <div className="text-4xl mb-3">⏳</div>
                <p className="text-sm text-gray-600">불러오는 중...</p>
              </div>
            ) : sajuList.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-4 border-[#adc4af] rounded-2xl bg-white p-10 text-center"
              >
                <div className="text-6xl mb-4">📭</div>
                <h2 className="text-lg font-bold text-[#556b2f] mb-2">
                  저장된 사주가 없습니다
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  첫 사주를 확인해보세요!
                </p>
                <button
                  onClick={handleNewSaju}
                  className="w-full py-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-gray-900 font-bold text-lg rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
                >
                  🔮 사주 보러 가기
                </button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm sm:text-base font-bold text-[#556b2f]">
                    저장된 사주 ({sajuList.length}/5)
                  </h2>
                </div>

                <AnimatePresence>
                  {sajuList.map((saju, index) => (
                    <motion.div
                      key={saju.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -60 }}
                      transition={{ delay: index * 0.06 }}
                    >
                      <SajuCard
                        saju={saju}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* 안내 메시지 */}
            {!isLoading && sajuList.length > 0 && sajuList.length < 5 && (
              <div className="mt-4 border-4 border-[#adc4af] rounded-2xl bg-[#f8fafc] p-4 text-center">
                <p className="text-xs sm:text-sm text-[#556b2f] font-bold">
                  💡 {5 - sajuList.length}개 더 저장할 수 있습니다
                </p>
              </div>
            )}

            {!isLoading && sajuList.length >= 5 && (
              <div className="mt-4 border-4 border-[#adc4af] rounded-2xl bg-[#fff7ed] p-4 text-center">
                <p className="text-xs sm:text-sm text-[#9a3412] font-bold">
                  ⚠️ 저장 공간이 가득 찼습니다. 새로 저장하려면 기존 사주를
                  삭제해주세요.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 하단 링크 */}
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push("/home")}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← 홈으로 돌아가기
          </button>
        </div>
      </div>
    </main>
  );
}