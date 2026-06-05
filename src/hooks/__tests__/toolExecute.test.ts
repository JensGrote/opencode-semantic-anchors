import { describe, it, expect, vi } from 'vitest'
import { createToolExecuteHandler } from '../toolExecute.js'
import { RuleEngine } from '../../rules/engine.js'
import type { LoadedConfig } from '../../config/loader.js'

const defaultConfig: LoadedConfig = {
  contracts: [],
  baseContracts: [],
  profiles: [],
  roleProfiles: {},
  presets: {},
  settings: { maxOverrides: 3, stepConfirmationInterval: 0 },
}

describe('createToolExecuteHandler', () => {
  it('throws when engine verdict is BLOCK', async () => {
    const engine = new RuleEngine({
      ...defaultConfig,
      contracts: [{
        id: 'block-read',
        mode: 'BLOCK',
        description: 'No reading',
        triggers: [{ type: 'tool', pattern: 'read' }],
        maxOverrides: 3,
      }],
    })

    const warn = vi.fn()
    const handler = createToolExecuteHandler(engine, warn)

    await expect(
      handler({ tool: 'read', sessionID: 's1', callID: 'c1' }, { args: {} }),
    ).rejects.toThrow('Blocked')
  })

  it('logs warning when engine verdict is WARN', async () => {
    const engine = new RuleEngine({
      ...defaultConfig,
      contracts: [{
        id: 'warn-read',
        mode: 'WARN',
        description: 'Be careful reading',
        triggers: [{ type: 'tool', pattern: 'read' }],
        maxOverrides: 3,
      }],
    })

    const warn = vi.fn()
    const handler = createToolExecuteHandler(engine, warn)

    await handler({ tool: 'read', sessionID: 's1', callID: 'c1' }, { args: {} })

    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]![0]).toContain('Warning')
  })

  it('does not throw or log when verdict is ALLOW', async () => {
    const engine = new RuleEngine(defaultConfig)
    const warn = vi.fn()
    const handler = createToolExecuteHandler(engine, warn)

    await handler({ tool: 'read', sessionID: 's1', callID: 'c1' }, { args: {} })

    expect(warn).not.toHaveBeenCalled()
  })

  it('fails open when engine.evaluate throws', async () => {
    const brokenEngine = {
      evaluate: () => { throw new Error('Unexpected crash') },
      getState: () => ({ toolCallCount: 0, overrideCount: 0, maxOverrides: 3, role: 'default', lastConfirmation: null }),
      getActiveContracts: () => [],
      incrementOverride: () => 0,
      setRole: (_r: string) => {},
      reset: () => {},
      // Satisfy RuleEngine shape for TypeScript
      state: { toolCallCount: 0, overrideCount: 0, role: 'default' } as const,
      contracts: [],
      getActiveTriggers: () => [],
    } as unknown as RuleEngine
    const warn = vi.fn()
    const handler = createToolExecuteHandler(brokenEngine, warn)

    // Should not throw despite internal engine error
    await expect(
      handler({ tool: 'read', sessionID: 's1', callID: 'c1' }, { args: {} }),
    ).resolves.toBeUndefined()
  })
})
