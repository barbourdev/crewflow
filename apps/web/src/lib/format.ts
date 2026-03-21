// ---------------------------------------------------------------------------
// Formatting utilities
// ---------------------------------------------------------------------------

/**
 * Formata valor monetario em USD (moeda real dos providers de IA).
 */
export function formatCost(value: number | null): string {
  if (value == null || value === 0) return '$0.00'
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
  return `$${value.toFixed(2)}`
}

/**
 * Formata custo detalhado (4 casas decimais) para views de run/step.
 */
export function formatCostDetailed(value: number): string {
  return `$${value.toFixed(4)}`
}
