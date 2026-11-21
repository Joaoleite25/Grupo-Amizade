import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/calendar";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Área reservada e páginas de conta não interessam aos motores de busca.
      disallow: ["/area", "/entrar", "/registar", "/recuperar-password", "/redefinir-password"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
