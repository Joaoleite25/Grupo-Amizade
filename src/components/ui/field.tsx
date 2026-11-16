import { cn } from "@/lib/utils";

const control =
  "w-full min-w-0 rounded-lg border border-border bg-surface px-3 text-sm text-fg shadow-xs transition-colors " +
  "placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent/15 " +
  "aria-invalid:border-danger aria-invalid:ring-danger/15 disabled:opacity-60";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(control, "h-10", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-28 py-2.5 leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return <select className={cn(control, "h-10 pr-8", className)} {...props} />;
}

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("text-sm font-medium text-fg", className)} {...props} />;
}

/**
 * Campo de formulário: label + controlo + ajuda + erros.
 * O controlo recebe-se como children e deve ter id = name.
 */
export function Field({
  label,
  name,
  hint,
  errors,
  className,
  children,
}: {
  label: string;
  name: string;
  hint?: React.ReactNode;
  errors?: string[];
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={name}>{label}</Label>
      {children}
      {hint && !errors?.length && <p className="text-xs text-muted">{hint}</p>}
      {errors?.map((e) => (
        <p key={e} id={`${name}-error`} className="text-xs font-medium text-danger">
          {e}
        </p>
      ))}
    </div>
  );
}
