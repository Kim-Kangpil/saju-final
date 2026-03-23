"use client";

export function TimelineCard() {
  const items = [
    { title: "과거", sub: "기반형성" },
    { title: "현재", sub: "방향전환" },
    { title: "미래", sub: "결과시작" },
  ] as const;

  return (
    <div style={{ width: "100%", background: "#F5F1EA", borderRadius: 16, border: "1px solid #D4C9B8", padding: 12, maxHeight: 200 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: "#3D3530", marginBottom: 12 }}>현재 시기 타임라인</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        {items.map((it, i) => (
          <div key={it.title} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ textAlign: "center", width: "100%" }}>
              <div style={{
                width: i === 1 ? 14 : 10,
                height: i === 1 ? 14 : 10,
                borderRadius: "50%",
                background: i === 1 ? "#8B7355" : "#C4B8A4",
                margin: "0 auto 6px",
              }} />
              <p style={{ fontSize: 11, fontWeight: 700, color: "#3D3530" }}>{it.title}</p>
              <p style={{ fontSize: 10, color: "#8B7355" }}>{it.sub}</p>
            </div>
            {i < items.length - 1 && <div style={{ height: 1, background: "#D4C9B8", flex: 1 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}
