"use client";

type Props = {
  title: string;
  content?: string;
  loading?: boolean;
  error?: string | null;
};

export function ReportSection({ title, content, loading = false, error = null }: Props) {
  return (
    <section
      style={{
        padding: "18px 0",
        borderBottom: "1px solid #D4C9B8",
      }}
    >
      <h2
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#2C2417",
          marginBottom: 10,
          fontFamily: "'Gmarket Sans', sans-serif",
          lineHeight: 1.4,
          wordBreak: "keep-all",
        }}
      >
        {title}
      </h2>

      {loading ? (
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ height: 12, borderRadius: 999, background: "#E6DED1" }} />
          <div style={{ height: 12, borderRadius: 999, background: "#E6DED1", width: "92%" }} />
          <div style={{ height: 12, borderRadius: 999, background: "#E6DED1", width: "84%" }} />
        </div>
      ) : error ? (
        <p
          style={{
            fontSize: 14,
            color: "#9B3A2C",
            lineHeight: 1.8,
            fontFamily: "'Gmarket Sans', sans-serif",
          }}
        >
          {error}
        </p>
      ) : (
        <p
          style={{
            fontSize: 14,
            color: "#4A3F30",
            lineHeight: 1.9,
            fontFamily: "'Gmarket Sans', sans-serif",
            whiteSpace: "pre-wrap",
            wordBreak: "keep-all",
          }}
        >
          {content?.trim()
            ? content
            : "이 구간에 표시할 내용이 없어요."}
        </p>
      )}
    </section>
  );
}

