import { describe, it, expect, vi } from 'vitest'
import { anchorStatusTool } from '../status.js'
import { RuleEngine } from '../../rules/engine.js'

describe('anchorStatusTool', () => {
  it('returns engine state and active contracts', async () => {
    const engine = new RuleEngine({
      contracts: [{
        id: 'file_write',
        mode: 'BLOCK',
        description: 'Block file writes',
        triggers: [{ type: 'tool', pattern: 'file_write' }],
        maxOverrides: 3,
      }],
      baseContracts: [],
      profiles: [],
      roleProfiles: {},
      presets: {},
      settings: { maxOverrides: 5, stepConfirmationInterval: 0 },
    })

    engine.evaluate({ type: 'tool', toolName: 'read' })
    engine.setRole('admin')
    engine.incrementOverride()

    const toolDef = anchorStatusTool(engine)
    const result = await toolDef.execute(
      {},
      { sessionID: 's1', messageID: 'm1', agent: 'user', directory: '/tmp', worktree: '/tmp', abort: new AbortController().signal, metadata: vi.fn() as any, ask: vi.fn() as any },
    )

    const output = result.toString()
    expect(output).toContain('admin')
    expect(output).toContain('5')
    expect(output).toContain('1') // overrideCount
    expect(output).toContain('file_write')
  })
})
