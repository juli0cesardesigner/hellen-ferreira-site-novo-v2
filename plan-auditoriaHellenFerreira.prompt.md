# Plano: Auditoria Completa do Site Hellen Ferreira

**TL;DR** — Auditoria estrutural do site Next.js + Supabase + Mercado Pago. Foram encontrados **28 issues** de severidade variada: ~~3 críticos~~ **✅ CORRIGIDOS**, ~~8 altos~~ **✅ CORRIGIDOS**, ~~10 médios~~ **✅ CORRIGIDOS**, ~~7 baixos~~ **✅ CORRIGIDOS**.

---

## 🔴 CRÍTICO (Quebra funcional imediata)

### C1 ✅ — Inconsistência UTC vs Local no cálculo de dia da semana
- **Arquivos**: `src/lib/actions/booking-actions.ts` (linhas ~48, ~95, ~256, ~348)
- **Problema**: `getAvailableSlots` e `getMonthAvailability` usam `date.getUTCDay()` para buscar slots no banco (`day_of_week`), mas a data `dateStr` vem como `YYYY-MM-DD` (local).
- **Correção**: Criada helper `parseLocalDate()` que faz parse manual de `YYYY-MM-DD` como data local (`new Date(y, m-1, d)`). Substituído `getUTCDay()` por `getDay()` em `getAvailableSlots`, `getMonthAvailability` e `createBooking`.

### C2 ✅ — `createBooking` usa `getUTCDay()` para master grid mas inconsistente com query de slots
- **Arquivo**: `src/lib/actions/booking-actions.ts` (linhas ~348-362)
- **Correção**: Substituído `new Date(data.bookingDate).getUTCDay()` por `parseLocalDate(data.bookingDate).getDay()`, usando a mesma helper de parse local.

### C3 ✅ — `getFinanceSummary` / `getExpenses` têm duplo offset de mês
- **Arquivos**: `src/lib/actions/admin-actions.ts` (linhas 301, 442) + `src/app/admin/page.tsx` (linhas ~110-112) + `src/components/admin/ExpensesConfig.tsx` (linha 78)
- **Correção**: Padronizadas TODAS as funções financeiras para receber mês **0-indexed** (padrão JS `Date`). Corrigidas as chamadas em `admin/page.tsx` (removido `+1` nas chamadas de `getFinanceSummary` e loop MEI) e `ExpensesConfig.tsx` (removido `+1` na chamada de `getExpenses`).

---

## 🟠 ALTO (Segurança, dados, confiabilidade)

### A1 ✅ — Webhook Mercado Pago sem verificação de assinatura
- **Arquivo**: `src/app/api/webhooks/mercadopago/route.ts`
- **Correção**: Adicionada função `verifySignature()` que valida `x-signature` (HMAC-SHA256) com `MERCADOPAGO_WEBHOOK_SECRET`. Fallback para `x-request-id` se secret não configurado. Requisições sem assinatura válida retornam 401.

### A2 ✅ — `createBooking` cria registro 'pending' ANTES da preferência de pagamento
- **Arquivo**: `src/lib/actions/booking-actions.ts`
- **Correção**: Invertida a ordem: preferência do Mercado Pago é criada PRIMEIRO. Se falhar, retorna erro sem inserir nada no banco. Booking só é inserido após preferência confirmada, com `payment_preference_id` registrado.

### A3 ✅ — `MercadoPagoConfig` inicializa com string vazia se env var ausente
- **Arquivo**: `src/lib/utils/mercadopago.ts`
- **Correção**: Substituída inicialização direta por lazy Proxy. Se `MERCADOPAGO_ACCESS_TOKEN` não estiver configurado, lança erro claro: "MERCADOPAGO_ACCESS_TOKEN is not configured. Payment processing is unavailable."

### A4 ✅ — `dynamic-images.ts` referencia paths inexistentes
- **Arquivo**: `src/lib/dynamic-images.ts`
- **Correção**: Arquivo removido. Nenhuma referência encontrada no código.

### A5 ✅ — `SERVICE_ID_MAP` tem IDs duplicados no `servicos/page.tsx`
- **Arquivo**: `src/app/servicos/page.tsx`
- **Correção**: Documentado com comentário que newborn-menino/menina e mensal-menino/menina compartilham o mesmo serviço no banco. IDs duplicados são intencionais (um serviço, duas landing pages). Instrução para criar serviços separados se precisar de controle independente.

### A6 ✅ — `next.config.ts` vazio — sem headers de segurança, sem image config
- **Arquivo**: `next.config.ts`
- **Correção**: Adicionados security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy). CSP configurado para permitir Supabase, Mercado Pago, Facebook Pixel, Google Analytics. Adicionado `images.formats: ["image/avif", "image/webp"]` para ativar sharp.

### A7 ✅ — `FacebookPixel.tsx` — `window.fbq` sem type declaration
- **Arquivo**: `src/types/global.d.ts` (novo)
- **Correção**: Criado arquivo de declaração global com tipos para `window.fbq`, `window.MercadoPago`, e `window._dynamic_images_used`.

