/**
 * GPT/Gemini가 반환한 단일 문자열을 리포트 섹션 개수만큼 분리.
 * 번호 형식이 조금 어긋나도 본문이 사라지지 않도록 fallback 포함.
 */
export function parseGptSections(content: string, count: number): string[] {
  const result: string[] = new Array(count).fill("");
  if (!content?.trim()) return result;

  const sectionHead = String.raw`(?:#{0,3}\s*)?\*{0,2}\d+[.．)]\*{0,2}\s*`;
  const splitRe = new RegExp(`\\n(?=${sectionHead})`);
  const lineStart = new RegExp(`^(?:${sectionHead})`);
  const parts = content.split(splitRe);
  let idx = 0;
  for (const part of parts) {
    if (idx >= count) break;
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (!lineStart.test(trimmed)) continue;
    const firstNewline = trimmed.search(/\n/);
    const body =
      firstNewline >= 0 ? trimmed.slice(firstNewline + 1).trim() : "";
    result[idx] = body;
    idx++;
  }

  if (result.some((s) => s.length > 0)) return result;

  const whole = content.trim();
  if (whole.length > 0) {
    result[0] = whole;
  }
  return result;
}
