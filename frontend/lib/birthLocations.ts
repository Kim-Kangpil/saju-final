/**
 * 출생지 검색·경도 보정 표시용 데이터
 * - 한국 표준시(KST)는 동경 135도를 기준선으로 둡니다.
 * - 경도 보정(분) ≈ (현지 경도 − 135) × 4  (지구가 1도 도는 데 약 4분)
 */

export type BirthLocation = {
  id: string;
  /** 저장·표시용 이름 */
  name: string;
  /** 부가 설명 (도·국가 등, 시 이름과 구분) */
  detail?: string;
  /** 동경 (도, 서경은 음수) */
  lon: number;
  /** 검색에 쓰는 별칭·행정구역 키워드 */
  tags?: string[];
};

export const KST_STANDARD_MERIDIAN = 135;

/** 동경 기준, 한국 표준시 기준선(135°)과의 차이를 “몇 분”으로 환산 */
export function longitudeCorrectionMinutes(lon: number): number {
  return Math.round((lon - KST_STANDARD_MERIDIAN) * 4);
}

/**
 * 해당 날짜의 태양 시차(근사, 분). 1년 동안 대략 −14~+16분 범위.
 * (시주 정밀 보정에서 쓰는 “날짜 따라 조금씩 달라지는 보정”)
 */
export function equationOfTimeMinutesForDate(
  year: number,
  month: number,
  day: number
): number | null {
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }
  const t = Date.UTC(year, month - 1, day);
  const y0 = Date.UTC(year, 0, 1);
  const n = Math.round((t - y0) / 86400000) + 1;
  const B = (2 * Math.PI * (n - 81)) / 365;
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  return Math.round(eot * 10) / 10;
}

function haystack(loc: BirthLocation): string {
  const parts = [loc.name, loc.detail, ...(loc.tags || [])];
  return parts.filter(Boolean).join(" ").toLowerCase();
}

