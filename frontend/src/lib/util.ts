import { Tag } from "antd";
import type { Ticket } from "@/types/ticket";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

export const URGENCY_COLOR: Record<string, string> = {
  Low: "green",
  Medium: "gold",
  High: "orange",
  Critical: "red",
};

export const STATUS_COLOR: Record<string, string> = {
  pending: "processing",
  analyzed: "success",
  error: "error",
};

export function getSeverityColor(score: number) {
  if (score >= 80) return "#ff4d4f";
  if (score >= 60) return "#fa8c16";
  if (score >= 40) return "#fadb14";
  return "#52c41a";
}

export function getLanguageFlag(lang?: string) {
  const flags: Record<string, string> = {
    id: "🇮🇩",
    en: "🇺🇸",
    ja: "🇯🇵",
    zh: "🇨🇳",
    de: "🇩🇪",
    fr: "🇫🇷",
    es: "🇪🇸",
  };
  return lang ? (flags[lang.toLowerCase()] ?? "🌐") : "🌐";
}

export function parseSimilarIds(raw?: string): number[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export const formatRelative = (dt: string | Date) => {
  return dayjs.utc(dt).tz("Asia/Jakarta").fromNow();
};

export const formatTime = (dt: string | Date) => {
  return dayjs.utc(dt).tz("Asia/Jakarta").format("DD MMM YYYY HH:mm");
};
