"use server";

import { revalidatePath, updateTag } from "next/cache";
import { after } from "next/server";
import { db } from "@/lib/db";
import { lockActivity, notifyPromoted, promoteWaitlist } from "@/lib/waitlist";
import { assertPermission, ForbiddenError } from "@/lib/auth";
import { SETTINGS, TAGS } from "@/lib/data";
import { ALL_PERMISSIONS, MASTER_LEVEL, type Permission } from "@/lib/permissions";
import { deleteImage, fileFrom, saveImage, UploadError } from "@/lib/storage";
import { parseLisbonDateTime } from "@/lib/utils";
import {
  AboutSchema,
  ActivitySchema,
  FooterSchema,
  NewsSchema,
  fieldErrors,
  formValues,
  type FormState,
} from "@/lib/validation";

/** Trata os erros esperados (permissões, uploads) e devolve-os ao formulário. */
async function guarded(values: Record<string, string>, fn: () => Promise<FormState>): Promise<FormState> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ForbiddenError || e instanceof UploadError) return { message: e.message, values };
    throw e;
  }
}

const idOf = (formData: FormData) => String(formData.get("id") ?? "") || null;

// ─── Notícias ────────────────────────────────────────────────────────

export async function saveNews(_: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  return guarded(values, async () => {
    await assertPermission("MANAGE_NEWS");
    const parsed = NewsSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

    const id = idOf(formData);
    const existing = id ? await db.news.findUnique({ where: { id } }) : null;
    const desktop = fileFrom(formData, "imageDesktop");
    const mobile = fileFrom(formData, "imageMobile");
    if (!existing && !desktop) return { errors: { imageDesktop: ["Escolhe uma imagem."] }, values };

    const data = {
      title: parsed.data.title,
      body: parsed.data.body,
      link: parsed.data.link ?? null,
      published: parsed.data.published === "on",
      ...(desktop && { imageDesktop: await saveImage(desktop, "noticias") }),
      ...(mobile && { imageMobile: await saveImage(mobile, "noticias") }),
    };

    if (existing) {
      await db.news.update({ where: { id: existing.id }, data });
      if (desktop) await deleteImage(existing.imageDesktop);
      if (mobile) await deleteImage(existing.imageMobile);
    } else {
      await db.news.create({ data: { ...data, imageDesktop: data.imageDesktop! } });
    }

    updateTag(TAGS.news);
    revalidatePath("/area/gestao/noticias");
    return { ok: true, message: existing ? "Notícia atualizada." : "Notícia criada." };
  });
}

export async function deleteNews(formData: FormData) {
  await assertPermission("MANAGE_NEWS");
  const news = await db.news.delete({ where: { id: String(formData.get("id")) } });
  await deleteImage(news.imageDesktop);
  await deleteImage(news.imageMobile);
  updateTag(TAGS.news);
  revalidatePath("/area/gestao/noticias");
}

// ─── Sobre ───────────────────────────────────────────────────────────

export async function saveAbout(_: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  return guarded(values, async () => {
    await assertPermission("MANAGE_ABOUT");
    const parsed = AboutSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

    const id = idOf(formData);
    if (id) {
      await db.aboutSection.update({ where: { id }, data: parsed.data });
    } else {
      const last = await db.aboutSection.aggregate({ _max: { position: true } });
      await db.aboutSection.create({ data: { ...parsed.data, position: (last._max.position ?? 0) + 1 } });
    }
    updateTag(TAGS.about);
    revalidatePath("/area/gestao/sobre");
    return { ok: true, message: id ? "Texto atualizado." : "Texto criado." };
  });
}

export async function deleteAbout(formData: FormData) {
  await assertPermission("MANAGE_ABOUT");
  await db.aboutSection.delete({ where: { id: String(formData.get("id")) } });
  updateTag(TAGS.about);
  revalidatePath("/area/gestao/sobre");
}

/** Troca a posição de um texto com o anterior/seguinte. */
export async function moveAbout(formData: FormData) {
  await assertPermission("MANAGE_ABOUT");
  const id = String(formData.get("id"));
  const dir = formData.get("dir") === "up" ? -1 : 1;
  const list = await db.aboutSection.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] });
  const i = list.findIndex((s) => s.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j]!, list[i]!];
  await db.$transaction(list.map((s, position) => db.aboutSection.update({ where: { id: s.id }, data: { position } })));
  updateTag(TAGS.about);
  revalidatePath("/area/gestao/sobre");
}

