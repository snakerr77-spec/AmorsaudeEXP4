# LAG Controller — atualização pontual em React

Esta versão mantém os módulos antigos do projeto e altera somente:

- login: restaurado com e-mail, senha e validação Cloudflare D1;
- home: nova tela em React + TypeScript + Vite + Motion;
- prontuário médico: nova tela em React + TypeScript + Vite + Motion;
- configuração do Worker/Vite necessária para servir as novas rotas.

## Rotas

- Login original restaurado: `/pages/login`
- Nova home React: `/pages/home`
- Novo prontuário React: `/modules/prontuario-medico/prontuario-medico`

As URLs antigas com `.html` continuam funcionando e redirecionam para as novas telas.

## O que permaneceu igual

As páginas abaixo continuam sendo os arquivos HTML/CSS/JS anteriores:

- perfil;
- administração de usuários;
- médicos e exames;
- treinamentos;
- boas práticas;
- LAG Dashboard;
- controladoria;
- contratação médica;
- demais imagens, scripts, banco D1 e endpoints da API.

## Login

O modo de edição livre foi desativado em:

- `src/worker.js`;
- `public/js/cloud-auth.js`;
- `public/js/login.js`.

O Worker cria o usuário inicial abaixo somente quando a tabela `usuarios` está vazia:

- E-mail: `admin@lag.com`
- Senha: `123456`

Caso o banco já possua usuários, utilize um acesso cadastrado no D1.

## Desenvolvimento local

```bash
npm install
npm run dev
```

## Cloudflare

Use estas configurações no build conectado ao GitHub:

```text
Build command: npm run build
Deploy command: npx wrangler deploy
Root directory: /
Production branch: main
```

O `wrangler.toml` publica `dist`, usa o Worker em `src/worker.js` e mantém o binding D1 com o nome `DB`.

Se a Cloudflare solicitar o ID do banco, copie o conteúdo de `wrangler.manual.toml` para `wrangler.toml` e preencha `database_name` e `database_id`.

## Validação feita

- TypeScript/TSX validado com `tsc -b`;
- JavaScript do Worker, login e autenticação validado com `node --check`;
- demais módulos foram preservados a partir do projeto original enviado.
