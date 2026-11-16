# Graph Report - grupo-amizade  (2026-11-16)

## Corpus Check
- Corpus is ~23,211 words - fits in a single context window. You may not need a graph.

## Summary
- 489 nodes · 1526 edges · 22 communities (17 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.85)
- Token cost: 168,559 input · 0 output

## Community Hubs (Navigation)
- Atividades e Inscrições
- Permissões e Ações de Gestão
- Páginas de Gestão
- Gestores de Conteúdo (Modais)
- Layouts e Navegação
- Páginas de Autenticação
- Arquitetura e Decisões (README)
- Dependências de Desenvolvimento
- Ações de Autenticação e Email
- Dependências de Produção
- Configuração TypeScript
- Seed da Base de Dados
- Scripts npm
- Layout Raiz e Fontes
- Configuração ESLint
- Configuração Prisma
- Logótipo e Ícones
- Inscrições e Limite de Vagas
- Capa Demo Verde
- Capa Demo Violeta
- Capa Demo Laranja

## God Nodes (most connected - your core abstractions)
1. `next` - 47 edges
2. `lucide-react` - 31 edges
3. `cn()` - 31 edges
4. `EmptyState()` - 28 edges
5. `react` - 25 edges
6. `PageHeader()` - 23 edges
7. `Input()` - 23 edges
8. `Container()` - 21 edges
9. `buttonClass()` - 21 edges
10. `db` - 20 edges

## Surprising Connections (you probably didn't know these)
- `Apple Touch Icon (white dove on teal, 180px)` --implements--> `Dove Logo Mark (black line-art dove in flight)`  [INFERRED]
  src/app/apple-icon.png → public/dove.png
- `Favicon (white dove on teal rounded square)` --implements--> `Dove Logo Mark (black line-art dove in flight)`  [INFERRED]
  src/app/icon.png → public/dove.png
- `ProfileForm()` --indirect_call--> `updateProfile()`  [INFERRED]
  src/components/area/profile-forms.tsx → src/app/actions/account.ts
- `PasswordForm()` --indirect_call--> `changePassword()`  [INFERRED]
  src/components/area/profile-forms.tsx → src/app/actions/account.ts
- `DeleteAccountForm()` --indirect_call--> `deleteAccount()`  [INFERRED]
  src/components/area/profile-forms.tsx → src/app/actions/account.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Site Technology Stack** — readme_nextjs_16, readme_tailwind_css_4, readme_postgresql_prisma_7, readme_zod_validation, readme_resend_email, readme_vercel_blob, readme_vercel_neon_hosting [EXTRACTED 1.00]
- **Role-based Access Control Model** — readme_role_levels, readme_permissions_matrix, readme_dynamic_sidebar, readme_activity_visibility, readme_footer_permissions, src_lib_permissions [INFERRED 0.85]
- **Improvements over Original Version** — readme_capacity_limit_locking, readme_lisbon_timezone, readme_rgpd, readme_security_measures, readme_accessibility_calendar [EXTRACTED 1.00]
- **Demo placeholder cover images (same blurred-blob gradient template, 1600x1000)** — public_demo_cover_1_image, public_demo_cover_2_image, public_demo_cover_3_image [INFERRED 0.95]

## Communities (22 total, 5 thin omitted)

### Community 0 - "Atividades e Inscrições"
Cohesion: 0.07
Nodes (74): nextConfig, lucide-react, next, cancelRegistration(), RegistrationError, saveRegistration(), ActivityDetail(), ActivityPage() (+66 more)

### Community 1 - "Permissões e Ações de Gestão"
Cohesion: 0.08
Nodes (50): Internal/External Activities (visibility field), Reserved Area Dynamic Sidebar, EDIT_FOOTER / CREATE_FOOTER Permissions, Editable Permissions Matrix, Server Actions (src/app/actions), react, changePassword(), deleteAccount() (+42 more)

### Community 2 - "Páginas de Gestão"
Cohesion: 0.09
Nodes (39): loadActivities(), ManageActivitiesPage(), metadata, cell(), GET(), ActivityRegistrationsPage(), age(), metadata (+31 more)

### Community 3 - "Gestores de Conteúdo (Modais)"
Cohesion: 0.17
Nodes (35): AboutFields(), AboutManager(), Section, ActivitiesManager(), ActivityFields(), Action, EntityDialog(), InnerForm() (+27 more)

### Community 4 - "Layouts e Navegação"
Cohesion: 0.11
Nodes (28): AuthLayout(), SiteLayout(), ICONS, NavGroup, NavItem, NavList(), Sidebar(), SidebarBody() (+20 more)

