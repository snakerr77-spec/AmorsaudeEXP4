# LAG Controller — HTML, CSS e JavaScript

Projeto estático para Cloudflare Workers + Static Assets + D1.

## Stack

- HTML
- CSS
- JavaScript
- Cloudflare Worker
- Cloudflare D1

Não utiliza React, TypeScript ou Vite.

## Deploy

No Cloudflare Workers Builds:

```text
Build command: vazio
Deploy command: npx wrangler deploy
Version command: npx wrangler versions upload
Root directory: /
Production branch: main
```

O `wrangler.toml` publica diretamente o diretório `public`.

## Páginas alteradas

- `public/pages/login.html`
- `public/pages/home.html`
- `public/modules/prontuario-medico/prontuario-medico.html`

Os outros módulos permanecem preservados.
