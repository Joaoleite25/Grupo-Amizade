import * as z from "zod";

// Estado devolvido pelas server actions para os formulários (useActionState).
export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
  // Valores enviados, para repor o formulário quando há erros.
  values?: Record<string, string>;
} | undefined;

export function fieldErrors(error: z.ZodError) {
  return z.flattenError(error).fieldErrors as Record<string, string[]>;
}

export function formValues(formData: FormData, omit: string[] = []) {
  const out: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (typeof v === "string" && !omit.includes(k) && !k.startsWith("$")) out[k] = v;
  }
  return out;
}

const optionalUrl = z
  .string()
  .trim()
  .transform((v) => v || undefined)
  .pipe(z.url({ error: "Link inválido (tem de começar por https://)." }).optional());

export const passwordSchema = z
  .string()
  .min(8, { error: "Pelo menos 8 caracteres." })
  .regex(/[a-zA-Z]/, { error: "Pelo menos uma letra." })
  .regex(/[0-9]/, { error: "Pelo menos um número." });

export const RegisterSchema = z
  .object({
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, { error: "Pelo menos 3 caracteres." })
      .max(30, { error: "No máximo 30 caracteres." })
      .regex(/^[a-z0-9._-]+$/, { error: "Só letras, números, ponto, hífen e underscore." }),
    name: z.string().trim().min(3, { error: "Escreve o nome completo." }).max(100),
    email: z.email({ error: "Email inválido." }).trim().toLowerCase(),
    birthDate: z.iso.date({ error: "Data inválida." }),
    password: passwordSchema,
    confirmPassword: z.string(),
    consent: z.literal("on", { error: "Tens de aceitar a política de privacidade." }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    error: "As palavras-passe não coincidem.",
    path: ["confirmPassword"],
  })
  .refine((d) => new Date(d.birthDate) < new Date() && new Date(d.birthDate) > new Date("1900-01-01"), {
    error: "Data de nascimento inválida.",
    path: ["birthDate"],
  });

export const LoginSchema = z.object({
  identifier: z.string().trim().toLowerCase().min(1, { error: "Escreve o utilizador ou email." }),
  password: z.string().min(1, { error: "Escreve a palavra-passe." }),
});

export const ProfileSchema = z.object({
  name: z.string().trim().min(3, { error: "Escreve o nome completo." }).max(100),
  email: z.email({ error: "Email inválido." }).trim().toLowerCase(),
  birthDate: z.iso.date({ error: "Data inválida." }),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { error: "Escreve a palavra-passe atual." }),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    error: "As palavras-passe não coincidem.",
    path: ["confirmPassword"],
  });

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(10),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    error: "As palavras-passe não coincidem.",
    path: ["confirmPassword"],
  });

export const NewsSchema = z.object({
  title: z.string().trim().min(3, { error: "Escreve um título." }).max(120),
  body: z.string().trim().min(10, { error: "Escreve o texto da notícia." }),
  link: optionalUrl,
  published: z.literal("on").optional(),
});

export const AboutSchema = z.object({
  title: z.string().trim().min(2, { error: "Escreve um título." }).max(120),
  body: z.string().trim().min(10, { error: "Escreve o texto." }),
});

export const FooterSchema = z.object({
  kind: z.enum(["INFO", "SOCIAL"]),
  title: z.string().trim().min(2, { error: "Escreve um título." }).max(60),
  content: z.string().trim().min(1, { error: "Escreve a informação." }).max(300),
  url: optionalUrl,
});

export const ActivitySchema = z
  .object({
    title: z.string().trim().min(3, { error: "Escreve um título." }).max(120),
    description: z.string().trim().min(10, { error: "Escreve uma descrição." }),
    date: z.string().min(1, { error: "Escolhe a data da atividade." }),
    registrationOpens: z.string().min(1, { error: "Escolhe a data de abertura." }),
    registrationEnds: z.string().min(1, { error: "Escolhe a data de fecho." }),
    limited: z.enum(["yes", "no"]),
    capacity: z.string().optional(),
    visibility: z.enum(["INTERNAL", "EXTERNAL"]),
    link: optionalUrl,
  })
  .refine((d) => d.limited === "no" || (Number(d.capacity) >= 1 && Number.isInteger(Number(d.capacity))), {
    error: "Indica um limite (número inteiro maior que 0).",
    path: ["capacity"],
  });

export const ParticipantsSchema = z.coerce
  .number({ error: "Número inválido." })
  .int({ error: "Número inválido." })
  .min(1, { error: "Pelo menos 1 pessoa." })
  .max(20, { error: "No máximo 20 pessoas por inscrição." });
