/**
 * Analisa o output de um agente para detectar:
 * 1. Perguntas diretas ao usuario (human input request)
 * 2. Rejeicoes de review (REJECT / REVISION REQUIRED)
 */

export interface OutputAnalysis {
  /** O agente esta fazendo uma pergunta e espera resposta do usuario */
  needsHumanInput: boolean
  /** O agente rejeitou o conteudo (review agent) */
  isRejection: boolean
  /** Motivo da rejeicao (se aplicavel) */
  rejectionReason?: string
}

// Padroes que indicam que o agente esta pedindo input do usuario
const QUESTION_PATTERNS = [
  /qual (?:você|voce|vc) (?:prefere|escolhe|quer)/i,
  /(?:escolha|selecione|defina) (?:uma|um|a|o) (?:das|dos)? (?:opcoes|opções|alternativas|hooks?|opcao|opção)/i,
  /(?:opção|opcao|option|hook) [A-Z]\b.*\n.*(?:opção|opcao|option|hook) [B-Z]\b/is,
  /\?\s*$/, // Output termina com pergunta
  /(?:deseja|gostaria|prefere|quer) que (?:eu|a gente)/i,
  /(?:before I (?:proceed|continue)|should I|would you (?:like|prefer))/i,
  /(?:please (?:choose|select|pick|decide))/i,
  /(?:aguardo|esperando) (?:sua|your) (?:resposta|escolha|decisão|decisao|response|choice)/i,
]

// Padroes que indicam rejeicao de review
const REJECTION_PATTERNS = [
  /\b(?:VERDICT|VEREDITO|STATUS):\s*REJECT/i,
  /\b(?:HARD REJECT|REJEITADO|REJECTED)\b/i,
  /\b(?:REVISION REQUIRED|REVISÃO NECESSÁRIA|REVISAO NECESSARIA)\b/i,
  /\bNão aprovado para (?:produção|producao|publicação|publicacao)\b/i,
  /\bNot approved for (?:production|publication)\b/i,
]

export function analyzeOutput(output: string): OutputAnalysis {
  const needsHumanInput = QUESTION_PATTERNS.some((p) => p.test(output))
  const isRejection = REJECTION_PATTERNS.some((p) => p.test(output))

  let rejectionReason: string | undefined
  if (isRejection) {
    // Tentar extrair o motivo
    const reasonMatch = output.match(/(?:Motivo principal|Main reason|Reason):\s*(.+)/i)
    rejectionReason = reasonMatch?.[1]?.trim() ?? 'Review agent rejected the output'
  }

  return { needsHumanInput, isRejection, rejectionReason }
}
