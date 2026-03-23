"use client";

import { getAuthHeaders } from "@/lib/auth";
import { getSavedSajuList, type SavedSaju, type ServerSajuRow } from "@/lib/sajuStorage";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://saju-backend-eqd6.onrender.com";

export type ReportInput = {
  day_stem: string;
  year_pillar: string;
  month_pillar: string;
  day_pillar: string;
  hour_pillar: string;
  gender: string;
  cache_key: string;
  birth_year?: number;
  birth_month?: number;
  birth_day?: number;
  birth_hour?: number | null;
  calendar_type?: string;
};

function toApiGender(g: string): string {
  const v = (g || "").toUpperCase();
  if (v === "M" || v.includes("남")) return "M";
  if (v === "F" || v.includes("여")) return "F";
  return v || "F";
}

function extractFromSaved(saved: SavedSaju): ReportInput | null {
  const r: any = saved.result ?? {};
  const year_pillar = String(r.year_pillar ?? "").trim();
  const month_pillar = String(r.month_pillar ?? "").trim();
  const day_pillar = String(r.day_pillar ?? "").trim();
  const hour_pillar = String(r.hour_pillar ?? "").trim();

  const day_stem =
    day_pillar?.[0] ||
    r?.day?.cheongan?.hanja ||
    r?.pillars?.day?.heavenly_stem ||
    "";

  if (!day_stem || !year_pillar || !month_pillar || !day_pillar || !hour_pillar) {
    return null;
  }

  const cache_key = `report_${saved.id}_${year_pillar}_${month_pillar}_${day_pillar}_${hour_pillar}`;

  // Extract birth info for daeun calculation
  const ymd = saved.birthYmd || "";
  const birth_year  = ymd.length >= 4 ? Number(ymd.slice(0, 4)) : undefined;
  const birth_month = ymd.length >= 6 ? Number(ymd.slice(4, 6)) : undefined;
  const birth_day   = ymd.length >= 8 ? Number(ymd.slice(6, 8)) : undefined;
  const hm = saved.birthHm || "";
  const birth_hour  = !saved.timeUnknown && hm.length >= 2 ? Number(hm.slice(0, 2)) : null;

  return {
    day_stem,
    year_pillar,
    month_pillar,
    day_pillar,
    hour_pillar,
    gender: toApiGender(saved.gender),
    cache_key,
    birth_year,
    birth_month,
    birth_day,
    birth_hour,
    calendar_type: saved.calendar === "lunar" ? "lunar" : "solar",
  };
}

async function fetchServerRowById(sajuId: string): Promise<ServerSajuRow | null> {
  const res = await fetch(`${API_BASE}/api/saju/list`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });
  if (!res.ok) return null;
  const list = (await res.json().catch(() => [])) as ServerSajuRow[];
  if (!Array.isArray(list)) return null;

  const raw = String(sajuId);
  const numeric = raw.startsWith("srv-") ? raw.slice(4) : raw;

  return (
    list.find((x) => String(x.id) === raw) ||
    list.find((x) => String(x.id) === numeric) ||
    null
  );
}

async function fetchFullByRow(row: ServerSajuRow): Promise<any | null> {
  const [y, m, d] = (row.birthdate || "").split("-").map(Number);
  if (!y || !m || !d) return null;

  const t = (row.birth_time || "").trim();
  const hasTime = /^\d{1,2}:\d{1,2}$/.test(t);
  const [h, mi] = hasTime ? t.split(":").map(Number) : [12, 0];

  const body: Record<string, any> = {
    calendar_type: row.calendar_type === "음력" ? "lunar" : "solar",
    year: y,
    month: m,
    day: d,
    hour: hasTime ? h : null,
    minute: hasTime ? mi : null,
    gender: row.gender === "남자" ? "M" : "F",
    time_unknown: !hasTime,
    is_leap_month: false,
  };
  if (row.iana_timezone) body.iana_timezone = row.iana_timezone;

  const res = await fetch(`${API_BASE}/saju/full`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return await res.json().catch(() => null);
}

export async function loadReportInputBySajuId(sajuId: string): Promise<ReportInput | null> {
  if (!sajuId) return null;

  const list = getSavedSajuList();
  const saved =
    list.find((s) => String(s.id) === sajuId) ||
    list.find((s) => String(s.id) === `srv-${sajuId}`) ||
    list.find((s) => String(s.id).startsWith("srv-") && String(s.id).slice(4) === sajuId) ||
    null;

  if (saved) {
    const local = extractFromSaved(saved);
    if (local) return local;
  }

  const row = await fetchServerRowById(sajuId);
  if (!row) return null;
  const full = await fetchFullByRow(row);
  if (!full) return null;

  const year_pillar = String(full.year_pillar ?? "").trim();
  const month_pillar = String(full.month_pillar ?? "").trim();
  const day_pillar = String(full.day_pillar ?? "").trim();
  const hour_pillar = String(full.hour_pillar ?? "").trim();
  const day_stem = day_pillar?.[0] || "";
  if (!day_stem || !year_pillar || !month_pillar || !day_pillar || !hour_pillar) return null;

  // Extract birth info from server row for daeun calculation
  const [by, bm, bd] = (row.birthdate || "").split("-").map(Number);
  const t = (row.birth_time || "").trim();
  const hasTime = /^\d{1,2}:\d{1,2}$/.test(t);
  const [bh] = hasTime ? t.split(":").map(Number) : [null];

  return {
    day_stem,
    year_pillar,
    month_pillar,
    day_pillar,
    hour_pillar,
    gender: row.gender === "남자" ? "M" : "F",
    cache_key: `report_srv-${row.id}_${year_pillar}_${month_pillar}_${day_pillar}_${hour_pillar}`,
    birth_year:  by || undefined,
    birth_month: bm || undefined,
    birth_day:   bd || undefined,
    birth_hour:  hasTime ? (bh ?? null) : null,
    calendar_type: row.calendar_type === "음력" ? "lunar" : "solar",
  };
}

