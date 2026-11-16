import Link from "next/link";
import { CalendarDays, Users } from "lucide-react";
import { Badge, ImageFallback } from "@/components/ui/misc";
import { registrationStatus, type ActivityWithCount, type RegistrationStatus } from "@/lib/data";
import { dayMonth, formatDate } from "@/lib/utils";

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
          {left !== null && status !== "past" && (
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5" />
              {left} vaga{left === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <div>
          <StatusBadge status={status} />
        </div>
      </div>
    </Link>
  );
}
