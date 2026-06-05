import type { RuleEngine, Verdict } from '../rules/engine.js'

/**
 * Minimal logger interface for WARN actions.
 */
export type WarnLogger = (message: string) => Promise<void>

export function createToolExecuteHandler(engine: RuleEngine, warn: WarnLogger) {
  return async (
    input: { tool: string; sessionID: string; callID: string },
    _output: { args: unknown },
  ): Promise<void> => {
    let verdict: Verdict

    try {
      verdict = engine.evaluate({ type: 'tool', toolName: input.tool })
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
