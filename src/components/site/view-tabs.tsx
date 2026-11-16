"use client";

import { useState } from "react";
import { CalendarDays, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

/** Alterna entre a vista de calendário e a vista em lista das atividades. */
export function ViewTabs({ calendar, list }: { calendar: React.ReactNode; list: React.ReactNode }) {
  const [tab, setTab] = useState<"calendar" | "list">("calendar");
  const tabs = [
    { id: "calendar", label: "Calendário", icon: CalendarDays },
    { id: "list", label: "Lista", icon: LayoutGrid },
  ] as const;

  return (
    <div className="space-y-8">
      <div role="tablist" aria-label="Vista" className="inline-flex rounded-xl border border-border bg-surface p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            onClick={() => setTab(id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === id ? "bg-accent text-accent-fg shadow-sm" : "text-muted hover:text-fg",
            )}
          >
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>
      {/* As duas vistas ficam no HTML; só se esconde a que não está ativa. */}
      <div role="tabpanel" id="panel-calendar" aria-labelledby="tab-calendar" hidden={tab !== "calendar"}>
        {calendar}
      </div>
      <div role="tabpanel" id="panel-list" aria-labelledby="tab-list" hidden={tab !== "list"} className="space-y-16">
        {list}
      </div>
    </div>
  );
}
