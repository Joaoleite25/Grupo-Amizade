import "server-only";
import { Resend } from "resend";

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

export function passwordResetEmail(name: string, link: string): Omit<Mail, "to"> {
  const first = name.split(" ")[0];
  return {
    subject: "Recuperar a tua palavra-passe — Grupo Amizade",
    text: `Olá ${first},\n\nPediste para recuperar a palavra-passe. Abre este link (válido durante 1 hora):\n${link}\n\nSe não foste tu, ignora este email.`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto;color:#1c1917">
        <h2 style="font-weight:600">Olá ${first},</h2>
        <p>Pediste para recuperar a palavra-passe da tua conta no site do Grupo Amizade.</p>
        <p style="margin:28px 0">
          <a href="${link}" style="background:#0f766e;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Definir nova palavra-passe</a>
        </p>
        <p style="color:#78716c;font-size:14px">O link é válido durante 1 hora. Se não foste tu, podes ignorar este email.</p>
      </div>`,
  };
}