export function filterBirthLocations(query: string, limit = 12): BirthLocation[] {
  const raw = query.trim();
  if (!raw) {
    return BIRTH_LOCATIONS.filter((l) => l.id !== "custom").slice(0, limit);
  }
  const tokens = raw
    .toLowerCase()
    .split(/[\s,，]+/)
    .map((t) => t.replace(/\s+/g, ""))
    .filter(Boolean);
  const scored: { loc: BirthLocation; score: number }[] = [];
  for (const loc of BIRTH_LOCATIONS) {
    if (loc.id === "custom") continue;
    const h = haystack(loc).replace(/\s+/g, "");
    let ok = true;
    let score = 0;
    for (const tok of tokens) {
      if (!h.includes(tok)) {
        ok = false;
        break;
      }
      if (loc.name.toLowerCase().replace(/\s+/g, "").startsWith(tok)) score += 3;
      else if (loc.name.toLowerCase().includes(tok)) score += 2;
      else score += 1;
    }
    if (ok) scored.push({ loc, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.loc);
}

export function findBirthLocationById(id: string): BirthLocation | undefined {
  return BIRTH_LOCATIONS.find((l) => l.id === id);
}

/** 사용자에게 보여 줄 문장: 경도 보정(분), 부호 설명 없이 숫자 강조 */
export function describeLongitudeCorrectionMinutes(minutes: number): string {
  const abs = Math.abs(minutes);
  if (minutes === 0) {
    return `표준 시간 기준선과 거의 같아요. (보정 약 0분)`;
  }
  if (minutes < 0) {
    return `표준 시간 기준선보다 서쪽이라, 시주 계산에 약 ${abs}분을 늦춘 쪽으로 반영해요.`;
  }
  return `표준 시간 기준선보다 동쪽이라, 시주 계산에 약 ${abs}분을 당긴 쪽으로 반영해요.`;
}

export function describeEquationOfTimeMinutes(minutes: number): string {
  const abs = Math.abs(minutes);
  if (Math.abs(minutes) < 0.05) {
    return `그날은 태양 위치 미세 보정이 거의 없어요. (약 0분)`;
  }
  if (minutes > 0) {
    return `그날 태양 위치 미세 보정은 약 ${abs}분 정도 당기는 쪽이에요. (1년에 따라 바뀌어요)`;
  }
  return `그날 태양 위치 미세 보정은 약 ${abs}분 정도 늦추는 쪽이에요. (1년에 따라 바뀌어요)`;
}

export const DEFAULT_BIRTH_LOCATION_ID = "seoul";

/** 검색 가능한 출생지 — 국내·해외 모두 「시(도시)」 단위만 (구·동 단위 없음) */
export const BIRTH_LOCATIONS: BirthLocation[] = [
  { id: "custom", name: "경도 직접 입력", detail: "목록에 없을 때", lon: 127, tags: ["기타", "직접", "manual"] },

  // 광역시·특별시
  { id: "seoul", name: "서울", detail: "서울특별시", lon: 126.978, tags: ["서울시", "수도"] },
  { id: "busan", name: "부산", detail: "부산광역시", lon: 129.0756, tags: ["부산시"] },
  { id: "daegu", name: "대구", detail: "대구광역시", lon: 128.6014, tags: ["대구시"] },
  { id: "incheon", name: "인천", detail: "인천광역시", lon: 126.7052, tags: ["인천시"] },
  { id: "gwangju", name: "광주", detail: "광주광역시", lon: 126.8526, tags: ["광주시", "전라"] },
  { id: "daejeon", name: "대전", detail: "대전광역시", lon: 127.3845, tags: ["대전시"] },
  { id: "ulsan", name: "울산", detail: "울산광역시", lon: 129.3114, tags: ["울산시"] },
  { id: "sejong", name: "세종", detail: "세종특별자치시", lon: 127.289, tags: ["세종시"] },

  // 경기도 (시 단위)
  { id: "suwon", name: "수원", detail: "경기도", lon: 127.0286, tags: ["경기", "수원시"] },
  { id: "seongnam", name: "성남", detail: "경기도", lon: 127.128, tags: ["경기", "성남시"] },
  { id: "goyang", name: "고양", detail: "경기도", lon: 126.835, tags: ["경기", "고양시"] },
  { id: "yongin", name: "용인", detail: "경기도", lon: 127.2068, tags: ["경기", "용인시"] },
  { id: "bucheon", name: "부천", detail: "경기도", lon: 126.783, tags: ["경기", "부천시"] },
  { id: "ansan", name: "안산", detail: "경기도", lon: 126.831, tags: ["경기", "안산시"] },
  { id: "anyang", name: "안양", detail: "경기도", lon: 126.957, tags: ["경기", "안양시"] },
  { id: "namyangju", name: "남양주", detail: "경기도", lon: 127.214, tags: ["경기", "남양주시"] },
  { id: "hwaseong", name: "화성", detail: "경기도", lon: 126.833, tags: ["경기", "화성시"] },
  { id: "pyeongtaek", name: "평택", detail: "경기도", lon: 127.1147, tags: ["경기", "평택시"] },
  { id: "uijeongbu", name: "의정부", detail: "경기도", lon: 127.047, tags: ["경기", "의정부시"] },
  { id: "siheung", name: "시흥", detail: "경기도", lon: 126.788, tags: ["경기", "시흥시"] },
  { id: "gimpo", name: "김포", detail: "경기도", lon: 126.717, tags: ["경기", "김포시"] },
  { id: "paju", name: "파주", detail: "경기도", lon: 126.78, tags: ["경기", "파주시"] },
  { id: "icheon", name: "이천", detail: "경기도", lon: 127.442, tags: ["경기", "이천시"] },
  { id: "anseong", name: "안성", detail: "경기도", lon: 127.279, tags: ["경기", "안성시"] },
  { id: "gwangmyeong", name: "광명", detail: "경기도", lon: 126.847, tags: ["경기", "광명시"] },
  { id: "gunpo", name: "군포", detail: "경기도", lon: 126.949, tags: ["경기", "군포시"] },
  { id: "hanam", name: "하남", detail: "경기도", lon: 127.216, tags: ["경기", "하남시"] },
  { id: "osan", name: "오산", detail: "경기도", lon: 127.072, tags: ["경기", "오산시"] },
  { id: "uiwang", name: "의왕", detail: "경기도", lon: 126.988, tags: ["경기", "의왕시"] },
  { id: "guri", name: "구리", detail: "경기도", lon: 127.144, tags: ["경기", "구리시"] },

  // 그 외 시·도 (시 단위)
  { id: "chuncheon", name: "춘천", detail: "강원특별자치도", lon: 127.729, tags: ["강원", "춘천시"] },
  { id: "wonju", name: "원주", detail: "강원특별자치도", lon: 127.945, tags: ["강원", "원주시"] },
  { id: "gangneung", name: "강릉", detail: "강원특별자치도", lon: 128.896, tags: ["강원", "강릉시"] },
  { id: "sokcho", name: "속초", detail: "강원특별자치도", lon: 128.592, tags: ["강원", "속초시"] },
  { id: "cheongju", name: "청주", detail: "충청북도", lon: 127.489, tags: ["충북", "청주시"] },
  { id: "chungju", name: "충주", detail: "충청북도", lon: 127.951, tags: ["충북", "충주시"] },
  { id: "cheonan", name: "천안", detail: "충청남도", lon: 127.152, tags: ["충남", "천안시"] },
  { id: "asan", name: "아산", detail: "충청남도", lon: 127.004, tags: ["충남", "아산시"] },
  { id: "seosan", name: "서산", detail: "충청남도", lon: 126.452, tags: ["충남", "서산시"] },
  { id: "jeonju", name: "전주", detail: "전북특별자치도", lon: 127.148, tags: ["전북", "전주시"] },
  { id: "gunsan", name: "군산", detail: "전북특별자치도", lon: 126.712, tags: ["전북", "군산시"] },
  { id: "iksan", name: "익산", detail: "전북특별자치도", lon: 126.957, tags: ["전북", "익산시"] },
  { id: "mokpo", name: "목포", detail: "전라남도", lon: 126.388, tags: ["전남", "목포시"] },
  { id: "yeosu", name: "여수", detail: "전라남도", lon: 127.662, tags: ["전남", "여수시"] },
  { id: "suncheon", name: "순천", detail: "전라남도", lon: 127.489, tags: ["전남", "순천시"] },
  { id: "gwangyang", name: "광양", detail: "전라남도", lon: 127.696, tags: ["전남", "광양시"] },
  { id: "changwon", name: "창원", detail: "경상남도", lon: 128.681, tags: ["경남", "창원시"] },
  { id: "gimhae", name: "김해", detail: "경상남도", lon: 128.881, tags: ["경남", "김해시"] },
  { id: "jinju", name: "진주", detail: "경상남도", lon: 128.124, tags: ["경남", "진주시"] },
  { id: "tongyeong", name: "통영", detail: "경상남도", lon: 128.435, tags: ["경남", "통영시"] },
  { id: "pohang", name: "포항", detail: "경상북도", lon: 129.365, tags: ["경북", "포항시"] },
  { id: "gyeongju", name: "경주", detail: "경상북도", lon: 129.224, tags: ["경북", "경주시"] },
  { id: "gumi", name: "구미", detail: "경상북도", lon: 128.344, tags: ["경북", "구미시"] },
  { id: "andong", name: "안동", detail: "경상북도", lon: 128.728, tags: ["경북", "안동시"] },
  { id: "jeju", name: "제주", detail: "제주특별자치도", lon: 126.531, tags: ["제주시", "제주도"] },
  { id: "seogwipo", name: "서귀포", detail: "제주특별자치도", lon: 126.512, tags: ["제주", "서귀포시"] },

  // 해외 — 나라당 대표 도시(시 단위) 위주
  { id: "tokyo", name: "도쿄", detail: "일본", lon: 139.6917, tags: ["일본", "tokyo"] },
  { id: "osaka", name: "오사카", detail: "일본", lon: 135.5023, tags: ["일본", "osaka"] },
  { id: "nagoya", name: "나고야", detail: "일본", lon: 136.9066, tags: ["일본"] },
  { id: "sapporo", name: "삿포로", detail: "일본", lon: 141.3544, tags: ["일본", "홋카이도"] },
  { id: "fukuoka", name: "후쿠오카", detail: "일본", lon: 130.4017, tags: ["일본"] },
  { id: "beijing", name: "베이징", detail: "중국", lon: 116.4074, tags: ["중국", "북경"] },
  { id: "shanghai", name: "상하이", detail: "중국", lon: 121.4737, tags: ["중국"] },
  { id: "guangzhou", name: "광저우", detail: "중국", lon: 113.2644, tags: ["중국"] },
  { id: "shenzhen", name: "선전", detail: "중국", lon: 114.0579, tags: ["중국"] },
  { id: "hong-kong", name: "홍콩", detail: "중국", lon: 114.1694, tags: ["중국", "hongkong"] },
  { id: "taipei", name: "타이베이", detail: "대만", lon: 121.5654, tags: ["대만", "台北", "taiwan"] },
  { id: "ho-chi-minh", name: "호치민", detail: "베트남", lon: 106.6297, tags: ["베트남", "사이공"] },
  { id: "hanoi", name: "하노이", detail: "베트남", lon: 105.8342, tags: ["베트남"] },
  { id: "bangkok", name: "방콕", detail: "태국", lon: 100.5018, tags: ["태국"] },
  { id: "singapore", name: "싱가포르", detail: "싱가포르", lon: 103.8198, tags: ["singapore"] },
  { id: "kuala-lumpur", name: "쿠알라룸푸르", detail: "말레이시아", lon: 101.6869, tags: ["말레이시아"] },
  { id: "jakarta", name: "자카르타", detail: "인도네시아", lon: 106.8451, tags: ["인도네시아"] },
  { id: "manila", name: "마닐라", detail: "필리핀", lon: 120.9842, tags: ["필리핀"] },
  { id: "new-delhi", name: "뉴델리", detail: "인도", lon: 77.209, tags: ["인도"] },
  { id: "sydney", name: "시드니", detail: "호주", lon: 151.2093, tags: ["호주", "australia"] },
  { id: "melbourne", name: "멜버른", detail: "호주", lon: 144.9631, tags: ["호주"] },
  { id: "auckland", name: "오클랜드", detail: "뉴질랜드", lon: 174.7633, tags: ["뉴질랜드"] },
  { id: "los-angeles", name: "로스앤젤레스", detail: "미국", lon: -118.2437, tags: ["미국", "la", "캘리포니아"] },
  { id: "san-francisco", name: "샌프란시스코", detail: "미국", lon: -122.4194, tags: ["미국", "캘리포니아"] },
  { id: "chicago", name: "시카고", detail: "미국", lon: -87.6298, tags: ["미국"] },
  { id: "new-york", name: "뉴욕", detail: "미국", lon: -74.006, tags: ["미국", "ny"] },
  { id: "toronto", name: "토론토", detail: "캐나다", lon: -79.3832, tags: ["캐나다"] },
  { id: "vancouver", name: "밴쿠버", detail: "캐나다", lon: -123.1216, tags: ["캐나다"] },
  { id: "mexico-city", name: "멕시코시티", detail: "멕시코", lon: -99.1332, tags: ["멕시코"] },
  { id: "sao-paulo", name: "상파울루", detail: "브라질", lon: -46.6333, tags: ["브라질"] },
  { id: "london", name: "런던", detail: "영국", lon: -0.1276, tags: ["영국", "uk"] },
  { id: "paris", name: "파리", detail: "프랑스", lon: 2.3522, tags: ["프랑스"] },
  { id: "berlin", name: "베를린", detail: "독일", lon: 13.405, tags: ["독일", "germany"] },
  { id: "madrid", name: "마드리드", detail: "스페인", lon: -3.7038, tags: ["스페인"] },
  { id: "rome", name: "로마", detail: "이탈리아", lon: 12.4964, tags: ["이탈리아"] },
  { id: "moscow", name: "모스크바", detail: "러시아", lon: 37.6173, tags: ["러시아"] },
  { id: "dubai", name: "두바이", detail: "아랍에미리트", lon: 55.2708, tags: ["uae", "아랍에미리트"] },
  { id: "tel-aviv", name: "텔아비브", detail: "이스라엘", lon: 34.7818, tags: ["이스라엘"] },
  { id: "cairo", name: "카이로", detail: "이집트", lon: 31.2357, tags: ["이집트"] },
  { id: "johannesburg", name: "요하네스버그", detail: "남아프리카", lon: 28.0473, tags: ["남아공"] },
];
