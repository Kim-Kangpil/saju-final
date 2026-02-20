// 사주 데이터 타입 정의
export interface SavedSaju {
  id: string;
  name: string; // 사용자가 지정한 이름 (예: "내 사주", "엄마 사주")
  birthYmd: string; // YYYYMMDD
  birthHm: string; // HHMM
  gender: 'M' | 'F';
  calendar: 'solar' | 'lunar';
  timeUnknown: boolean;
  result: any; // 사주 결과 데이터
  createdAt: string; // 저장 날짜
  lastViewed?: string; // 마지막 조회 날짜
}

const STORAGE_KEY = 'saved_saju_list';
const MAX_SAJU_COUNT = 5;

/**
 * 저장된 사주 목록 가져오기
 */
export function getSavedSajuList(): SavedSaju[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('사주 목록 불러오기 실패:', error);
    return [];
  }
}

/**
 * 새 사주 저장하기
 */
export function saveSaju(saju: Omit<SavedSaju, 'id' | 'createdAt'>): { success: boolean; message: string } {
  try {
    const list = getSavedSajuList();
    
    // 최대 개수 체크
    if (list.length >= MAX_SAJU_COUNT) {
      return {
        success: false,
        message: `최대 ${MAX_SAJU_COUNT}개까지만 저장할 수 있습니다. 기존 사주를 삭제해주세요.`
      };
    }
    
    // 새 사주 생성
    const newSaju: SavedSaju = {
      ...saju,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    // 목록에 추가 (최신순)
    list.unshift(newSaju);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    
    return {
      success: true,
      message: '사주가 저장되었습니다.'
    };
  } catch (error) {
    console.error('사주 저장 실패:', error);
    return {
      success: false,
      message: '저장 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 사주 수정하기
 */
export function updateSaju(id: string, updates: Partial<SavedSaju>): { success: boolean; message: string } {
  try {
    const list = getSavedSajuList();
    const index = list.findIndex(s => s.id === id);
    
    if (index === -1) {
      return {
        success: false,
        message: '사주를 찾을 수 없습니다.'
      };
    }
    
    list[index] = { ...list[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    
    return {
      success: true,
      message: '사주가 수정되었습니다.'
    };
  } catch (error) {
    console.error('사주 수정 실패:', error);
    return {
      success: false,
      message: '수정 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 사주 삭제하기
 */
export function deleteSaju(id: string): { success: boolean; message: string } {
  try {
    const list = getSavedSajuList();
    const filtered = list.filter(s => s.id !== id);
    
    if (list.length === filtered.length) {
      return {
        success: false,
        message: '사주를 찾을 수 없습니다.'
      };
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    return {
      success: true,
      message: '사주가 삭제되었습니다.'
    };
  } catch (error) {
    console.error('사주 삭제 실패:', error);
    return {
      success: false,
      message: '삭제 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 특정 사주 가져오기
 */
export function getSajuById(id: string): SavedSaju | null {
  const list = getSavedSajuList();
  return list.find(s => s.id === id) || null;
}

/**
 * 마지막 조회 시간 업데이트
 */
export function updateLastViewed(id: string): void {
  const list = getSavedSajuList();
  const index = list.findIndex(s => s.id === id);
  
  if (index !== -1) {
    list[index].lastViewed = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

/**
 * 생년월일 포맷팅 (YYYYMMDD → YYYY년 MM월 DD일)
 */
export function formatBirthDate(ymd: string): string {
  if (ymd.length !== 8) return ymd;
  const year = ymd.slice(0, 4);
  const month = ymd.slice(4, 6);
  const day = ymd.slice(6, 8);
  return `${year}년 ${month}월 ${day}일`;
}

/**
 * 시간 포맷팅 (HHMM → HH시 MM분)
 */
export function formatBirthTime(hm: string): string {
  if (hm.length !== 4) return hm;
  const hour = hm.slice(0, 2);
  const minute = hm.slice(2, 4);
  return `${hour}시 ${minute}분`;
}
