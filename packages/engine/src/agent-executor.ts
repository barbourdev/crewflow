import type { AgentDefinition, TaskDefinition } from '@crewflow/shared'
import type { AIProvider, AIMessage, AITool } from '@crewflow/ai'
import { executeToolCall } from './tools'

export interface AgentExecutorOptions {
  onStream?: (chunk: string) => void
  bestPractices?: string[]
  skillInstructions?: string[]
  memories?: string[]
  previousOutput?: string
  provider: AIProvider
  /** Instrucoes do step (vindas do step file) */
  stepInstructions?: string
  /** Dados de contexto a carregar (squad data, reference files) */
  contextData?: string[]
  /** Exemplo de output esperado (do step) */
  outputExample?: string
  /**
   * Callback para quando o agente precisa de input do usuario mid-execution.
   * O agente usa o marcador [AWAITING_INPUT]pergunta[/AWAITING_INPUT] no output.
   * O engine detecta, envia a pergunta ao usuario, e continua com a resposta.
   */
  onInlineQuestion?: (question: string, agentName: string) => Promise<string>
  /** Tools disponiveis para o agente (ex: web_search) */
  tools?: AITool[]
  /** Callback para log de tool calls (para verbose logging) */
  onToolCall?: (toolName: string, input: Record<string, unknown>, result: string) => void
  /** Override de modelo (ex: model tier fast → haiku, powerful → sonnet) */
  modelOverride?: string
}

interface ExecutionResult {
  content: string
  tokensUsed: { input: number; output: number; total: number }
  cost: number
}

const MAX_TOOL_ROUNDS = 10

export class AgentExecutor {
  /**
   * Executa um agente. Se o agente tem tasks, executa cada task em sequencia.
   * Cada task gera um output que alimenta a proxima task.
   */
  async execute(
    agent: AgentDefinition,
    input: string,
    options: AgentExecutorOptions,
  ): Promise<ExecutionResult> {
    // Se tem tasks, executar em sequencia (task decomposition)
    if (agent.tasks.length > 0) {
      return this.executeTasks(agent, input, options)
    }

    // Sem tasks — execucao simples (legado)
    return this.executeSingle(agent, input, options)
  }

  /**
   * Executa tasks em sequencia. Cada task tem suas proprias instrucoes,
   * criterios de qualidade e formato de output.
   * O output de cada task vira input da proxima.
   */
  private async executeTasks(
    agent: AgentDefinition,
    input: string,
    options: AgentExecutorOptions,
  ): Promise<ExecutionResult> {
    const sortedTasks = [...agent.tasks].sort((a, b) => a.order - b.order)
    const totalTokens = { input: 0, output: 0, total: 0 }
    let totalCost = 0
    let currentInput = input
    let fullOutput = ''

    for (let i = 0; i < sortedTasks.length; i++) {
      const task = sortedTasks[i]!
      const isLastTask = i === sortedTasks.length - 1

      const taskPrompt = this.buildTaskPrompt(task, currentInput, options.previousOutput)
      const systemPrompt = this.buildContext(agent, options, task)

      const messages: AIMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: taskPrompt },
      ]

      // So fazer streaming na ultima task (a que o usuario ve)
      const onStream = isLastTask ? options.onStream : undefined

      const result = await this.executeWithToolLoop(messages, options, onStream, sortedTasks.length > 1 && isLastTask)

      totalTokens.input += result.tokensUsed.input
      totalTokens.output += result.tokensUsed.output
      totalTokens.total += result.tokensUsed.total
      totalCost += result.cost

