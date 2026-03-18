export interface VetoResult {
  passed: boolean
  violations: string[]
}

export class VetoChecker {
  async check(output: string, conditions: string[]): Promise<VetoResult> {
    const violations: string[] = []

    for (const condition of conditions) {
      const violation = this.evaluateCondition(output, condition)
      if (violation) {
        violations.push(violation)
      }
    }

    return {
      passed: violations.length === 0,
      violations,
    }
  }

  private evaluateCondition(output: string, condition: string): string | null {
    const lower = condition.toLowerCase().trim()

    // min_length:N
    const minLengthMatch = lower.match(/^min_length:(\d+)$/)
    if (minLengthMatch) {
      const minLen = parseInt(minLengthMatch[1] ?? '0', 10)
      if (output.length < minLen) {
        return `Output tem ${output.length} caracteres, mínimo exigido: ${minLen}`
      }
      return null
    }

    // max_length:N
    const maxLengthMatch = lower.match(/^max_length:(\d+)$/)
    if (maxLengthMatch) {
      const maxLen = parseInt(maxLengthMatch[1] ?? '0', 10)
      if (output.length > maxLen) {
        return `Output tem ${output.length} caracteres, máximo permitido: ${maxLen}`
      }
      return null
    }

    // must_contain:keyword
    const mustContainMatch = lower.match(/^must_contain:(.+)$/)
    if (mustContainMatch) {
      const keyword = (mustContainMatch[1] ?? '').trim()
      if (!output.toLowerCase().includes(keyword)) {
        return `Output não contém a palavra obrigatória: "${keyword}"`
      }
      return null
    }

    // must_not_contain:keyword
    const mustNotContainMatch = lower.match(/^must_not_contain:(.+)$/)
    if (mustNotContainMatch) {
      const keyword = (mustNotContainMatch[1] ?? '').trim()
      if (output.toLowerCase().includes(keyword)) {
        return `Output contém a palavra proibida: "${keyword}"`
      }
      return null
    }

    // min_words:N
    const minWordsMatch = lower.match(/^min_words:(\d+)$/)
    if (minWordsMatch) {
      const minWords = parseInt(minWordsMatch[1] ?? '0', 10)
      const wordCount = output.split(/\s+/).filter(Boolean).length
      if (wordCount < minWords) {
        return `Output tem ${wordCount} palavras, mínimo exigido: ${minWords}`
      }
      return null
    }

    // not_empty
    if (lower === 'not_empty') {
      if (output.trim().length === 0) {
        return 'Output está vazio'
      }
      return null
    }

    // Condição desconhecida — ignora
    return null
  }
}
