ACESSOS FIREBASE - CDT E GERÊNCIA

O campo correto no documento usuarios/{UID} é: nivelAcesso

Valores aceitos no sistema:
- admin
- financeiro
- gerencia
- cdt
- recepcao
- medico
- colaborador

Regra nova:
- CDT funciona como colaborador comum. Não vê Lag Controller nem Controladoria.
- Gerência vê Lag Controller e Controladoria.
- Financeiro vê Lag Controller e Controladoria.
- Admin vê Lag Controller, Controladoria e Painel Admin.

No Painel Admin, abra cada usuário e escolha o nível desejado no campo "Nível de acesso".

Importante:
Depois de substituir os arquivos no GitHub, copie o conteúdo de docs/REGRAS-FIRESTORE.txt e publique em Firebase > Firestore Database > Rules.
