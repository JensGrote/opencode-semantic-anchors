import { tool, type ToolDefinition } from '@opencode-ai/plugin'
import type { ConfigLoader } from '../config/loader.js'
import type { RuleEngine } from '../rules/engine.js'

export function anchorConfigReloadTool(config: ConfigLoader, engine: RuleEngine): ToolDefinition {
  return tool({
    description: 'Reload config without plugin restart (requires edit permission)',
    args: {},
    async execute() {
      const newConfig = config.reload()
      engine.loadConfig(newConfig)
      return `Config reloaded: ${newConfig.contracts.length} contracts, ${Object.keys(newConfig.presets).length} presets, maxOverrides=${newConfig.settings.maxOverrides}`
    },
  })
}
