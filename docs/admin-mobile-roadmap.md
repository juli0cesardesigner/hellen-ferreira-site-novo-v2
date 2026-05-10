# Roadmap do Painel Admin Mobile (PWA)

Este documento documenta os porquês e comos da transformação mobile-first do sistema de gestão Hellen Ferreira.

## 📱 Por que Mobile?
O controle de um estúdio fotográfico (Newborn, Família) muitas vezes exige que a profissional possa confirmar horários ou bloquear datas rapidamente enquanto está em estúdio ou em deslocamento, sem a necessidade de um notebook.

## 🏗️ O que foi feito (Março 2026)

### 1. Camada de PWA (Progressive Web App)
- **Arquivo:** `public/manifest.json`
- **Impacto:** Permite "instalar" o site como um app no celular.
- **Configuração:** Ícone de 512x512px (`/brand/black.png`) e cor de tema #09090b (Zinc/Black).

### 2. Navegação Alternativa (Context Awareness)
- **Bottom Navigation Bar:** No mobile, ocultamos a `Sidebar` e mostramos a `BottomBar`.
- **Botão Central de Ação:** O botão de "Nova Reserva" foi centralizado e flutuante no mobile para acesso imediato via polegar.

### 3. Visualização em Cartões (Otimização de Tela)
- Substituição da `<table>` (que causava scroll lateral desconfortável) por um **Fluxo de Cards**.
- **Cards:** Focam no essencial: Horário em destaque, Nome do Cliente grande, e Status com cores semânticas (Verde = Validado).

### 4. Modais Adaptativos
- **Mudança:** Saíram de modais fixos (estilo Desktop) para **Full Screen Layers** no mobile.
- **Motivo:** Evita que o teclado virtual do celular cubra campos de input vitais.

## 🛣️ Próximos Passos (Roadmap)

1.  **Notificações Push:** Implementar via service worker para avisar a Hellen sempre que um novo agendamento for feito pelo site.
2.  **Pull-to-Refresh:** Adicionar o gesto de deslizar para baixo para recarregar a lista de agendamentos.
3.  **Quick Actions WhatsApp:** Botão de um clique para abrir conversa diretamente com o cliente agendado.

---
*Gerado autonomamente pelo Agente Antigravity em 27/03/2026.*
