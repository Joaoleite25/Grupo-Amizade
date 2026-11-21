import "server-only";
import { Resend } from "resend";
import { activityUrl, googleCalendarUrl, mapsUrl, siteUrl } from "@/lib/calendar";
import { formatDateTimeRange } from "@/lib/utils";

type Mail = { to: string; subject: string; html: string; text: string };

/**
 * Envia um email com o Resend. Sem RESEND_API_KEY (desenvolvimento),
 * mostra o conteúdo no terminal em vez de enviar.
 */
export async function sendEmail(mail: Mail) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`\n✉️  [email não enviado: falta RESEND_API_KEY]\nPara: ${mail.to}\nAssunto: ${mail.subject}\n${mail.text}\n`);
    return;
  }
  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Grupo Amizade <onboarding@resend.dev>",
    ...mail,
  });
  if (error) throw new Error(`Falha ao enviar email: ${error.message}`);
}

/** Envia sem deixar que uma falha no email estrague a ação que o pediu. */
export async function sendEmailSafely(mail: Mail) {
  try {
    await sendEmail(mail);
  } catch (e) {
    console.error(e);
  }
}

// ─── Modelos ─────────────────────────────────────────────────────────

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const firstName = (name: string) => name.split(" ")[0] ?? name;

function button(href: string, label: string, secondary = false) {
  const style = secondary
    ? "background:#f5f5f4;color:#1c1917;border:1px solid #e7e5e4"
    : "background:#0f766e;color:#fff";
  return `<a href="${esc(href)}" style="${style};display:inline-block;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;margin:0 8px 8px 0">${esc(label)}</a>`;
}

function layout(body: string) {
  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:auto;color:#1c1917;line-height:1.55">
      ${body}
      <p style="color:#78716c;font-size:13px;margin-top:32px;border-top:1px solid #e7e5e4;padding-top:16px">
        Grupo Amizade · <a href="${esc(siteUrl())}" style="color:#0f766e">${esc(siteUrl().replace(/^https?:\/\//, ""))}</a>
      </p>
    </div>`;
}

export function passwordResetEmail(name: string, link: string): Omit<Mail, "to"> {
  const first = firstName(name);
  return {
    subject: "Recuperar a tua palavra-passe — Grupo Amizade",
    text: `Olá ${first},\n\nPediste para recuperar a palavra-passe. Abre este link (válido durante 1 hora):\n${link}\n\nSe não foste tu, ignora este email.`,
    html: layout(`
      <h2 style="font-weight:600">Olá ${esc(first)},</h2>
      <p>Pediste para recuperar a palavra-passe da tua conta no site do Grupo Amizade.</p>
      <p style="margin:28px 0">${button(link, "Definir nova palavra-passe")}</p>
      <p style="color:#78716c;font-size:14px">O link é válido durante 1 hora. Se não foste tu, podes ignorar este email.</p>`),
  };
}

type EmailActivity = {
  id: string;
  title: string;
  description: string;
  date: Date;
  endsAt: Date | null;
  location: string | null;
  bring: string | null;
};

function details(a: EmailActivity, participants: number) {
  const rows = [
    ["Quando", formatDateTimeRange(a.date, a.endsAt)],
    ...(a.location ? [["Onde", a.location]] : []),
    ["Pessoas", String(participants)],
    ...(a.bring ? [["O que levar", a.bring]] : []),
  ];
  return {
    text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
    html: `<table style="border-collapse:collapse;margin:20px 0;font-size:15px">${rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:4px 16px 4px 0;color:#78716c;vertical-align:top">${esc(k!)}</td><td style="padding:4px 0;font-weight:500;white-space:pre-line">${
            k === "Onde" ? `<a href="${esc(mapsUrl(v!))}" style="color:#0f766e">${esc(v!)}</a>` : esc(v!)
          }</td></tr>`,
      )
      .join("")}</table>`,
  };
}

function calendarButtons(a: EmailActivity) {
  const ics = `${activityUrl(a.id)}/calendario`;
  return {
    text: `Adicionar ao Google Calendar: ${googleCalendarUrl(a)}\nAdicionar a outro calendário (.ics): ${ics}`,
    html: `<p style="margin:24px 0 8px">${button(googleCalendarUrl(a), "Google Calendar")}${button(ics, "Apple / Outlook (.ics)", true)}</p>`,
  };
}

/** Inscrição confirmada (nova, ou vinda da lista de espera). */
export function registrationConfirmedEmail(
  name: string,
  a: EmailActivity,
  participants: number,
  fromWaitlist = false,
): Omit<Mail, "to"> {
  const first = firstName(name);
  const intro = fromWaitlist
    ? `Abriu uma vaga e a tua inscrição em "${a.title}" saiu da lista de espera: está confirmada!`
    : `A tua inscrição em "${a.title}" está confirmada.`;
  const d = details(a, participants);
  const cal = calendarButtons(a);
  return {
    subject: `${fromWaitlist ? "Saíste da lista de espera" : "Inscrição confirmada"}: ${a.title}`,
    text: `Olá ${first},\n\n${intro}\n\n${d.text}\n\n${cal.text}\n\nSe já não puderes ir, cancela a inscrição para dares a vaga a outra pessoa:\n${activityUrl(a.id)}`,
    html: layout(`
      <h2 style="font-weight:600">Olá ${esc(first)},</h2>
      <p>${esc(intro)}</p>
      ${d.html}
      <p style="font-weight:600;margin-bottom:0">Adicionar ao calendário</p>
      ${cal.html}
      <p style="color:#78716c;font-size:14px">Se já não puderes ir, <a href="${esc(activityUrl(a.id))}" style="color:#0f766e">cancela a inscrição</a> para dares a vaga a outra pessoa.</p>`),
  };
}

/** Entrou na lista de espera. */
export function waitlistEmail(name: string, a: EmailActivity, participants: number, position: number): Omit<Mail, "to"> {
  const first = firstName(name);
  const d = details(a, participants);
  return {
    subject: `Lista de espera: ${a.title}`,
    text: `Olá ${first},\n\nAs vagas para "${a.title}" esgotaram, por isso ficaste na lista de espera (posição ${position}). Se alguém cancelar, a tua inscrição é confirmada automaticamente e avisamos-te por email.\n\n${d.text}\n\n${activityUrl(a.id)}`,
    html: layout(`
      <h2 style="font-weight:600">Olá ${esc(first)},</h2>
      <p>As vagas para <strong>${esc(a.title)}</strong> esgotaram, por isso ficaste na <strong>lista de espera (posição ${position})</strong>.</p>
      <p>Se alguém cancelar, a tua inscrição é confirmada automaticamente e avisamos-te por email.</p>
      ${d.html}
      <p>${button(activityUrl(a.id), "Ver atividade", true)}</p>`),
  };
}
