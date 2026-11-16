import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("rounded-2xl border border-border bg-surface", className)} {...props} />;
}

const badgeTones = {
  neutral: "bg-surface-2 text-muted",
  accent: "bg-accent-soft text-accent-soft-fg",
  internal: "bg-internal-soft text-internal-fg",
  warning: "bg-warning-soft text-warning-fg",
  danger: "bg-danger-soft text-danger",
} as const;

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.ComponentProps<"span"> & { tone?: keyof typeof badgeTones }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        badgeTones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function EmptyState({
  icon,
  title,
  children,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-14 text-center",
        className,
      )}
    >
      {icon && <div className="mb-3 text-muted [&_svg]:size-8">{icon}</div>}
      <p className="font-medium">{title}</p>
      {children && <div className="mt-1 max-w-sm text-sm text-muted">{children}</div>}
    </div>
  );
}

export function FormMessage({ state }: { state?: { ok?: boolean; message?: string } }) {
  if (!state?.message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={cn(
        "rounded-lg px-3 py-2.5 text-sm",
        state.ok ? "bg-accent-soft text-accent-soft-fg" : "bg-danger-soft text-danger",
      )}
    >
      {state.message}
    </p>
  );
}

export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span aria-hidden className="dove size-8 text-accent" />
      {withText && <span className="text-[15px] font-semibold tracking-tight">Grupo Amizade</span>}
    </span>
  );
}

/** Imagem de reserva quando um conteúdo não tem fotografia. */
export function ImageFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gradient-to-br from-accent-soft via-surface-2 to-internal-soft",
        className,
      )}
    >
      <span aria-hidden className="dove size-16 text-accent/40" />
    </div>
  );
}
