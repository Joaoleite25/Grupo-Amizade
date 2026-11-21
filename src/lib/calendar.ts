// Ligações "Adicionar ao calendário" para uma atividade.
// As atividades só têm hora de início, por isso assume-se uma duração de 2 horas.

const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000;

type CalendarActivity = {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string | null;
};

/** Data em UTC no formato dos calendários: 20261123T143000Z */
function stamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function siteUrl() {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function activityUrl(id: string) {
  return `${siteUrl()}/atividades/${id}`;
}

/** Abre o Google Calendar com o evento já preenchido. */
export function googleCalendarUrl(a: CalendarActivity) {
  const end = new Date(a.date.getTime() + DEFAULT_DURATION_MS);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: a.title,
    dates: `${stamp(a.date)}/${stamp(end)}`,
    details: `${a.description.slice(0, 800)}\n\n${activityUrl(a.id)}`,
    ctz: "Europe/Lisbon",
  });
  if (a.location) params.set("location", a.location);
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** Escapa texto para um campo de um ficheiro .ics (RFC 5545). */
function icsText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/**
 * Parte linhas compridas em pedaços de no máximo 75 bytes, como manda o formato.
 * Conta bytes (UTF-8) e não caracteres, sem nunca partir uma letra acentuada a meio.
 */
function fold(line: string) {
  const out: string[] = [];
  let current = "";
  let bytes = 0;
  for (const ch of line) {
    const size = Buffer.byteLength(ch);
    // A 1.ª linha leva 75 bytes; as seguintes começam com um espaço, por isso levam 74.
    if (bytes + size > (out.length === 0 ? 75 : 74)) {
      out.push(current);
      current = "";
      bytes = 0;
    }
    current += ch;
    bytes += size;
  }
  out.push(current);
  return out.join("\r\n ");
}

/** Nome de ficheiro seguro: "Caminhada solidária" → "caminhada-solidaria". */
export function fileSlug(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

/** Ficheiro .ics (Apple Calendar, Outlook, Google...). */
export function activityIcs(a: CalendarActivity) {
  const end = new Date(a.date.getTime() + DEFAULT_DURATION_MS);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Grupo Amizade//Atividades//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:atividade-${a.id}@grupoamizade`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(a.date)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${icsText(a.title)}`,
    `DESCRIPTION:${icsText(a.description)}`,
    ...(a.location ? [`LOCATION:${icsText(a.location)}`] : []),
    `URL:${activityUrl(a.id)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

/** Pesquisa a morada no Google Maps (não precisa de chave). */
export function mapsUrl(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}
