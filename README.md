# Site do Grupo Amizade

Nova versão do site do Grupo Amizade (PAP, Informática). Refeito de raiz com tecnologias atuais, no lugar da versão original em HTML/CSS/JS + PHP + MySQL.

## Tecnologias

| Camada | Escolha | Porquê |
| --- | --- | --- |
| Framework | **Next.js 16** (App Router, React 19, TypeScript) | Frontend e backend no mesmo projeto, com páginas rápidas por pré-renderização e cache |
| Estilos | **Tailwind CSS 4** | Interface consistente, clara e responsiva |
| Base de dados | **PostgreSQL** + **Prisma 7** | SQL a sério, com tipos gerados automaticamente e migrações versionadas |
| Autenticação | Sessões próprias (cookie httpOnly + tabela `Session`) e bcrypt | Simples de explicar e seguro |
| Validação | **Zod** | Valida todos os formulários no servidor |
| Email | **Resend** | Recuperação da palavra-passe |
| Imagens | **Vercel Blob** (produção) / `public/uploads` (local) | Fotos das notícias e atividades |
| Alojamento | **Vercel** + **Neon** (Postgres) | Gratuito, com HTTPS e deploy automático |

## Correspondência com o relatório original

| Requisito do relatório | Onde está |
| --- | --- |
| Página principal com notícias (carrossel), textos do grupo, próximas atividades e rodapé | `src/app/(site)/page.tsx` |
| Login e registo (utilizador, nome, email, data de nascimento, password) | `/entrar`, `/registar` |
| Inscrição em atividades com sessão iniciada | `/atividades/[id]` |
| Atividades internas e externas | campo `visibility`; as internas só aparecem a quem tem permissão |
| Ver quem está inscrito e o número de pessoas | Área reservada → Inscrições (com pesquisa e exportação para CSV) |
| Ver as minhas inscrições, alterar o número de pessoas ou cancelar | Área reservada → Minhas inscrições |
| Área reservada com sidebar dinâmica | `src/app/area/layout.tsx`: as opções dependem das permissões |
| 4 níveis: Utilizador, Staff, Direção, Master | tabela `Role` |
| Master define o que cada nível pode fazer (opção "Sidebar") | Área reservada → Permissões (matriz editável) |
| Gestão de utilizadores (só níveis inferiores) | Área reservada → Utilizadores |
| Informações do rodapé: Direção edita, Master cria | permissões `EDIT_FOOTER` / `CREATE_FOOTER` |
| Notícias com foto para computador e foto para telemóvel | Área reservada → Notícias |
| Textos "Sobre" | Área reservada → Sobre (com reordenação) |
| Atividades com título, imagem, descrição, data, abertura/fecho, limite, exposição e ligação | Área reservada → Atividades |
| *Extra:* email para recuperar a password | `/recuperar-password` |
| Site responsivo | todas as páginas |

### Melhorias em relação à versão original

- **Limite de vagas garantido**: a inscrição corre numa transação com bloqueio (`SELECT … FOR UPDATE`), por isso duas pessoas a inscreverem-se ao mesmo tempo não ultrapassam o limite.
- **Datas sempre na hora de Lisboa**, mesmo com o servidor em UTC (inclui a mudança para a hora de verão).
- **RGPD**: política de privacidade, consentimento no registo (com aviso para menores de 16 anos) e o próprio utilizador pode apagar a conta.
- **Segurança**: passwords com bcrypt, sessões guardadas como hash, verificação de permissões no servidor em cada ação e mensagens de login que não revelam que contas existem.
- **Calendário de atividades** (vista mensal), acessibilidade (navegação por teclado, foco visível, `prefers-reduced-motion`) e exportação de inscritos para Excel (CSV).

## Estrutura

```
prisma/
  schema.prisma        modelos da base de dados
  seed.ts              níveis, conta Master, textos e rodapé iniciais
src/
  app/
    (site)/            páginas públicas (início, notícias, sobre, atividades, privacidade)
    (auth)/            entrar, registar, recuperar e redefinir password
    area/              área reservada (painel, inscrições, perfil, gestão)
    actions/           server actions: tudo o que altera dados
  components/          componentes de interface (ui/, site/, area/, auth/)
  lib/
    auth.ts            utilizador atual e verificação de permissões
    session.ts         criar, ler e terminar sessões
    data.ts            leituras públicas com cache
    validation.ts      validação dos formulários (Zod)
    permissions.ts     lista de permissões
scripts/db.mjs         PostgreSQL local para desenvolvimento
```

## Correr no computador

Precisas do **Node.js 22** (há um `.nvmrc`; com o nvm basta `nvm use`).

```bash
git clone <url-do-repositório> grupo-amizade && cd grupo-amizade
cp .env.example .env          # e preenche SEED_MASTER_PASSWORD
npm install
npm run db                    # num terminal à parte: PostgreSQL local na porta 5433
npm run db:migrate            # cria as tabelas
SEED_DEMO=true npm run db:seed  # níveis, conta Master e conteúdo de exemplo
npm run dev                   # http://localhost:3000
```

Entra com o email `SEED_MASTER_EMAIL` e a password `SEED_MASTER_PASSWORD` do `.env`.

Outros comandos: `npm run db:studio` (ver a base de dados no browser), `npm run lint`, `npm run typecheck` e `npm run build`.

> Sem `RESEND_API_KEY`, o link de recuperação da password aparece no terminal em vez de ser enviado por email.

## Publicar (Vercel + Neon)

1. Põe o projeto num repositório GitHub.
2. Cria uma base de dados gratuita em [neon.tech](https://neon.tech) e copia o *connection string*.
3. Em [vercel.com](https://vercel.com), importa o repositório e define estas variáveis de ambiente:
   - `DATABASE_URL`: connection string do Neon
   - `APP_URL`: URL final do site (ex.: `https://grupoamizade.pt`)
   - `BLOB_READ_WRITE_TOKEN`: cria um *Blob store* em Vercel → Storage, que preenche esta variável sozinho
   - `RESEND_API_KEY` e `EMAIL_FROM`: conta em [resend.com](https://resend.com) com o domínio verificado
4. Em *Build Command* põe `npm run vercel-build`, que aplica as migrações antes do build.
5. Depois do primeiro deploy, corre o seed uma vez contra a base de dados de produção (no teu computador, com o `DATABASE_URL` do Neon e `SEED_DEMO=false`):
   ```bash
   DATABASE_URL="postgres://..." SEED_MASTER_EMAIL="..." SEED_MASTER_PASSWORD="..." npm run db:seed
   ```
6. Entra no site com a conta Master, muda a password e adiciona as redes sociais em **Informações**.

## Antes de pôr em produção

- [ ] A direção deve rever o texto da **política de privacidade** (`src/app/(site)/privacidade/page.tsx`).
- [ ] Adicionar os links do Instagram e do Facebook em Área reservada → Informações.
- [ ] Substituir os textos "Sobre" pelos textos oficiais do grupo, se for preciso.
- [ ] Verificar um domínio no Resend para os emails não irem para o spam.
