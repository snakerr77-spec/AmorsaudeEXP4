Atualização: Área Médica dentro da Home

O que foi feito:
1. Não foi removida nenhuma parte original da home.
2. Foi adicionada uma nova aba/link no menu: Área Médica.
3. Foi adicionada uma seção completa dentro de pages/home.html com:
   - Prontuário médico.
   - Mapa corporal com frente e costas usando a imagem enviada.
   - Pontos clicáveis para selecionar locais de dor.
   - Intensidade de dor de 0 a 10.
   - Anamnese, sinais vitais, alergias, medicamentos, exame físico, hipótese/CID, conduta, exames e prescrição.
   - Pacientes salvos do dia.
   - Pacientes salvos do mês.
   - Impressão do prontuário pelo navegador.
   - Área para copiar o link de cadastro de médicos.
4. Foi criada a página pública:
   pages/cadastro-medico.html

Arquivos alterados:
- pages/home.html
- css/home.css
- js/home.js

Arquivos adicionados:
- pages/cadastro-medico.html
- assets/images/anatomia-frente-costas.png
- README-AREA-MEDICA-HOME.txt

Observação importante:
Os dados estão salvos com localStorage, ótimo para teste e apresentação.
Para uso real em clínica, conecte com Firebase/Firestore ou outro banco seguro, com login por permissão, auditoria e regras de LGPD.


ATUALIZAÇÃO 28/05 - LINK MÉDICO
- A home continua intacta e ganhou acesso clicável ao prontuário junto do botão Medicina.
- O card Área Médica agora abre a seção inteira ao clicar no card.
- O link de contrato/cadastro de médicos aparece no menu de perfil e na página Meu Perfil somente para usuários admin, financeiro e gerência.
- A permissão usa o mesmo controle data-controladoria-only, já liberado para admin, financeiro e gerência no firebase-config.js.
