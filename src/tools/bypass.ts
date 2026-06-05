import { tool, type ToolDefinition } from '@opencode-ai/plugin'
import type { RuleEngine } from '../rules/engine.js'

export function anchorBypassTool(engine: RuleEngine): ToolDefinition {
  return tool({
    description: 'Temporarily bypass an active contract block. Grants one override that allows the next blocked action to proceed.',
    args: { reason: tool.schema.string() },
    async execute(args) {
      const remaining = engine.incrementOverride()
      return `Override bypass granted. Reason: "${args.reason}". Remaining overrides: ${remaining}/${engine.getState().maxOverrides}`
    },
  })
}
