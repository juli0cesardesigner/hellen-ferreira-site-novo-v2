# Spec: Admin Panel Overhaul & Clean Paths

## 1. Visão Geral
Transformar o painel administrativo em uma ferramenta mobile-first, minimalista e visualmente integrada, além de padronizar a experiência de agendamento público com URLs amigáveis.

## 2. Requisitos de UI/UX (Admin)
### 2.1 Navegação
- **Topo:** Sem títulos. Botão `(+) Novo Agendamento` fixo no canto superior direito.
- **Bottom Nav (5 Tabs):**
  1. **Calendário (Agenda):** Calendário visual (topo) + Lista de agendamentos filtrada (base).
  2. **Bloqueios:** Gerenciamento de datas/horários fechados.
  3. **Horários:** Grade padrão de slots.
  4. **Financeiro:** Dashboard de métricas.
  5. **Configurações:** Gestão de Serviços (sessões) e Preços.

### 2.2 Estética dos Cards
- O background de cada card de agendamento deve usar a cor da sessão com **baixa opacidade (ex: 0.1 ou 0.15)**.
- Texto deve permanecer preto para legibilidade total (Opção B).

### 2.3 Modal de Edição
- Remover `sticky` do header.
- Todo o conteúdo deve ser scrollable.
- Adicionar `padding-bottom: 80px` (ou similar) para evitar que a bottom nav do celular ou do sistema cubra os botões de ação.

## 3. Lógica de Negócio & Dados
### 3.1 Financeiro (Cálculo de Receita)
A métrica de faturamento deve ser calculada da seguinte forma:
- **Status "Concluído":** Soma-se o **Valor Total** do ensaio.
- **Status "Pendente" ou "Cancelado":** Soma-se apenas o **Valor da Entrada (Sinal)**.

### 3.2 Caminho Limpo (URLs de Agendamento)
- Nova estrutura: `hellenferreira.com/agendar/[slug]`.
- Banco de Dados: Adicionar coluna `slug` na tabela `sessions`.
- Redirecionamento: Caso o usuário acesse a URL antiga com `?sessao=ID`, redirecionar para a nova URL amigável se o slug existir.

## 4. Implementação Técnica
- **Framework:** Next.js 15 (App Router).
- **Banco:** Supabase (PostgreSQL).
- **Estilização:** Vanilla CSS / Tailwind (conforme projeto original).

## 5. Critérios de Aceite
- [x] O admin abre por padrão na aba de Calendário.
- [x] Ao clicar em uma data no calendário, a lista abaixo atualiza instantaneamente (filtro diário).
- [x] Navegação centralizada entre meses com setas laterais.
- [x] Remoção de filtros de histórico (Tudo/Passados/Futuros) para foco no dia selecionado.
- [x] Agrupar blocos por serviço com cores pré-configuradas (ex: Gestante: #90CAF9, Newborn: #F48FB1)
- [x] Substituir seletor de cores livre por grade de cores pré-configuradas (28 cores curadas)
- [x] Sincronizar cores entre SESSIONS_DATA e UI administrativa
- [ ] O faturamento reflete as novas regras de Entrada vs Total.
- [ ] O botão de novo agendamento funciona em qualquer aba do admin.
- [ ] URLs amigáveis carregam corretamente o fluxo de agendamento.