/** Foto do grupo no topo da página inicial (e a sua descrição para leitores de ecrã). */
export async function saveHeroImage(_: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  return guarded(values, async () => {
    await assertPermission("MANAGE_ABOUT");
    const alt = String(formData.get("alt") ?? "").trim().slice(0, 200);
    const file = fileFrom(formData, "image");
    const current = await db.setting.findUnique({ where: { key: SETTINGS.heroImage } });
    if (!file && !current) return { errors: { image: ["Escolhe uma foto."] }, values };
    if (!alt) return { errors: { alt: ["Descreve a foto (ex.: “O grupo no acampamento de verão”)."] }, values };

    if (file) {
      const url = await saveImage(file, "topo");
      await db.setting.upsert({ where: { key: SETTINGS.heroImage }, create: { key: SETTINGS.heroImage, value: url }, update: { value: url } });
      await deleteImage(current?.value);
    }
    await db.setting.upsert({ where: { key: SETTINGS.heroAlt }, create: { key: SETTINGS.heroAlt, value: alt }, update: { value: alt } });

    updateTag(TAGS.settings);
    revalidatePath("/area/gestao/sobre");
    return { ok: true, message: "Foto do topo guardada." };
  });
}

export async function removeHeroImage() {
  await assertPermission("MANAGE_ABOUT");
  const current = await db.setting.findUnique({ where: { key: SETTINGS.heroImage } });
  await db.setting.deleteMany({ where: { key: { in: [SETTINGS.heroImage, SETTINGS.heroAlt] } } });
  await deleteImage(current?.value);
  updateTag(TAGS.settings);
  revalidatePath("/area/gestao/sobre");
}

// ─── Rodapé ──────────────────────────────────────────────────────────

export async function saveFooter(_: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  return guarded(values, async () => {
    const id = idOf(formData);
    // Editar precisa de EDIT_FOOTER; criar precisa de CREATE_FOOTER.
    await assertPermission(id ? "EDIT_FOOTER" : "CREATE_FOOTER");
    const parsed = FooterSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { errors: fieldErrors(parsed.error), values };
    if (parsed.data.kind === "SOCIAL" && !parsed.data.url) {
      return { errors: { url: ["As redes sociais precisam de um link."] }, values };
    }

    const data = { ...parsed.data, url: parsed.data.url ?? null };
    if (id) {
      await db.footerItem.update({ where: { id }, data });
    } else {
      const last = await db.footerItem.aggregate({ _max: { position: true } });
      await db.footerItem.create({ data: { ...data, position: (last._max.position ?? 0) + 1 } });
    }
    updateTag(TAGS.footer);
    revalidatePath("/area/gestao/rodape");
    return { ok: true, message: id ? "Informação atualizada." : "Informação criada." };
  });
}

export async function deleteFooter(formData: FormData) {
  await assertPermission("CREATE_FOOTER");
  await db.footerItem.delete({ where: { id: String(formData.get("id")) } });
  updateTag(TAGS.footer);
  revalidatePath("/area/gestao/rodape");
}

// ─── Atividades ──────────────────────────────────────────────────────

