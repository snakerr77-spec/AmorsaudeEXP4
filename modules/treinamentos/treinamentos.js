const STORAGE_PROGRESS = "amorSaude_treinamentos_progress_v4";
const STORAGE_LAST_COURSE = "amorSaude_treinamentos_ultimo_curso_v4";

const courses = [
  {
    id: "boas-praticas",
    tab: "cvortex",
    category: "Via C-Vortex",
    icon: "◔",
    badge: "Essencial",
    title: "Boas práticas no atendimento",
    description: "Acolhimento, escuta ativa e condução segura da jornada do paciente.",
    level: "Inicial",
    duration: "45 min",
    lessons: [
      {
        title: "Acolhimento desde o primeiro contato",
        duration: "12 min",
        videoSearch: "https://www.youtube.com/results?search_query=atendimento+humanizado+em+sa%C3%BAde",
        content: "Nesta aula, o colaborador aprende a receber o paciente com clareza, cordialidade e segurança. O objetivo é reduzir ruídos, organizar a fala e criar uma experiência mais humana desde a chegada ou primeira mensagem.",
        checklist: ["Cumprimente com postura profissional.", "Confirme nome e necessidade principal.", "Explique o próximo passo sem pressa."],
        quiz: {
          question: "Qual atitude melhora o primeiro atendimento?",
          options: ["Falar rápido para liberar fila", "Escutar, confirmar e orientar o próximo passo", "Usar termos técnicos sem explicar"],
          answer: 1,
          feedback: "Perfeito. A sequência escutar, confirmar e orientar cria confiança e evita retrabalho."
        }
      },
      {
        title: "Como registrar informações sem bagunça",
        duration: "14 min",
        videoSearch: "https://www.youtube.com/results?search_query=organiza%C3%A7%C3%A3o+de+cadastro+de+pacientes+atendimento",
        content: "Aqui a equipe treina registro objetivo: nome, contato, serviço procurado, data, profissional e observação útil. Informação limpa é o motor silencioso de uma clínica organizada.",
        checklist: ["Evite abreviações confusas.", "Registre somente dados úteis para o atendimento.", "Revise antes de salvar."],
        quiz: {
          question: "Uma boa observação interna deve ser:",
          options: ["Longa e cheia de opinião", "Objetiva, útil e respeitosa", "Vazia para não ocupar espaço"],
          answer: 1,
          feedback: "Isso aí. Observações precisam ajudar a equipe sem expor ou confundir o paciente."
        }
      },
      {
        title: "Encerramento com segurança",
        duration: "19 min",
        videoSearch: "https://www.youtube.com/results?search_query=boas+pr%C3%A1ticas+atendimento+cl%C3%ADnica+m%C3%A9dica",
        content: "Finalizar bem é confirmar agendamento, preparo, documentos e canal de contato. O colaborador aprende a encerrar a conversa com resumo claro e confirmação final.",
        checklist: ["Repita data, horário e profissional.", "Informe preparo quando existir.", "Confirme se ficou alguma dúvida."],
        quiz: {
          question: "Antes de encerrar, o colaborador deve:",
          options: ["Confirmar as principais informações", "Encerrar assim que o paciente parar de falar", "Mandar o paciente procurar sozinho"],
          answer: 0,
          feedback: "Correto. A confirmação final evita faltas, erros de preparo e desalinhamento."
        }
      }
    ]
  },
  {
    id: "seguranca-paciente",
    tab: "cvortex",
    category: "Via C-Vortex",
    icon: "✚",
    badge: "Obrigatório",
    title: "Segurança do paciente",
    description: "Rotinas para reduzir erros, orientar preparo e proteger o atendimento.",
    level: "Intermediário",
    duration: "55 min",
    lessons: [
      {
        title: "Identificação correta do paciente",
        duration: "15 min",
        videoSearch: "https://www.youtube.com/results?search_query=seguran%C3%A7a+do+paciente+identifica%C3%A7%C3%A3o+correta",
        content: "A aula reforça a conferência de nome completo, data de nascimento e serviço solicitado. Pequenas confirmações são grandes muralhas contra erros.",
        checklist: ["Confirme dois identificadores.", "Evite chamar apenas por apelido.", "Cheque antes de imprimir ou encaminhar."],
        quiz: {
          question: "Para confirmar o paciente, o ideal é usar:",
          options: ["Só o primeiro nome", "Dois identificadores", "A cor da roupa"],
          answer: 1,
          feedback: "Exato. Dois identificadores aumentam a segurança do processo."
        }
      },
      {
        title: "Orientação de preparo para exames",
        duration: "20 min",
        videoSearch: "https://www.youtube.com/results?search_query=preparo+para+exames+laboratoriais+jejum+orienta%C3%A7%C3%A3o",
        content: "O foco é explicar jejum, documentos, prazos e restrições de forma simples. O colaborador aprende a conferir o preparo antes de confirmar o exame.",
        checklist: ["Verifique se precisa de jejum.", "Informe prazo estimado.", "Oriente trazer documento e pedido quando necessário."],
        quiz: {
          question: "Quando o exame exige jejum, a equipe deve:",
          options: ["Informar claramente o tempo", "Deixar o paciente descobrir", "Cancelar o atendimento"],
          answer: 0,
          feedback: "Certo. O tempo de jejum deve ser explicado antes da ida do paciente."
        }
      },
      {
        title: "Comunicação de risco e encaminhamento",
        duration: "20 min",
        videoSearch: "https://www.youtube.com/results?search_query=comunica%C3%A7%C3%A3o+segura+em+sa%C3%BAde+paciente",
        content: "Nesta etapa, a equipe aprende quando pedir apoio da liderança, quando acionar o setor responsável e como registrar situações sensíveis sem improviso.",
        checklist: ["Não prometa diagnóstico.", "Acione responsável em caso de dúvida clínica.", "Registre a orientação dada."],
        quiz: {
          question: "O colaborador deve evitar:",
          options: ["Chamar ajuda quando necessário", "Prometer diagnóstico ou resultado", "Registrar orientação objetiva"],
          answer: 1,
          feedback: "Isso. Diagnóstico e conduta clínica pertencem ao profissional habilitado."
        }
      }
    ]
  },
  {
    id: "etica-conduta",
    tab: "cvortex",
    category: "Via C-Vortex",
    icon: "⚖",
    badge: "Conduta",
    title: "Ética e conduta profissional",
    description: "Postura, sigilo, respeito e comunicação dentro da clínica.",
    level: "Inicial",
    duration: "40 min",
    lessons: [
      {
        title: "Sigilo e cuidado com dados",
        duration: "13 min",
        videoSearch: "https://www.youtube.com/results?search_query=sigilo+profissional+dados+de+pacientes+cl%C3%ADnica",
        content: "A aula mostra como tratar informações de pacientes com cuidado, evitando exposição em conversas, telas abertas ou mensagens desnecessárias.",
        checklist: ["Não compartilhe dados fora do canal correto.", "Bloqueie telas quando sair.", "Use somente informações necessárias."],
        quiz: {
          question: "Dados de pacientes devem ser tratados com:",
          options: ["Sigilo e necessidade", "Curiosidade", "Compartilhamento livre"],
          answer: 0,
          feedback: "Correto. Sigilo e necessidade são bússola e freio."
        }
      },
      {
        title: "Postura em situações difíceis",
        duration: "14 min",
        videoSearch: "https://www.youtube.com/results?search_query=como+lidar+com+paciente+dif%C3%ADcil+atendimento+sa%C3%BAde",
        content: "Treino para manter tom calmo, ouvir a reclamação, não discutir e chamar apoio quando a situação ultrapassar o papel do colaborador.",
        checklist: ["Mantenha tom respeitoso.", "Não responda agressividade com agressividade.", "Encaminhe à liderança quando necessário."],
        quiz: {
          question: "Em uma reclamação, a primeira postura deve ser:",
          options: ["Discutir", "Ouvir e organizar a solução", "Ignorar"],
          answer: 1,
          feedback: "Boa. Ouvir e organizar a solução reduz atrito."
        }
      },
      {
        title: "Comunicação entre setores",
        duration: "13 min",
        videoSearch: "https://www.youtube.com/results?search_query=comunica%C3%A7%C3%A3o+interna+equipe+cl%C3%ADnica",
        content: "Uma clínica funciona melhor quando a informação cruza setores sem ruído. A aula ensina repasse objetivo, responsável e com confirmação de recebimento.",
        checklist: ["Informe o setor certo.", "Use mensagem objetiva.", "Confirme recebimento em casos importantes."],
        quiz: {
          question: "Um bom repasse interno precisa ser:",
          options: ["Vago", "Objetivo e rastreável", "Apenas verbal sempre"],
          answer: 1,
          feedback: "Isso. Repasse objetivo vira trilho, não labirinto."
        }
      }
    ]
  },
  {
    id: "alinhamento-chamada",
    tab: "chamada",
    category: "Por chamada",
    icon: "☎",
    badge: "Ao vivo",
    title: "Reunião de alinhamento",
    description: "Roteiro de chamada para padronizar metas, campanhas e fluxo do dia.",
    level: "Equipe",
    duration: "40 min",
    lessons: [
      {
        title: "Preparação antes da chamada",
        duration: "10 min",
        videoSearch: "https://www.youtube.com/results?search_query=como+fazer+reuni%C3%A3o+de+alinhamento+equipe",
        content: "A equipe aprende a chegar na chamada com pauta, dados principais e pontos críticos do dia. Chamada sem pauta vira neblina com microfone.",
        checklist: ["Separe pendências.", "Anote dúvidas.", "Confira metas do dia."],
        quiz: { question: "Uma chamada produtiva começa com:", options: ["Pauta clara", "Improviso total", "Todo mundo falando junto"], answer: 0, feedback: "Certo. Pauta clara economiza tempo e energia." }
      },
      {
        title: "Registro de decisões",
        duration: "15 min",
        videoSearch: "https://www.youtube.com/results?search_query=ata+de+reuni%C3%A3o+decis%C3%B5es+e+respons%C3%A1veis",
        content: "Cada decisão precisa ter responsável e prazo. O curso ensina a transformar conversa em ação acompanhável.",
        checklist: ["Defina responsável.", "Defina prazo.", "Registre onde todos acessem."],
        quiz: { question: "Uma decisão sem responsável tende a:", options: ["Virar ação rápida", "Se perder", "Ficar mais clara"], answer: 1, feedback: "Exato. Responsável e prazo dão pernas para a decisão." }
      },
      {
        title: "Fechamento e próximos passos",
        duration: "15 min",
        videoSearch: "https://www.youtube.com/results?search_query=como+encerrar+reuni%C3%A3o+com+pr%C3%B3ximos+passos",
        content: "O encerramento resume prioridades, bloqueios e responsáveis. Todos saem sabendo o que fazer, sem caça ao tesouro depois.",
        checklist: ["Recapitule prioridades.", "Confirme dúvidas finais.", "Envie resumo curto."],
        quiz: { question: "No final da chamada, a equipe precisa sair com:", options: ["Próximos passos claros", "Mais dúvidas", "Nada anotado"], answer: 0, feedback: "Perfeito. Clareza final evita retrabalho." }
      }
    ]
  },
  {
    id: "tira-duvidas",
    tab: "chamada",
    category: "Por chamada",
    icon: "❖",
    badge: "Suporte",
    title: "Tira-dúvidas operacional",
    description: "Aulas para resolver dúvidas de agenda, exames, encaminhamentos e sistemas.",
    level: "Rotina",
    duration: "35 min",
    lessons: [
      { title: "Como organizar dúvidas", duration: "10 min", videoSearch: "https://www.youtube.com/results?search_query=gest%C3%A3o+de+d%C3%BAvidas+equipe+atendimento", content: "Aprenda a separar dúvidas por prioridade: paciente aguardando, agenda, exame, cadastro e sistema.", checklist: ["Classifique a dúvida.", "Evite mensagens soltas.", "Inclua print quando necessário."], quiz: { question: "Dúvidas devem ser enviadas com:", options: ["Contexto", "Só um 'não deu'", "Nenhum detalhe"], answer: 0, feedback: "Certo. Contexto acelera a solução." } },
      { title: "Quando chamar liderança", duration: "12 min", videoSearch: "https://www.youtube.com/results?search_query=quando+escalar+problema+para+lideran%C3%A7a+atendimento", content: "Nem toda dúvida precisa escalar, mas risco, reclamação séria e erro sensível devem ir para liderança rapidamente.", checklist: ["Identifique risco.", "Registre o caso.", "Avise a liderança com clareza."], quiz: { question: "Caso sensível deve ser:", options: ["Escondido", "Escalado com registro", "Comentado no corredor"], answer: 1, feedback: "Exatamente. Escalar com registro protege paciente e equipe." } },
      { title: "Como transformar dúvidas em melhoria", duration: "13 min", videoSearch: "https://www.youtube.com/results?search_query=melhoria+cont%C3%ADnua+processos+atendimento+cl%C3%ADnica", content: "Dúvidas repetidas revelam processo fraco. A aula ensina a criar pequenos ajustes e materiais internos.", checklist: ["Liste dúvidas repetidas.", "Crie resposta padrão.", "Atualize o painel interno."], quiz: { question: "Dúvidas repetidas indicam:", options: ["Oportunidade de melhoria", "Que ninguém presta atenção", "Que deve ser ignorado"], answer: 0, feedback: "Isso. Dúvida repetida é placa luminosa de melhoria." } }
    ]
  },
  {
    id: "treino-equipe",
    tab: "chamada",
    category: "Por chamada",
    icon: "👥",
    badge: "Prático",
    title: "Treino de equipe",
    description: "Simulações de atendimento para praticar fala, registro e fechamento.",
    level: "Prático",
    duration: "50 min",
    lessons: [
      { title: "Simulação de primeira mensagem", duration: "15 min", videoSearch: "https://www.youtube.com/results?search_query=simula%C3%A7%C3%A3o+de+atendimento+ao+cliente", content: "A equipe pratica como responder de forma rápida, humana e padronizada.", checklist: ["Use saudação.", "Pergunte necessidade.", "Ofereça caminho."], quiz: { question: "A primeira resposta deve ser:", options: ["Humana e objetiva", "Robótica e seca", "Sem identificação"], answer: 0, feedback: "Boa. Tom humano e objetivo abre portas." } },
      { title: "Simulação de paciente irritado", duration: "18 min", videoSearch: "https://www.youtube.com/results?search_query=como+lidar+com+cliente+irritado+atendimento", content: "Treino para ouvir, acalmar, validar e encaminhar sem confronto.", checklist: ["Não interrompa.", "Valide o problema.", "Busque solução possível."], quiz: { question: "Em atrito, a equipe deve evitar:", options: ["Escutar", "Confronto", "Encaminhar"], answer: 1, feedback: "Certo. Confronto joga combustível no incêndio." } },
      { title: "Simulação de fechamento", duration: "17 min", videoSearch: "https://www.youtube.com/results?search_query=fechamento+de+atendimento+ao+cliente+confirma%C3%A7%C3%A3o", content: "Aula prática para finalizar atendimento com resumo e confirmação final.", checklist: ["Resumo do combinado.", "Confirmação do paciente.", "Canal para dúvidas."], quiz: { question: "Um fechamento seguro inclui:", options: ["Resumo e confirmação", "Silêncio", "Apenas emoji"], answer: 0, feedback: "Perfeito. Resumo e confirmação fecham o ciclo." } }
    ]
  },
  {
    id: "recepcao-presencial",
    tab: "presencial",
    category: "Presencial",
    icon: "🏥",
    badge: "Unidade",
    title: "Recepção e fluxo de chegada",
    description: "Organização da chegada, fila, senha, documentos e direcionamento.",
    level: "Inicial",
    duration: "50 min",
    lessons: [
      { title: "Primeiros 30 segundos", duration: "12 min", videoSearch: "https://www.youtube.com/results?search_query=recep%C3%A7%C3%A3o+cl%C3%ADnica+atendimento+paciente", content: "Acolhimento rápido, conferência e direcionamento inicial do paciente.", checklist: ["Olhe para o paciente.", "Cumprimente.", "Pergunte como ajudar."], quiz: { question: "Na chegada, o paciente precisa sentir:", options: ["Direcionamento", "Abandono", "Pressa agressiva"], answer: 0, feedback: "Exato. Direcionamento reduz ansiedade." } },
      { title: "Conferência de documentos", duration: "18 min", videoSearch: "https://www.youtube.com/results?search_query=confer%C3%AAncia+de+documentos+recep%C3%A7%C3%A3o+cl%C3%ADnica", content: "Aula sobre pedido, documento, cadastro e autorização quando necessário.", checklist: ["Confira documento.", "Valide cadastro.", "Peça pedido quando necessário."], quiz: { question: "Documento deve ser conferido:", options: ["Antes do encaminhamento", "Só depois", "Nunca"], answer: 0, feedback: "Certo. Conferir antes evita interrupções." } },
      { title: "Direcionamento para setor correto", duration: "20 min", videoSearch: "https://www.youtube.com/results?search_query=fluxo+de+atendimento+recep%C3%A7%C3%A3o+cl%C3%ADnica", content: "Organização do caminho entre recepção, consulta, exame e atendimento interno.", checklist: ["Informe onde aguardar.", "Explique o tempo aproximado.", "Avise o setor responsável."], quiz: { question: "Direcionamento correto evita:", options: ["Paciente perdido", "Atendimento claro", "Fila organizada"], answer: 0, feedback: "Isso. Paciente perdido vira ruído para todos." } }
    ]
  },
  {
    id: "setor-interno",
    tab: "presencial",
    category: "Presencial",
    icon: "🗂",
    badge: "Processos",
    title: "Setor interno e organização",
    description: "Rotina de documentos, repasses, pendências e fechamento de atendimento.",
    level: "Operacional",
    duration: "1h 10m",
    lessons: [
      { title: "Fila de pendências", duration: "20 min", videoSearch: "https://www.youtube.com/results?search_query=organiza%C3%A7%C3%A3o+de+pend%C3%AAncias+administrativas", content: "Como classificar pendências por prazo, impacto e responsável.", checklist: ["Priorize urgentes.", "Defina responsável.", "Atualize status."], quiz: { question: "Pendência sem status causa:", options: ["Clareza", "Retrabalho", "Produtividade"], answer: 1, feedback: "Certo. Sem status, ninguém sabe onde está o fio." } },
      { title: "Repasses entre turnos", duration: "25 min", videoSearch: "https://www.youtube.com/results?search_query=passagem+de+plant%C3%A3o+administrativo+cl%C3%ADnica", content: "Passagem de informação entre equipes, evitando perda de histórico.", checklist: ["Liste pendências abertas.", "Informe responsáveis.", "Destaque prioridades."], quiz: { question: "Um bom repasse precisa de:", options: ["Histórico mínimo", "Frases soltas", "Apenas memória"], answer: 0, feedback: "Boa. Histórico mínimo dá continuidade." } },
      { title: "Fechamento do dia", duration: "25 min", videoSearch: "https://www.youtube.com/results?search_query=rotina+de+fechamento+administrativo+cl%C3%ADnica", content: "Conferência final de registros, pendências, agenda do dia seguinte e ocorrências.", checklist: ["Conferir agenda.", "Fechar pendências possíveis.", "Registrar ocorrências."], quiz: { question: "Fechamento do dia serve para:", options: ["Preparar o próximo dia", "Apagar registros", "Criar confusão"], answer: 0, feedback: "Perfeito. Fechar bem hoje abre melhor amanhã." } }
    ]
  },
  {
    id: "boas-praticas-presencial",
    tab: "presencial",
    category: "Presencial",
    icon: "★",
    badge: "Excelência",
    title: "Excelência no atendimento presencial",
    description: "Postura, linguagem corporal e cuidado com o ambiente da clínica.",
    level: "Equipe",
    duration: "45 min",
    lessons: [
      { title: "Ambiente e primeira impressão", duration: "12 min", videoSearch: "https://www.youtube.com/results?search_query=excel%C3%AAncia+no+atendimento+presencial", content: "Aula sobre organização do balcão, tom de voz, fila e acolhimento visual.", checklist: ["Balcão organizado.", "Tom de voz adequado.", "Fila observada."], quiz: { question: "Primeira impressão inclui:", options: ["Ambiente e postura", "Só preço", "Apenas uniforme"], answer: 0, feedback: "Exato. A experiência começa antes da fala." } },
      { title: "Comunicação corporal", duration: "15 min", videoSearch: "https://www.youtube.com/results?search_query=linguagem+corporal+atendimento+ao+cliente", content: "Treino de postura, expressão, atenção visual e gestos durante o atendimento.", checklist: ["Postura aberta.", "Evite olhar só para tela.", "Demonstre atenção."], quiz: { question: "Olhar só para a tela pode transmitir:", options: ["Desatenção", "Acolhimento", "Segurança total"], answer: 0, feedback: "Certo. Tela ajuda, mas o paciente precisa ser visto." } },
      { title: "Cuidado com filas e espera", duration: "18 min", videoSearch: "https://www.youtube.com/results?search_query=gest%C3%A3o+de+fila+e+tempo+de+espera+cl%C3%ADnica", content: "Como informar espera, organizar prioridade e reduzir tensão em horários de pico.", checklist: ["Avise previsão.", "Observe prioridades.", "Atualize paciente quando houver atraso."], quiz: { question: "Em espera longa, é melhor:", options: ["Atualizar o paciente", "Fingir que não viu", "Culpar outro setor"], answer: 0, feedback: "Boa. Informação reduz ansiedade." } }
    ]
  },
  {
    id: "libras-basico",
    tab: "libras",
    category: "Libras",
    icon: "👋",
    badge: "Inclusão",
    title: "Saudações básicas em Libras",
    description: "Primeiros sinais para receber melhor pessoas surdas ou com deficiência auditiva.",
    level: "Inicial",
    duration: "25 min",
    lessons: [
      { title: "Cumprimentos", duration: "8 min", videoSearch: "https://www.youtube.com/results?search_query=libras+cumprimentos+b%C3%A1sicos", content: "Introdução a sinais de cumprimento e abertura do atendimento.", checklist: ["Aprenda olá.", "Aprenda bom dia.", "Pratique com calma."], quiz: { question: "Libras ajuda a clínica a ser mais:", options: ["Acessível", "Confusa", "Distante"], answer: 0, feedback: "Certo. Acessibilidade começa com disposição para comunicar." } },
      { title: "Perguntas simples", duration: "9 min", videoSearch: "https://www.youtube.com/results?search_query=libras+perguntas+b%C3%A1sicas+atendimento", content: "Sinais e estratégias para perguntar nome, necessidade e confirmação.", checklist: ["Pergunte nome.", "Use apoio visual.", "Confirme entendimento."], quiz: { question: "Além dos sinais, ajuda usar:", options: ["Apoio visual", "Gritos", "Pressa"], answer: 0, feedback: "Perfeito. Apoio visual facilita a comunicação." } },
      { title: "Encaminhamento acessível", duration: "8 min", videoSearch: "https://www.youtube.com/results?search_query=libras+atendimento+em+sa%C3%BAde", content: "Como direcionar para sala, recepção ou exame de forma visual e respeitosa.", checklist: ["Aponte local com clareza.", "Use escrita quando preciso.", "Confirme se entendeu."], quiz: { question: "Ao encaminhar, a equipe deve:", options: ["Confirmar entendimento", "Virar as costas rápido", "Ignorar dúvidas"], answer: 0, feedback: "Boa. Confirmação fecha o ciclo de comunicação." } }
    ]
  },
  {
    id: "libras-atendimento",
    tab: "libras",
    category: "Libras",
    icon: "💬",
    badge: "Acolhimento",
    title: "Atendimento inicial acessível",
    description: "Comunicação inclusiva para triagem administrativa e orientação básica.",
    level: "Intermediário",
    duration: "40 min",
    lessons: [
      { title: "Como iniciar sem constrangimento", duration: "12 min", videoSearch: "https://www.youtube.com/results?search_query=atendimento+acess%C3%ADvel+pessoa+surda+sa%C3%BAde", content: "Aula sobre respeito, paciência e uso de alternativas de comunicação sem infantilizar o paciente.", checklist: ["Fale de frente.", "Não infantilize.", "Use escrita se necessário."], quiz: { question: "No atendimento acessível, deve-se evitar:", options: ["Infantilizar o paciente", "Usar apoio visual", "Ter paciência"], answer: 0, feedback: "Certo. Respeito é parte central da inclusão." } },
      { title: "Orientação de documentos", duration: "14 min", videoSearch: "https://www.youtube.com/results?search_query=libras+documentos+atendimento", content: "Como solicitar documentos, pedido e confirmação usando fala clara, escrita ou sinais básicos.", checklist: ["Mostre o documento solicitado.", "Escreva quando necessário.", "Confirme antes de prosseguir."], quiz: { question: "A escrita pode ser usada como:", options: ["Apoio de comunicação", "Substituto de respeito", "Obstáculo"], answer: 0, feedback: "Isso. Escrita é ponte quando usada com cuidado." } },
      { title: "Fechamento inclusivo", duration: "14 min", videoSearch: "https://www.youtube.com/results?search_query=acessibilidade+comunica%C3%A7%C3%A3o+surda+atendimento", content: "Treino para encerrar com resumo visual, horário, preparo e canal de dúvida.", checklist: ["Mostre resumo.", "Confirme horário.", "Explique preparo."], quiz: { question: "O fechamento acessível precisa de:", options: ["Resumo claro", "Informação pela metade", "Nenhuma confirmação"], answer: 0, feedback: "Perfeito. Resumo claro dá autonomia ao paciente." } }
    ]
  },
  {
    id: "libras-pratica",
    tab: "libras",
    category: "Libras",
    icon: "✔",
    badge: "Prática",
    title: "Prática cotidiana de inclusão",
    description: "Pequenas atitudes diárias para manter acolhimento acessível na clínica.",
    level: "Aplicação",
    duration: "35 min",
    lessons: [
      { title: "Sinais úteis para rotina", duration: "10 min", videoSearch: "https://www.youtube.com/results?search_query=sinais+em+libras+para+atendimento", content: "Lista de sinais e recursos visuais úteis para recepção e orientação.", checklist: ["Treine diariamente.", "Crie cartaz de apoio.", "Compartilhe com a equipe."], quiz: { question: "Prática cotidiana melhora quando:", options: ["A equipe treina junto", "Ninguém pratica", "Só uma pessoa sabe"], answer: 0, feedback: "Boa. Inclusão cresce em equipe." } },
      { title: "Recursos visuais na unidade", duration: "12 min", videoSearch: "https://www.youtube.com/results?search_query=recursos+visuais+acessibilidade+atendimento+sa%C3%BAde", content: "Como placas, QR codes, textos simples e imagens podem ajudar no fluxo do atendimento.", checklist: ["Use frases curtas.", "Inclua ícones.", "Revise clareza."], quiz: { question: "Recursos visuais devem ser:", options: ["Claros e simples", "Pequenos demais", "Confusos"], answer: 0, feedback: "Certo. Visual bom não grita, orienta." } },
      { title: "Melhoria contínua em acessibilidade", duration: "13 min", videoSearch: "https://www.youtube.com/results?search_query=acessibilidade+atendimento+inclusivo+sa%C3%BAde", content: "A equipe aprende a registrar dificuldades reais e transformar isso em ajustes de processo.", checklist: ["Anote barreiras.", "Peça feedback.", "Ajuste o processo."], quiz: { question: "Acessibilidade deve ser vista como:", options: ["Processo contínuo", "Favor", "Algo sem importância"], answer: 0, feedback: "Exato. Acessibilidade é processo, não enfeite." } }
    ]
  }
];

