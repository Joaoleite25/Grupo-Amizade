import type { Metadata } from "next";
import { Container, PageHero } from "@/components/site/section";

export const metadata: Metadata = { title: "Política de privacidade" };

// Texto base — deve ser revisto pela direção do Grupo Amizade antes de publicar.
const SECTIONS = [
  {
    title: "Quem trata os dados",
    body: "O responsável pelo tratamento dos dados é o Grupo Amizade, associação com sede em São João de Ver. Para qualquer questão sobre os teus dados, contacta-nos através do email indicado no rodapé do site.",
  },
  {
    title: "Que dados recolhemos",
    body: "Quando crias conta: nome completo, nome de utilizador, email, data de nascimento e palavra-passe (guardada de forma cifrada — nem nós a conseguimos ver). Quando te inscreves numa atividade: a atividade e o número de pessoas da inscrição.",
  },
  {
    title: "Para que usamos os dados",
    body: "Para gerir a tua conta, organizar as inscrições nas atividades (incluindo o número de participantes e vagas) e, se pedires, enviar-te um email para recuperares a palavra-passe. A data de nascimento serve para organizar atividades por idades. Não enviamos publicidade nem partilhamos os dados com terceiros para fins comerciais.",
  },
  {
    title: "Quem tem acesso",
    body: "Apenas os elementos da direção do grupo, com acesso à área reservada, podem ver as inscrições e os dados dos utilizadores, e só para organizar as atividades.",
  },
  {
    title: "Menores de idade",
    body: "Se tens menos de 16 anos, só podes criar conta com autorização do teu encarregado de educação.",
  },
  {
    title: "Os teus direitos",
    body: "Podes consultar e corrigir os teus dados a qualquer momento na área reservada (Perfil). Podes também apagar a tua conta: todos os teus dados e inscrições são eliminados de imediato. Tens ainda o direito de apresentar reclamação à Comissão Nacional de Proteção de Dados (CNPD).",
  },
  {
    title: "Cookies",
    body: "O site usa apenas um cookie essencial para manter a tua sessão iniciada. Não usamos cookies de publicidade nem de análise.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="RGPD" title="Política de privacidade" description="Como tratamos os teus dados pessoais, em linguagem simples." />
      <Container className="max-w-3xl space-y-10 py-14">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="text-xl font-semibold tracking-tight">{s.title}</h2>
            <p className="mt-2 leading-relaxed text-fg/85">{s.body}</p>
          </section>
        ))}
      </Container>
    </>
  );
}
