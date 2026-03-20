import { prisma } from '@/lib/db'
import { wsServer } from '@/lib/ws-server'
import { createProvider } from '@crewflow/ai'
import type { AIProvider, AIMessage } from '@crewflow/ai'

// ============================================================================
// TYPES
// ============================================================================

export type ArchitectMode = 'create' | 'evaluate-agent'

export interface ArchitectSession {
  id: string
  mode: ArchitectMode
  userId: string
  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'idle'
  phase: string
  discovery: {
    purpose?: string
    audience?: string
    references?: string[]
    performanceMode?: 'alta-performance' | 'balanced' | 'economico'
    targetFormats?: string[]
    language?: string
  }
  research: {
    domains?: string[]
    brief?: string
    bestPractices?: string[]
  }
  skillDiscovery: {
    availableSkills?: { name: string; type: string; description: string }[]
    suggestedSkills?: string[]
    selectedSkills?: string[]
  }
  design: {
    agents?: DesignedAgent[]
    pipeline?: DesignedStep[]
    squadData?: DesignedSquadData[]
    skills?: string[]
  }
  evaluateAgent?: {
    squadId?: string
    agentTemplateId?: string
    recommendation?: string
  }
  // Nome e icon vindos da UI
  squadName?: string
  squadIcon?: string
}

interface DesignedAgent {
  name: string
  title: string
  icon: string
  role: string
  execution: 'inline' | 'subagent'
  persona: {
    role: string
    identity: string
    communicationStyle: string
    principles: string[]
  }
  principles: string
  voiceGuidance: {
    alwaysUse: string[]
    neverUse: string[]
    toneRules: string[]
  }
  antiPatterns: { neverDo: string[]; alwaysDo: string[] }
  qualityCriteria: string[]
  integration: { readsFrom: string[]; writesTo: string[] }
  tasks: DesignedTask[]
  skills: string[]
}

interface DesignedTask {
  name: string
  description: string
  order: number
  skills: string[]
  objective: string
  process: string
  outputFormat: string
  outputExample: string
  qualityCriteria: string[]
  vetoConditions: string[]
}

interface DesignedStep {
  label: string
  type: 'inline' | 'subagent' | 'checkpoint'
  agentRole?: string
  order: number
  instructions?: string
  formatRef?: string
  skillRefs?: string[]
  modelTier?: string
  onReject?: string
  contextLoading?: string[]
  outputExample?: string
  vetoConditions?: string[]
  checkpointType?: 'approval' | 'selection' | 'input'
  question?: string
  options?: string[]
}

interface DesignedSquadData {
  name: string
  category: string
  content: string
}

// ============================================================================
// ACTIVE SESSIONS
// ============================================================================

const activeSessions = new Map<string, ArchitectSession>()

export function getArchitectSession(sessionId: string): ArchitectSession | undefined {
  return activeSessions.get(sessionId)
}

// Pending questions — stored so polling can retrieve them
const pendingQuestions = new Map<string, { phase: string; question: string; options?: string[]; type: 'approval' | 'selection' | 'input'; runStepId: string; context?: string }>()

export function getPendingQuestion(sessionId: string) {
  return pendingQuestions.get(sessionId)
}

export function cancelArchitectSession(sessionId: string): void {
  const session = activeSessions.get(sessionId)
  if (session) {
    (session as { status: string }).status = 'cancelled'
    activeSessions.delete(sessionId)
  }
}