### Community 5 - "Páginas de Autenticação"
Cohesion: 0.14
Nodes (25): register(), metadata, ProfilePage(), LoginPage(), metadata, ForgotPasswordPage(), metadata, metadata (+17 more)

### Community 6 - "Arquitetura e Decisões (README)"
Cohesion: 0.08
Nodes (18): next/dist/server/lib/generate-agent-files.js, node_modules/next/dist/docs guides, Next.js Agent Rules (breaking-changes notice), prisma/schema.prisma, Next.js 16 (App Router, React 19, TypeScript), PostgreSQL + Prisma 7, Pre-production Checklist, Resend Email (password recovery) (+10 more)

### Community 7 - "Dependências de Desenvolvimento"
Cohesion: 0.12
Nodes (22): devDependencies, embedded-postgres@^18.6.0-beta.19, tailwindcss@4.3.3, @tailwindcss/turbopack@4.3.3, tsx@^4.23.15, @types/node@^20, @types/pg@^8.23.1, @types/react@^19 (+14 more)

### Community 8 - "Ações de Autenticação e Email"
Cohesion: 0.17
Nodes (19): server-only@^0.0.1, server-only, login(), logout(), PASSWORD_FIELDS, requestPasswordReset(), resetPassword(), safeNext() (+11 more)

### Community 9 - "Dependências de Produção"
Cohesion: 0.10
Nodes (20): dependencies, clsx@^2.1.1, lucide-react@^1.73.0, next@16.4.6, pg@^8.23.1, @prisma/client@^7.10.1, react@19.3.0, react-dom@19.3.0 (+12 more)

### Community 10 - "Configuração TypeScript"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 11 - "Seed da Base de Dados"
Cohesion: 0.16
Nodes (10): bcryptjs@^3.0.3, @prisma/adapter-pg@^7.10.1, daysFromNow(), db, demo(), main(), ROLES, Seed Master Account (SEED_MASTER_EMAIL/PASSWORD, SEED_DEMO) (+2 more)

### Community 12 - "Scripts npm"
Cohesion: 0.17
Nodes (12): scripts, build, db, db:migrate, db:seed, db:studio, dev, lint (+4 more)

### Community 13 - "Layout Raiz e Fontes"
Cohesion: 0.22
Nodes (6): sonner@^2.0.8, sonner, displaySerif, geistSans, metadata, viewport

### Community 14 - "Configuração ESLint"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9, eslint-config-next@16.4.6, eslint, eslint-config-next

### Community 15 - "Configuração Prisma"
Cohesion: 0.40
Nodes (4): dotenv@^18.0.10, prisma@^7.10.1, dotenv, prisma

### Community 16 - "Logótipo e Ícones"
Cohesion: 0.67
Nodes (4): Dove Logo Mark (black line-art dove in flight), Grupo Amizade Full Logo (dove + hand-lettered wordmark), Apple Touch Icon (white dove on teal, 180px), Favicon (white dove on teal rounded square)

## Knowledge Gaps
- **12 isolated node(s):** `Original Version (HTML/CSS/JS + PHP + MySQL)`, `Internal/External Activities (visibility field)`, `Registrations CSV Export`, `EDIT_FOOTER / CREATE_FOOTER Permissions`, `Seed Master Account (SEED_MASTER_EMAIL/PASSWORD, SEED_DEMO)` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 111 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Atividades e Inscrições` to `Permissões e Ações de Gestão`, `Páginas de Gestão`, `Gestores de Conteúdo (Modais)`, `Layouts e Navegação`, `Páginas de Autenticação`, `Dependências de Desenvolvimento`, `Ações de Autenticação e Email`, `Dependências de Produção`, `Layout Raiz e Fontes`?**
  _High betweenness centrality (0.222) - this node is a cross-community bridge._
- **What connects `Original Version (HTML/CSS/JS + PHP + MySQL)`, `Internal/External Activities (visibility field)`, `Registrations CSV Export` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Atividades e Inscrições` be split into smaller, more focused modules?**
  _Cohesion score 0.06615240766713418 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `Atividades e Inscrições` to `Permissões e Ações de Gestão`, `Páginas de Gestão`, `Gestores de Conteúdo (Modais)`, `Layouts e Navegação`, `Páginas de Autenticação`, `Dependências de Desenvolvimento`, `Dependências de Produção`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Should `Permissões e Ações de Gestão` be split into smaller, more focused modules?**
  _Cohesion score 0.08192090395480225 - nodes in this community are weakly interconnected._
- **Why does `Site do Grupo Amizade` connect `Arquitetura e Decisões (README)` to `Atividades e Inscrições`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `Páginas de Gestão` be split into smaller, more focused modules?**
  _Cohesion score 0.08506493506493507 - nodes in this community are weakly interconnected._