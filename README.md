# Hellen Ferreira Fotografia - V2

Sistema de gestão e presença digital premium para estúdio de fotografia, focado em Newborn, Gestante e Família.

## 🚀 Tecnologias
- **Framework:** Next.js 15+ (App Router)
- **Estilização:** Tailwind CSS v4
- **Banco de Dados/Auth:** Supabase
- **Animações:** Framer Motion
- **Ícones:** Lucide React

## 📱 Painel Administrativo Mobile-First (PWA)

O painel administrativo foi projetado para ser uma ferramenta de gestão ágil, permitindo o controle total do estúdio através de dispositivos móveis como se fosse um aplicativo nativo.

### Funcionalidades PWA
- **Instalável:** Através do `manifest.json`, o painel pode ser adicionado à tela de início do celular.
- **Interface Adaptativa:** 
  - **Desktop:** Barra lateral industrial completa com tabelas de dados profundas.
  - **Mobile:** Barra de navegação inferior (Bottom Nav) e feed de agendamentos em Cards táteis.
- **Gestão de Horários:** Bloqueio de datas e configuração de slots simplificada para telas pequenas.

### Como instalar no celular:
1. Acesse `/admin` no seu navegador mobile (Chrome ou Safari).
2. Vá em "Compartilhar" (iOS) ou "Configurações" (Android).
3. Selecione **"Adicionar à Tela de Início"**.
4. O ícone da Hellen Ferreira aparecerá como um app fixo.

## 🛠️ Estrutura de Pastas
- `src/app/admin`: Coração da lógica administrativa.
- `src/components/admin`: Componentes modulares (Modais, Sessões, Bloqueios).
- `src/lib/actions`: Server Actions para comunicação segura com o banco de dados.

## 📖 Roadmap & Decisões Técnicas
Consulte `docs/admin-mobile-roadmap.md` para detalhes sobre a evolução da camada mobile e futuras implementações de sincronização.
