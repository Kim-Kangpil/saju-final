"use client";

import { SavedSaju, formatBirthDate, formatBirthTime } from '@/lib/sajuStorage';
import { motion } from 'framer-motion';

interface SajuCardProps {
  saju: SavedSaju;
  onView: (saju: SavedSaju) => void;
  onEdit: (saju: SavedSaju) => void;
  onDelete: (id: string) => void;
}

export default function SajuCard({ saju, onView, onEdit, onDelete }: SajuCardProps) {
  const genderText = saju.gender === 'M' ? '남' : '여';
  const calendarText = saju.calendar === 'solar' ? '양력' : '음력';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-4 border-[#adc4af] rounded-2xl p-4 bg-white hover:shadow-lg transition-all"
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[#556b2f] mb-1">{saju.name}</h3>
          <div className="text-xs text-gray-500">
            저장일: {new Date(saju.createdAt).toLocaleDateString('ko-KR')}
          </div>
        </div>
        
        {/* 성별 뱃지 */}
        <div className={`px-2 py-1 rounded-full text-xs font-bold ${
          saju.gender === 'M' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
        }`}>
          {genderText}
        </div>
      </div>
      
      {/* 정보 */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">생년월일:</span>
          <span className="font-semibold text-[#556b2f]">
            {formatBirthDate(saju.birthYmd)} ({calendarText})
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">태어난 시간:</span>
          <span className="font-semibold text-[#556b2f]">
            {saju.timeUnknown ? '모름' : formatBirthTime(saju.birthHm)}
          </span>
        </div>
      </div>
      
      {/* 버튼들 */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onView(saju)}
          className="py-2 bg-[#556b2f] text-white rounded-lg text-sm font-bold hover:bg-[#6d8b3a] transition-colors"
        >
          보기
        </button>
        
        <button
          onClick={() => onEdit(saju)}
          className="py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
        >
          수정
        </button>
        
        <button
          onClick={() => {
            if (confirm(`"${saju.name}" 사주를 삭제하시겠습니까?`)) {
              onDelete(saju.id);
            }
          }}
          className="py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
        >
          삭제
        </button>
      </div>
    </motion.div>
  );
}
