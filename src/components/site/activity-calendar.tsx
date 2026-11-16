"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalendarEvent = {
  id: string;
  title: string;
  day: string; // AAAA-MM-DD (hora de Lisboa, calculado no servidor)
  time: string; // HH:MM
  internal: boolean;
  past: boolean;
};

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

/** Grelha de 6 semanas (segunda a domingo) que contém o mês pedido. */
function monthGrid(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (first.getUTCDay() + 6) % 7; // segunda = 0
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(Date.UTC(year, month, 1 - offset + i));
    return {
      key: keyOf(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
      day: d.getUTCDate(),
      inMonth: d.getUTCMonth() === month,
    };
  });
}

/** Calendário mensal das atividades. Clicar num dia mostra as atividades desse dia. */
export function ActivityCalendar({ events, today }: { events: CalendarEvent[]; today: string }) {
  const [ty, tm] = today.split("-").map(Number) as [number, number];
  const [view, setView] = useState({ year: ty, month: tm - 1 });
  const [selected, setSelected] = useState<string | null>(today);

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) map.set(e.day, [...(map.get(e.day) ?? []), e]);
    return map;
  }, [events]);

  const cells = monthGrid(view.year, view.month);
  const monthPrefix = `${view.year}-${pad(view.month + 1)}`;
  const monthCount = events.filter((e) => e.day.startsWith(monthPrefix)).length;

  const move = (delta: number) => {
    const d = new Date(Date.UTC(view.year, view.month + delta, 1));
    setView({ year: d.getUTCFullYear(), month: d.getUTCMonth() });
    setSelected(null);
  };

  const selectedEvents = selected ? (byDay.get(selected) ?? []) : [];
  const selectedLabel = selected
    ? (() => {
        const [y, m, d] = selected.split("-").map(Number) as [number, number, number];
        return `${d} de ${MONTHS[m - 1]!.toLowerCase()}${y !== ty ? ` de ${y}` : ""}`;
      })()
    : null;

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight" aria-live="polite">
            {MONTHS[view.month]} <span className="text-muted">{view.year}</span>
          </h2>
          <p className="text-xs text-muted">
            {monthCount === 0 ? "Sem atividades este mês" : `${monthCount} atividade${monthCount === 1 ? "" : "s"} este mês`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setView({ year: ty, month: tm - 1 });
              setSelected(today);
            }}
            className="h-9 rounded-lg border border-border px-3 text-sm font-medium hover:bg-surface-2"
          >
            Hoje
          </button>
          <button type="button" onClick={() => move(-1)} aria-label="Mês anterior" className="grid size-9 place-items-center rounded-lg hover:bg-surface-2">
            <ChevronLeft className="size-4" />
          </button>
          <button type="button" onClick={() => move(1)} aria-label="Mês seguinte" className="grid size-9 place-items-center rounded-lg hover:bg-surface-2">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border bg-surface-2/60 text-center text-[11px] font-semibold tracking-wider text-muted uppercase">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-2">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7" role="grid" aria-label={`${MONTHS[view.month]} ${view.year}`}>
        {cells.map((c, i) => {
          const dayEvents = byDay.get(c.key) ?? [];
          const isToday = c.key === today;
          const isSelected = c.key === selected;
          return (
            <button
              key={c.key}
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              aria-label={`${c.day}${dayEvents.length ? `, ${dayEvents.length} atividade${dayEvents.length === 1 ? "" : "s"}` : ""}`}
              onClick={() => setSelected(c.key)}
              className={cn(
                "group relative flex min-h-16 flex-col items-stretch gap-1 border-border p-1.5 text-left transition-colors sm:min-h-28 sm:p-2",
                i % 7 !== 6 && "border-r",
                i < 35 && "border-b",
                !c.inMonth && "bg-surface-2/40",
                isSelected ? "bg-accent-soft/70" : "hover:bg-surface-2/70",
              )}
            >
              <span
                className={cn(
                  "grid size-7 place-items-center self-start rounded-full text-sm tabular-nums",
                  !c.inMonth && "text-muted/60",
                  isToday && "bg-accent font-semibold text-accent-fg",
                )}
              >
                {c.day}
              </span>

              {/* Telemóvel: só pontos */}
              {dayEvents.length > 0 && (
                <span className="flex gap-1 px-1 sm:hidden">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span key={e.id} className={cn("size-1.5 rounded-full", e.internal ? "bg-internal-fg" : "bg-accent", e.past && "opacity-40")} />
                  ))}
                </span>
              )}

              {/* Computador: nome das atividades */}
              <span className="hidden flex-col gap-1 sm:flex">
                {dayEvents.slice(0, 2).map((e) => (
                  <span
                    key={e.id}
                    className={cn(
                      "truncate rounded-md px-1.5 py-0.5 text-[11px] leading-tight font-medium",
                      e.internal ? "bg-internal-soft text-internal-fg" : "bg-accent-soft text-accent-soft-fg",
                      e.past && "opacity-50",
                    )}
                  >
                    <span className="tabular-nums opacity-70">{e.time}</span> {e.title}
                  </span>
                ))}
                {dayEvents.length > 2 && <span className="px-1.5 text-[11px] font-medium text-muted">+{dayEvents.length - 2} mais</span>}
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="border-t border-border px-4 py-4 sm:px-6">
          <p className="mb-3 text-sm font-semibold">{selectedLabel}</p>
          {selectedEvents.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted">
              <CalendarDays className="size-4" /> Não há atividades neste dia.
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {selectedEvents.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/atividades/${e.id}`}
                    className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-accent/40 hover:bg-surface-2/50"
                  >
                    <span
                      className={cn(
                        "rounded-lg px-2 py-1 text-xs font-semibold tabular-nums",
                        e.internal ? "bg-internal-soft text-internal-fg" : "bg-accent-soft text-accent-soft-fg",
                      )}
                    >
                      {e.time}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{e.title}</span>
                    {e.internal && <Lock className="size-3.5 shrink-0 text-internal-fg" aria-label="Interna" />}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
