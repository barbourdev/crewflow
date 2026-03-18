export class VetoChecker {
  // TODO: Implementar na Etapa 3
  async check(_output: string, _conditions: string[]): Promise<{ passed: boolean; violations: string[] }> {
    return { passed: true, violations: [] }
  }
}