let progress = loadProgress();
let activeCourseId = null;
let activeLessonIndex = 0;
let selectedAnswer = null;
let toastTimer = null;

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_PROGRESS)) || {};
  } catch {
    return {};
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_PROGRESS, JSON.stringify(progress));
}

function sanitize(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getCourse(id) {
  return courses.find(course => course.id === id);
}

function lessonKey(courseId, lessonIndex) {
  return `${courseId}:${lessonIndex}`;
}

function isLessonDone(courseId, lessonIndex) {
  return Boolean(progress[lessonKey(courseId, lessonIndex)]);
}

function courseProgress(course) {
  const total = course.lessons.length || 1;
  const done = course.lessons.filter((_, index) => isLessonDone(course.id, index)).length;
  return Math.round((done / total) * 100);
}

function courseDoneCount(course) {
  return course.lessons.filter((_, index) => isLessonDone(course.id, index)).length;
}

function showToast(message) {
  const toast = document.getElementById("trainingToast");
  if (!toast) return;

  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2300);
}

function renderCards() {
  ["cvortex", "chamada", "presencial", "libras"].forEach(tab => {
    const container = document.getElementById(`courses-${tab}`);
    if (!container) return;

    const html = courses
      .filter(course => course.tab === tab)
      .map(course => {
        const percent = courseProgress(course);
        const done = courseDoneCount(course);
        const badgeClass = course.tab === "chamada" ? "badge red" : "badge";
        const actionText = percent === 100 ? "Revisar curso" : percent > 0 ? "Continuar aulas" : "Iniciar aulas";

        return `
          <article class="course-card" data-course-card="${course.id}">
            <div class="course-top">
              <div class="card-icon">${course.icon}</div>
              <span class="${badgeClass}">${sanitize(course.badge)}</span>
            </div>

            <h3>${sanitize(course.title)}</h3>
            <p>${sanitize(course.description)}</p>

            <div class="card-meta">
              <span>${sanitize(course.level)}</span>
              <span>${sanitize(course.duration)}</span>
            </div>

            <div class="meta-line">
              <span>${percent}% concluído</span>
              <span>${done}/${course.lessons.length} aulas</span>
            </div>

            <div class="progress"><div class="progress-bar" style="width:${percent}%"></div></div>

            <button type="button" class="card-button" data-open-course="${course.id}">▶ ${actionText}</button>
          </article>
        `;
      })
      .join("");

    container.innerHTML = html;
  });

  document.querySelectorAll("[data-open-course]").forEach(button => {
    button.addEventListener("click", () => openCourse(button.dataset.openCourse));
  });
}

