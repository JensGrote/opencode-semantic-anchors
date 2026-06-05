import type { RuleEngine, Verdict } from '../rules/engine.js'
import type { WarnLogger } from './toolExecute.js'

export function createMessageHandler(engine: RuleEngine, warn: WarnLogger) {
  return async (
    _input: {
      sessionID: string
      agent?: string
      model?: { providerID: string; modelID: string }
      messageID?: string
      variant?: string
    },
    output: { message: unknown; parts: unknown[] },
  ): Promise<void> => {
    let verdict: Verdict

    try {
      verdict = engine.evaluate({
        type: 'message',
        content: String(output.message ?? ''),
      })
    } catch {
      // Fail-open: engine error → allow silently
      return
    }

    if (!verdict.allow) {
      throw new Error(`🚫 ${verdict.message}`)
    }

    if (verdict.message) {
      await warn(verdict.message)
    }
  }
}
