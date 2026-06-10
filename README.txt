LAG LOGIN UPGRADE

Arquivos criados:
- pages/login.html
- css/login-lag.css
- js/login-lag.js
- css/lag-svg-global.css
- js/lag-svg-global.js
- assets/svg/lag-symbol.svg
- assets/svg/lag-wave.svg
- assets/svg/lag-grid.svg
- assets/images/logo-lag-sem-fundo.png
- assets/images/logo-lag-sem-fundo-cortada.png

Como usar:
1. Substitua o arquivo pages/login.html pelo arquivo deste pacote.
2. Envie as pastas css, js e assets para o seu projeto, mantendo os caminhos.
3. Não precisa mudar banco de dados, D1, Worker, Firebase ou regras.
4. O arquivo /js/login.js continua sendo chamado no HTML para preservar sua autenticação atual.
5. Para usar os detalhes SVG no site inteiro, adicione nas outras páginas:

<link rel="stylesheet" href="/css/lag-svg-global.css?v=lag-svg-20260610">
<script src="/js/lag-svg-global.js?v=lag-svg-20260610"></script>

Dica:
Se seu arquivo de autenticação não estiver em /js/login.js, troque apenas essa linha no final do login.html:
<script type="module" src="/js/login.js?v=auth-current"></script>
