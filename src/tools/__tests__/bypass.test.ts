import { describe, it, expect, vi } from 'vitest'
import { anchorBypassTool } from '../bypass.js'
import { RuleEngine } from '../../rules/engine.js'

describe('anchorBypassTool', () => {
  it('increments override count and returns confirmation', async () => {
    const engine = new RuleEngine({
      contracts: [],
      baseContracts: [],
      profiles: [],
      roleProfiles: {},
      presets: {},
      settings: { maxOverrides: 3, stepConfirmationInterval: 0 },
    })

    const incrementSpy = vi.spyOn(engine, 'incrementOverride')
    const toolDef = anchorBypassTool(engine)

    const result = await toolDef.execute(
      { reason: 'Need to deploy urgently' },
      { sessionID: 's1', messageID: 'm1', agent: 'user', directory: '/tmp', worktree: '/tmp', abort: new AbortController().signal, metadata: vi.fn() as any, ask: vi.fn() as any },
    )

    expect(incrementSpy).toHaveBeenCalledTimes(1)
    expect(result.toString()).toContain('bypass')
    expect(result.toString()).toContain('Need to deploy urgently')
  })
})
