import type { Plugin, PluginOptions } from '@opencode-ai/plugin'
import { ConfigLoader } from './config/loader.js'
import { RuleEngine } from './rules/engine.js'
import { createToolExecuteHandler } from './hooks/toolExecute.js'
import { createMessageHandler } from './hooks/chatMessage.js'
import { anchorBypassTool } from './tools/bypass.js'
import { anchorStatusTool } from './tools/status.js'
import { anchorConfigReloadTool } from './tools/configReload.js'

const opencodeSemanticAnchors: Plugin = async (input, options?: PluginOptions) => {
  const configPath = options?.configPath as string | undefined
  const config = new ConfigLoader(configPath)
  const loaded = config.load()
  const engine = new RuleEngine(loaded, config.getActiveContracts.bind(config))

  const warn = async (message: string) => {
    await input.client.app.log({
      body: { service: 'opencode-semantic-anchors', level: 'warn', message },
    })
  }

  return {
    'tool.execute.before': createToolExecuteHandler(engine, warn),

    'chat.message': createMessageHandler(engine, warn),

    tool: {
      'anchor-bypass': anchorBypassTool(engine),
      'anchor-status': anchorStatusTool(engine),
      'anchor-config-reload': anchorConfigReloadTool(config, engine),
    },
  }
}

export default opencodeSemanticAnchors
