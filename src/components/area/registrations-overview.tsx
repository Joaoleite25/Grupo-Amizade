"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, ClipboardList, Search } from "lucide-react";
import { Input } from "@/components/ui/field";
import { Badge, EmptyState } from "@/components/ui/misc";
import { formatDateTime } from "@/lib/utils";

type Row = {
  id: string;
  title: string;
  date: Date;
  visibility: "INTERNAL" | "EXTERNAL";
  capacity: number | null;
  people: number;
  registrations: number;
  past: boolean;
};

/** Lista de atividades com pesquisa por nome e número de pessoas inscritas. */
export function RegistrationsOverview({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
    if (!term) return rows;
    return rows.filter((r) =>
      r.title.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").includes(term),
    );
  }, [q, rows]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
        <Input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Pesquisar atividade..."
          aria-label="Pesquisar atividade"
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<ClipboardList />} title={q ? "Nenhuma atividade encontrada" : "Ainda não há atividades"} />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {filtered.map((r) => (
            <li key={r.id}>
              <Link href={`/area/gestao/inscricoes/${r.id}`} className="flex items-center gap-4 p-4 hover:bg-surface-2/50">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{r.title}</span>
                    {r.visibility === "INTERNAL" && <Badge tone="internal">Interna</Badge>}
                    {r.past && <Badge>Passada</Badge>}
                  </div>
                  <p className="mt-0.5 text-sm text-muted">{formatDateTime(r.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold tabular-nums">
                    {r.people}
                    {r.capacity !== null && <span className="text-sm font-normal text-muted"> / {r.capacity}</span>}
                  </p>
                  <p className="text-xs text-muted">
                    {r.registrations} inscriç{r.registrations === 1 ? "ão" : "ões"}
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
