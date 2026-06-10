ATUALIZAÇÃO - ÁREA MÉDICA EM PÁGINA PRÓPRIA + FIRESTORE

O que mudou:

1. A Área Médica foi removida do final da home.
   Ela não aparece mais lá embaixo. Agora abre somente quando clicar em:
   modules/prontuario-medico/prontuario-medico.html

2. A home original foi preservada.
   O botão/card da Área Médica apenas leva para a nova página.

3. A nova página Área Médica é liberada somente para:
   - admin
   - financeiro
   - medico

4. Os prontuários agora salvam no Firestore, na coleção:
   prontuariosMedicos

5. O cadastro público de médicos agora salva no Firestore, na coleção:
   candidatosMedicos

6. Admin e financeiro conseguem ver os médicos cadastrados pela página:
   modules/prontuario-medico/prontuario-medico.html#contratacao

7. Ao aprovar um médico cadastrado, o sistema cria/atualiza um documento na coleção:
   medicos

8. O link do contrato/cadastro médico continua no perfil do admin, financeiro e gerência.
   Também foi adicionado o link para ver médicos cadastrados.

IMPORTANTE PARA FUNCIONAR NO GITHUB PAGES:

Publique o conteúdo do arquivo abaixo nas regras do Firestore:

docs/REGRAS-FIRESTORE.txt

Sem publicar essas regras, o site pode abrir, mas o banco pode bloquear:
- salvar prontuários
- enviar cadastro médico
- ver médicos cadastrados
- aprovar médico para a coleção medicos

Arquivos adicionados:
- modules/prontuario-medico/prontuario-medico.html
- modules/prontuario-medico/prontuario-medico.css
- modules/prontuario-medico/prontuario-medico.js

Arquivos alterados:
- pages/home.html
- pages/perfil.html
- pages/cadastro-medico.html
- css/home.css
- css/perfil.css
- js/firebase-config.js
- docs/REGRAS-FIRESTORE.txt
