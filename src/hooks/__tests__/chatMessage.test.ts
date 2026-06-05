import { describe, it, expect, vi } from 'vitest'
import { createMessageHandler } from '../chatMessage.js'
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

describe('createMessageHandler', () => {
  it('throws when message matches BLOCK contract', async () => {
    const engine = new RuleEngine({
      ...defaultConfig,
      contracts: [{
        id: 'block-deploy',
        mode: 'BLOCK',
        description: 'No deploys without approval',
        triggers: [{ type: 'message', pattern: 'deploy' }],
        maxOverrides: 3,
      }],
    })

    const warn = vi.fn()
    const handler = createMessageHandler(engine, warn)

    await expect(
      handler(
        { sessionID: 's1' },
        { message: 'please deploy to production', parts: [] },
      ),
    ).rejects.toThrow('Blocked')
  })

  it('logs warning when message matches WARN contract', async () => {
    const engine = new RuleEngine({
      ...defaultConfig,
      contracts: [{
        id: 'warn-restart',
        mode: 'WARN',
        description: 'Restart may cause downtime',
        triggers: [{ type: 'message', pattern: 'restart' }],
        maxOverrides: 3,
      }],
    })

    const warn = vi.fn()
    const handler = createMessageHandler(engine, warn)

    await handler(
      { sessionID: 's1' },
      { message: 'should we restart the server?', parts: [] },
    )

    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]![0]).toContain('Warning')
  })

  it('does not throw or log when no contract matches', async () => {
    const engine = new RuleEngine(defaultConfig)
    const warn = vi.fn()
    const handler = createMessageHandler(engine, warn)

    await handler(
      { sessionID: 's1' },
      { message: 'hello world', parts: [] },
    )

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
      state: { toolCallCount: 0, overrideCount: 0, role: 'default' } as const,
      contracts: [],
      getActiveTriggers: () => [],
    } as unknown as RuleEngine
    const warn = vi.fn()
    const handler = createMessageHandler(brokenEngine, warn)

    await expect(
      handler(
        { sessionID: 's1' },
        { message: 'do something dangerous', parts: [] },
      ),
    ).resolves.toBeUndefined()
  })
})
