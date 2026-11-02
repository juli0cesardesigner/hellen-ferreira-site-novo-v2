# Instruções Permanentes do Workspace

## Regras de Commit, Push e Deploy (Vercel)
Antes de qualquer `git commit` ou `git push`, siga rigorosamente as diretrizes em [.agents/rules/git-push-deploy.md](file:///f:/Hellen/HLLN%20-%20SITE/HLLN%20-%20SITE/.agents/rules/git-push-deploy.md):

1. **Autor & Committer:** Sempre assinar commits como:
   - `user.name`: `juli0cesardesigner`
   - `user.email`: `juli0cesardesigner@users.noreply.github.com`
   *(Qualquer outro autor causa bloqueio imediato do deploy no plano Hobby da Vercel).*
2. **Eficiência de Tempo:**
   - Para mudanças de assets/estáticos: commit e push direto (sem build local).
   - Para código `.ts`/`.tsx`: validar apenas com `npx tsc --noEmit`.
   - **Nunca** colocar timers ou esperas ativas aguardando o Vercel responder HTTP 200. Concluir a resposta logo após o `git push`.