function updateOverview() {
  const totalLessons = courses.reduce((sum, course) => sum + course.lessons.length, 0);
  const totalDone = courses.reduce((sum, course) => sum + courseDoneCount(course), 0);
  const overall = totalLessons ? Math.round((totalDone / totalLessons) * 100) : 0;
  const certificates = courses.filter(course => courseProgress(course) === 100).length;

  document.getElementById("overallProgress").textContent = `${overall}%`;
  document.getElementById("overallProgressBar").style.width = `${overall}%`;
  document.getElementById("totalCourses").textContent = courses.length;
  document.getElementById("totalLessonsDone").textContent = totalDone;
  document.getElementById("totalLessonsText").textContent = `de ${totalLessons} aulas.`;
  document.getElementById("totalCertificates").textContent = certificates;
}

function openCourse(courseId, lessonIndex = null) {
  const course = getCourse(courseId);
  if (!course) return;

  activeCourseId = courseId;
  localStorage.setItem(STORAGE_LAST_COURSE, courseId);

  if (typeof lessonIndex === "number") {
    activeLessonIndex = lessonIndex;
  } else {
    const firstNotDone = course.lessons.findIndex((_, index) => !isLessonDone(course.id, index));
    activeLessonIndex = firstNotDone === -1 ? 0 : firstNotDone;
  }

  document.getElementById("lessonDrawer").classList.add("open");
  document.getElementById("lessonDrawer").setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");

  renderDrawer();
}