function isCancelled(session: ArchitectSession): boolean {
  return (session as { status: string }).status === 'cancelled'
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

export async function startArchitect(
  sessionId: string,
  userId: string,
  mode: ArchitectMode = 'create',
  evaluateAgentData?: { squadId: string; agentTemplateId: string },
  squadName?: string,
  squadIcon?: string,
): Promise<void> {
  const session: ArchitectSession = {
    id: sessionId,
    mode,
    userId,
    status: 'running',
    phase: 'init',
    discovery: {},
    research: {},
    skillDiscovery: {},
    design: {},
    evaluateAgent: evaluateAgentData,
    squadName,
    squadIcon,
  }

  activeSessions.set(sessionId, session)
  activeSessions.set(`active-${userId}`, session)

  try {
    const user = await prisma.user.findFirstOrThrow()
    let apiKeys: Record<string, string> = {}
    try { apiKeys = user.apiKeys ? JSON.parse(user.apiKeys) : {} } catch { /* */ }

    const providerName = apiKeys.anthropic ? 'anthropic' : apiKeys.openai ? 'openai' : null
    if (!providerName) {
      throw new Error('Nenhuma API key configurada. Va em Settings para adicionar.')
    }

    const provider = createProvider(providerName, apiKeys[providerName]!)

    console.log(`[ARCHITECT] Session ${sessionId} starting (mode: ${mode})`)
    console.log(`[ARCHITECT] Provider: ${providerName}`)

    // Aguardar UI subscrever no WebSocket antes de comecar a emitir eventos
    // O cliente precisa: conectar WS → React render → subscribeToRun
    await new Promise((r) => setTimeout(r, 3000))

    console.log(`[ARCHITECT] Starting flow...`)

    if (mode === 'create') {
      await runCreateSquadFlow(session, provider)
    } else if (mode === 'evaluate-agent') {
      await runEvaluateAgentFlow(session, provider)
    }

    console.log(`[ARCHITECT] Session ${sessionId} completed`)
    session.status = 'completed'
  } catch (err) {
    session.status = 'failed'
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[ARCHITECT] Session ${sessionId} FAILED:`, msg)
    wsServer.broadcastToRun(sessionId, {
      event: 'architect:error',
      payload: { sessionId, error: msg },
    })
  } finally {
    activeSessions.delete(`active-${userId}`)
    setTimeout(() => activeSessions.delete(sessionId), 5 * 60 * 1000)
  }
}

// ============================================================================
// HELPERS
// ============================================================================

async function askUser(
  sessionId: string,
  phase: string,
  question: string,
  options?: string[],
  context?: string,
): Promise<string> {
  const runStepId = `architect-${phase}-${Date.now()}`

  if (options && options.length > 0) {
    wsServer.emitCheckpointRequest(
      sessionId, runStepId, question, context ?? '',
      'selection', question, options,
    )
  } else {
    wsServer.emitCheckpointRequest(
      sessionId, runStepId, question, context ?? '',
      'input', question,
    )
  }

  const checkpointType = (options && options.length > 0) ? 'selection' as const : 'input' as const

  // Salvar pergunta pendente para polling
  pendingQuestions.set(sessionId, { phase, question, options, type: checkpointType, runStepId, context })

  console.log(`[ARCHITECT] Asking user (${phase}): "${question}" — waiting for response...`)

  const response = await wsServer.waitForCheckpoint(runStepId)

  // Limpar pergunta pendente
  pendingQuestions.delete(sessionId)

  const answer = response.selected || response.feedback || ''
  console.log(`[ARCHITECT] User responded (${phase}): "${answer.slice(0, 100)}"`)
  return answer
}

function emitProgress(sessionId: string, phase: string, message: string) {
  wsServer.broadcastToRun(sessionId, {
    event: 'architect:progress',
    payload: { sessionId, phase, message },
  })
}

function emitOutput(sessionId: string, phase: string, chunk: string) {
  wsServer.broadcastToRun(sessionId, {
    event: 'architect:output',
    payload: { sessionId, phase, chunk },
  })
}

// ============================================================================
// CREATE SQUAD FLOW — 8 Phases (fiel ao opensquad)
// ============================================================================

async function runCreateSquadFlow(session: ArchitectSession, provider: AIProvider): Promise<void> {
  const t = Date.now()
  const elapsed = () => `${((Date.now() - t) / 1000).toFixed(1)}s`

  // Phase 1: Discovery
  session.phase = 'discovery'
  console.log(`[ARCHITECT] [${elapsed()}] Phase 1/8: Discovery`)
  emitProgress(session.id, 'discovery', 'Fase 1/8 — Descoberta')
  await phaseDiscovery(session)
  console.log(`[ARCHITECT] [${elapsed()}] Discovery complete:`, JSON.stringify(session.discovery))
  if (isCancelled(session)) { console.log('[ARCHITECT] Cancelled after discovery'); return }

  // Phase 2: Best Practices
  session.phase = 'best-practices'
  console.log(`[ARCHITECT] [${elapsed()}] Phase 2/8: Best Practices`)
  emitProgress(session.id, 'best-practices', 'Fase 2/8 — Consultando boas praticas')
  await phaseBestPractices(session)
  console.log(`[ARCHITECT] [${elapsed()}] Best practices: ${session.research.bestPractices?.length ?? 0} loaded`)
  if (isCancelled(session)) { console.log('[ARCHITECT] Cancelled after best-practices'); return }

  // Phase 3: Research
  session.phase = 'research'
  console.log(`[ARCHITECT] [${elapsed()}] Phase 3/8: Research`)
  emitProgress(session.id, 'research', 'Fase 3/8 — Pesquisando dominio')
  await phaseResearch(session, provider)
  console.log(`[ARCHITECT] [${elapsed()}] Research complete: ${session.research.brief?.length ?? 0} chars`)
  if (isCancelled(session)) { console.log('[ARCHITECT] Cancelled after research'); return }

  // Phase 4: Extraction
  session.phase = 'extraction'
  console.log(`[ARCHITECT] [${elapsed()}] Phase 4/8: Extraction`)
  emitProgress(session.id, 'extraction', 'Fase 4/8 — Extraindo artifacts')
  await phaseExtraction(session, provider)
  console.log(`[ARCHITECT] [${elapsed()}] Extraction complete: ${session.research.domains?.length ?? 0} domains`)
  if (isCancelled(session)) { console.log('[ARCHITECT] Cancelled after extraction'); return }

  // Phase 5: Skill Discovery
  session.phase = 'skill-discovery'
  console.log(`[ARCHITECT] [${elapsed()}] Phase 5/8: Skill Discovery`)
  emitProgress(session.id, 'skill-discovery', 'Fase 5/8 — Descoberta de skills')
  await phaseSkillDiscovery(session, provider)
  console.log(`[ARCHITECT] [${elapsed()}] Skills: suggested=${session.skillDiscovery.suggestedSkills?.join(',')}, selected=${session.skillDiscovery.selectedSkills?.join(',')}`)
  if (isCancelled(session)) { console.log('[ARCHITECT] Cancelled after skill-discovery'); return }

  // Phase 6: Design
  session.phase = 'design'
  console.log(`[ARCHITECT] [${elapsed()}] Phase 6/8: Design`)
  emitProgress(session.id, 'design', 'Fase 6/8 — Projetando squad')
  await phaseDesign(session, provider)
  console.log(`[ARCHITECT] [${elapsed()}] Design: ${session.design.agents?.length ?? 0} agents, ${session.design.pipeline?.length ?? 0} steps, ${session.design.squadData?.length ?? 0} data`)
  if (session.design.agents) {
    for (const a of session.design.agents) {
      console.log(`[ARCHITECT]   Agent: ${a.icon} ${a.name} (${a.role}, ${a.execution}) — ${a.tasks.length} tasks, skills: ${a.skills.join(',')}`)
    }
  }
  if (session.design.pipeline) {
    for (const s of session.design.pipeline) {
      console.log(`[ARCHITECT]   Step ${s.order}: ${s.label} (${s.type}${s.agentRole ? ', agent=' + s.agentRole : ''})`)
    }
  }
  if (isCancelled(session)) { console.log('[ARCHITECT] Cancelled after design'); return }

  // Approval
  session.phase = 'approval'
  console.log(`[ARCHITECT] [${elapsed()}] Presenting design for approval`)
  emitProgress(session.id, 'approval', 'Apresentando design para aprovacao...')
  const approval = await presentDesign(session)
  console.log(`[ARCHITECT] [${elapsed()}] Approval: ${approval}`)
  if (approval === 'redo') {
    console.log(`[ARCHITECT] [${elapsed()}] Redoing design...`)
    session.phase = 'design'
    await phaseDesign(session, provider)
    await presentDesign(session)
  }
  if (isCancelled(session)) { console.log('[ARCHITECT] Cancelled after approval'); return }

  // Phase 7: Build
  session.phase = 'build'
  console.log(`[ARCHITECT] [${elapsed()}] Phase 7/8: Build`)
  emitProgress(session.id, 'build', 'Fase 7/8 — Criando no banco de dados')
  const squadId = await phaseBuild(session)
  console.log(`[ARCHITECT] [${elapsed()}] Build complete: squadId=${squadId}`)

  // Phase 8: Validate
  session.phase = 'validate'
  console.log(`[ARCHITECT] [${elapsed()}] Phase 8/8: Validate`)
  emitProgress(session.id, 'validate', 'Fase 8/8 — Validando squad')
  await phaseValidate(session, squadId)
  console.log(`[ARCHITECT] [${elapsed()}] Validate complete`)

  console.log(`[ARCHITECT] [${elapsed()}] SESSION COMPLETE — squadId=${squadId}`)
  emitProgress(session.id, 'complete', `Squad criado com sucesso!`)
  wsServer.broadcastToRun(session.id, {
    event: 'architect:complete',
    payload: { sessionId: session.id, squadId },
  })
}

// ============================================================================
// PHASE 1: DISCOVERY
// Fiel ao opensquad: 6 perguntas (purpose, audience, references, performance, formats, language)
// ============================================================================

async function phaseDiscovery(session: ArchitectSession): Promise<void> {
  // Q1: Purpose
  const purpose = await askUser(
    session.id, 'discovery-purpose',
    'O que esse squad deve fazer? Descreva o resultado final que voce quer.',
  )
  session.discovery.purpose = purpose

  // Q2: Audience/Context
  const audience = await askUser(
    session.id, 'discovery-audience',
    'Para quem eh esse conteudo/trabalho?',
    ['Desenvolvedores/Tech', 'Freelancers', 'Empresarios', 'Publico geral', 'Outro'],
  )
  session.discovery.audience = audience

  // Q3: References (URLs, exemplos, perfis)
  const hasReferences = await askUser(
    session.id, 'discovery-has-references',
    'Tem perfis, sites ou exemplos de referencia?',
    ['Sim, tenho URLs/exemplos', 'Pular — sem referencias'],
  )

  if (hasReferences.toLowerCase().includes('sim')) {
    const refs = await askUser(
      session.id, 'discovery-references',
      'Cole as URLs ou descreva as referencias (uma por linha):',
    )
    session.discovery.references = refs.split('\n').map((r) => r.trim()).filter(Boolean)
  }

  // Q4: Performance Mode
  const perfMode = await askUser(
    session.id, 'discovery-performance',
    'Qual nivel de performance?',
    [
      'Alta Performance — pipeline completo, multiplos formatos, review detalhado, otimizacao, mais tokens',
      'Balanced — pipeline equilibrado, bom custo-beneficio (recomendado)',
      'Economico — pipeline enxuto, formato principal, review leve, menos tokens',
    ],
  )
  session.discovery.performanceMode = perfMode.toLowerCase().includes('alta')
    ? 'alta-performance'
    : perfMode.toLowerCase().includes('econ')
      ? 'economico'
      : 'balanced'

  // Q5: Target Formats (scan best practices do banco)
  const platformBps = await prisma.bestPractice.findMany({
    where: { category: 'platform' },
    select: { name: true, platform: true, contentType: true, description: true },
  })

  if (platformBps.length > 0) {
    const formatOptions = platformBps.map((bp) =>
      `${bp.platform}/${bp.contentType} — ${bp.description?.slice(0, 60) ?? bp.name}`
    )

    const selectedFormats = await askUser(
      session.id, 'discovery-formats',
      'Para quais formatos/plataformas? Pode selecionar multiplos.',
      formatOptions,
    )
    // Parse multiple selections (user might select multiple or type comma-separated)
    session.discovery.targetFormats = selectedFormats
      .split(/[,\n]/)
      .map((f) => f.trim())
      .filter(Boolean)
  }

  // Language (default pt-BR, could ask)
  session.discovery.language = 'pt-BR'

  emitProgress(session.id, 'discovery', `Discovery completo: "${purpose}" para ${audience}`)
}

// ============================================================================
// PHASE 2: BEST PRACTICES CONSULTATION
// Fiel ao opensquad Phase 1.8: scan catalogo, selecionar por relevancia
// ============================================================================

async function phaseBestPractices(session: ArchitectSession): Promise<void> {
  const allBp = await prisma.bestPractice.findMany()
  const purpose = session.discovery.purpose?.toLowerCase() ?? ''
  const formats = session.discovery.targetFormats?.join(' ').toLowerCase() ?? ''
  const audience = session.discovery.audience?.toLowerCase() ?? ''
  const search = purpose + ' ' + formats + ' ' + audience

  const relevantBp = allBp.filter((bp) => {
    // Platform match
    if (bp.platform && (
      search.includes(bp.platform.toLowerCase()) ||
      formats.includes(bp.platform.toLowerCase())
    )) return true

    // Content type match
    if (bp.contentType && (
      search.includes(bp.contentType.toLowerCase()) ||
      formats.includes(bp.contentType.toLowerCase())
    )) return true

    // Discipline always included for general knowledge
    if (bp.category === 'discipline') {
      // Filter disciplines by relevance
      const name = bp.name.toLowerCase()
      if (search.includes('pesquis') || search.includes('research')) {
        if (name.includes('research')) return true
      }
      if (search.includes('copi') || search.includes('copy') || search.includes('escrev') || search.includes('conteud')) {
        if (name.includes('copywriting') || name.includes('writing')) return true
      }
      if (search.includes('revis') || search.includes('review') || search.includes('qualidade')) {
        if (name.includes('review')) return true
      }
      if (search.includes('design') || search.includes('imag') || search.includes('visual')) {
        if (name.includes('design') || name.includes('image')) return true
      }
      // Always include copywriting as baseline
      if (name.includes('copywriting')) return true
    }

    return false
  })

  session.research.bestPractices = relevantBp.map((bp) => `[${bp.name}]: ${bp.content}`)

  emitProgress(session.id, 'best-practices',
    `${relevantBp.length} boas praticas selecionadas: ${relevantBp.map((bp) => bp.name).join(', ')}`)
}

// ============================================================================
// PHASE 3: RESEARCH
// Fiel ao opensquad Phase 2: pesquisa de dominio com IA
// ============================================================================

async function phaseResearch(session: ArchitectSession, provider: AIProvider): Promise<void> {
  const bpContext = session.research.bestPractices?.length
    ? `\n\n## Boas praticas ja disponiveis (use como base):\n${session.research.bestPractices.slice(0, 5).join('\n\n---\n\n')}`
    : ''

  const refsContext = session.discovery.references?.length
    ? `\n\n## Referencias do usuario:\n${session.discovery.references.map((r) => `- ${r}`).join('\n')}`
    : ''

  const systemPrompt = `Voce eh um pesquisador de dominio especializado. Sua tarefa eh pesquisar profundamente sobre o dominio necessario para criar agentes IA que vao trabalhar neste contexto.

## Objetivo
Pesquisar o dominio para criar um squad de agentes que vai: ${session.discovery.purpose}

## Publico-alvo
${session.discovery.audience}

## Formatos alvo
${session.discovery.targetFormats?.join(', ') ?? 'geral'}

## O que pesquisar
1. **Frameworks e metodologias** — processos usados por profissionais do setor
2. **Boas praticas** — regras do que funciona e por que
3. **Criterios de qualidade** — como profissionais avaliam qualidade neste dominio
4. **Anti-padroes** — erros comuns que amadores cometem
5. **Vocabulario do dominio** — termos que profissionais usam vs termos amadores
6. **Metricas de sucesso** — como medir se o output eh bom
7. **Exemplos de output** — como eh um resultado de alta qualidade

## Formato do output
Produza um research brief estruturado em markdown com TODAS estas secoes:

### Frameworks e Metodologias
(min 2 frameworks com descricao de como aplicar)

### Boas Praticas do Dominio
(min 5 boas praticas especificas, nao genericas)

### Criterios de Qualidade
(min 5 criterios com escala 1-10 e descricao de cada nivel)

### Anti-Padroes
(min 5 erros comuns com explicacao do por que sao ruins)

### Vocabulario Profissional
- Sempre use: (min 5 termos profissionais)
- Nunca use: (min 5 termos amadores/genericos)

### Metricas de Sucesso
(como medir qualidade do output)

### Recomendacoes para Agentes
(que tipos de agentes seriam ideais para este dominio e por que)
${bpContext}${refsContext}`

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Pesquise sobre: ${session.discovery.purpose}\nPublico: ${session.discovery.audience}\nFormatos: ${session.discovery.targetFormats?.join(', ') ?? 'geral'}` },
  ]

  const result = await provider.streamText(messages, (chunk) => {
    emitOutput(session.id, 'research', chunk)
  })


  session.research.brief = result.content
  emitProgress(session.id, 'research', `Research brief gerado (${result.content.length} chars, ${result.tokensUsed.total} tokens)`)
}

// ============================================================================
// PHASE 4: EXTRACTION
// Fiel ao opensquad Phase 3: transformar pesquisa em artifacts operacionais
// ============================================================================

async function phaseExtraction(session: ArchitectSession, provider: AIProvider): Promise<void> {
  const systemPrompt = `Voce eh um especialista em extrair artifacts operacionais de pesquisa para alimentar agentes IA.

## Sua tarefa
A partir do research brief abaixo, extraia artifacts estruturados que serao usados para configurar agentes.

## O que extrair

### 1. Operational Frameworks (1 por tipo de agente)
- Passo-a-passo concreto para o agente executar
- Minimo 5 passos com criterios de decisao
- Especifico ao dominio, nao generico

### 2. Voice Guidance
- 5+ termos que agentes DEVEM usar (profissionais)
- 5+ termos que agentes NUNCA devem usar (amadores)
- 3+ regras de tom especificas

### 3. Quality Criteria
- 5+ criterios mensuraveis com escala 1-10
- Cada criterio com descricao do que eh nota 10 e nota 1
- Threshold de aprovacao

### 4. Anti-Patterns
- 5+ erros que agentes NUNCA devem cometer
- 3+ praticas que agentes SEMPRE devem seguir
- Cada um com explicacao do impacto

### 5. Output Examples
- 2 exemplos COMPLETOS e realistas de output ideal
- Cada exemplo com 15+ linhas
- Mostrando formatacao, estrutura e conteudo esperado

### 6. Tone of Voice (para squads de conteudo)
- 6 opcoes de tom disponiveis:
  1. Informativo — objetivo e educacional
  2. Conversacional — como se falasse com um amigo
  3. Provocativo — questiona o status quo
  4. Inspiracional — motiva e empodera
  5. Tecnico — preciso e detalhado
  6. Humoristico — leve e divertido

## Formato do output
Retorne um JSON valido dentro de \`\`\`json ... \`\`\` com:
\`\`\`json
{
  "frameworks": {
    "researcher": "1. Passo...\\n2. Passo...",
    "creator": "1. Passo...\\n2. Passo...",
    "reviewer": "1. Passo...\\n2. Passo..."
  },
  "voiceGuidance": {
    "alwaysUse": ["termo1", "termo2", "termo3", "termo4", "termo5"],
    "neverUse": ["termo1", "termo2", "termo3", "termo4", "termo5"],
    "toneRules": ["regra1", "regra2", "regra3"]
  },
  "qualityCriteria": [
    { "name": "Criterio", "description": "O que avalia", "scale": "1=ruim, 10=excelente" }
  ],
  "antiPatterns": {
    "neverDo": [{ "pattern": "Erro", "impact": "Por que eh ruim" }],
    "alwaysDo": [{ "pattern": "Pratica", "impact": "Por que importa" }]
  },
  "outputExamples": ["Exemplo 1 completo...", "Exemplo 2 completo..."],
  "toneOfVoice": "markdown com 6 opcoes de tom detalhadas"
}
\`\`\``

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Research Brief:\n\n${session.research.brief}` },
  ]

  const result = await provider.streamText(messages, (chunk) => {
    emitOutput(session.id, 'extraction', chunk)
  }, { maxTokens: 8192 })



  // Parse extraction and store in research for design phase to use
  const jsonMatch = result.content.match(/```json\s*([\s\S]*?)```/)
  if (jsonMatch) {
    try {
      const extracted = JSON.parse(jsonMatch[1]!)
      // Enrich research with extracted data
      session.research.domains = Object.keys(extracted.frameworks ?? {})
      // Store full extraction as extended brief
      session.research.brief = session.research.brief + '\n\n---\n\n## Extracted Artifacts\n\n' + JSON.stringify(extracted, null, 2)
    } catch { /* parsing failed, continue with raw brief */ }
  }

  emitProgress(session.id, 'extraction', 'Artifacts operacionais extraidos')
}

// ============================================================================
// PHASE 5: SKILL DISCOVERY
// Fiel ao opensquad Phase 3.5: mostrar skills, sugerir relevantes, usuario escolhe
// ============================================================================

async function phaseSkillDiscovery(session: ArchitectSession, provider: AIProvider): Promise<void> {
  const allSkills = await prisma.skill.findMany({
    select: { name: true, type: true, description: true, categories: true },
  })

  session.skillDiscovery.availableSkills = allSkills

  // IA sugere skills relevantes
  const suggestPrompt = `Voce eh um especialista em skills para agentes IA.

Dado este squad:
- Proposito: ${session.discovery.purpose}
- Publico: ${session.discovery.audience}
- Formatos: ${session.discovery.targetFormats?.join(', ') ?? 'geral'}

Skills disponiveis:
${allSkills.map((s) => `- ${s.name} (${s.type}): ${s.description}`).join('\n')}

Quais skills sao RELEVANTES para este squad? Liste apenas os nomes separados por virgula.
Nao sugira skills que nao agregam valor direto.
Skills nativas (web_search, web_fetch) nao precisam ser listadas pois ja estao disponiveis.

Responda APENAS com os nomes separados por virgula, nada mais.`

  const suggestResult = await provider.generateText([
    { role: 'system', content: suggestPrompt },
    { role: 'user', content: 'Quais skills sao relevantes?' },
  ])


  const suggested = suggestResult.content
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => allSkills.some((sk) => sk.name.toLowerCase() === s))

  session.skillDiscovery.suggestedSkills = suggested

  if (suggested.length === 0) {
    emitProgress(session.id, 'skill-discovery', 'Nenhuma skill extra necessaria — seguindo com skills nativas')
    session.skillDiscovery.selectedSkills = []
    return
  }

  // Apresentar sugestoes ao usuario
  const skillOptions = suggested.map((name) => {
    const skill = allSkills.find((s) => s.name.toLowerCase() === name.toLowerCase())
    return `${skill?.name ?? name} (${skill?.type ?? '?'}) — ${skill?.description ?? ''}`
  })

  // Adicionar opcao "nenhuma"
  skillOptions.push('Nenhuma — seguir sem skills extras')

  const selected = await askUser(
    session.id, 'skill-discovery',
    `Encontrei ${suggested.length} skills relevantes para seu squad. Quais quer usar?`,
    skillOptions,
  )

  if (selected.toLowerCase().includes('nenhuma')) {
    session.skillDiscovery.selectedSkills = []
  } else {
    // Parse selection
    session.skillDiscovery.selectedSkills = suggested.filter((name) =>
      selected.toLowerCase().includes(name.toLowerCase())
    )
    // If user selected a specific option, extract skill name
    if (session.skillDiscovery.selectedSkills.length === 0) {
      const selectedSkillName = selected.split('(')[0]?.trim().toLowerCase()
      const match = allSkills.find((s) => s.name.toLowerCase() === selectedSkillName)
      if (match) {
        session.skillDiscovery.selectedSkills = [match.name]
      }
    }
  }

  emitProgress(session.id, 'skill-discovery',
    session.skillDiscovery.selectedSkills.length > 0
      ? `Skills selecionadas: ${session.skillDiscovery.selectedSkills.join(', ')}`
      : 'Seguindo sem skills extras')
}

// ============================================================================
// PHASE 6: DESIGN
// Fiel ao opensquad Phase 4: projetar agentes, tasks, pipeline, squad data
// ============================================================================

async function phaseDesign(session: ArchitectSession, provider: AIProvider): Promise<void> {
  const allSkills = await prisma.skill.findMany({
    select: { name: true, type: true, description: true, categories: true },
  })

  const designPrompt = buildDesignPrompt(session, allSkills)
  const messages: AIMessage[] = [
    { role: 'system', content: designPrompt },
    { role: 'user', content: buildDesignInput(session) },
  ]

  const result = await provider.streamText(messages, (chunk) => {
    emitOutput(session.id, 'design', chunk)
  }, { maxTokens: 16000 })



  const parsed = parseDesignOutput(result.content)
  if (parsed) {
    session.design = parsed
    console.log(`[ARCHITECT] Design parsed: ${parsed.agents?.length ?? 0} agents, ${parsed.pipeline?.length ?? 0} steps, ${parsed.squadData?.length ?? 0} data`)
  } else {
    console.error(`[ARCHITECT] FAILED to parse design JSON from AI output (${result.content.length} chars)`)
    console.error(`[ARCHITECT] First 500 chars: ${result.content.slice(0, 500)}`)
  }

  emitProgress(session.id, 'design',
    `Design: ${session.design.agents?.length ?? 0} agentes, ${session.design.pipeline?.length ?? 0} steps`)
}

async function presentDesign(session: ArchitectSession): Promise<string> {
  if (!session.design.agents || session.design.agents.length === 0) {
    return 'approve'
  }

  const summary = formatDesignSummary(session)
  const response = await askUser(
    session.id, 'design-approval',
    'Esse design esta bom?',
    ['Perfeito, construir!', 'Ajustar agentes/pipeline', 'Simplificar (menos agentes)'],
    summary,
  )

  return response.toLowerCase().includes('perfeito') ? 'approve' : 'redo'
}

// ============================================================================
// PHASE 7: BUILD
// ============================================================================

async function phaseBuild(session: ArchitectSession): Promise<string> {
  console.log(`[ARCHITECT] BUILD: Starting — ${session.design.agents?.length ?? 0} agents to create`)
  const user = await prisma.user.findFirstOrThrow()

  const code = (session.discovery.purpose ?? 'new-squad')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 30)
    + '-' + Date.now().toString(36)

  const squad = await prisma.squad.create({
    data: {
      name: session.squadName || session.discovery.purpose?.slice(0, 60) || 'New Squad',
      code,
      description: session.discovery.purpose,
      performanceMode: session.discovery.performanceMode ?? 'balanced',
      targetAudience: session.discovery.audience,
      language: session.discovery.language ?? 'pt-BR',
      icon: session.design.agents?.[0]?.icon || '🤖',
      gradient: session.squadIcon ? `icon:${session.squadIcon}` : undefined,
      userId: user.id,
    },
  })

  emitProgress(session.id, 'build', `Squad "${squad.name}" criado`)

  const pipeline = await prisma.pipeline.create({
    data: { squadId: squad.id },
  })

  // Create agents
  const agentIdMap = new Map<string, string>()

  for (const designedAgent of session.design.agents ?? []) {
    const agent = await prisma.agent.create({
      data: {
        squadId: squad.id,
        name: designedAgent.name,
        title: designedAgent.title,
        icon: designedAgent.icon,
        role: designedAgent.role,
        execution: designedAgent.execution,
        persona: JSON.stringify(designedAgent.persona),
        principles: designedAgent.principles,
        voiceGuidance: JSON.stringify(designedAgent.voiceGuidance),
        antiPatterns: JSON.stringify(designedAgent.antiPatterns),
        qualityCriteria: JSON.stringify(designedAgent.qualityCriteria),
        integration: JSON.stringify(designedAgent.integration),
      },
    })

    agentIdMap.set(designedAgent.role, agent.id)
    console.log(`[ARCHITECT] BUILD: Created agent "${designedAgent.name}" (${agent.id}) — role: ${designedAgent.role}`)

    for (const task of designedAgent.tasks) {
      await prisma.task.create({
        data: {
          agentId: agent.id,
          name: task.name,
          description: task.description,
          order: task.order,
          skills: JSON.stringify(task.skills),
          objective: task.objective,
          process: task.process,
          outputFormat: task.outputFormat,
          outputExample: task.outputExample,
          qualityCriteria: JSON.stringify(task.qualityCriteria),
          vetoConditions: JSON.stringify(task.vetoConditions),
        },
      })
      console.log(`[ARCHITECT] BUILD:   Task "${task.name}" created (order: ${task.order})`)
    }

    for (const skillName of designedAgent.skills) {
      const skill = await prisma.skill.findUnique({ where: { name: skillName } })
      if (skill) {
        await prisma.agentSkill.create({
          data: { agentId: agent.id, skillId: skill.id },
        }).catch(() => { /* duplicate */ })
        console.log(`[ARCHITECT] BUILD:   Skill "${skillName}" linked`)
      } else {
        console.log(`[ARCHITECT] BUILD:   Skill "${skillName}" NOT FOUND in DB — skipped`)
      }
    }

    emitProgress(session.id, 'build', `Agente "${designedAgent.name}" — ${designedAgent.tasks.length} tasks, ${designedAgent.skills.length} skills`)
  }

  console.log(`[ARCHITECT] BUILD: Agent ID map:`, Object.fromEntries(agentIdMap))

  // Create pipeline steps
  for (const step of session.design.pipeline ?? []) {
    const agentId = step.agentRole ? agentIdMap.get(step.agentRole) : undefined
    if (step.agentRole && !agentId) {
      console.log(`[ARCHITECT] BUILD: WARNING — step "${step.label}" references role "${step.agentRole}" but no agent has that role`)
    }

    await prisma.step.create({
      data: {
        pipelineId: pipeline.id,
        agentId: agentId ?? null,
        order: step.order,
        label: step.label,
        type: step.type,
        instructions: step.instructions ?? null,
        formatRef: step.formatRef ?? null,
        skillRefs: step.skillRefs ? JSON.stringify(step.skillRefs) : '[]',
        modelTier: step.modelTier ?? null,
        onReject: step.onReject ?? 'retry',
        contextLoading: step.contextLoading ? JSON.stringify(step.contextLoading) : '[]',
        outputExample: step.outputExample ?? null,
        vetoConditions: step.vetoConditions ? JSON.stringify(step.vetoConditions) : '[]',
      },
    })
    console.log(`[ARCHITECT] BUILD: Step ${step.order}: "${step.label}" (${step.type}${agentId ? ', agentId=' + agentId : ''})`)
  }

  emitProgress(session.id, 'build', `Pipeline — ${session.design.pipeline?.length ?? 0} steps`)

  // Create squad data
  for (const data of session.design.squadData ?? []) {
    await prisma.squadData.create({
      data: {
        squadId: squad.id,
        name: data.name,
        category: data.category,
        content: data.content,
      },
    })
  }

  emitProgress(session.id, 'build', `Dados de referencia — ${session.design.squadData?.length ?? 0} arquivos`)

  return squad.id
}

// ============================================================================
// PHASE 8: VALIDATE
// Fiel ao opensquad Phase 6: 4 gates (agent, task, pipeline, squad data)
// ============================================================================

async function phaseValidate(session: ArchitectSession, squadId: string): Promise<void> {
  const squad = await prisma.squad.findUnique({
    where: { id: squadId },
    include: {
      agents: { include: { tasks: true, skills: { include: { skill: true } } } },
      pipeline: { include: { steps: { orderBy: { order: 'asc' } } } },
      data: true,
    },
  })

  if (!squad) return

  const issues: string[] = []
  let passCount = 0
  let totalChecks = 0

  // Gate 1: Agent Completeness (BLOCKING)
  for (const agent of squad.agents) {
    totalChecks += 5
    if (agent.persona && agent.persona !== '{}') passCount++
    else issues.push(`[Gate 1] Agente "${agent.name}": persona vazia`)

    if (agent.principles) passCount++
    else issues.push(`[Gate 1] Agente "${agent.name}": sem principios`)

    if (agent.voiceGuidance && agent.voiceGuidance !== '{}') passCount++
    else issues.push(`[Gate 1] Agente "${agent.name}": sem voice guidance`)

    if (agent.qualityCriteria && agent.qualityCriteria !== '[]') passCount++
    else issues.push(`[Gate 1] Agente "${agent.name}": sem criterios de qualidade`)

    if (agent.antiPatterns && agent.antiPatterns !== '{}') passCount++
    else issues.push(`[Gate 1] Agente "${agent.name}": sem anti-patterns`)
  }

  // Gate 1b: Task Completeness (BLOCKING)
  for (const agent of squad.agents) {
    for (const task of agent.tasks) {
      totalChecks += 4
      if (task.objective) passCount++
      else issues.push(`[Gate 1b] Task "${task.name}" (${agent.name}): sem objetivo`)

      if (task.process) passCount++
      else issues.push(`[Gate 1b] Task "${task.name}" (${agent.name}): sem processo`)

      const criteria = JSON.parse(task.qualityCriteria)
      if (Array.isArray(criteria) && criteria.length >= 2) passCount++
      else issues.push(`[Gate 1b] Task "${task.name}" (${agent.name}): menos de 2 criterios de qualidade`)

      const veto = JSON.parse(task.vetoConditions)
      if (Array.isArray(veto) && veto.length >= 1) passCount++
      else issues.push(`[Gate 1b] Task "${task.name}" (${agent.name}): sem condicoes de veto`)
    }
  }

  // Gate 2: Pipeline Coherence (BLOCKING)
  if (squad.pipeline) {
    const steps = squad.pipeline.steps

    totalChecks += 3
    const hasReviewer = squad.agents.some((a) => a.role.toLowerCase().includes('review'))
    if (hasReviewer) passCount++
    else issues.push('[Gate 2] Pipeline sem agente de review')

    const hasCheckpoint = steps.some((s) => s.type === 'checkpoint')
    if (hasCheckpoint) passCount++
    else issues.push('[Gate 2] Pipeline sem nenhum checkpoint')

    // Research Focus: primeiro step deve ser checkpoint (se tem researcher)
    const hasResearcher = squad.agents.some((a) => a.role.toLowerCase().includes('research'))
    if (hasResearcher) {
      totalChecks++
      if (steps[0]?.type === 'checkpoint') passCount++
      else issues.push('[Gate 2] Pipeline com researcher mas sem Research Focus checkpoint no inicio')
    }

    // Content Approval Gate
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]!
      const label = step.label.toLowerCase()
      if (label.includes('render') || label.includes('publish') || label.includes('visual')) {
        totalChecks++
        const prevStep = i > 0 ? steps[i - 1] : null
        if (prevStep && prevStep.type === 'checkpoint') passCount++
        else issues.push(`[Gate 2] Step "${step.label}" sem Content Approval checkpoint antes`)
      }
    }

    // on_reject loops
    totalChecks++
    const hasOnReject = steps.some((s) =>
      s.onReject && s.onReject !== 'retry' && steps.some((t) => t.label === s.onReject)
    )
    if (hasOnReject || steps.some((s) => s.type === 'checkpoint')) passCount++
    else issues.push('[Gate 2] Pipeline sem loop de rejeicao (on_reject)')
  }

  // Gate 3: Squad Data (ADVISORY)
  totalChecks += 3
  if (squad.data.some((d) => d.name === 'quality-criteria')) passCount++
  else issues.push('[Gate 3] Squad sem quality-criteria')

  if (squad.data.some((d) => d.name === 'tone-of-voice')) passCount++
  else issues.push('[Gate 3] Squad sem tone-of-voice')

  if (squad.data.some((d) => d.name === 'anti-patterns')) passCount++
  else issues.push('[Gate 3] Squad sem anti-patterns')

  const summary = `Validacao: ${passCount}/${totalChecks} checks passaram`

  if (issues.length > 0) {
    emitProgress(session.id, 'validate', `${summary}\n\nProblemas encontrados:\n${issues.map((i) => `- ${i}`).join('\n')}`)
  } else {
    emitProgress(session.id, 'validate', `${summary} — sem problemas!`)
  }
}

// ============================================================================
// EVALUATE AGENT FLOW (future feature)
// ============================================================================

async function runEvaluateAgentFlow(session: ArchitectSession, provider: AIProvider): Promise<void> {
  if (!session.evaluateAgent?.squadId) {
    throw new Error('squadId obrigatorio para avaliar agente')
  }

  const squad = await prisma.squad.findUnique({
    where: { id: session.evaluateAgent.squadId },
    include: {
      agents: { include: { tasks: true } },
      pipeline: { include: { steps: { orderBy: { order: 'asc' } } } },
      data: true,
    },
  })

  if (!squad || !squad.pipeline) {
    throw new Error('Squad nao encontrado ou sem pipeline')
  }

  const evaluatePrompt = buildEvaluatePrompt(squad)
  const messages: AIMessage[] = [
    { role: 'system', content: evaluatePrompt },
    { role: 'user', content: 'Avalie se o agente se encaixa neste squad e em qual posicao da pipeline.' },
  ]

  const result = await provider.streamText(messages, (chunk) => {
    emitOutput(session.id, 'evaluate', chunk)
  })



  session.evaluateAgent.recommendation = result.content

  const decision = await askUser(
    session.id, 'evaluate-decision',
    'Aceitar a recomendacao do Architect?',
    ['Sim, adicionar agente ao squad', 'Nao, cancelar'],
    result.content,
  )

  if (decision.toLowerCase().includes('sim')) {
    emitProgress(session.id, 'evaluate', 'Agente sera adicionado ao squad!')
    // Future: parse recommendation, create agent, update pipeline
  }

  wsServer.broadcastToRun(session.id, {
    event: 'architect:complete',
    payload: { sessionId: session.id, squadId: squad.id },
  })
}

// ============================================================================
// PROMPT BUILDERS
// ============================================================================

function buildDesignPrompt(
  session: ArchitectSession,
  allSkills: { name: string; type: string; description: string; categories: string }[],
): string {
  const perfMode = session.discovery.performanceMode ?? 'balanced'
  const taskGuidance = perfMode === 'alta-performance'
    ? '3-5 tasks por agente, cada task altamente especializada, formato e otimizacao separados'
    : perfMode === 'economico'
      ? '1-2 tasks por agente, combinar responsabilidades, otimizacao embutida'
      : '2-3 tasks por agente, equilibrio entre especializacao e eficiencia'

  const selectedSkills = session.skillDiscovery.selectedSkills ?? []
  const skillsList = allSkills
    .map((s) => {
      const isSelected = selectedSkills.includes(s.name)
      return `- ${s.name} (${s.type})${isSelected ? ' [SELECIONADA]' : ''}: ${s.description}`
    })
    .join('\n')

  return `Voce eh o Architect — especialista em projetar squads de agentes IA.
Voce projeta squads completos com agentes ricos, tasks decompostas, pipelines inteligentes e dados de referencia.

## Principios do Architect (18 regras inegociaveis)

1. **YAGNI** — nunca crie agentes desnecessarios. Menos eh mais.
2. **Responsabilidade unica** — cada agente tem exatamente UMA responsabilidade clara.
3. **Checkpoints em decisoes** — pipeline DEVE ter checkpoints em CADA ponto de decisao do usuario.
4. **Explique antes de construir** — sempre apresente o design antes de gerar.
5. **Research = subagent** — agentes de pesquisa/coleta sempre usam execution: subagent.
6. **Creative = inline** — agentes criativos/escritores sempre usam execution: inline.
7. **Pipeline simples** — default pro pipeline mais simples que atinge o objetivo.
8. **Reviewer obrigatorio** — todo squad DEVE ter um agente revisor.
9. **Maximo 4 perguntas** — fase de discovery com no maximo 4 perguntas por rodada.
10. **Build atomico** — gere todos os arquivos de uma vez, nunca parcialmente.
11. **Content squads = tone-of-voice** — squads de conteudo DEVEM ter tone-of-voice nos dados.
12. **Research antes de design** — pesquise o dominio ANTES de projetar agentes.
13. **Agentes profundos** — cada agente DEVE ter: Persona (role + identity + communicationStyle), Principles, Voice Guidance (alwaysUse + neverUse + toneRules), Anti-Patterns (neverDo + alwaysDo), Quality Criteria, Integration (readsFrom + writesTo).
14. **Quality gates** — valide cada agente e step antes de declarar completo.
15. **Skill discovery** — sugira skills relevantes do catalogo.
16. **Content Approval Gate** — steps visuais/render/publicacao DEVEM ter checkpoint IMEDIATAMENTE antes.
17. **Research Focus** — SEMPRE comece pipeline com checkpoint perguntando topico/foco ao usuario.
18. **Agentes com tasks** — agentes COM tasks removem Operational Framework do agente (fica nas tasks). Agentes SEM tasks mantem tudo.

## Nomes dos Agentes (aliteracao obrigatoria)

- Formato: "PrimeiroNome Sobrenome" com MESMA LETRA INICIAL
- Primeiro nome: nome humano comum em pt-BR
- Sobrenome: referencia divertida/esperta a especialidade
- Cada agente usa letra inicial DIFERENTE
- Icone: emoji representando o papel

Exemplos pt-BR:
- Pedro Pesquisa (researcher), Guilherme Gancho (copywriter), Renata Revisao (reviewer)
- Iago Instagram (creator), Diana Design (designer), Vera Veredito (reviewer)

## Performance Mode: ${perfMode}
- Tasks por agente: ${taskGuidance}

## Pipeline Patterns

### News-based (pesquisa de noticias):
Research Focus (checkpoint) → Research (subagent) → News Selection (checkpoint) → Generate Angles (inline) → Angle Selection (checkpoint) → Create Content (inline) → Content Approval (checkpoint) → [Render se visual] → Review (inline) → Final Approval (checkpoint)

### Fixed source (fonte definida):
Research Focus (checkpoint) → Research (subagent) → Create Content (inline) → Content Approval (checkpoint) → [Render se visual] → Review (inline) → Final Approval (checkpoint)

### Regras de checkpoint:
- Research Focus: SEMPRE primeiro step, tipo 'input', pergunta topico/foco
- News/Angle Selection: tipo 'selection', opcoes geradas pelo agente anterior
- Content Approval: tipo 'approval', usuario revisa conteudo
- Final Approval: tipo 'approval', usuario decide publicar ou nao

## Skills Disponiveis
${skillsList}

## Skills selecionadas pelo usuario
${selectedSkills.length > 0 ? selectedSkills.join(', ') : 'Nenhuma skill extra selecionada'}
Distribua as skills selecionadas entre os agentes que mais se beneficiam delas.

## Formato do Output
Retorne um JSON valido dentro de \`\`\`json ... \`\`\` com esta estrutura:

\`\`\`json
{
  "agents": [
    {
      "name": "Nome Sobrenome",
      "title": "Titulo do Papel",
      "icon": "emoji",
      "role": "role_id_unico",
      "execution": "inline|subagent",
      "persona": {
        "role": "descricao detalhada do papel (2-3 frases)",
        "identity": "identidade unica e memoravel do agente (3-4 frases, personalidade, motivacao, estilo)",
        "communicationStyle": "como se comunica (2-3 frases, formatacao, tom, estrutura)",
        "principles": ["principio1", "principio2", "principio3", "principio4", "principio5"]
      },
      "principles": "- principio 1 com explicacao\\n- principio 2 com explicacao\\n- principio 3\\n- principio 4\\n- principio 5",
      "voiceGuidance": {
        "alwaysUse": ["termo1", "termo2", "termo3", "termo4", "termo5"],
        "neverUse": ["termo1", "termo2", "termo3", "termo4", "termo5"],
        "toneRules": ["regra1 especifica", "regra2 especifica", "regra3 especifica"]
      },
      "antiPatterns": {
        "neverDo": ["erro1 com explicacao", "erro2 com explicacao", "erro3", "erro4"],
        "alwaysDo": ["pratica1 com explicacao", "pratica2", "pratica3"]
      },
      "qualityCriteria": ["criterio1 mensuravel", "criterio2 mensuravel", "criterio3", "criterio4", "criterio5"],
      "integration": {
        "readsFrom": ["fonte especifica (ex: research-brief do Pedro Pesquisa)"],
        "writesTo": ["destino especifico (ex: conteudo para Vera Veredito revisar)"]
      },
      "skills": ["nome_da_skill"],
      "tasks": [
        {
          "name": "nome-da-task-kebab-case",
          "description": "descricao curta da task (1 frase)",
          "order": 0,
          "skills": ["skill_usada_nesta_task"],
          "objective": "Objetivo detalhado da task em 2-3 frases. O que deve ser alcancado e por que.",
          "process": "1. Primeiro passo concreto com acao especifica\\n2. Segundo passo com criterio de decisao\\n3. Terceiro passo com output intermediario\\n4. Quarto passo de refinamento\\n5. Quinto passo de verificacao",
          "outputFormat": "## Titulo\\n### Secao 1\\n- campo: valor\\n### Secao 2\\n- campo: valor",
          "outputExample": "Exemplo COMPLETO e REALISTA com 15+ linhas mostrando exatamente como o output ideal deve ser. Nao use placeholders — escreva conteudo real.",
          "qualityCriteria": ["criterio1 especifico e mensuravel", "criterio2", "criterio3"],
          "vetoConditions": ["condicao de rejeicao automatica 1", "condicao 2"]
        }
      ]
    }
  ],
  "pipeline": [
    {
      "label": "Research Focus",
      "type": "checkpoint",
      "agentRole": null,
      "order": 0,
      "instructions": "[QUESTION] Qual topico voce quer explorar? [/QUESTION]",
      "checkpointType": "input",
      "question": "Qual topico voce quer explorar?"
    },
    {
      "label": "Research",
      "type": "subagent",
      "agentRole": "researcher",
      "order": 1,
      "instructions": "Pesquise sobre o topico definido pelo usuario. Execute suas tasks em sequencia.",
      "modelTier": "powerful"
    },
    {
      "label": "Aprovar pesquisa",
      "type": "checkpoint",
      "agentRole": null,
      "order": 2,
      "checkpointType": "approval",
      "question": "Revise o research brief. Aprovar ou refazer?"
    }
  ],
  "squadData": [
    {
      "name": "quality-criteria",
      "category": "reference",
      "content": "# Criterios de Qualidade\\n\\n## Sistema de Avaliacao\\nCada criterio avaliado de 1-10. Media minima: 7.0.\\n\\n### 1. [Criterio]\\n- **10:** descricao excelente\\n- **7:** descricao aceitavel\\n- **4:** descricao ruim\\n- **1:** descricao pessima"
    },
    {
      "name": "tone-of-voice",
      "category": "reference",
      "content": "# Tom de Voz\\n\\n## Identidade\\n[quem somos]\\n\\n## Caracteristicas\\n- [caracteristica 1]\\n\\n## Palavras-Chave\\nUsar: [termos]\\nEvitar: [termos]\\n\\n## Exemplos\\nBOM: [exemplo]\\nRUIM: [exemplo]"
    },
    {
      "name": "anti-patterns",
      "category": "reference",
      "content": "# Anti-Padroes\\n\\n## NUNCA faca:\\n1. [erro] — [impacto]\\n2. [erro] — [impacto]"
    }
  ]
}
\`\`\`

## REGRAS CRITICAS:
- O JSON DEVE ser valido e COMPLETO — nao truncar
- Cada agente DEVE ter TODOS os campos preenchidos com conteudo REAL, nao placeholders
- Cada task DEVE ter: objective (2-3 frases), process (min 5 passos), outputExample (min 15 linhas REAIS), qualityCriteria (min 3), vetoConditions (min 2)
- Pipeline DEVE comecar com Research Focus checkpoint
- Pipeline DEVE ter Content Approval checkpoint antes de render/publish
- squadData DEVE incluir quality-criteria (com escala 1-10), tone-of-voice (com exemplos BOM/RUIM) e anti-patterns (com impacto)
- Personas devem ser UNICAS e MEMORAVEIS, nunca genericas
- Voice guidance deve ter termos ESPECIFICOS do dominio, nao genericos
- Anti-patterns devem ser ERROS REAIS que profissionais cometem, nao obviedades`
}

function buildDesignInput(session: ArchitectSession): string {
  return `## Discovery
- Proposito: ${session.discovery.purpose}
- Publico: ${session.discovery.audience}
- Referencias: ${session.discovery.references?.join(', ') ?? 'nenhuma'}
- Performance: ${session.discovery.performanceMode}
- Formatos: ${session.discovery.targetFormats?.join(', ') ?? 'geral'}
- Idioma: ${session.discovery.language}
- Skills selecionadas: ${session.skillDiscovery.selectedSkills?.join(', ') ?? 'nenhuma'}

## Research Brief
${session.research.brief ?? 'Sem pesquisa disponivel'}

Projete o squad completo seguindo TODAS as regras e principios. Retorne APENAS o JSON estruturado dentro de \`\`\`json ... \`\`\`.`
}

function buildEvaluatePrompt(squad: {
  name: string
  agents: { name: string; role: string; tasks: { name: string }[] }[]
  pipeline: { steps: { label: string; type: string; order: number; agentId: string | null }[] } | null
  data: { name: string; content: string }[]
}): string {
  const agentsList = squad.agents.map((a) =>
    `- ${a.name} (${a.role}): ${a.tasks.length} tasks [${a.tasks.map((t) => t.name).join(', ')}]`
  ).join('\n')

  const stepsList = squad.pipeline?.steps.map((s) =>
    `${s.order + 1}. ${s.label} (${s.type})`
  ).join('\n') ?? 'Sem pipeline'

  return `Voce eh o Architect avaliando se um novo agente se encaixa num squad existente.

## Squad: ${squad.name}

### Agentes atuais:
${agentsList}

### Pipeline atual:
${stepsList}

### Dados de referencia:
${squad.data.map((d) => `- ${d.name}`).join('\n')}

## Sua tarefa
Analise o agente proposto e responda:

1. **Encaixe** — O agente se encaixa neste squad? (sim/nao com justificativa)
2. **Posicao** — Em qual posicao da pipeline ele deveria entrar? (entre quais steps)
3. **Impacto** — Que mudancas na pipeline seriam necessarias?
   - Novos checkpoints necessarios?
   - Reordenacao de steps?
   - Novos handoffs entre agentes?
4. **Tasks sugeridas** — Quais tasks o novo agente deveria ter?
5. **Conflitos** — Existe sobreposicao com agentes existentes?

Responda de forma estruturada e clara. Se o agente NAO se encaixa, explique por que e sugira alternativas.`
}

// ============================================================================
// PARSERS
// ============================================================================

function parseDesignOutput(content: string): ArchitectSession['design'] | null {
  // Strategy 1: Find ```json ... ``` block (greedy — last ```)
  const jsonBlockMatch = content.match(/```json\s*([\s\S]*)```/)
  if (jsonBlockMatch) {
    // The captured group might contain trailing ``` from nested blocks
    // Find the actual JSON by matching balanced braces
    const jsonStr = extractBalancedJson(jsonBlockMatch[1]!.trim())
    if (jsonStr) {
      try {
        const parsed = JSON.parse(jsonStr)
        console.log(`[ARCHITECT] JSON parsed via Strategy 1 (code block) — ${jsonStr.length} chars`)
        return parsed
      } catch (e) {
        console.error(`[ARCHITECT] Strategy 1 parse error:`, (e as Error).message)
      }
    }
  }

  // Strategy 2: Find first { and extract balanced JSON
  const jsonStr = extractBalancedJson(content)
  if (jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr)
      console.log(`[ARCHITECT] JSON parsed via Strategy 2 (balanced braces) — ${jsonStr.length} chars`)
      return parsed
    } catch (e) {
      console.error(`[ARCHITECT] Strategy 2 parse error:`, (e as Error).message)
    }
  }

  // Strategy 3: Try to clean common issues and parse
  const cleaned = content
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim()
  const cleanedJson = extractBalancedJson(cleaned)
  if (cleanedJson) {
    try {
      const parsed = JSON.parse(cleanedJson)
      console.log(`[ARCHITECT] JSON parsed via Strategy 3 (cleaned) — ${cleanedJson.length} chars`)
      return parsed
    } catch (e) {
      console.error(`[ARCHITECT] Strategy 3 parse error:`, (e as Error).message)
    }
  }

  // Log diagnostics
  const firstBrace = content.indexOf('{')
  const lastBrace = content.lastIndexOf('}')
  const openCount = (content.match(/\{/g) ?? []).length
  const closeCount = (content.match(/\}/g) ?? []).length
  console.error(`[ARCHITECT] All JSON parse strategies failed`)
  console.error(`[ARCHITECT] JSON diagnostics: length=${content.length}, firstBrace=${firstBrace}, lastBrace=${lastBrace}, open={=${openCount}, close=}=${closeCount}, balanced=${openCount === closeCount}`)
  console.error(`[ARCHITECT] Last 200 chars: ${content.slice(-200)}`)
  return null
}

