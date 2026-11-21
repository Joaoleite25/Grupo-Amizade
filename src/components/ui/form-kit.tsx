"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ImagePlus, RefreshCw, Trash2, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Peças dos formulários de criar/editar da área reservada.

/** Grupo de campos com título (ex.: "Data e hora"). */
export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("grid gap-4 border-t border-border pt-6 first-of-type:border-t-0 first-of-type:pt-0", className)}>
      <div>
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/**
 * Escolha entre poucas opções, em botões lado a lado (mais rápido do que um <select>).
 * São rádios de verdade: funcionam com teclado e são enviados no formulário.
 */
export function ChoiceGroup<T extends string>({
  name,
  value,
  onChange,
  options,
  label,
  columns = 2,
}: {
  name: string;
  value: T;
  onChange?: (value: T) => void;
  options: { value: T; label: string; description?: string; icon?: React.ReactNode }[];
  label: string;
  columns?: 2 | 3;
}) {
  const [current, setCurrent] = useState<T>(value);
  const select = (v: T) => {
    setCurrent(v);
    onChange?.(v);
  };
  return (
    <fieldset className="grid gap-1.5">
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className={cn("grid gap-2", columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 text-sm transition-colors",
              "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-accent/20",
              current === o.value ? "border-accent bg-accent-soft/60" : "border-border bg-surface hover:border-stone-300",
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={current === o.value}
              onChange={() => select(o.value)}
              className="sr-only"
            />
            {o.icon && (
              <span className={cn("mt-0.5 shrink-0 [&_svg]:size-4", current === o.value ? "text-accent" : "text-muted")}>
                {o.icon}
              </span>
            )}
            <span className="min-w-0">
              <span className="block font-medium">{o.label}</span>
              {o.description && <span className="mt-0.5 block text-xs text-muted">{o.description}</span>}
            </span>
            <span
              aria-hidden
              className={cn(
                "ml-auto mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
                current === o.value ? "border-accent bg-accent" : "border-stone-300",
              )}
            >
              {current === o.value && <span className="size-1.5 rounded-full bg-white" />}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Interruptor ligado/desligado (envia "on" quando ligado, como uma checkbox). */
export function Switch({
  name,
  defaultChecked,
  label,
  description,
}: {
  name: string;
  defaultChecked?: boolean;
  label: string;
  description?: string;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-muted">{description}</span>}
      </span>
      <span className="relative inline-flex shrink-0">
        <input id={id} type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-stone-300 transition-colors peer-checked:bg-accent peer-focus-visible:ring-3 peer-focus-visible:ring-accent/25" />
        <span className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

/**
 * Escolher uma foto com pré-visualização, arrastar e largar, trocar e remover.
 * - Envia o ficheiro no campo `name`.
 * - Se houver `removeName`, envia "on" nesse campo quando a foto atual é removida.
 */
export function ImageInput({
  name,
  current,
  removeName,
  required,
  aspect = "aspect-[16/9]",
  hint,
  errors,
}: {
  name: string;
  current?: string | null;
  removeName?: string;
  required?: boolean;
  aspect?: string;
  hint?: string;
  errors?: string[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Liberta o URL temporário da pré-visualização.
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  // Depois de enviar, o React limpa o formulário (e o ficheiro escolhido):
  // a pré-visualização tem de acompanhar, para não mostrar uma foto que já não vai ser enviada.
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const onReset = () => {
      setPreview(null);
      setFileName(null);
      setRemoved(false);
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, []);

  const pick = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
    setRemoved(false);
  };

  const clearNew = () => {
    if (inputRef.current) inputRef.current.value = "";
    setPreview(null);
    setFileName(null);
  };

  const shown = preview ?? (removed ? null : current ?? null);

  return (
    <div className="grid gap-1.5">
      <input
        ref={inputRef}
        id={name}
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp,image/avif"
        required={required && !current}
        className="sr-only"
        onChange={(e) => pick(e.target.files)}
        aria-invalid={errors?.length ? true : undefined}
      />
      {removeName && removed && !preview && <input type="hidden" name={removeName} value="on" />}

      {shown ? (
        <div className={cn("group relative overflow-hidden rounded-xl border border-border bg-surface-2", aspect)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shown} alt="" className="size-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/60 to-transparent p-3 pt-10">
            {fileName && <span className="mr-auto truncate text-xs font-medium text-white">{fileName}</span>}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-medium text-stone-900 backdrop-blur hover:bg-white"
            >
              <RefreshCw className="size-3.5" /> Trocar
            </button>
            {preview ? (
              <button
                type="button"
                onClick={clearNew}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-medium text-stone-900 backdrop-blur hover:bg-white"
              >
                <Undo2 className="size-3.5" /> {current && !removed ? "Manter a atual" : "Tirar"}
              </button>
            ) : (
              removeName && (
                <button
                  type="button"
                  onClick={() => setRemoved(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-medium text-danger backdrop-blur hover:bg-white"
                >
                  <Trash2 className="size-3.5" /> Remover
                </button>
              )
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (inputRef.current && e.dataTransfer.files.length) {
              inputRef.current.files = e.dataTransfer.files;
              pick(e.dataTransfer.files);
            }
          }}
          className={cn(
            "grid place-items-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
            dragging ? "border-accent bg-accent-soft/60" : "border-border bg-surface-2/40 hover:border-accent/50 hover:bg-accent-soft/30",
            errors?.length && "border-danger/60",
          )}
        >
          <ImagePlus className="mb-2 size-6 text-muted" />
          <span className="text-sm font-medium">
            Escolher foto <span className="font-normal text-muted">ou arrastar para aqui</span>
          </span>
          <span className="mt-1 text-xs text-muted">{hint ?? "JPG, PNG ou WebP, até 5 MB."}</span>
        </button>
      )}
      {!shown && removed && current && (
        <button
          type="button"
          onClick={() => setRemoved(false)}
          className="inline-flex items-center gap-1 justify-self-start text-xs font-medium text-accent hover:underline"
        >
          <Undo2 className="size-3.5" /> Desfazer: manter a foto atual
        </button>
      )}
      {errors?.map((e) => (
        <p key={e} className="text-xs font-medium text-danger">
          {e}
        </p>
      ))}
    </div>
  );
}
