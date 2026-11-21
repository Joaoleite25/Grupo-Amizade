import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Badge, ImageFallback } from "@/components/ui/misc";
import { registrationStatus, type ActivityWithCount, type RegistrationStatus } from "@/lib/data";
import { cn, dayMonth, formatDate } from "@/lib/utils";

const STATUS: Record<RegistrationStatus, { label: string; tone: "accent" | "neutral" | "warning" | "danger" }> = {
  open: { label: "Inscrições abertas", tone: "accent" },
  soon: { label: "Inscrições em breve", tone: "warning" },
  closed: { label: "Inscrições fechadas", tone: "neutral" },
  full: { label: "Esgotado", tone: "danger" },
  past: { label: "Já aconteceu", tone: "neutral" },
};

export function StatusBadge({ status }: { status: RegistrationStatus }) {
  const s = STATUS[status];
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

/** Barra de ocupação das vagas. Fica laranja quando restam poucas. */
export function CapacityBar({
  registered,
  capacity,
  className,
}: {
  registered: number;
  capacity: number;
  className?: string;
}) {
  if (capacity <= 0) return null;
  const pct = Math.min(100, (registered / capacity) * 100);
  const left = Math.max(capacity - registered, 0);
  const tone = left === 0 ? "bg-danger" : isLastSpots(left, capacity) ? "bg-amber-500" : "bg-accent";
  return (
    <div
      role="meter"
      aria-label="Vagas ocupadas"
      aria-valuemin={0}
      aria-valuemax={capacity}
      aria-valuenow={Math.min(registered, capacity)}
      aria-valuetext={`${Math.min(registered, capacity)} de ${capacity} vagas ocupadas`}
      className={cn("h-1.5 overflow-hidden rounded-full bg-surface-2", className)}
    >
      <div className={cn("h-full rounded-full transition-[width] duration-500", tone)} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** "Últimas vagas": no máximo 5 ou menos de 20% da capacidade. */
export function isLastSpots(left: number, capacity: number) {
  return left > 0 && (left <= 5 || left / capacity <= 0.2);
}

export function ActivityCard({ activity, now }: { activity: ActivityWithCount; now: Date }) {
  const status = registrationStatus(activity, now);
  const { day, month } = dayMonth(activity.date);
  const left = activity.capacity !== null ? Math.max(activity.capacity - activity.registered, 0) : null;

  return (
    <Link
      href={`/atividades/${activity.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-stone-900/5"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {activity.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activity.image}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <ImageFallback className="size-full" />
        )}
        <div className="absolute top-3 left-3 min-w-12 rounded-xl bg-surface/95 px-2.5 py-1.5 text-center shadow-sm backdrop-blur">
          <span className="block text-lg leading-none font-semibold tabular-nums">{day}</span>
          <span className="block text-[11px] leading-tight font-semibold text-accent uppercase">{month}</span>
        </div>
        {activity.visibility === "INTERNAL" && (
          <Badge tone="internal" className="absolute top-3 right-3 shadow-sm">
            Interna
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-base leading-snug font-semibold tracking-tight text-balance group-hover:text-accent">
          {activity.title}
        </h3>
        <p className="line-clamp-2 text-sm text-muted">{activity.description}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {formatDate(activity.date, { weekday: "short", hour: "2-digit", minute: "2-digit", year: undefined })}
          </span>
          {activity.location && (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{activity.location}</span>
            </span>
          )}
        </div>
        {left !== null && activity.capacity! > 0 && (status === "open" || status === "full") && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 text-muted">
                <Users className="size-3.5" />
                {left === 0 ? "Sem vagas · lista de espera" : `${left} de ${activity.capacity} vagas livres`}
              </span>
              {isLastSpots(left, activity.capacity!) && <span className="font-semibold text-amber-700">Últimas vagas!</span>}
            </div>
            <CapacityBar registered={activity.registered} capacity={activity.capacity!} />
          </div>
        )}
        <div>
          <StatusBadge status={status} />
        </div>
      </div>
    </Link>
  );
}