/** Extract a balanced JSON object from text — finds first { and matches to its closing } */
function extractBalancedJson(text: string): string | null {
  const start = text.indexOf('{')
  if (start === -1) return null

  let depth = 0
  let inString = false
  let escape = false

  for (let i = start; i < text.length; i++) {
    const ch = text[i]!

    if (escape) {
      escape = false
      continue
    }

    if (ch === '\\' && inString) {
      escape = true
      continue
    }

    if (ch === '"') {
      inString = !inString
      continue
    }

    if (inString) continue

    if (ch === '{') depth++
    if (ch === '}') {
      depth--
      if (depth === 0) {
        return text.slice(start, i + 1)
      }
    }
  }

  return null
}

function formatDesignSummary(session: ArchitectSession): string {
  const agents = session.design.agents ?? []
  const steps = session.design.pipeline ?? []

  let summary = `## Squad Design\n\n`
  summary += `**Proposito:** ${session.discovery.purpose}\n`
  summary += `**Publico:** ${session.discovery.audience}\n`
  summary += `**Performance:** ${session.discovery.performanceMode}\n\n`

  summary += `### Agentes (${agents.length})\n`
  for (const a of agents) {
    summary += `- ${a.icon} **${a.name}** — ${a.title} (${a.execution})\n`
    summary += `  Tasks: ${a.tasks.map((t) => t.name).join(', ')}\n`
    summary += `  Skills: ${a.skills.length > 0 ? a.skills.join(', ') : 'nenhuma'}\n`
  }

  summary += `\n### Pipeline (${steps.length} steps)\n`
  for (const s of steps) {
    const icon = s.type === 'checkpoint' ? '🛑' : s.type === 'subagent' ? '🔄' : '✏️'
    summary += `${s.order + 1}. ${icon} ${s.label} (${s.type})`
    if (s.agentRole) {
      const agent = agents.find((a) => a.role === s.agentRole)
      if (agent) summary += ` — ${agent.icon} ${agent.name}`
    }
    summary += '\n'
  }

  summary += `\n### Dados de Referencia\n`
  for (const d of session.design.squadData ?? []) {
    summary += `- ${d.name} (${d.category})\n`
  }

  if (session.skillDiscovery.selectedSkills && session.skillDiscovery.selectedSkills.length > 0) {
    summary += `\n### Skills Ativas\n`
    summary += session.skillDiscovery.selectedSkills.map((s) => `- ${s}`).join('\n')
  }

  return summary
}
