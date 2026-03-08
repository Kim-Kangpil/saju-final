"use client";

interface MaskVsNatureVisualProps {
  size?: number;
  className?: string;
}

/**
 * 사회적 가면 vs 실제 기질 카드용 시각 자료.
 * 겉(가면)과 속(본모습)을 한 화면에 담은 심플 일러스트.
 */
export function MaskVsNatureVisual({ size = 200, className = "" }: MaskVsNatureVisualProps) {
  const s = size;
  const cx = s * 0.5;
  const pad = s * 0.12;
  const boxW = (s - pad * 2 - 8) * 0.5;
  const boxH = s * 0.36;
  const leftCx = pad + boxW * 0.5;
  const rightCx = s - pad - boxW * 0.5;
  const cy = pad + boxH * 0.5 + 4;
  const stroke = "#556b2f";
  const fill = "#eef4ee";
  const muted = "#adc4af";

  const leftTx = leftCx - boxW * 0.5 + 4;
  const leftTy = cy - boxH * 0.5;
  const rightTx = rightCx - boxW * 0.5 - 4;
  const rightTy = cy - boxH * 0.5;
  const halfBox = (boxW - 8) * 0.5;
  const faceCx = boxW * 0.5 - 4;
  const pathDLeft = "M " + (boxW * 0.28 - 4) + " " + (boxH * 0.52) + " Q " + faceCx + " " + (boxH * 0.72) + " " + (boxW * 0.72 - 4) + " " + (boxH * 0.52);
  const pathDRight = "M " + halfBox + " " + (boxH * 0.32) + " C " + ((boxW - 8) * 0.2) + " " + (boxH * 0.32) + " " + ((boxW - 8) * 0.12) + " " + (boxH * 0.5) + " " + halfBox + " " + (boxH * 0.62) + " C " + ((boxW - 8) * 0.88) + " " + (boxH * 0.5) + " " + ((boxW - 8) * 0.8) + " " + (boxH * 0.32) + " " + halfBox + " " + (boxH * 0.32) + " Z";
  const lineStart = leftCx + boxW * 0.5 - 2;
  const lineEnd = rightCx - boxW * 0.5 + 2;

  return (
    <svg
      width={s}
      height={s}
      viewBox={"0 0 " + s + " " + s}
      className={className}
      aria-hidden
    >
      {/* 왼쪽: 겉(가면) — 마스크 실루엣 */}
      <g transform={"translate(" + leftTx + "," + leftTy + ")"}>
        <rect width={boxW - 8} height={boxH} rx={8} fill={fill} stroke={muted} strokeWidth={1.5} />
        <ellipse cx={faceCx} cy={boxH * 0.4} rx={boxW * 0.2} ry={boxH * 0.18} fill="none" stroke={stroke} strokeWidth={1.2} />
        <path d={pathDLeft} fill="none" stroke={stroke} strokeWidth={1.2} strokeLinecap="round" />
        <text x={faceCx} y={boxH - 6} textAnchor="middle" fill={stroke} fontSize={10} fontWeight="600">겉</text>
      </g>

      {/* 화살표 / 연결 */}
      <path d={"M " + lineStart + " " + cy + " H " + lineEnd} stroke={muted} strokeWidth={1.5} strokeDasharray="4 3" fill="none" />
      <text x={cx} y={cy + 4} textAnchor="middle" fill={muted} fontSize={9}>↔</text>

      {/* 오른쪽: 속(본모습) — 심장/내면 실루엣 */}
      <g transform={"translate(" + rightTx + "," + rightTy + ")"}>
        <rect width={boxW - 8} height={boxH} rx={8} fill={fill} stroke={muted} strokeWidth={1.5} />
        <path
          d={pathDRight}
          fill="none"
          stroke={stroke}
          strokeWidth={1.2}
        />
        <text x={halfBox} y={boxH - 6} textAnchor="middle" fill={stroke} fontSize={10} fontWeight="600">속</text>
      </g>

      {/* 하단 라벨 */}
      <text x={leftCx} y={s - pad - 2} textAnchor="middle" fill={muted} fontSize={9}>사회적 모습</text>
      <text x={rightCx} y={s - pad - 2} textAnchor="middle" fill={muted} fontSize={9}>편할 때</text>
    </svg>
  );
}