function closeDrawer() {
  document.getElementById("lessonDrawer").classList.remove("open");
  document.getElementById("lessonDrawer").setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
}

function renderDrawer() {
  const course = getCourse(activeCourseId);
  if (!course) return;

  const percent = courseProgress(course);

  document.getElementById("drawerCategory").textContent = course.category;
  document.getElementById("drawerCourseTitle").textContent = course.title;
  document.getElementById("drawerCourseDescription").textContent = course.description;
  document.getElementById("drawerProgressBar").style.width = `${percent}%`;
  document.getElementById("drawerProgressText").textContent = `${percent}% concluído`;

  const list = document.getElementById("lessonList");
  list.innerHTML = course.lessons.map((lesson, index) => {
    const done = isLessonDone(course.id, index);
    const active = index === activeLessonIndex;

    return `
      <button type="button" class="lesson-item ${done ? "done" : ""} ${active ? "active" : ""}" data-lesson-index="${index}">
        <span class="lesson-number">${done ? "✓" : index + 1}</span>
        <span class="lesson-info">
          <strong>${sanitize(lesson.title)}</strong>
          <small>${sanitize(lesson.duration)}</small>
        </span>
        <span class="lesson-status">${done ? "Feita" : ""}</span>
      </button>
    `;
  }).join("");

  list.querySelectorAll("[data-lesson-index]").forEach(button => {
    button.addEventListener("click", () => {
      activeLessonIndex = Number(button.dataset.lessonIndex);
      renderDrawer();
    });
  });

  renderLesson();
}