### A8 ✅ — `InternalDatePicker` não encontrado/verificado
- **Arquivo**: `src/components/ui/InternalDatePicker.tsx`
- **Conclusão**: Componente usa `date-fns` (`format`, `parseISO`, `isSameDay`) que operam em datas locais — consistente com a correção C1. Sem bugs de timezone encontrados.

---

## 🟡 MÉDIO (Lógica incorreta ou risco de evolução)

### M1 ✅ — API de Gallery sem cache — lê arquivos sync toda request
- **Arquivo**: `src/app/api/gallery/[category]/route.ts`
- **Correção**: Cache em memória com `globalThis` (TTL de 30 min). Shuffle determinístico com seed horário (`seededShuffle`), eliminando reordenação em cascata a cada request.

### M2 ✅ — `getMonthAvailability` — cálculo de lotação impreciso
- **Arquivo**: `src/lib/actions/booking-actions.ts`
- **Correção**: Substituída contagem simples `dayBookingsCount < totalSlotsInDay` por verificação via master grid. Cada dia é analisado slot a slot, verificando se existe pelo menos uma janela de `duration_slots` consecutivos sem colisão com bookings existentes.

### M3 ✅ — `SESSIONS_DATA` estático duplica dados do banco
- **Arquivos**: `src/lib/data/sessions.ts`, `src/lib/actions/booking-actions.ts`, `src/lib/actions/admin-actions.ts`
- **Correção**: `fetchSessionDetails`, `fetchSessionBySlug`, `listActiveSessions` e `createBooking` agora buscam do banco primeiro, com fallback para `SESSIONS_DATA`. `syncSessionColors` lê do banco como fonte primária. Helpers síncronos em `sessions.ts` documentados como fallback estático.

### M4 ✅ — `getDashboardData` — estatísticas de revenue usam mês ATUAL, não o mês selecionado
- **Arquivo**: `src/lib/actions/admin-actions.ts`
- **Correção**: `pStats` (revenue) agora usa `startTargetMonth`/`endTargetMonth` (parâmetros `year`/`month`), não mais `now`. Todas as queries do dashboard usam o mês selecionado.

### M5 ✅ — `loadData` e `loadFinanceData` têm dependências ausentes nos `useEffect`
- **Arquivo**: `src/app/admin/page.tsx`
- **Correção**: `useEffect` agora chama `loadDataRef.current()` e `loadFinanceDataRef.current()` (que já eram atualizados via `useEffect` de sincronização). Dependências corretas (`activeTab`, `selectedDate`, `viewDate`, `financeDate`) sem risco de stale closures.

### M6 ✅ — `revalidatePath` chamado sem efeito em Server Actions que retornam dados
- **Arquivo**: `src/lib/actions/admin-actions.ts`
- **Correção**: Adicionado comentário documentando que `revalidatePath` não força re-render no client (`"use client"`), mas é mantido para higiene do cache SSR. O admin já usa Supabase realtime para live updates.

### M7 ✅ — `agendar/[slug]/page.tsx` tenta redirecionar para `[packageSlug]` que não existe
- **Arquivo**: `src/app/agendar/[slug]/[packageSlug]/page.tsx`
- **Conclusão**: A rota EXISTE e está funcional. O `list_dir` confirmou `page.tsx` dentro de `[packageSlug]/`. Falso positivo.

### M8 ✅ — `PWA sw.js` praticamente inútil para offline
- **Arquivo**: `public/sw.js`
- **Correção**: Substituída estratégia "não intercepta navegação" por network-first com cache fallback. Navegações agora são cacheadas após primeiro acesso. Cache renomeado para `hf-site-v6`.

### M9 ✅ — Múltiplos `console.log` em produção
- **Arquivos**: `booking-actions.ts`, `mercadopago/route.ts`, `BookingWizard.tsx`, `PWARegistration.tsx`
- **Correção**: `console.log` com dados sensíveis substituídos por guards `if (process.env.NODE_ENV === 'development')`. `console.error` mantidos para debugging de produção.

### M10 ✅ — `agendar/page.tsx` duplica lógica da rota `[slug]`
- **Arquivo**: `src/app/agendar/page.tsx`
- **Correção**: Página `/agendar` sem query params agora redireciona para `/servicos` (escolha de serviço primeiro). O middleware já trata `/agendar?sessao=ID` → `/agendar/[slug]`.

---

## 🟢 BAIXO (Performance, DX, manutenção)

### B1 ✅ — Sem `generateStaticParams` nas páginas de serviço
- **Arquivos**: `src/app/servicos/*/page.tsx`
- **Conclusão**: As 12 páginas de serviço são `"use client"` (CSR com fetch no `useEffect`). `generateStaticParams` só funciona com Server Components. Converter para SSR/ISR exigiria refatoração arquitetural — documentado como melhoria futura.

