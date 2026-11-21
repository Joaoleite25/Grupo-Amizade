"use client";

import { useActionState, useEffect } from "react";
import { ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { removeHeroImage, saveHeroImage } from "@/app/actions/admin";
import { ConfirmSubmit, SubmitButton } from "@/components/ui/client";
import { Field, Input } from "@/components/ui/field";
import { Card, FormMessage } from "@/components/ui/misc";

const fileClass = "py-2 file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-2 file:py-1 file:text-xs";

/** Foto do grupo que aparece em grande no topo da página inicial. */
export function HeroImageForm({ image, alt }: { image: string | null; alt: string }) {
  const [state, action] = useActionState(saveHeroImage, undefined);
  useEffect(() => {
    if (state?.ok) toast.success(state.message);
  }, [state]);
  const e = state?.errors ?? {};

  return (
    <Card className="@container mb-10 overflow-hidden">
      {/* Lado a lado só quando o próprio cartão é largo (não depende do ecrã, por causa da barra lateral). */}
      <div className="grid @2xl:grid-cols-[16rem_1fr]">
        <div className="relative aspect-[16/9] bg-surface-2 @2xl:aspect-auto">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={alt} className="absolute inset-0 size-full object-cover" />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-muted">
              <ImageIcon className="size-8" />
            </div>
          )}
        </div>
        <div className="p-6">
          <h2 className="font-semibold">Foto do topo da página inicial</h2>
          <p className="mt-1 text-sm text-muted">
            Uma fotografia real do grupo, em grande, com a frase de boas-vindas por cima. Funciona melhor na horizontal
            (pelo menos 1600 px de largura), com as pessoas na parte de cima, porque o texto fica em baixo. Sem foto, o
            topo mostra o carrossel das notícias.
          </p>
          <form action={action} className="mt-5 space-y-4">
            <Field label={image ? "Trocar foto" : "Foto"} name="image" errors={e.image} hint="JPG, PNG, WebP ou AVIF, até 5 MB.">
              <Input id="image" name="image" type="file" accept="image/*" className={fileClass} />
            </Field>
            <Field label="Descrição da foto" name="alt" errors={e.alt} hint="Para quem usa leitores de ecrã.">
              <Input id="alt" name="alt" defaultValue={state?.values?.alt ?? alt} placeholder="Ex.: O grupo no acampamento de verão" />
            </Field>
            {!state?.ok && <FormMessage state={state} />}
            <div className="flex flex-wrap gap-2">
              <SubmitButton pendingText="A guardar...">Guardar</SubmitButton>
            </div>
          </form>
          {image && (
            <form action={removeHeroImage} className="mt-2">
              <ConfirmSubmit message="Remover a foto do topo? A página inicial volta a mostrar o carrossel no topo." size="md">
                <Trash2 /> Remover foto
              </ConfirmSubmit>
            </form>
          )}
        </div>
      </div>
    </Card>
  );
}
