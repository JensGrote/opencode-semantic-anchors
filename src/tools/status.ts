import { tool, type ToolDefinition } from '@opencode-ai/plugin'
import type { RuleEngine } from '../rules/engine.js'

export function anchorStatusTool(engine: RuleEngine): ToolDefinition {
  return tool({
    description: 'Show active contracts, counters, and current role for the semantic anchor plugin',
    args: {},
    async execute() {
      const state = engine.getState()
      const contracts = engine.getActiveContracts()

      const lines: string[] = [
        `Role: ${state.role}`,
        `Tool calls: ${state.toolCallCount}`,
        `Overrides available: ${state.overrideCount} / ${state.maxOverrides}`,
        `Active contracts (${contracts.length}):`,
      ]

      for (const c of contracts) {
        const triggerPatterns = c.triggers.map((t) => `${t.type}:${t.pattern}`).join(', ')
        lines.push(`  - ${c.id} [${c.mode}] — ${c.description} (triggers: ${triggerPatterns})`)
      }

      return lines.join('\n')
    },
  })
}
