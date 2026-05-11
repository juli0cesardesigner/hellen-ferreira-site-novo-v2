# Design System — Separação Público vs Admin

> Última atualização: 10 de Maio de 2026

Este projeto utiliza **dois sistemas de design distintos** para separar a identidade visual do site público (cliente final) da interface administrativa (gestão interna).

---

## 🎨 Site Público — Fine Art Editorial

| Token | Valor | Uso |
|---|---|---|
| **Font Serif** | `Cormorant Garamond` | Títulos, headings, poesia |
| **Font Sans** | `Lato` | Corpo de texto, labels |
| **Paleta** | Pearl, Linen, Sand, Blush | Tons quentes e suaves |
| **Raio de Borda** | `rounded-sm` / `rounded-full` | Suave, editorial |
| **Tipografia** | Italic, tracking largo, serif | Elegância, sensibilidade |
| **Animações** | Framer Motion, parallax | Cinematográfico |

**Localização dos tokens:** `globals.css` → `@theme` (variáveis `--color-pearl`, `--color-blush`, etc.)

---

## 🏢 Painel Admin — Corporate SaaS

| Token | Valor | Uso |
|---|---|---|
| **Font** | `Inter` (`--font-admin`) | Todo o painel admin |
| **Paleta** | Slate (`#0F172A` → `#F8FAFC`) | Tons frios e neutros |
| **Raio de Borda** | `rounded-md` / `rounded-lg` | Reto, profissional |
| **Tipografia** | `font-medium`, `font-semibold` | Sem italic, sem serif |
| **Animações** | Mínimas (fade-in apenas) | Foco em performance |
| **Layout** | Sidebar escura + conteúdo claro | Padrão SaaS |

**Localização dos tokens:** `globals.css` → `@theme` (variáveis `--color-admin-*`)

### Cores Admin (CSS Custom Properties)

```css
--color-admin-bg:           #F8FAFC   /* Fundo geral */
--color-admin-surface:      #FFFFFF   /* Cards, tabelas */
--color-admin-border:       #E2E8F0   /* Bordas padrão */
--color-admin-border-hover: #CBD5E1   /* Bordas hover */
--color-admin-text:         #0F172A   /* Texto principal */
--color-admin-text-secondary: #475569 /* Texto secundário */
--color-admin-text-muted:   #94A3B8   /* Labels, placeholders */
--color-admin-accent:       #1E293B   /* Botões primários, sidebar */
--color-admin-accent-hover: #0F172A   /* Hover em botões */
--color-admin-info:         #3B82F6   /* Links, ações informativas */
--color-admin-success:      #10B981   /* Status confirmado */
--color-admin-warning:      #F59E0B   /* Status pendente */
--color-admin-danger:       #EF4444   /* Erros, exclusão */
```

---

## 📐 Como Aplicar

### Site Público
Headings herdam automaticamente `font-serif` e `text-text-dark` via `globals.css` `@layer base`.

### Painel Admin
O admin aplica a font **inline** no container raiz:
```tsx
<div style={{ fontFamily: 'var(--font-admin)' }}>
```
Isso evita conflitos com os base styles do site público. **Headings no admin** usam classes diretas (`text-[var(--color-admin-text)]`, `font-semibold`) em vez de herdar do `@layer base`.

---

## ⚠️ Regras de Ouro

1. **Nunca** use `font-serif`, `Cormorant Garamond`, `blush`, `sand`, ou `linen` em componentes `/admin`.
2. **Nunca** use `Inter`, `slate`, `--color-admin-*` em componentes públicos.
3. Componentes admin ficam em `src/components/admin/` — componentes públicos em `src/components/ui/`, `src/components/layout/`, etc.
4. Se criar um componente compartilhado (ex: `ConfirmModal`), use apenas cores neutras que funcionem em ambos os contextos.
5. Ao adicionar novas cores admin, **sempre** adicione como `--color-admin-*` no `globals.css`.

---

## 📁 Arquivos Relevantes

| Arquivo | Responsabilidade |
|---|---|
| `src/app/globals.css` | Tokens de ambos os sistemas |
| `src/app/layout.tsx` | Carrega as 3 fonts (Cormorant, Lato, Inter) |
| `src/app/admin/page.tsx` | Dashboard admin (design corporativo) |
| `src/app/admin/login/page.tsx` | Login admin (design corporativo) |
| `src/components/admin/*` | Todos os componentes do painel |
| `src/components/layout/GeneralLayout.tsx` | Detecta `/admin` e omite Navbar/Footer público |