      // Output desta task vira input da proxima
      currentInput = result.content
      fullOutput += (fullOutput ? '\n\n---\n\n' : '') + result.content
    }

    return { content: fullOutput, tokensUsed: totalTokens, cost: totalCost }
  }

  /**
   * Execucao simples — 1 agente, 1 prompt (sem tasks).
   * Suporta loop de inline questions e tool use.
   */
  private async executeSingle(
    agent: AgentDefinition,
    input: string,
    options: AgentExecutorOptions,
  ): Promise<ExecutionResult> {
    const systemPrompt = this.buildContext(agent, options)
    const totalTokens = { input: 0, output: 0, total: 0 }
    let totalCost = 0

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
    ]

    if (options.previousOutput) {
      messages.push({
        role: 'user',
        content: `Contexto do agente anterior:\n\n${options.previousOutput}\n\n---\n\nAgora execute sua tarefa com base no input abaixo:\n\n${input}`,
      })
    } else {
      messages.push({ role: 'user', content: input })
    }

    let fullOutput = ''
    const MAX_QUESTION_ROUNDS = 5

    for (let round = 0; round <= MAX_QUESTION_ROUNDS; round++) {
      const onStream = options.onStream
      const result = await this.executeWithToolLoop(messages, options, onStream, false)

      totalTokens.input += result.tokensUsed.input
      totalTokens.output += result.tokensUsed.output
      totalTokens.total += result.tokensUsed.total
      totalCost += result.cost

      // Detectar inline question
      const detection = AgentExecutor.detectInlineQuestion(result.content)

      if (!detection.hasQuestion || !options.onInlineQuestion) {
        // Sem pergunta — retornar output completo
        fullOutput += result.content
        return { content: fullOutput, tokensUsed: totalTokens, cost: totalCost }
      }

      // Pergunta detectada — guardar output ate aqui
      if (detection.outputBeforeQuestion) {
        fullOutput += detection.outputBeforeQuestion + '\n\n'
      }

      console.log(`[ENGINE] Inline question detected from "${agent.name}": ${detection.question.slice(0, 100)}...`)

      // Enviar pergunta ao usuario e esperar resposta
      const userResponse = await options.onInlineQuestion(detection.question, agent.name)

      console.log(`[ENGINE] User responded to "${agent.name}": ${userResponse.slice(0, 100)}...`)

      // Adicionar a troca ao historico de mensagens e continuar
      messages.push({ role: 'assistant', content: result.content })
      messages.push({ role: 'user', content: userResponse })

      // Emitir separador visual no stream
      if (options.onStream) {
        options.onStream(`\n\n`)
      }
    }

    // Se chegou aqui, excedeu o limite de rounds
    return { content: fullOutput, tokensUsed: totalTokens, cost: totalCost }
  }

  /**
   * Executa uma chamada ao provider com loop de tool_use.
   * Se o modelo pedir para usar uma tool, executa e continua ate ter resposta final.
   */
  private async executeWithToolLoop(
    messages: AIMessage[],
    options: AgentExecutorOptions,
    onStream: ((chunk: string) => void) | undefined,
    emitSeparator: boolean,
  ): Promise<ExecutionResult> {
    const totalTokens = { input: 0, output: 0, total: 0 }
    let totalCost = 0
    const generateOptions = {
      ...(options.tools ? { tools: options.tools } : {}),
      ...(options.modelOverride ? { model: options.modelOverride } : {}),
    }

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      let result

      if (onStream && round === 0) {
        if (emitSeparator) onStream(`\n\n---\n\n`)
        result = await options.provider.streamText(messages, onStream, generateOptions)
      } else if (onStream) {
        result = await options.provider.streamText(messages, onStream, generateOptions)
      } else {
        result = await options.provider.generateText(messages, generateOptions)
      }

      totalTokens.input += result.tokensUsed.input
      totalTokens.output += result.tokensUsed.output
      totalTokens.total += result.tokensUsed.total
      totalCost += result.cost

      // Se nao tem tool calls, retornar resultado final
      if (!result.toolCalls || result.toolCalls.length === 0 || result.stopReason !== 'tool_use') {
        return { content: result.content, tokensUsed: totalTokens, cost: totalCost }
      }

      // Tool use — executar tools e continuar conversa
      console.log(`[ENGINE] Tool calls: ${result.toolCalls.map((tc) => tc.name).join(', ')}`)

      // Emitir no stream que estamos pesquisando
      if (onStream) {
        for (const tc of result.toolCalls) {
          if (tc.name === 'web_search') {
            onStream(`\n\n🔍 Searching: "${tc.input.query}"...\n`)
          } else if (tc.name === 'web_fetch') {
            onStream(`\n\n📄 Reading: ${tc.input.url}...\n`)
          }
        }
      }

      // Adicionar assistant message com tool calls ao historico
      messages.push({
        role: 'assistant',
        content: result.content,
        toolCalls: result.toolCalls,
      })

      // Executar cada tool e adicionar resultados
      for (const toolCall of result.toolCalls) {
        const toolResult = await executeToolCall(toolCall)

        // Callback de verbose logging
        if (options.onToolCall) {
          options.onToolCall(toolCall.name, toolCall.input, toolResult.slice(0, 200))
        }

        console.log(`[ENGINE] Tool "${toolCall.name}" result: ${toolResult.slice(0, 100)}...`)

        messages.push({
          role: 'tool_result',
          content: toolResult,
          toolCallId: toolCall.id,
        })
      }

      // Continuar loop — modelo vai processar resultados das tools
    }

    // Excedeu rounds de tool use — retornar o que tem
    console.warn('[ENGINE] Max tool rounds exceeded, returning partial result')
    return { content: 'Max tool iterations reached.', tokensUsed: totalTokens, cost: totalCost }
  }

  /**
   * Constroi o prompt do usuario para uma task especifica
   */
  private buildTaskPrompt(
    task: TaskDefinition,
    input: string,
    previousOutput?: string,
  ): string {
    const parts: string[] = []

    if (previousOutput) {
      parts.push(`## Contexto do agente/task anterior:\n${previousOutput}`)
    }

    parts.push(`## Sua tarefa atual: ${task.name}`)

    if (task.objective) {
      parts.push(`### Objetivo:\n${task.objective}`)
    }

    if (task.process) {
      parts.push(`### Processo a seguir:\n${task.process}`)
    }

    if (task.outputFormat) {
      parts.push(`### Formato de output esperado:\n${task.outputFormat}`)
    }

    if (task.outputExample) {
      parts.push(`### Exemplo de output:\n${task.outputExample}`)
    }

    if (task.qualityCriteria.length > 0) {
      parts.push(`### Criterios de qualidade:\n${task.qualityCriteria.map((c) => `- ${c}`).join('\n')}`)
    }

    if (task.vetoConditions.length > 0) {
      parts.push(`### Condicoes de rejeicao (evite a todo custo):\n${task.vetoConditions.map((v) => `- ${v}`).join('\n')}`)
    }

    parts.push(`## Input:\n${input}`)

    return parts.join('\n\n')
  }

  /**
   * Constroi o system prompt completo do agente, injetando:
   * - Persona rica (8 secoes)
   * - Instrucoes do step
   * - Best practices
   * - Skill instructions
   * - Dados de contexto (squad data)
   * - Memorias
   * - Task-specific context (se houver)
   */
  buildContext(
    agent: AgentDefinition,
    options?: Partial<AgentExecutorOptions>,
    task?: TaskDefinition,
  ): string {
    const parts: string[] = []

    // Data atual
    parts.push(`Data atual: ${new Date().toISOString().split('T')[0]}`)

    // === PERSONA RICA ===
    const p = agent.persona
    parts.push(`# Voce eh: ${agent.name}${agent.title ? ` — ${agent.title}` : ''}`)
    parts.push(`## Papel: ${p.role}`)

    if (p.identity) {
      parts.push(`## Identidade: ${p.identity}`)
    }
    if (p.communicationStyle) {
      parts.push(`## Estilo de comunicacao: ${p.communicationStyle}`)
    }

    // Principios (campo dedicado ou do persona)
    if (agent.principles) {
      parts.push(`## Principios:\n${agent.principles}`)
    } else if (p.principles.length > 0) {
      parts.push(`## Principios:\n${p.principles.map((pr) => `- ${pr}`).join('\n')}`)
    }

    // Voice guidance
    if (agent.voiceGuidance) {
      const v = agent.voiceGuidance
      if (v.alwaysUse.length > 0) {
        parts.push(`## Sempre use:\n${v.alwaysUse.map((s) => `- ${s}`).join('\n')}`)
      }
      if (v.neverUse.length > 0) {
        parts.push(`## Nunca use:\n${v.neverUse.map((s) => `- ${s}`).join('\n')}`)
      }
      if (v.toneRules.length > 0) {
        parts.push(`## Regras de tom:\n${v.toneRules.map((s) => `- ${s}`).join('\n')}`)
      }
    }

    // Operational framework
    if (agent.operationalFramework) {
      parts.push(`## Framework operacional:\n${agent.operationalFramework}`)
    }

    // Anti-patterns
    if (agent.antiPatterns && agent.antiPatterns.length > 0) {
      parts.push(`## Anti-padroes (NUNCA faca):\n${agent.antiPatterns.map((a) => `- ${a}`).join('\n')}`)
    }

    // Quality criteria (agent-level)
    if (agent.qualityCriteria && agent.qualityCriteria.length > 0) {
      parts.push(`## Criterios de qualidade:\n${agent.qualityCriteria.map((q) => `- ${q}`).join('\n')}`)
    }

    // Integration
    if (agent.integration) {
      if (agent.integration.readsFrom.length > 0) {
        parts.push(`## Voce le de:\n${agent.integration.readsFrom.map((r) => `- ${r}`).join('\n')}`)
      }
      if (agent.integration.writesTo.length > 0) {
        parts.push(`## Voce escreve para:\n${agent.integration.writesTo.map((w) => `- ${w}`).join('\n')}`)
      }
    }

    // Output examples
    if (agent.outputExamples && agent.outputExamples.length > 0) {
      parts.push(`## Exemplos de output:\n${agent.outputExamples.map((e) => `---\n${e}`).join('\n')}`)
    }

    // === INSTRUCOES DO STEP ===
    if (options?.stepInstructions) {
      parts.push(`## Instrucoes especificas deste step:\n${options.stepInstructions}`)
    }

    // === EXEMPLO DE OUTPUT DO STEP ===
    if (options?.outputExample) {
      parts.push(`## Exemplo de output esperado neste step:\n${options.outputExample}`)
    }

    // === DADOS DE CONTEXTO (squad data: quality-criteria, tone-of-voice, etc.) ===
    if (options?.contextData && options.contextData.length > 0) {
      parts.push(`## Dados de referencia:\n${options.contextData.join('\n\n---\n\n')}`)
    }

    // === BEST PRACTICES ===
    if (options?.bestPractices && options.bestPractices.length > 0) {
      parts.push(`## Boas praticas a seguir:\n${options.bestPractices.join('\n\n')}`)
    }

    // === SKILL INSTRUCTIONS (o SKILL.md inteiro, nao so descricao) ===
    if (options?.skillInstructions && options.skillInstructions.length > 0) {
      parts.push(`## Instrucoes de skills disponiveis:\n${options.skillInstructions.join('\n\n---\n\n')}`)
    }

    // === MEMORIAS ===
    if (options?.memories && options.memories.length > 0) {
      parts.push(`## Aprendizados de execucoes anteriores (use para melhorar seu output):\n${options.memories.map((m) => `- ${m}`).join('\n')}`)
    }

    // === TASK SKILLS (skills especificas da task atual) ===
    if (task && task.skills.length > 0) {
      parts.push(`## Skills disponiveis para esta task: ${task.skills.join(', ')}`)
    }

    // === TOOLS DISPONIVEIS ===
    if (options?.tools && options.tools.length > 0) {
      parts.push(`## Tools disponiveis
Voce tem acesso a tools que pode usar durante sua execucao.
Use-as quando precisar de informacoes atualizadas ou dados externos.

Tools: ${options.tools.map((t) => `\`${t.name}\` — ${t.description}`).join('\n')}

IMPORTANTE: Use as tools de pesquisa quando:
- Precisar de informacoes atualizadas (noticias, tendencias, dados recentes)
- O input mencionar topicos que requerem pesquisa
- Voce nao tiver certeza sobre um fato especifico
- Precisar de dados reais (estatisticas, precos, eventos)`)
    }

    // === STRUCTURED OUTPUT ===
    parts.push(`## Formato do output
Seu output DEVE ser estruturado em markdown com secoes claras:
- Use headers (##, ###) para organizar secoes
- Use listas para items enumeraveis
- Use **negrito** para termos-chave
- Inclua metricas e dados concretos quando relevante
- NAO produza texto corrido sem estrutura
- Se a task define outputFormat, siga-o EXATAMENTE`)

    // === INSTRUCAO DE INLINE QUESTIONS ===
    if (options?.onInlineQuestion) {
      parts.push(`## Interacao com o usuario
Se voce precisa de uma decisao ou preferencia do usuario para continuar seu trabalho,
use o marcador abaixo para fazer a pergunta. O sistema vai pausar, coletar a resposta,
e voce podera continuar com essa informacao.

Formato:
[AWAITING_INPUT]
Sua pergunta aqui. Seja claro e direto.
Se quiser oferecer opcoes, liste-as:
1. Opcao A — descricao breve
2. Opcao B — descricao breve
3. Opcao C — descricao breve
[/AWAITING_INPUT]

IMPORTANTE:
- Use este marcador SOMENTE quando a decisao do usuario eh necessaria para continuar
- Nao use para perguntas retoricas ou confirmacoes triviais
- Apos receber a resposta, continue seu trabalho incorporando a escolha do usuario`)
    }

    return parts.join('\n\n')
  }

  // ================================================================
  // INLINE QUESTION DETECTION
  // ================================================================

  /** Detecta se o output contem um marcador de pergunta inline */
  static detectInlineQuestion(output: string): { hasQuestion: boolean; question: string; outputBeforeQuestion: string } {
    const match = output.match(/\[AWAITING_INPUT\]([\s\S]*?)\[\/AWAITING_INPUT\]/)
    if (!match) {
      return { hasQuestion: false, question: '', outputBeforeQuestion: output }
    }

    const question = match[1]!.trim()
    const outputBeforeQuestion = output.slice(0, match.index).trim()

    return { hasQuestion: true, question, outputBeforeQuestion }
  }
}
