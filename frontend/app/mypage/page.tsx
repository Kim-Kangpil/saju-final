"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getSavedSajuList, deleteSaju, SavedSaju, updateLastViewed } from '@/lib/sajuStorage';
import SajuCard from '@/components/SajuCard';

export default function MyPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sajuList, setSajuList] = useState<SavedSaju[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 로그인 체크
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    
    if (!loggedIn) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
    
    // 저장된 사주 목록 불러오기
    const list = getSavedSajuList();
    setSajuList(list);
    setIsLoading(false);
  }, [router]);

  const handleView = (saju: SavedSaju) => {
    // 마지막 조회 시간 업데이트
    updateLastViewed(saju.id);
    
    // 사주 데이터를 세션에 저장하고 메인 페이지로
    sessionStorage.setItem('viewingSaju', JSON.stringify(saju));
    router.push('/?view=' + saju.id);
  };

  const handleEdit = (saju: SavedSaju) => {
    // 수정 모드로 메인 페이지 이동
    sessionStorage.setItem('editingSaju', JSON.stringify(saju));
    router.push('/?edit=' + saju.id);
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
    router.push('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loginType');
    alert('로그아웃되었습니다.');
    router.push('/');
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white border-4 border-[#adc4af] rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#556b2f] mb-2">
                마이페이지 📋
              </h1>
              <p className="text-sm text-gray-600">
                저장된 사주를 관리하세요 (최대 5개)
              </p>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-800 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* 새 사주 보기 버튼 */}
        <div className="mb-6">
          <button
            onClick={handleNewSaju}
            className="w-full py-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-gray-900 font-bold text-lg rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            🔮 새 사주 보기
          </button>
        </div>

        {/* 사주 목록 */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">불러오는 중...</p>
          </div>
        ) : sajuList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-4 border-[#adc4af] rounded-2xl p-12 text-center"
          >
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl font-bold text-[#556b2f] mb-2">
              저장된 사주가 없습니다
            </h2>
            <p className="text-gray-600 mb-6">
              첫 사주를 확인해보세요!
            </p>
            <button
              onClick={handleNewSaju}
              className="px-8 py-3 bg-[#556b2f] text-white font-bold rounded-lg hover:bg-[#6d8b3a] transition-colors"
            >
              사주 보러 가기
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-[#556b2f]">
                저장된 사주 ({sajuList.length}/5)
              </h2>
            </div>
            
            <AnimatePresence>
              {sajuList.map((saju, index) => (
                <motion.div
                  key={saju.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.1 }}
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
        {sajuList.length > 0 && sajuList.length < 5 && (
          <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <p className="text-sm text-blue-700 text-center">
              💡 {5 - sajuList.length}개 더 저장할 수 있습니다
            </p>
          </div>
        )}
        
        {sajuList.length >= 5 && (
          <div className="mt-6 p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
            <p className="text-sm text-orange-700 text-center">
              ⚠️ 저장 공간이 가득 찼습니다. 새로 저장하려면 기존 사주를 삭제해주세요.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