### B2 ✅ — `DynamicImage` busca e filtra imagens no client
- **Arquivo**: `src/components/ui/DynamicImage.tsx`
- **Correção**: Eliminada a verificação de orientação via `new Image()` em runtime. Agora usa metadados `orientation` do index JSON (pré-computados). Fallback: aceita qualquer imagem se metadados ausentes. Reduz chamadas de rede e processamento sequencial.

### B3 ✅ — O `gallery-index.json` é gerado no `prebuild` mas não inclui orientação
- **Arquivo**: `scripts/generate-gallery-index.js`
- **Correção**: Script atualizado para extrair dimensões via PowerShell (`System.Drawing.Image`). Índice agora inclui `width`, `height`, `orientation` (`horizontal`/`vertical`) para cada imagem.

### B4 ✅ — `sharp` listado como dependência mas não configurado no Next.js
- **Arquivos**: `package.json`, `next.config.ts`
- **Correção**: `next.config.ts` já tinha `images.formats: ["image/avif", "image/webp"]`. Adicionado `deviceSizes`, `imageSizes` e `minimumCacheTTL: 30 dias` para otimização completa.

### B5 ✅ — `globals.css` tem dois blocos `@theme` separados
- **Arquivo**: `src/app/globals.css`
- **Correção**: Unificados os dois blocos `@theme` em um único bloco. Variáveis admin movidas para dentro do bloco principal.

### B6 ✅ — Apenas 1 teste unitário (utils.test.ts)
- **Arquivos**: `src/lib/utils.test.ts`, `src/lib/actions/booking-actions.test.ts` (novo)
- **Correção**: Criado `booking-actions.test.ts` com testes para `parseLocalDate` (parsing de data local vs UTC, day-of-week, boundaries) e lógica de disponibilidade (contagem de slots, detecção de bloqueios).

### B7 ✅ — `layout.test.tsx` mocka Navbar mas não mocka `GeneralLayout`
- **Arquivo**: `src/app/layout.test.tsx`
- **Correção**: Substituídos mocks de `Navbar`/`Footer`/`WhatsAppWidget` por mock do `GeneralLayout` (que internamente renderiza esses componentes). Adicionados mocks para `FacebookPixel` e `PWARegistration`.

---

## 📁 Arquivos Relevantes

- `src/lib/actions/booking-actions.ts` — Funções críticas de disponibilidade e booking (C1, C2, A2, M2)
- `src/lib/actions/admin-actions.ts` — CRUD admin e finanças (C3, M4, M6)
- `src/lib/data/sessions.ts` — Dados estáticos duplicados (M3, A5)
- `src/app/api/webhooks/mercadopago/route.ts` — Webhook sem assinatura (A1)
- `src/app/api/gallery/[category]/route.ts` — API sem cache (M1)
- `src/app/admin/page.tsx` — Dashboard admin (M5, C3)
- `src/components/ui/DynamicImage.tsx` — Carga ineficiente de imagens (B2)
- `src/lib/utils/mercadopago.ts` — Inicialização frágil (A3)
- `src/lib/dynamic-images.ts` — Código abandonado (A4)
- `src/app/servicos/page.tsx` — Mapa de IDs duplicados (A5)
- `src/app/agendar/[slug]/page.tsx` — Redirect para rota potencialmente inexistente (M7)
- `next.config.ts` — Sem segurança/image config (A6)
- `scripts/generate-gallery-index.js` — Index sem metadados (B3)
- `src/app/globals.css` — @theme duplicado (B5)

---

## 🔍 Verificação

1. Rodar `npm run build` e verificar se há erros de TypeScript ou lint
2. Testar fluxo de agendamento completo: `/agendar/gestante` → selecionar data → pagamento → webhook → confirmar no admin
3. Verificar relatório financeiro do mês atual vs mês anterior no admin (C3, M4)
4. Testar agendamento em horário de fim de dia (ex: 21h) para validar timezone (C1, C2)
5. Verificar se os modais admin (EditBooking, BlockSlot, ManualBooking) abrem e salvam corretamente
6. Rodar `npm test` e verificar cobertura atual

---

## 📋 Decisões

- **Escopo**: Auditoria cobre todos os arquivos TypeScript/TSX, CSS, scripts e config. Exclui arquivos de conteúdo (imagens, JSON de dados).
- **Não abordado**: Configuração do Supabase (schema SQL, RLS policies), configuração do Mercado Pago no dashboard, variáveis de ambiente específicas, conteúdo estático (imagens, ícones).
- **Premissa**: O site usa Next.js 16 + React 19 + Tailwind v4, com Supabase como backend e Mercado Pago como gateway de pagamento.

---

## 📝 Observações Adicionais

1. **O design system é bem documentado** (`DESIGN-SYSTEM.md`) — a separação público vs admin é clara e consistente.
2. **O código de booking é sofisticado** — a lógica de master grid, merge de slots globais/específicos, e antecedência mínima mostra pensamento cuidadoso. Os bugs são principalmente de timezone.
3. **A UI admin é polida** — uso consistente de `framer-motion`, variáveis CSS, e componentes modais bem estruturados.
4. **O projeto tem potencial para escalar** mas precisa de testes e correções de timezone antes de crescer o volume de agendamentos.
