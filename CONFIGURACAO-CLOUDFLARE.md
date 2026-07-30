# LAG Controller — configuração Cloudflare Workers

Este pacote está configurado para **Cloudflare Workers + Static Assets + D1**.

## Configuração do Workers Builds

Use estes valores no painel da Cloudflare:

- **Ramificação de produção:** `main`
- **Comando de build:** deixe vazio
- **Comando de implantação:** `npx wrangler deploy`
- **Comando de implantação de ramificação não produtiva:** `npx wrangler versions upload`
- **Diretório raiz:** `/`

O nome do Worker no painel deve ser `amorsaudeexp4`, igual ao campo `name` do `wrangler.toml`.

## Banco D1

O arquivo `wrangler.toml` usa provisionamento automático:

```toml
[[d1_databases]]
binding = "DB"
```

Na primeira implantação, o Wrangler/Cloudflare pode criar o banco D1 automaticamente. O código usa o binding `env.DB`.

### Usar um banco D1 já existente

1. Abra `wrangler.manual.toml`.
2. Informe `database_name` e o UUID real em `database_id`.
3. Copie o conteúdo para `wrangler.toml`.
4. Faça uma nova implantação.

## Primeiro acesso

Quando o banco está vazio, o Worker cria este administrador inicial:

- **E-mail:** `admin@lag.com`
- **Senha:** `123456`

Entre no painel e altere a senha no gerenciamento de usuários.

## Testes após publicar

Abra:

- `/api/health` — deve retornar `ok: true`, `db: true` e `assets: true`.
- `/pages/login.html` — tela de login.
- `/pages/home.html` — exige sessão válida.

## Correções aplicadas

- login real reativado;
- acesso livre desativado por padrão;
- raiz `/` redireciona para o login;
- D1 preparado para provisionamento automático;
- Wrangler fixado em versão estável do projeto;
- páginas protegidas agora validam o token na API;
- somente administradores gerenciam usuários;
- candidatura médica pública permitida apenas no envio `POST`;
- exclusões protegidas por perfil;
- URLs limpas ganham tentativa automática de `.html`;
- página `404.html` adicionada;
- headers de segurança e regras de cache adicionados;
- arquitetura duplicada de Pages Functions removida; o projeto usa apenas `src/worker.js`.
