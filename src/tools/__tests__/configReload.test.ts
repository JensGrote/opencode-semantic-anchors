import { describe, it, expect, vi } from 'vitest'
import { anchorConfigReloadTool } from '../configReload.js'
import { RuleEngine } from '../../rules/engine.js'
import { ConfigLoader } from '../../config/loader.js'
import type { LoadedConfig } from '../../config/loader.js'

describe('anchorConfigReloadTool', () => {
  it('reloads config and loads it into engine', async () => {
    const newConfig: LoadedConfig = {
      contracts: [{
        id: 'reloaded',
        mode: 'BLOCK',
        description: 'After reload',
        triggers: [{ type: 'tool', pattern: 'reloaded' }],
        maxOverrides: 3,
      }],
      baseContracts: [],
      profiles: [],
      roleProfiles: {},
      presets: {},
      settings: { maxOverrides: 10, stepConfirmationInterval: 1 },
    }

    // Mock config loader
    const config = {
      reload: vi.fn(() => newConfig),
    } as unknown as ConfigLoader

    const engine = new RuleEngine({
      contracts: [],
      baseContracts: [],
      profiles: [],
      roleProfiles: {},
      presets: {},
      settings: { maxOverrides: 3, stepConfirmationInterval: 0 },
    })

    const loadConfigSpy = vi.spyOn(engine, 'loadConfig')
    const toolDef = anchorConfigReloadTool(config, engine)

    const result = await toolDef.execute(
      {},
      { sessionID: 's1', messageID: 'm1', agent: 'user', directory: '/tmp', worktree: '/tmp', abort: new AbortController().signal, metadata: vi.fn() as any, ask: vi.fn() as any },
    )

    expect(config.reload).toHaveBeenCalledTimes(1)
    expect(loadConfigSpy).toHaveBeenCalledWith(newConfig)
    expect(result.toString()).toContain('reloaded')
  })
})
