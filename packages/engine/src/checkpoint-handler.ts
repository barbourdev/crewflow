import type { StepDefinition } from '@crewflow/shared'

export type CheckpointAction = 'approve' | 'adjust' | 'redo'

export type CheckpointType = 'approval' | 'selection' | 'input'

export interface CheckpointRequest {
  type: CheckpointType
  question?: string
  options?: string[]
  instructions?: string
}

export interface CheckpointResponse {
  action: CheckpointAction
  feedback?: string
  /** Para checkpoints tipo 'selection' — indice ou valor selecionado */
  selected?: string
}

export type CheckpointResolver = (step: StepDefinition, request: CheckpointRequest) => Promise<CheckpointResponse>

export class CheckpointHandler {
  private resolver: CheckpointResolver

  constructor(resolver?: CheckpointResolver) {
    // Default: auto-approve
    this.resolver = resolver ?? (() => Promise.resolve({ action: 'approve' }))
  }

  setResolver(resolver: CheckpointResolver): void {
    this.resolver = resolver
  }

  async waitForResponse(step: StepDefinition, request?: CheckpointRequest): Promise<CheckpointResponse> {
    const req = request ?? { type: 'approval' }
    return this.resolver(step, req)
  }

  /**
   * Parseia instrucoes do step para extrair tipo de checkpoint, pergunta e opcoes.
   * Formato suportado nas instructions do step:
   *
   *   [QUESTION] Qual angulo voce prefere? [/QUESTION]
   *   [OPTIONS]
   *   - Medo: "Designers acabaram de ficar obsoletos?"
   *   - Oportunidade: "Nova ferramenta vai triplicar sua produtividade"
   *   - Educacional: "Como funciona por dentro"
   *   [/OPTIONS]
   */
  static parseStepInstructions(step: StepDefinition): CheckpointRequest {
    const instructions = step.instructions ?? ''

    // Extrair pergunta
    const questionMatch = instructions.match(/\[QUESTION\]([\s\S]*?)\[\/QUESTION\]/)
    const question = questionMatch ? questionMatch[1]!.trim() : step.label

    // Extrair opcoes
    const optionsMatch = instructions.match(/\[OPTIONS\]([\s\S]*?)\[\/OPTIONS\]/)
    let options: string[] | undefined

    if (optionsMatch) {
      options = optionsMatch[1]!
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.startsWith('-') || l.startsWith('*'))
        .map((l) => l.replace(/^[-*]\s*/, ''))
    }

    // Determinar tipo
    let type: CheckpointType = 'approval'
    if (options && options.length > 0) {
      type = 'selection'
    } else if (instructions.toLowerCase().includes('[input]') || instructions.toLowerCase().includes('texto livre')) {
      type = 'input'
    }

    return { type, question, options, instructions: instructions || undefined }
  }
}
