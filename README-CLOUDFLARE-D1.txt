LAG Controller - Cloudflare D1 corrigido

O que foi corrigido:
1. O site deixou de chamar a API antiga little-fog-b415amorsaude-api.snakerr77.workers.dev.
2. Agora ele chama a API principal em https://amorsaudeexp4.snakerr77.workers.dev.
3. Foi adicionada uma API em functions/api/[[path]].js.
4. A API usa o binding D1 chamado exatamente DB.
5. Login, sessão, perfil, usuários, notícias, notificações, cadastro médico e prontuário médico usam D1.

Passo obrigatório no Cloudflare:
Workers & Pages > seu projeto amorsaudeexp4 > Settings > Bindings > Add binding > D1 database.
Nome da variável: DB
Selecione o seu banco D1 e salve.
Depois faça New deployment.

Teste rápido:
Abra no navegador:
https://amorsaudeexp4.snakerr77.workers.dev/api/health

Se estiver certo, vai aparecer algo com:
{
  "ok": true,
  "db": true
}

Primeiro login criado automaticamente se a tabela usuarios estiver vazia:
E-mail: admin@lag.com
Senha: 123456

Depois de entrar, vá no painel Admin e altere os usuários/permissões.
