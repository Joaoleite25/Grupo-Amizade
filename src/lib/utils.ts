import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// O grupo é em Portugal: todas as datas são mostradas e interpretadas
// na hora de Lisboa, mesmo que o servidor (ex.: Vercel) esteja em UTC.
export const TIME_ZONE = "Europe/Lisbon";

export function formatDate(date: Date, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
    ...opts,
  }).format(date);
}

export function formatDateTime(date: Date) {
  return formatDate(date, { hour: "2-digit", minute: "2-digit" });
}

/** Dia e mês abreviado separados, ex.: { day: "23", month: "nov" }. */
export function dayMonth(date: Date) {
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("pt-PT", { timeZone: TIME_ZONE, ...o }).format(date);
  return { day: f({ day: "numeric" }), month: f({ month: "short" }).replace(".", "") };
}

/** Dia (AAAA-MM-DD) em que uma data cai, na hora de Lisboa. */
export function lisbonDayKey(date: Date) {
  // O locale sv-SE formata as datas como AAAA-MM-DD.
  return new Intl.DateTimeFormat("sv-SE", { timeZone: TIME_ZONE }).format(date);
}

export function formatTime(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit" }).format(date);
}

/**
 * Início e fim de uma atividade, ex.: "3 de dezembro de 2026 às 09:00–12:30".
 * Se acabar noutro dia, mostra as duas datas completas.
 */
export function formatDateTimeRange(start: Date, end: Date | null | undefined) {
  if (!end) return formatDateTime(start);
  if (lisbonDayKey(start) === lisbonDayKey(end)) return `${formatDateTime(start)}–${formatTime(end)}`;
  return `${formatDateTime(start)} até ${formatDateTime(end)}`;
}

/**
 * Idade (anos completos) num dado dia. A data de nascimento é guardada
 * como data sem hora (meia-noite UTC), por isso compara-se em UTC.
 */
export function ageOn(birthDate: Date, on: Date) {
  const day = new Date(`${lisbonDayKey(on)}T00:00:00Z`);
  let age = day.getUTCFullYear() - birthDate.getUTCFullYear();
  const m = day.getUTCMonth() - birthDate.getUTCMonth();
  if (m < 0 || (m === 0 && day.getUTCDate() < birthDate.getUTCDate())) age--;
  return age;
}

/** Idade a partir da qual já não é preciso autorização do encarregado de educação. */
export const GUARDIAN_AGE = 16;

/** Diferença (ms) entre a hora de Lisboa e UTC num dado instante. */
function lisbonOffset(at: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - at.getTime();
}

/** Converte o valor de um <input type="datetime-local"> (hora de Lisboa) para Date. */
export function parseLisbonDateTime(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!m) return null;
  const naive = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  const guess = new Date(naive - lisbonOffset(new Date(naive)));
  // Segunda passagem corrige a mudança de hora (verão/inverno).
  return new Date(naive - lisbonOffset(guess));
}

/** Converte uma Date para o formato de <input type="datetime-local"> em hora de Lisboa. */
export function toLisbonInputValue(date: Date | null | undefined) {
  if (!date) return "";
  const local = new Date(date.getTime() + lisbonOffset(date));
  return local.toISOString().slice(0, 16);
}

export function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function excerpt(text: string, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max).trimEnd() + "…" : clean;
}
