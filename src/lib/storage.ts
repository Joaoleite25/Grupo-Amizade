import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { put, del } from "@vercel/blob";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export class UploadError extends Error {}

/** Devolve o ficheiro se o campo tiver uma imagem escolhida, ou null se vier vazio. */
export function fileFrom(formData: FormData, field: string) {
  const value = formData.get(field);
  return value instanceof File && value.size > 0 ? value : null;
}

/**
 * Guarda uma imagem enviada por formulário e devolve o URL público.
 * - Em produção (Vercel) usa o Vercel Blob (BLOB_READ_WRITE_TOKEN).
 * - Em desenvolvimento, sem token, grava em public/uploads.
 */
export async function saveImage(file: File, folder: string) {
  const ext = TYPES[file.type];
  if (!ext) throw new UploadError("A imagem tem de ser JPG, PNG, WebP ou AVIF.");
  if (file.size > MAX_BYTES) throw new UploadError("A imagem não pode ter mais de 5 MB.");

  const name = `${folder}/${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(name, file, { access: "public", contentType: file.type });
    return blob.url;
  }

  const dest = path.join(process.cwd(), "public", "uploads", name);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

/** Apaga uma imagem antiga (ignora erros: a imagem pode já não existir). */
export async function deleteImage(url: string | null | undefined) {
  if (!url) return;
  try {
    if (url.startsWith("/uploads/")) {
      await unlink(path.join(process.cwd(), "public", url));
    } else if (url.includes(".blob.vercel-storage.com") && process.env.BLOB_READ_WRITE_TOKEN) {
      await del(url);
    }
  } catch {
    /* sem problema */
  }
}
