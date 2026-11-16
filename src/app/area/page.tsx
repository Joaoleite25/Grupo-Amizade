import Link from "next/link";
import { ArrowRight, CalendarDays, ClipboardList, Newspaper, Ticket, Users } from "lucide-react";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { buttonClass } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/misc";
import { PageHeader } from "@/components/area/page-header";

export default async function DashboardPage() {
  const user = await requireUser();
  const now = new Date();

  const myUpcoming = await db.registration.findMany({
    where: { userId: user.id, activity: { date: { gte: now } } },
    include: { activity: true },
    orderBy: { activity: { date: "asc" } },
  });

  const isManager = can(user, "VIEW_REGISTRATIONS") || can(user, "MANAGE_ACTIVITIES");
  const stats = isManager
    ? await Promise.all([
        db.user.count(),
        db.activity.count({ where: { date: { gte: now } } }),
        db.registration.aggregate({ _sum: { participants: true }, where: { activity: { date: { gte: now } } } }),
        db.news.count({ where: { published: true } }),
      ])
    : null;

  const firstName = user.name.split(" ")[0];

  return (
    <>
      <PageHeader title={`Olá, ${firstName} 👋`} description={`Tens sessão iniciada como ${user.role.name}.`} />

      {stats && (
        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Utilizadores", value: stats[0], icon: Users, href: can(user, "MANAGE_USERS") ? "/area/gestao/utilizadores" : null },
            { label: "Próximas atividades", value: stats[1], icon: CalendarDays, href: can(user, "MANAGE_ACTIVITIES") ? "/area/gestao/atividades" : null },
            { label: "Pessoas inscritas", value: stats[2]._sum.participants ?? 0, icon: ClipboardList, href: can(user, "VIEW_REGISTRATIONS") ? "/area/gestao/inscricoes" : null },
            { label: "Notícias publicadas", value: stats[3], icon: Newspaper, href: can(user, "MANAGE_NEWS") ? "/area/gestao/noticias" : null },
          ].map(({ label, value, icon: Icon, href }) => {
            const body = (
              <>
                <Icon className="size-4 text-muted" />
                <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
                <p className="mt-0.5 text-sm text-muted">{label}</p>
              </>
            );
            return href ? (
              <Link key={label} href={href} className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/40">
                {body}
              </Link>
            ) : (
              <Card key={label} className="p-5">
                {body}
              </Card>
            );
          })}
        </div>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">As tuas próximas atividades</h2>
          <Link href="/area/inscricoes" className="text-sm font-medium text-accent hover:underline">
            Ver todas
          </Link>
        </div>
        {myUpcoming.length ? (
          <ul className="grid gap-3 md:grid-cols-2">
            {myUpcoming.slice(0, 4).map((r) => (
              <li key={r.id}>
                <Link
                  href={`/atividades/${r.activityId}`}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent/40"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-soft-fg">
                    <Ticket className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{r.activity.title}</p>
                    <p className="text-sm text-muted">
                      {formatDateTime(r.activity.date)} · {r.participants} pessoa{r.participants === 1 ? "" : "s"}
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={<Ticket />} title="Ainda não estás inscrito em nenhuma atividade">
            <Link href="/atividades" className={buttonClass("primary", "sm", "mt-4")}>
              Ver atividades
            </Link>
          </EmptyState>
        )}
      </section>
    </>
  );
}