function renderLesson() {
  const course = getCourse(activeCourseId);
  if (!course) return;

  const lesson = course.lessons[activeLessonIndex];
  selectedAnswer = null;

  document.getElementById("lessonVideoTitle").textContent = `Apoio para: ${lesson.title}`;
  document.getElementById("lessonVideoLink").href = lesson.videoSearch;
  document.getElementById("lessonDuration").textContent = `${course.title} · ${lesson.duration}`;
  document.getElementById("lessonTitle").textContent = lesson.title;
  document.getElementById("lessonContent").textContent = lesson.content;

  const checklist = document.getElementById("lessonChecklist");
  checklist.innerHTML = lesson.checklist.map((item, index) => `
    <div class="check-card">
      <b>Passo ${index + 1}</b>
      ${sanitize(item)}
    </div>
  `).join("");

  document.getElementById("quizQuestion").textContent = lesson.quiz.question;
  document.getElementById("quizFeedback").textContent = "Escolha uma resposta para validar o entendimento.";

  const options = document.getElementById("quizOptions");
  options.innerHTML = lesson.quiz.options.map((option, index) => `
    <button type="button" class="quiz-option" data-answer-index="${index}">${sanitize(option)}</button>
  `).join("");

  options.querySelectorAll(".quiz-option").forEach(button => {
    button.addEventListener("click", () => answerQuiz(Number(button.dataset.answerIndex)));
  });

  const completeButton = document.getElementById("completeLesson");
  const done = isLessonDone(course.id, activeLessonIndex);
  completeButton.textContent = done ? "Aula concluída ✓" : "Concluir aula";
  completeButton.disabled = false;

  document.getElementById("prevLesson").disabled = activeLessonIndex === 0;
  document.getElementById("nextLesson").disabled = activeLessonIndex === course.lessons.length - 1;
}

