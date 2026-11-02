# Regras Obrigatórias para Commit e Push (Deploy Vercel)

Toda vez que o usuário solicitar **commit**, **push** ou **deploy**, o agente **DEVE OBRIGATORIAMENTE** seguir este checklist:

---

## 1. Identidade Git (Autor e Committer) — CRÍTICO PARA O VERCEL

No plano Hobby da Vercel, qualquer commit com autor/committer divergente da conta dona do projeto é **bloqueado** com o erro:
> *"The deployment was blocked because the commit author did not have contributing access to the project on Vercel. The Hobby Plan does not support collaboration for private repositories."*

### Configuração Obrigatória:
- **Nome:** `juli0cesardesigner`
- **E-mail:** `juli0cesardesigner@users.noreply.github.com`
- **Repositório:** `https://github.com/juli0cesardesigner/hellen-ferreira-site-novo-v2.git`
- **Branch principal:** `main`

### Comando Padrão de Commit:
Sempre defina as variáveis de ambiente explicitamente ou use os parâmetros de autor no Git:

```powershell
$env:GIT_AUTHOR_NAME='juli0cesardesigner'
$env:GIT_AUTHOR_EMAIL='juli0cesardesigner@users.noreply.github.com'
$env:GIT_COMMITTER_NAME='juli0cesardesigner'
$env:GIT_COMMITTER_EMAIL='juli0cesardesigner@users.noreply.github.com'
git commit -m "tipo(escopo): descrição da alteração"
```

> **Atenção:** NUNCA assine commits como `Hellen Ferreira` ou e-mails pessoais (`hellen@...`, `jlcsrgmspnt@...`), pois a Vercel rejeitará o deploy imediatamente.

---

## 2. Validação Rápida Pré-Commit (Sem Desperdiçar Tempo)

1. **Alterações de Código TypeScript / TSX:**
   - Rodar apenas: `npx tsc --noEmit`
   - Deve retornar **código 0**.
2. **Alterações apenas de Assets / Imagens / Texto:**
   - **NÃO** rodar `npm run build` nem `npx tsc`. Faça o commit e push direto.
3. **NÃO executar timers de espera no Vercel:**
   - Após o `git push origin main`, **NÃO** travar a resposta esperando 20s/30s (`setTimeout` ou `Start-Sleep`) para checar status HTTP 200 da Vercel.
   - Entregue a resposta ao usuário assim que o `git push` concluir com sucesso. A Vercel constrói de forma assíncrona.

---

## 3. Checklist de Execução Rápida

1. `git status` para conferir arquivos modificados.
2. `npx tsc --noEmit` (apenas se houver arquivos `.ts`/`.tsx` alterados).
3. `git add -A`
4. Commit com as variáveis de ambiente de autor/committer corretas.
5. `git push origin main`
6. Finalizar e responder prontamente ao usuário com o hash do commit e resumo objetivo.