export async function saveActivity(_: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  return guarded(values, async () => {
    await assertPermission("MANAGE_ACTIVITIES");
    const parsed = ActivitySchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { errors: fieldErrors(parsed.error), values };
    const d = parsed.data;

    const date = parseLisbonDateTime(d.date);
    const opens = parseLisbonDateTime(d.registrationOpens);
    const ends = parseLisbonDateTime(d.registrationEnds);
    const errors: Record<string, string[]> = {};
    if (!date) errors.date = ["Data inválida."];
    if (!opens) errors.registrationOpens = ["Data inválida."];
    if (!ends) errors.registrationEnds = ["Data inválida."];
    if (opens && ends && ends <= opens) errors.registrationEnds = ["O fecho tem de ser depois da abertura."];
    if (ends && date && ends > date) errors.registrationEnds = ["As inscrições têm de fechar antes da atividade."];
    if (Object.keys(errors).length) return { errors, values };

    const id = idOf(formData);
    const existing = id ? await db.activity.findUnique({ where: { id } }) : null;
    const capacity = d.limited === "yes" ? Number(d.capacity) : null;

    if (existing && capacity !== null) {
      const sum = await db.registration.aggregate({
        _sum: { participants: true },
        where: { activityId: existing.id, waitlisted: false },
      });
      const registered = sum._sum.participants ?? 0;
      if (capacity < registered) {
        return { errors: { capacity: [`Já há ${registered} pessoas inscritas — o limite não pode ser menor.`] }, values };
      }
    }

    const image = fileFrom(formData, "image");
    const removeImage = formData.get("removeImage") === "on";
    const data = {
      title: d.title,
      description: d.description,
      date: date!,
      registrationOpens: opens!,
      registrationEnds: ends!,
      capacity,
      visibility: d.visibility,
      link: d.link ?? null,
      location: d.location,
      ages: d.ages,
      bring: d.bring,
      ...(image ? { image: await saveImage(image, "atividades") } : removeImage ? { image: null } : {}),
    };

    if (existing) {
      // Se o limite aumentou (ou deixou de existir), confirma quem está na lista de espera.
      const promoted = await db.$transaction(async (tx) => {
        await lockActivity(tx, existing.id);
        await tx.activity.update({ where: { id: existing.id }, data });
        return promoteWaitlist(tx, existing.id);
      });
      if (promoted.length) after(() => notifyPromoted(promoted));
      if (image || removeImage) await deleteImage(existing.image);
    } else {
      await db.activity.create({ data });
    }

    updateTag(TAGS.activities);
    revalidatePath("/area", "layout");
    return { ok: true, message: existing ? "Atividade atualizada." : "Atividade criada." };
  });
}

export async function deleteActivity(formData: FormData) {
  await assertPermission("MANAGE_ACTIVITIES");
  const activity = await db.activity.delete({ where: { id: String(formData.get("id")) } });
  await deleteImage(activity.image);
  updateTag(TAGS.activities);
  revalidatePath("/area", "layout");
}

// ─── Utilizadores e permissões ───────────────────────────────────────

export async function changeUserRole(_: FormState, formData: FormData): Promise<FormState> {
  return guarded({}, async () => {
    const actor = await assertPermission("MANAGE_USERS");
    const target = await db.user.findUnique({ where: { id: String(formData.get("userId")) }, include: { role: true } });
    const role = await db.role.findUnique({ where: { id: Number(formData.get("roleId")) } });
    if (!target || !role) return { message: "Utilizador ou nível inválido." };

    const isMaster = actor.role.level >= MASTER_LEVEL;
    // Só se gere quem está abaixo; só se atribui um nível abaixo do próprio.
    // O Master pode tudo, exceto alterar-se a si próprio (nunca fica sem Master).
    if (target.id === actor.id) return { message: "Não podes alterar o teu próprio nível." };
    if (!isMaster && (target.role.level >= actor.role.level || role.level >= actor.role.level)) {
      return { message: "Só podes gerir utilizadores e níveis abaixo do teu." };
    }

    await db.user.update({ where: { id: target.id }, data: { roleId: role.id } });
    revalidatePath("/area/gestao/utilizadores");
    return { ok: true, message: `${target.name} é agora ${role.name}.` };
  });
}

export async function saveRolePermissions(_: FormState, formData: FormData): Promise<FormState> {
  return guarded({}, async () => {
    await assertPermission("MANAGE_ROLES");
    const roles = await db.role.findMany({ where: { level: { lt: MASTER_LEVEL } } });

    await db.$transaction(
      roles.map((role) => {
        const permissions = ALL_PERMISSIONS.filter(
          // MANAGE_ROLES fica reservado ao Master.
          (p) => p !== "MANAGE_ROLES" && formData.get(`${role.id}:${p}`) === "on",
        ) as Permission[];
        return db.role.update({ where: { id: role.id }, data: { permissions } });
      }),
    );
    revalidatePath("/area", "layout");
    return { ok: true, message: "Permissões guardadas." };
  });
}
