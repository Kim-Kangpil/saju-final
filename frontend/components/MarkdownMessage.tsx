import React, { useMemo } from "react";

/**
 * MarkdownMessage
 * AI 답변 말풍선 내부에서 마크다운을 렌더링하는 컴포넌트
 *
 * 지원 문법:
 *  - **굵게**, *기울임*
 *  - # ## ### 제목
 *  - --- 구분선
 *  - - 또는 • 리스트
 *  - 1. 번호 리스트
 *  - `인라인 코드`
 *  - 빈 줄 → 단락 구분
 *  - \n → 줄바꿈
 */

interface MarkdownMessageProps {
  text: string;
  /** AI 말풍선이면 true, 유저 말풍선이면 false (기본 true) */
  isAI?: boolean;
}

// 인라인 파서: **bold**, *italic*, `code`
function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    if (match[2]) {
      parts.push(
        <strong key={match.index} style={{ fontWeight: 700 }}>
          {match[2]}
        </strong>,
      );
    } else if (match[3]) {
      parts.push(
        <em key={match.index} style={{ fontStyle: "italic" }}>
          {match[3]}
        </em>,
      );
    } else if (match[4]) {
      parts.push(
        <code
          key={match.index}
          style={{
            fontFamily: "monospace",
            fontSize: "0.88em",
            background: "rgba(0,0,0,0.07)",
            borderRadius: 4,
            padding: "1px 5px",
          }}
        >
          {match[4]}
        </code>,
      );
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// 블록 타입
type Block =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "hr" }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "p"; lines: string[] };

function parseBlocks(raw: string): Block[] {
  const lines = raw.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (/^###\s/.test(line)) {
      blocks.push({ type: "h3", text: line.replace(/^###\s/, "") });
      i++;
      continue;
    }
    if (/^##\s/.test(line)) {
      blocks.push({ type: "h2", text: line.replace(/^##\s/, "") });
      i++;
      continue;
    }
    if (/^#\s/.test(line)) {
      blocks.push({ type: "h1", text: line.replace(/^#\s/, "") });
      i++;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    if (/^[-*•]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*•]\s/, "").trim());
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, "").trim());
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const pLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#+\s|-{3,}|\*{3,}|_{3,}|[-*•]\s|\d+\.\s)/.test(lines[i])
    ) {
      pLines.push(lines[i]);
      i++;
    }
    if (pLines.length > 0) blocks.push({ type: "p", lines: pLines });
  }

  return blocks;
}

// 스타일 상수 (폰트는 상위에서 gmarketsans를 상속받도록 기본값 유지)
const STYLES = {
  h1: {
    fontSize: 16,
    fontWeight: 700,
    color: "#2C2417",
    margin: "14px 0 6px",
    lineHeight: 1.4,
  } as React.CSSProperties,
  h2: {
    fontSize: 14,
    fontWeight: 700,
    color: "#2C2417",
    margin: "12px 0 4px",
    lineHeight: 1.4,
  } as React.CSSProperties,
  h3: {
    fontSize: 13,
    fontWeight: 700,
    color: "#4A3F30",
    margin: "10px 0 3px",
    lineHeight: 1.5,
  } as React.CSSProperties,
  hr: {
    border: "none",
    borderTop: "1px solid rgba(0,0,0,0.10)",
    margin: "12px 0",
  } as React.CSSProperties,
  p: {
    margin: "0 0 8px",
    lineHeight: 1.85,
    wordBreak: "keep-all" as const,
  } as React.CSSProperties,
  ul: {
    margin: "4px 0 8px",
    paddingLeft: 0,
    listStyle: "none",
  } as React.CSSProperties,
  ol: {
    margin: "4px 0 8px",
    paddingLeft: 0,
    listStyle: "none",
  } as React.CSSProperties,
  li: {
    display: "flex",
    alignItems: "flex-start",
    gap: 7,
    marginBottom: 5,
    lineHeight: 1.75,
    wordBreak: "keep-all" as const,
  } as React.CSSProperties,
  bullet: {
    flexShrink: 0,
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: "#8B7355",
    marginTop: 8,
  } as React.CSSProperties,
  num: {
    flexShrink: 0,
    minWidth: 18,
    height: 18,
    borderRadius: "50%",
    background: "#8B7355",
    color: "#fff",
    fontSize: 10,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3,
  } as React.CSSProperties,
};

export function MarkdownMessage({ text, isAI = true }: MarkdownMessageProps) {
  const blocks = useMemo(() => parseBlocks(text), [text]);

  if (!isAI) {
    return (
      <span
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "keep-all",
          lineHeight: 1.75,
        }}
      >
        {text}
      </span>
    );
  }

  return (
    <div
      style={{
        fontSize: 14,
        color: "#2C2417",
        lineHeight: 1.9,
        maxWidth: 520,
      }}
    >
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "h1":
            return (
              <div key={idx} style={STYLES.h1}>
                {parseInline(block.text)}
              </div>
            );
          case "h2":
            return (
              <div key={idx} style={STYLES.h2}>
                {parseInline(block.text)}
              </div>
            );
          case "h3":
            return (
              <div key={idx} style={STYLES.h3}>
                {parseInline(block.text)}
              </div>
            );
          case "hr":
            return <hr key={idx} style={STYLES.hr} />;
          case "ul":
            return (
              <ul key={idx} style={STYLES.ul}>
                {block.items.map((item, j) => (
                  <li key={j} style={STYLES.li}>
                    <span style={STYLES.bullet} />
                    <span>{parseInline(item)}</span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={idx} style={STYLES.ol}>
                {block.items.map((item, j) => (
                  <li key={j} style={STYLES.li}>
                    <span style={STYLES.num}>{j + 1}</span>
                    <span>{parseInline(item)}</span>
                  </li>
                ))}
              </ol>
            );
          case "p":
            return (
              <p key={idx} style={STYLES.p}>
                {block.lines.map((line, j) => (
                  <React.Fragment key={j}>
                    {parseInline(line)}
                    {j < block.lines.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

export default MarkdownMessage;

