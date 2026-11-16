import Link from "next/link";
import { Globe, Info, Mail, MapPin, Phone } from "lucide-react";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/site/social-icons";
import { getFooter } from "@/lib/data";
import { Logo } from "@/components/ui/misc";

function infoIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes("morada") || t.includes("local")) return MapPin;
  if (t.includes("mail") || t.includes("correio")) return Mail;
  if (t.includes("telef") || t.includes("telem") || t.includes("contacto")) return Phone;
  return Info;
}

function socialIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes("insta")) return InstagramIcon;
  if (t.includes("face")) return FacebookIcon;
  if (t.includes("youtube")) return YoutubeIcon;
  return Globe;
}

function infoHref(title: string, content: string) {
  const t = title.toLowerCase();
  if (t.includes("mail") && content.includes("@")) return `mailto:${content}`;
  if (t.includes("telef") || t.includes("telem")) return `tel:${content.replace(/\s/g, "")}`;
  return undefined;
}

export async function SiteFooter() {
  "use cache";
  const items = await getFooter();
  const info = items.filter((i) => i.kind === "INFO");
  const social = items.filter((i) => i.kind === "SOCIAL");

  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_2fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            Ajudamos os jovens a envolverem-se nas descobertas e nas decisões, através dos tempos livres, da educação para a paz e da solidariedade.
          </p>
          {social.length > 0 && (
            <ul className="flex gap-2">
              {social.map((s) => {
                const Icon = socialIcon(s.title);
                return (
                  <li key={s.id}>
                    <a
                      href={s.url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.title}
                      className="grid size-10 place-items-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent"
                    >
                      <Icon className="size-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <dl className="grid gap-6 sm:grid-cols-3">
          {info.map((i) => {
            const Icon = infoIcon(i.title);
            const href = i.url ?? infoHref(i.title, i.content);
            return (
              <div key={i.id} className="space-y-1.5">
                <dt className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted uppercase">
                  <Icon className="size-3.5" />
                  {i.title}
                </dt>
                <dd className="text-sm leading-relaxed whitespace-pre-line">
                  {href ? (
                    <a href={href} className="hover:text-accent hover:underline">
                      {i.content}
                    </a>
                  ) : (
                    i.content
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© Grupo Amizade · São João de Ver</p>
          <Link href="/privacidade" className="hover:text-fg">
            Política de privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}