function answerQuiz(index) {
  const course = getCourse(activeCourseId);
  if (!course) return;

  const lesson = course.lessons[activeLessonIndex];
  selectedAnswer = index;

  const buttons = document.querySelectorAll(".quiz-option");
  buttons.forEach((button, buttonIndex) => {
    button.classList.remove("selected", "correct", "wrong");

    if (buttonIndex === index) button.classList.add("selected");
    if (buttonIndex === lesson.quiz.answer) button.classList.add("correct");
    if (buttonIndex === index && index !== lesson.quiz.answer) button.classList.add("wrong");
  });

  const feedback = document.getElementById("quizFeedback");
  feedback.textContent = index === lesson.quiz.answer
    ? lesson.quiz.feedback
    : "Quase. Revise a aula e tente pensar no atendimento mais seguro para o paciente.";
}

function completeCurrentLesson() {
  const course = getCourse(activeCourseId);
  if (!course) return;

  if (selectedAnswer === null && !isLessonDone(course.id, activeLessonIndex)) {
    showToast("Responda a mini atividade antes de concluir a aula.");
    return;
  }

  progress[lessonKey(course.id, activeLessonIndex)] = true;
  saveProgress();
  renderCards();
  updateOverview();
  renderDrawer();

  const percent = courseProgress(course);
  if (percent === 100) {
    showToast(`Curso finalizado: ${course.title}. Certificado liberado no painel.`);
  } else {
    showToast("Aula concluída. Sua porcentagem subiu no painel.");
  }
}

