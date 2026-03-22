# Design Spec: Sistema de Agenda Inteligente Premium (Hellen Ferreira Fotografia)

**Data:** 2026-03-21  
**Autor:** Antigravity  
**Status:** Design Validado  
**Tags:** Next.js, Supabase, Mercado Pago, Booking, Admin Dashboard

---

## 1. Objetivo do Projeto 🎯
Criar um sistema de agendamento automático de sessão de fotos com inteligência de bloqueio de horários (slots), confirmação automática via pagamento (Mercado Pago) e gestão administrativa completa via site.

## 2. Requisitos & Necessidades 💎

### 2.1 Requisitos do Cliente (Agenda Inteligente)
- Calendário interativo para seleção de data.
- Exibição de horários fixos baseados no dia da semana.
- Bloqueio inteligente de slots vizinhos caso a sessão tenha duração superior a 1 slot (ex: Newborn).
- Captura de dados: Nome, E-mail e WhatsApp.
- Opção de pagamento (Sinal ou Total).
- Confirmação em tempo real após pagamento.

### 2.2 Requisitos Administrativos (Hellen)
- Dashboard protegido com login (Supabase Auth).
- Gestão de sessões: Nome, Preço (Total/Sinal), Duração em slots, Link do Guia (PDF).
- Gestão de horários fixos por dia da semana (Dashboard de horários).
- **Bloqueio em Massa:** Capacidade de ocultar períodos inteiros (ex: Férias, Feriados).
- Lista de pedidos de agendamento com status.

## 3. Lógica de Calendário (Disponibilidade) 🗓️

### 3.1 Grade Horária Base:
- **Terça, Quarta, Sexta:** 09:30, 11:00, 14:00, 15:30, 17:00
- **Sábado:** 08:00, 09:30, 11:00, 14:00, 16:00
- **Seg, Qui, Dom:** Fechados por padrão (configurável no Admin).

### 3.2 Lógica de Bloqueio (O "Coração" do Sistema):
Ao selecionar uma sessão (ex: Newborn com duração de 2 slots), o sistema verifica se os próximos N slots consecutivos na mesma data estão livres. Se sim, permite o agendamento; senão, oculta aquele horário inicial.

## 4. Arquitetura Técnica 🏗️

### 4.1 Tecnologias:
- **Frontend:** Next.js 15 (App Router), Tailwind CSS v4, Framer Motion.
- **Backend:** Next.js Server Actions.
- **Database:** Supabase (PostgreSQL).
- **Pagamentos:** Mercado Pago SDK (Checkout Pro/API).
- **Notificações:** Resend (E-mail automático).

### 4.2 Esquema do Banco de Dados (Supabase Tables):

- **`sessions`**: `id`, `name`, `full_price`, `deposit_price`, `duration_slots`, `guide_url`, `is_active`.
- **`schema_slots`**: `id`, `day_of_week` (0-6), `start_time` (string HH:mm), `is_active`.
- **`bookings`**: `id`, `session_id`, `client_name`, `client_email`, `client_phone`, `booking_date`, `start_time`, `end_time` (calculado), `payment_method`, `total_amount`, `paid_amount`, `status` (pending, confirmed, cancelled).
- **`payments`**: `id`, `booking_id`, `mp_preference_id`, `mp_payment_id`, `amount`, `status`.
- **`blocked_dates`**: `id`, `start_date`, `end_date`, `reason` (opcional).

## 5. Fluxo de Agendamento (Step-by-Step) 🛫

1.  **Sessão:** Cliente acessa a página de agendamento (específica da sessão ou geral).
2.  **Agenda:** Calendário mostra dias disponíveis (calculando contra horários ocupados e datas bloqueadas).
3.  **Slot:** Seleção do horário de início da sessão.
4.  **Dados:** Formulário Minimalista (Nome, E-mail, WhatsApp).
5.  **Checkout:** Escolha da forma de pagamento (Sinal/Total) -> Geração de preferência no Mercado Pago.
6.  **Confirmação:** 
    - Pagamento OK -> Webhook atualiza booking para `confirmed`.
    - Envio de E-mail Automático (Resend): Confirmação com Horário + Link para Baixar Guia.

## 6. Considerações de UX/UI 👩‍🎨
- Estética Clean, fontes serifadas e tons `pearl`/`linen` para manter a identidade premium da marca.
- Micro-interações nos slots de horários.
- Feedback visual imediato de "Horário ocupado".

---

**Fim do Spec. Validado e pronto para planejamento de implementação.**
