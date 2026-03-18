import type { AgentDefinition } from '@crewflow/shared'
import type { AIProvider, AIMessage } from '@crewflow/ai'

export interface AgentExecutorOptions {
  onStream?: (chunk: string) => void
  bestPractices?: string[]
  skillInstructions?: string[]
  memories?: string[]
  previousOutput?: string
  provider: AIProvider
}

export class AgentExecutor {
  async execute(
    agent: AgentDefinition,
    input: string,
    options: AgentExecutorOptions,
  ): Promise<{ content: string; tokensUsed: { input: number; output: number; total: number }; cost: number }> {
    const systemPrompt = this.buildContext(
      agent,
      options.bestPractices,
      options.skillInstructions,
      options.memories,
    )

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

    if (options.onStream) {
      return options.provider.streamText(messages, options.onStream)
    }

    return options.provider.generateText(messages)
  }

  buildContext(
    agent: AgentDefinition,
    bestPractices?: string[],
    skillInstructions?: string[],
    memories?: string[],
  ): string {
    const parts: string[] = []

    // Data atual
    parts.push(`Data atual: ${new Date().toISOString().split('T')[0]}`)

    // Persona
    const p = agent.persona
    parts.push(`# Você é: ${agent.name}`)
    parts.push(`## Papel: ${p.role}`)
    parts.push(`## Identidade: ${p.identity}`)
    parts.push(`## Estilo de comunicação: ${p.communicationStyle}`)

    if (p.principles.length > 0) {
      parts.push(`## Princípios:\n${p.principles.map((pr) => `- ${pr}`).join('\n')}`)
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

    // Output examples
    if (agent.outputExamples && agent.outputExamples.length > 0) {
      parts.push(`## Exemplos de output:\n${agent.outputExamples.map((e) => `---\n${e}`).join('\n')}`)
    }

    // Anti-patterns
    if (agent.antiPatterns && agent.antiPatterns.length > 0) {
      parts.push(`## Anti-padrões (evite):\n${agent.antiPatterns.map((a) => `- ${a}`).join('\n')}`)
    }

    // Quality criteria
    if (agent.qualityCriteria && agent.qualityCriteria.length > 0) {
      parts.push(`## Critérios de qualidade:\n${agent.qualityCriteria.map((q) => `- ${q}`).join('\n')}`)
    }

    // Best practices
    if (bestPractices && bestPractices.length > 0) {
      parts.push(`## Boas práticas a seguir:\n${bestPractices.map((bp) => `- ${bp}`).join('\n')}`)
    }

    // Skill instructions
    if (skillInstructions && skillInstructions.length > 0) {
      parts.push(`## Instruções de skills:\n${skillInstructions.join('\n\n')}`)
    }

    // Memórias de execuções anteriores
    if (memories && memories.length > 0) {
      parts.push(`## Aprendizados de execuções anteriores (use para melhorar seu output):\n${memories.map((m) => `- ${m}`).join('\n')}`)
    }

    return parts.join('\n\n')
  }
}