function nextLesson() {
  const course = getCourse(activeCourseId);
  if (!course) return;

  if (activeLessonIndex < course.lessons.length - 1) {
    activeLessonIndex += 1;
    renderDrawer();
  }
}

function prevLesson() {
  if (activeLessonIndex > 0) {
    activeLessonIndex -= 1;
    renderDrawer();
  }
}

function initializeTabs() {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-tab");

      tabs.forEach(item => item.classList.remove("is-active"));
      panels.forEach(panel => panel.classList.remove("is-active"));

      tab.classList.add("is-active");
      document.getElementById(target)?.classList.add("is-active");

      if (window.innerWidth <= 720) {
        document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

function initializeMenu() {
  const menuButton = document.getElementById("trainingMenuToggle");
  const nav = document.getElementById("trainingNavigation");
  if (!menuButton || !nav) return;

  function closeMenu() {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.textContent = "☰";
    document.body.classList.remove("menu-open");
  }

  menuButton.addEventListener("click", event => {
    event.stopPropagation();
    const isOpen = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.textContent = isOpen ? "×" : "☰";
    document.body.classList.toggle("menu-open", isOpen);
  });

  nav.addEventListener("click", event => event.stopPropagation());
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("click", closeMenu);
  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) closeMenu();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeMenu();
      closeDrawer();
    }
  });
}

function initializeBackToTop() {
  const backToTop = document.getElementById("trainingBackToTop");
  if (!backToTop) return;

  function updateBackToTop() {
    backToTop.classList.toggle("show", window.scrollY > 420);
  }

  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function initializeDrawer() {
  document.getElementById("drawerClose")?.addEventListener("click", closeDrawer);
  document.getElementById("drawerBackdrop")?.addEventListener("click", closeDrawer);
  document.getElementById("completeLesson")?.addEventListener("click", completeCurrentLesson);
  document.getElementById("nextLesson")?.addEventListener("click", nextLesson);
  document.getElementById("prevLesson")?.addEventListener("click", prevLesson);
}

function initializeShortcuts() {
  document.querySelectorAll("[data-scroll-target]").forEach(button => {
    button.addEventListener("click", () => {
      document.getElementById(button.dataset.scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.getElementById("continueLastCourse")?.addEventListener("click", () => {
    const lastCourse = localStorage.getItem(STORAGE_LAST_COURSE) || courses[0].id;
    openCourse(lastCourse);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderCards();
  updateOverview();
  initializeTabs();
  initializeMenu();
  initializeBackToTop();
  initializeDrawer();
  initializeShortcuts();
});
