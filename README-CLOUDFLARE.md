# LAG Controller — deploy no Cloudflare Workers

Este projeto está preparado para **Cloudflare Workers + Static Assets + D1**.
Não crie um projeto Pages para este pacote.

## Estrutura usada

- `src/worker.js`: API em `/api/*` e entrega dos arquivos estáticos.
- `public/`: site completo.
- `wrangler.toml`: configuração do Worker, assets e binding D1 `DB`.
- `database/`: esquemas SQL de referência.

## Configuração no Cloudflare via GitHub

1. Envie o conteúdo desta pasta para a raiz do repositório GitHub.
2. No Cloudflare, abra **Workers & Pages**.
3. Entre no Worker existente `amorsaudeexp4` ou crie um Worker com esse nome.
4. Em **Settings > Builds**, conecte o repositório.
5. Use:
   - Branch de produção: `main`
   - Root directory: `/`
   - Build command: deixe vazio
   - Deploy command: `npx wrangler deploy`
6. Confirme que existe um binding D1 com o nome exato `DB`.
7. Faça o deploy.

O nome do Worker no painel deve ser igual ao `name` do `wrangler.toml`: `amorsaudeexp4`.

## Banco D1

O `wrangler.toml` está configurado para provisionamento automático do banco `amorsaudeexp4-db`.
Caso você precise manter um banco D1 que já possui dados, coloque o `database_id` real no `wrangler.toml`, usando `wrangler.manual.toml` como modelo.

## Testes depois do deploy

Abra:

- `/api/health`
- `/api/debug-bindings`
- `/pages/home.html`

Em `/api/health`, o esperado é `ok: true` e `db: true`.
Em `/api/debug-bindings`, o esperado é `DB: true` e `ASSETS: true`.

## Teste local

```bash
npm install
npm run dev
```

Depois abra `http://localhost:8787`.

## Atenção

Esta cópia está em modo de edição livre, conforme configurado no projeto. Quem tiver acesso ao endereço pode criar, editar e excluir informações. Para uso público em produção, reative autenticação e autorização antes de compartilhar o link.
