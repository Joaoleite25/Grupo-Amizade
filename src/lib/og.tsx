import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

// Imagens de partilha (WhatsApp, Facebook, Instagram...) geradas a partir de código.
export const OG_SIZE = { width: 1200, height: 630 };

const TEAL = "#0f766e";
const TEAL_DARK = "#134e4a";

async function icon() {
  // Pomba branca sobre fundo verde (o mesmo ícone do site), embutida como data URI.
  const file = await readFile(path.join(process.cwd(), "src", "app", "apple-icon.png"));
  return `data:image/png;base64,${file.toString("base64")}`;
}

/** Cartão de partilha com o título em grande e, opcionalmente, uma etiqueta e detalhes. */
export async function ogCard({ eyebrow, title, details = [] }: { eyebrow?: string; title: string; details?: string[] }) {
  const src = await icon();
  const size = title.length > 60 ? 58 : title.length > 35 ? 68 : 80;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DARK} 100%)`,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} width={72} height={72} alt="" style={{ borderRadius: 18, border: "2px solid rgba(255,255,255,0.35)" }} />
          <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.5 }}>Grupo Amizade</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {eyebrow && (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "8px 20px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.16)",
                fontSize: 26,
                fontWeight: 500,
              }}
            >
              {eyebrow}
            </div>
          )}
          <div style={{ fontSize: size, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000 }}>{title}</div>
        </div>

        <div style={{ display: "flex", gap: 40, fontSize: 30, color: "rgba(255,255,255,0.85)" }}>
          {details.map((d) => (
            <div key={d} style={{ display: "flex" }}>
              {d}
            </div>
          ))}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
