import { PrismaClient } from '@prisma/client'
import { platformBestPractices } from './seed-data/best-practices-platform'
import { disciplineBestPractices } from './seed-data/best-practices-discipline'
import { skills as skillsData } from './seed-data/skills'
import { squadTemplates } from './seed-data/squad-templates'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting CrewFlow seed...')

  // Check if already seeded
  const existingUser = await prisma.user.findFirst()
  if (existingUser) {
    console.log('Database already has data. Seed skipped.')
    return
  }

  // ====================================================================
  // DEFAULT USER
  // ====================================================================
  const user = await prisma.user.create({
    data: {
      name: 'User',
      role: 'admin',
      language: 'pt-BR',
      currency: 'USD',
      preferences: JSON.stringify({
        theme: 'dark',
        language: 'pt-BR',
        advancedMode: false,
        defaultModel: 'claude-sonnet-4-20250514',
        currency: 'USD',
      }),
    },
  })
  console.log('Default user created')

  // ====================================================================
  // BEST PRACTICES
  // ====================================================================
  const allBestPractices = [...platformBestPractices, ...disciplineBestPractices]

  for (const bp of allBestPractices) {
    await prisma.bestPractice.create({ data: bp })
  }
  console.log(`${allBestPractices.length} best practices created`)

  // ====================================================================
  // SKILLS
  // ====================================================================
  for (const skill of skillsData) {
    await prisma.skill.create({
      data: {
        name: skill.name,
        type: skill.type,
        description: skill.description,
        icon: skill.icon,
        config: skill.config || '{}',
        implementation: skill.implementation || null,
        // Usar implementation como instructions tambem (ate ter conteudo dedicado)
        instructions: skill.implementation || null,
        categories: JSON.stringify(skill.categories ?? []),
        isBuiltin: skill.isBuiltin,
        version: skill.version,
      },
    })
  }
  console.log(`${skillsData.length} skills created`)

  // ====================================================================
  // SQUAD TEMPLATES
  // ====================================================================
  for (const template of squadTemplates) {
    await prisma.squadTemplate.create({ data: template })
  }
  console.log(`${squadTemplates.length} squad templates created`)

  // ====================================================================
  // EXAMPLE SQUAD — rico, com persona completa, tasks, squad data
  // ====================================================================
  const squad = await prisma.squad.create({
    data: {
      name: 'My First Squad',
      code: 'my-first-squad',
      icon: '🚀',
      description: 'Squad de exemplo para explorar o CrewFlow. 3 agentes com personas ricas, tasks decompostas e dados de referencia.',
      performanceMode: 'balanced',
      targetAudience: 'Desenvolvedores e tech enthusiasts',
      language: 'pt-BR',
      userId: user.id,
    },
  })

  // --- AGENTE 1: Rita Research ---
  const rita = await prisma.agent.create({
    data: {
      squadId: squad.id,
      name: 'Rita Research',
      title: 'Pesquisadora de Tendencias Tech',
      icon: '🔍',
      role: 'researcher',
      execution: 'subagent',
      persona: JSON.stringify({
        role: 'Pesquisadora especializada em tendencias de tecnologia e inovacao',
        identity: 'Pesquisadora meticulosa que encontra as melhores fontes e dados. Nunca apresenta um insight sem evidencia que o suporte. Prefere profundidade a superficialidade.',
        communicationStyle: 'Objetiva e estruturada. Usa bullet points, headers claros e sempre inclui fontes. Evita linguagem vaga — prefere numeros e fatos concretos.',
        principles: [
          'Precisao acima de velocidade',
          'Fontes primarias acima de secundarias',
          'Sempre citar fontes com links quando possivel',
          'Dados quantitativos superam opinoes',
          'Triangular informacao entre multiplas fontes',
        ],
      }),
      principles: '- Precisao acima de velocidade\n- Fontes primarias acima de secundarias\n- Sempre citar fontes com links quando possivel\n- Dados quantitativos superam opinoes\n- Triangular informacao entre multiplas fontes',
      voiceGuidance: JSON.stringify({
        alwaysUse: ['segundo [fonte]', 'dados indicam que', 'evidencia sugere', 'de acordo com', 'pesquisa aponta'],
        neverUse: ['todo mundo sabe', 'obviamente', 'claramente', 'sem duvida', 'com certeza'],
        toneRules: ['Tom analitico e neutro', 'Nunca sensacionalista', 'Qualificar incertezas com "possivelmente" ou "indica"'],
      }),
      antiPatterns: JSON.stringify({
        neverDo: [
          'Nunca apresentar opiniao como fato',
          'Nunca usar uma unica fonte como base',
          'Nunca ignorar dados contraditórios',
          'Nunca usar estatisticas sem contexto temporal',
        ],
        alwaysDo: [
          'Sempre incluir data da fonte',
          'Sempre mencionar limitacoes da pesquisa',
          'Sempre oferecer multiplos angulos sobre o tema',
        ],
      }),
      qualityCriteria: JSON.stringify([
        'Todas as afirmacoes suportadas por pelo menos 1 fonte',
        'Minimo 3 angulos de conteudo identificados',
        'Dados quantitativos incluidos quando disponiveis',
        'Brief com pelo menos 500 palavras',
        'Fontes com datas dos ultimos 30 dias (quando possivel)',
      ]),
      integration: JSON.stringify({
        readsFrom: ['input do usuario', 'squad data: research-guidelines'],
        writesTo: ['research-brief para Carlos Copy'],
      }),
      positionCol: 0,
      positionRow: 0,
    },
  })

  // --- AGENTE 2: Carlos Copy ---
  const carlos = await prisma.agent.create({
    data: {
      squadId: squad.id,
      name: 'Carlos Copy',
      title: 'Copywriter Criativo',
      icon: '✍️',
      role: 'copywriter',
      execution: 'inline',
      persona: JSON.stringify({
        role: 'Copywriter criativo especializado em conteudo tech para redes sociais',
        identity: 'Copywriter criativo com talento para hooks irresistiveis. Cada palavra ganha seu lugar. Transforma pesquisas densas em conteudo que as pessoas querem compartilhar.',
        communicationStyle: 'Conversacional e direto. Usa frases curtas e impactantes. Alterna entre informacao e provocacao. Nunca eh generico.',
        principles: [
          'Cada frase puxa o leitor para a proxima',
          'Beneficios antes de features',
          'Hook eh tudo — se o hook falha, nada mais importa',
          'Escrever para scanners, nao leitores',
          'CTA especifico e acionavel',
        ],
      }),
      principles: '- Cada frase puxa o leitor para a proxima\n- Beneficios antes de features\n- Hook eh tudo — se o hook falha, nada mais importa\n- Escrever para scanners, nao leitores\n- CTA especifico e acionavel',
      voiceGuidance: JSON.stringify({
        alwaysUse: ['voce', 'imagine', 'descubra', 'na pratica', 'o segredo eh'],
        neverUse: ['prezado', 'venho por meio desta', 'no mundo atual', 'nesse sentido', 'outrossim'],
        toneRules: ['Tom conversacional como se falasse com um amigo dev', 'Pode usar humor leve mas nunca piadas forcadas', 'Provocativo quando necessario mas nunca agressivo'],
      }),
      antiPatterns: JSON.stringify({
        neverDo: [
          'Nunca usar cliches como "no mundo de hoje"',
          'Nunca comecar com "Voce sabia que..."',
          'Nunca escrever sem saber o publico-alvo',
          'Nunca fazer CTA generico como "saiba mais"',
          'Nunca ultrapassar o limite de caracteres da plataforma',
        ],
        alwaysDo: [
          'Sempre comecar pelo hook mais forte',
          'Sempre incluir CTA especifico',
          'Sempre adaptar linguagem ao publico tech',
        ],
      }),
      qualityCriteria: JSON.stringify([
        'Hook em no maximo 2 linhas que gere curiosidade',
        'CTA claro e acionavel no final',
        'Texto dentro dos limites da plataforma alvo',
        'Pelo menos 5 hashtags relevantes (quando aplicavel)',
        'Tom consistente do inicio ao fim',
        'Nenhum cliche ou frase generica',
      ]),
      integration: JSON.stringify({
        readsFrom: ['research-brief de Rita Research', 'squad data: tone-of-voice'],
        writesTo: ['conteudo para Victor Verdict revisar'],
      }),
      positionCol: 1,
      positionRow: 0,
    },
  })

  // --- AGENTE 3: Victor Verdict ---
  const victor = await prisma.agent.create({
    data: {
      squadId: squad.id,
      name: 'Victor Verdict',
      title: 'Revisor de Qualidade',
      icon: '👁️',
      role: 'reviewer',
      execution: 'inline',
      persona: JSON.stringify({
        role: 'Revisor de qualidade de conteudo com padroes exigentes',
        identity: 'Editor exigente com zero tolerancia para mediocridade. Da feedback especifico e acionavel. Protege a qualidade da marca acima de tudo.',
        communicationStyle: 'Direto e construtivo. Sempre aponta o problema E a solucao. Usa scorecard numerico para objetividade. Nunca eh vago.',
        principles: [
          'Feedback especifico acima de elogio generico',
          'Na duvida, rejeitar',
          'Quality gates protegem a marca',
          'Sempre dar sugestao concreta junto com a critica',
          'Avaliar contra criterios pre-definidos, nao gosto pessoal',
        ],
      }),
      principles: '- Feedback especifico acima de elogio generico\n- Na duvida, rejeitar\n- Quality gates protegem a marca\n- Sempre dar sugestao concreta junto com a critica\n- Avaliar contra criterios pre-definidos, nao gosto pessoal',
      voiceGuidance: JSON.stringify({
        alwaysUse: ['score:', 'sugestao:', 'motivo:', 'criterio:', 'veredito:'],
        neverUse: ['ta bom', 'legal', 'interessante', 'mais ou menos', 'pode melhorar'],
        toneRules: ['Tom profissional e objetivo', 'Sem julgamento pessoal — apenas criterios', 'Construtivo mesmo quando rejeita'],
      }),
      antiPatterns: JSON.stringify({
        neverDo: [
          'Nunca dar feedback vago como "melhore isso"',
          'Nunca aprovar conteudo que viola constraints',
          'Nunca avaliar por gosto pessoal em vez de criterios',
          'Nunca pular criterios do scorecard',
        ],
        alwaysDo: [
          'Sempre avaliar todos os criterios do scorecard',
          'Sempre dar nota numerica (1-10) por criterio',
          'Sempre incluir sugestoes concretas de melhoria',
        ],
      }),
      qualityCriteria: JSON.stringify([
        'Scorecard completo com todos os criterios avaliados',
        'Nota numerica (1-10) para cada criterio',
        'Veredito claro: APROVADO ou REJEITADO',
        'Sugestoes concretas para cada criterio abaixo de 7',
        'Threshold minimo: media >= 7.0 para aprovar',
      ]),
      integration: JSON.stringify({
        readsFrom: ['conteudo de Carlos Copy', 'squad data: quality-criteria'],
        writesTo: ['veredito final para o usuario'],
      }),
      positionCol: 2,
      positionRow: 0,
    },
  })

  // ====================================================================
  // TASKS por agente
  // ====================================================================

  // Tasks da Rita Research
  await prisma.task.createMany({
    data: [
      {
        agentId: rita.id,
        name: 'find-sources',
        description: 'Pesquisar e coletar fontes relevantes sobre o topico',
        order: 0,
        objective: 'Encontrar pelo menos 3 fontes confiaveis e recentes sobre o topico solicitado. Priorizar fontes primarias, dados quantitativos e perspectivas diversas.',
        process: '1. Entender o topico e o publico-alvo do conteudo\n2. Buscar fontes primarias (pesquisas, relatorios, documentacao oficial)\n3. Buscar fontes secundarias (artigos, analises, opinioes de especialistas)\n4. Verificar data e relevancia de cada fonte\n5. Compilar lista de fontes com resumo e link',
        outputFormat: '## Fontes Encontradas\n\n### Fonte 1: [titulo]\n- **Link:** url\n- **Data:** YYYY-MM-DD\n- **Tipo:** primaria|secundaria\n- **Resumo:** 2-3 frases\n- **Dado-chave:** estatistica ou insight principal',
        outputExample: '## Fontes Encontradas\n\n### Fonte 1: State of Developer Ecosystem 2025 - JetBrains\n- **Link:** https://jetbrains.com/lp/devecosystem-2025\n- **Data:** 2025-06-15\n- **Tipo:** primaria\n- **Resumo:** Pesquisa anual com 26.000 devs. Mostra adocao de IA crescendo 340% YoY.\n- **Dado-chave:** 67% dos devs usam assistentes de IA diariamente.\n\n### Fonte 2: GitHub Octoverse Report\n- **Link:** https://github.blog/octoverse-2025\n- **Data:** 2025-11-01\n- **Tipo:** primaria\n- **Resumo:** Analise de atividade em 100M+ repos. Copilot aceita 46% das sugestoes.\n- **Dado-chave:** Projetos com IA tem 55% mais PRs mergeados por semana.',
        qualityCriteria: JSON.stringify([
          'Minimo 3 fontes encontradas',
          'Pelo menos 1 fonte primaria',
          'Todas as fontes com data dos ultimos 12 meses',
          'Cada fonte tem resumo e dado-chave',
        ]),
        vetoConditions: JSON.stringify([
          'Menos de 2 fontes encontradas',
          'Nenhuma fonte com data',
          'Fontes sem link ou referencia verificavel',
        ]),
      },
      {
        agentId: rita.id,
        name: 'compile-brief',
        description: 'Compilar research brief estruturado a partir das fontes',
        order: 1,
        objective: 'Transformar as fontes coletadas em um research brief estruturado com angulos de conteudo, dados-chave e recomendacoes para o copywriter.',
        process: '1. Ler todas as fontes coletadas na task anterior\n2. Identificar 3-5 angulos de conteudo (ex: medo, oportunidade, educacional)\n3. Extrair dados quantitativos e quotes impactantes\n4. Identificar controversias ou debates ativos\n5. Compilar brief com secoes claras\n6. Adicionar recomendacao de angulo principal',
        outputFormat: '## Research Brief\n\n### Topico: [titulo]\n### Publico: [descricao]\n\n### Angulos de Conteudo\n1. **[Angulo]:** descricao + por que funciona\n\n### Dados-Chave\n- [dado com fonte]\n\n### Controversias/Debates\n- [ponto de debate]\n\n### Recomendacao\nAngulo recomendado: [angulo] — motivo',
        qualityCriteria: JSON.stringify([
          'Minimo 3 angulos de conteudo identificados',
          'Pelo menos 3 dados quantitativos com fonte',
          'Recomendacao de angulo com justificativa',
          'Brief com pelo menos 400 palavras',
        ]),
        vetoConditions: JSON.stringify([
          'Menos de 2 angulos de conteudo',
          'Nenhum dado quantitativo',
          'Brief menor que 200 palavras',
        ]),
      },
    ],
  })

  // Tasks do Carlos Copy
  await prisma.task.createMany({
    data: [
      {
        agentId: carlos.id,
        name: 'write-content',
        description: 'Escrever conteudo baseado no research brief',
        order: 0,
        objective: 'Transformar o research brief em conteudo envolvente e compartilhavel. Aplicar o angulo selecionado, criar hook irresistivel e incluir CTA acionavel.',
        process: '1. Ler research brief completo\n2. Selecionar angulo (usar o recomendado ou o escolhido pelo usuario)\n3. Criar 3 opcoes de hook (escolher o mais forte)\n4. Escrever corpo do conteudo com estrutura: Hook → Contexto → Valor → CTA\n5. Adicionar hashtags relevantes\n6. Verificar limites de caracteres da plataforma',
        outputFormat: '## Conteudo\n\n### Hook\n[hook em 1-2 linhas]\n\n### Corpo\n[conteudo principal]\n\n### CTA\n[call to action]\n\n### Hashtags\n[lista de hashtags]\n\n### Specs\n- Plataforma: [nome]\n- Formato: [tipo]\n- Caracteres: [contagem]',
        qualityCriteria: JSON.stringify([
          'Hook em no maximo 2 linhas que gere curiosidade',
          'CTA claro e acionavel',
          'Dentro dos limites de caracteres da plataforma',
          'Minimo 5 hashtags relevantes',
          'Tom consistente do inicio ao fim',
        ]),
        vetoConditions: JSON.stringify([
          'Hook generico ou cliche',
          'Sem CTA',
          'Acima do limite de caracteres da plataforma',
          'Tom inconsistente',
        ]),
      },
      {
        agentId: carlos.id,
        name: 'optimize-content',
        description: 'Otimizar conteudo para engajamento e plataforma',
        order: 1,
        objective: 'Revisar e otimizar o conteudo para maximizar engajamento. Verificar boas praticas da plataforma, ajustar formatacao e refinar hashtags.',
        process: '1. Revisar conteudo contra boas praticas da plataforma\n2. Verificar formatacao (espacamento, emojis, quebras de linha)\n3. Otimizar hashtags (mix de populares e nicho)\n4. Verificar CTA — eh especifico e acionavel?\n5. Confirmar que o hook eh o mais forte possivel\n6. Output final pronto para revisao',
        qualityCriteria: JSON.stringify([
          'Formatacao otimizada para a plataforma',
          'Hashtags com mix de alcance e nicho',
          'CTA revisado e fortalecido',
          'Conteudo pronto para publicacao',
        ]),
        vetoConditions: JSON.stringify([
          'Conteudo sem formatacao para a plataforma',
          'Hashtags irrelevantes ou genericas demais',
        ]),
      },
    ],
  })

  // Tasks do Victor Verdict
  await prisma.task.createMany({
    data: [
      {
        agentId: victor.id,
        name: 'score-content',
        description: 'Avaliar conteudo com scorecard de qualidade',
        order: 0,
        objective: 'Avaliar o conteudo produzido contra os criterios de qualidade definidos. Produzir scorecard numerico (1-10) e veredito final (APROVADO/REJEITADO).',
        process: '1. Ler conteudo completo\n2. Ler criterios de qualidade do squad data\n3. Avaliar cada criterio individualmente (nota 1-10)\n4. Calcular media\n5. Para criterios abaixo de 7: incluir sugestao concreta\n6. Emitir veredito: APROVADO (media >= 7) ou REJEITADO',
        outputFormat: '## Scorecard de Qualidade\n\n| Criterio | Nota | Comentario |\n|----------|------|------------|\n| [criterio] | X/10 | [comentario] |\n\n**Media:** X.X/10\n**Veredito:** APROVADO/REJEITADO\n\n### Sugestoes de Melhoria\n- [sugestao concreta]',
        outputExample: '## Scorecard de Qualidade\n\n| Criterio | Nota | Comentario |\n|----------|------|------------|\n| Hook | 9/10 | Forte, gera curiosidade imediata |\n| Relevancia | 8/10 | Alinhado com publico tech |\n| CTA | 6/10 | Generico, precisa ser mais especifico |\n| Tom | 8/10 | Consistente e conversacional |\n| Formatacao | 7/10 | OK mas pode melhorar espacamento |\n\n**Media:** 7.6/10\n**Veredito:** APROVADO\n\n### Sugestoes de Melhoria\n- CTA: trocar "saiba mais" por "comenta aqui qual ferramenta IA voce usa"\n- Formatacao: adicionar quebra de linha antes do CTA para destaque',
        qualityCriteria: JSON.stringify([
          'Todos os criterios avaliados com nota 1-10',
          'Comentario especifico para cada criterio',
          'Media calculada corretamente',
          'Veredito alinhado com threshold (>= 7 = aprovado)',
          'Sugestoes concretas para cada criterio abaixo de 7',
        ]),
        vetoConditions: JSON.stringify([
          'Criterio sem nota numerica',
          'Veredito sem justificativa',
          'Aprovar conteudo com media abaixo de 7',
        ]),
      },
    ],
  })

  // ====================================================================
  // PIPELINE + STEPS (com instructions e format injection)
  // ====================================================================
  const pipeline = await prisma.pipeline.create({
    data: { squadId: squad.id },
  })

  await prisma.step.createMany({
    data: [
      {
        pipelineId: pipeline.id,
        agentId: rita.id,
        order: 0,
        label: 'Research',
        type: 'subagent',
        instructions: 'Pesquise sobre o topico solicitado. Execute suas tasks em sequencia: primeiro encontre fontes, depois compile o research brief. Use as boas praticas de pesquisa como guia.',
        modelTier: 'powerful',
      },
      {
        pipelineId: pipeline.id,
        order: 1,
        label: 'Aprovar pesquisa',
        type: 'checkpoint',
        instructions: 'Revise o research brief produzido. Verifique se as fontes sao confiaveis e os angulos sao relevantes para seu publico.',
      },
      {
        pipelineId: pipeline.id,
        agentId: carlos.id,
        order: 2,
        label: 'Criar conteudo',
        type: 'inline',
        instructions: 'Com base no research brief aprovado, crie o conteudo. Execute suas tasks: primeiro escreva, depois otimize. Aplique o tom de voz definido no squad data.',
        skillRefs: JSON.stringify(['image_creator']),
      },
      {
        pipelineId: pipeline.id,
        order: 3,
        label: 'Aprovar conteudo',
        type: 'checkpoint',
        instructions: 'Revise o conteudo criado. Verifique hook, CTA, tom de voz e adequacao ao publico-alvo.',
      },
      {
        pipelineId: pipeline.id,
        agentId: victor.id,
        order: 4,
        label: 'Review de qualidade',
        type: 'inline',
        onReject: 'Criar conteudo',
        instructions: 'Avalie o conteudo usando o scorecard de qualidade definido no squad data. Se a media for menor que 7, rejeite com sugestoes concretas.',
        contextLoading: JSON.stringify(['quality-criteria']),
      },
    ],
  })

  // ====================================================================
  // SQUAD DATA — dados de referencia
  // ====================================================================
  await prisma.squadData.createMany({
    data: [
      {
        squadId: squad.id,
        name: 'quality-criteria',
        category: 'reference',
        content: `# Criterios de Qualidade

## Sistema de Avaliacao
Cada criterio eh avaliado de 1 a 10. Media minima para aprovacao: 7.0.
Qualquer criterio individual abaixo de 5 eh veto automatico.

## Criterios

### 1. Qualidade do Hook (Scroll-Stopping Power)
- **10:** Impossivel nao parar e ler
- **7:** Gera curiosidade suficiente para continuar
- **4:** Generico, ja vi isso antes
- **1:** Nao tem hook ou eh cliche puro

### 2. Relevancia para o Publico
- **10:** Fala diretamente com a dor/desejo do publico
- **7:** Relevante mas poderia ser mais especifico
- **4:** Vagamente relacionado ao publico
- **1:** Completamente fora do target

### 3. Forca do CTA
- **10:** CTA especifico, acionavel e irresistivel
- **7:** CTA claro mas poderia ser mais forte
- **4:** CTA generico ("saiba mais", "clique aqui")
- **1:** Sem CTA

### 4. Consistencia de Tom
- **10:** Tom perfeito do inicio ao fim
- **7:** Consistente com pequenas variacoes
- **4:** Tom muda no meio do conteudo
- **1:** Tom completamente inconsistente

### 5. Precisao Tecnica
- **10:** Tudo correto e verificavel
- **7:** Correto no geral, detalhes menores imprecisos
- **4:** Erros que podem confundir o leitor
- **1:** Informacao fundamentalmente errada`,
      },
      {
        squadId: squad.id,
        name: 'tone-of-voice',
        category: 'reference',
        content: `# Tom de Voz

## Identidade
Somos um dev que conversa com outros devs. Nao somos uma empresa, somos uma pessoa.

## Caracteristicas
- **Conversacional:** como se estivesse explicando para um colega no cafe
- **Direto:** sem rodeios, vai ao ponto
- **Provocativo quando necessario:** questiona o status quo
- **Tecnico mas acessivel:** usa termos tech mas explica quando necessario
- **Com humor leve:** nunca forcado, nunca piadas de tiozao

## Palavras-Chave
Usar: "mano", "olha so", "o lance eh", "na pratica", "o pulo do gato"
Evitar: "prezados", "outrossim", "nesse sentido", "venho por meio desta"

## Exemplos de Tom
BOM: "O Cursor mudou meu workflow de um jeito que eu nao esperava. Deixa eu te mostrar."
RUIM: "No cenario atual de ferramentas de desenvolvimento, o Cursor se destaca como uma solucao inovadora."`,
      },
      {
        squadId: squad.id,
        name: 'anti-patterns',
        category: 'reference',
        content: `# Anti-Padroes de Conteudo

## NUNCA faca isso:
1. **Hook cliche:** "Voce sabia que...", "No mundo de hoje...", "Nos ultimos anos..."
2. **CTA generico:** "Saiba mais", "Clique aqui", "Link na bio"
3. **Filler words:** "basicamente", "literalmente", "tipo assim"
4. **Conteudo sem dado:** opiniao sem nenhum numero ou fonte
5. **Copiar formato viral:** usar template de "3 coisas que aprendi" sem adaptar
6. **Hashtags spam:** mais de 15 hashtags ou hashtags irrelevantes
7. **Tom corporativo:** linguagem de press release em rede social
8. **Clickbait puro:** prometer algo que o conteudo nao entrega`,
      },
    ],
  })

  // ====================================================================
  // ASSOCIAR SKILLS AOS AGENTES
  // ====================================================================
  const apifySkill = await prisma.skill.findUnique({ where: { name: 'apify' } })
  const imageCreatorSkill = await prisma.skill.findUnique({ where: { name: 'image_creator' } })

  if (apifySkill) {
    await prisma.agentSkill.create({
      data: { agentId: rita.id, skillId: apifySkill.id },
    })
  }
  if (imageCreatorSkill) {
    await prisma.agentSkill.create({
      data: { agentId: carlos.id, skillId: imageCreatorSkill.id },
    })
  }

  console.log('Example squad created (with rich personas, tasks, and squad data)')
  console.log('')
  console.log('Seed complete!')
  console.log(`   1 user`)
  console.log(`   ${allBestPractices.length} best practices`)
  console.log(`   ${skillsData.length} skills`)
  console.log(`   ${squadTemplates.length} squad templates`)
  console.log(`   1 example squad (3 agents, 5 tasks, 5 steps, 3 data files)`)
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
