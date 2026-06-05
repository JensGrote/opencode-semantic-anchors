/**
 * Integration test: Config → Engine → Hook → Tool pipeline.
 *
 * Loads a real YAML fixture, wires everything up, and exercises
 * the full flow without mocking the core modules.
 */
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { join } from 'node:path'
import { ConfigLoader } from '../config/loader.js'
import { RuleEngine } from '../rules/engine.js'
import { createToolExecuteHandler } from '../hooks/toolExecute.js'
import { createMessageHandler } from '../hooks/chatMessage.js'
import { anchorBypassTool } from '../tools/bypass.js'
import { anchorStatusTool } from '../tools/status.js'
import { anchorConfigReloadTool } from '../tools/configReload.js'

const FIXTURE_PATH = join(process.cwd(), 'src/__tests__/fixtures/test-config.yaml')

describe('Integration: Config → Engine → Hooks → Tools', () => {
  let config: ConfigLoader
  let engine: RuleEngine
  let warn: ReturnType<typeof vi.fn>
  let toolExecuteHandler: ReturnType<typeof createToolExecuteHandler>
  let messageHandler: ReturnType<typeof createMessageHandler>

  beforeAll(() => {
    // Bootstrap from real YAML
    config = new ConfigLoader(FIXTURE_PATH)
    const loaded = config.load()
    engine = new RuleEngine(loaded)
    warn = vi.fn()
    toolExecuteHandler = createToolExecuteHandler(engine, warn)
    messageHandler = createMessageHandler(engine, warn)
  })

  describe('Config loading', () => {
    it('loads contracts from YAML fixture (4 user + 1 from socratic profile)', () => {
      // 4 user-defined contracts + 1 from socratic profile (source-anchor)
      expect(engine.getActiveContracts()).toHaveLength(5)
    })

    it('parses settings correctly', () => {
      const state = engine.getState()
      expect(state.maxOverrides).toBe(5)
    })

    it('parses presets and profiles', () => {
      // Verify the engine has all expected contracts
      const contracts = engine.getActiveContracts()
      const contractIds = contracts.map((c) => c.id)
      expect(contractIds).toContain('block-dangerous-tools')
      expect(contractIds).toContain('warn-git-operations')
      // source-anchor comes from the socratic profile
      expect(contractIds).toContain('source-anchor')
    })
  })

  describe('Tool pipeline', () => {
    it('BLOCK: tool.execute.before throws for matched tool', async () => {
      await expect(
        toolExecuteHandler(
          { tool: 'file_write', sessionID: 's1', callID: 'c1' },
          { args: {} },
        ),
      ).rejects.toThrow('Blocked')
    })

    it('WARN: tool.execute.before logs warning for matched WARN contract', async () => {
      warn.mockClear()
      await toolExecuteHandler(
        { tool: 'git_commit', sessionID: 's1', callID: 'c2' },
        { args: {} },
      )
      expect(warn).toHaveBeenCalledOnce()
      expect(warn.mock.calls[0]![0]).toContain('Warning')
    })

    it('ALLOW: tool.execute.before does nothing for unmatched tool', async () => {
      warn.mockClear()
      await toolExecuteHandler(
        { tool: 'file_read', sessionID: 's1', callID: 'c3' },
        { args: {} },
      )
      expect(warn).not.toHaveBeenCalled()
    })

    it('BLOCK tool consumes an override when overrides are available', async () => {
      warn.mockClear()
      engine.reset()

      // Make 2 allowed calls first so file_write is call #3 (3 % 4 !== 0, no step confirmation)
      for (let i = 0; i < 2; i++) {
        await toolExecuteHandler(
          { tool: 'file_read', sessionID: 's1', callID: `c-pre-${i}` },
          { args: {} },
        )
      }

      // Grant an override
      engine.incrementOverride()

      // 3rd call: file_write → override consumed, logged, NOT thrown
      await toolExecuteHandler(
        { tool: 'file_write', sessionID: 's1', callID: 'c-override' },
        { args: {} },
      )
      expect(warn).toHaveBeenCalledOnce()
      expect(warn.mock.calls[0]![0]).toContain('Override')
    })

    it('Step confirmation blocks every 4th tool call', () => {
      engine.reset()
      // Check step confirmation in isolation: create a fresh engine with interval=4
      // The step confirmation check happens inside engine.evaluate, not in the handler
      // So we test against the engine directly
      const freshEngine = new RuleEngine({
        contracts: [],
        baseContracts: [],
        profiles: [],
        roleProfiles: {},
        presets: {},
        settings: { maxOverrides: 5, stepConfirmationInterval: 4 },
      })

      // call 1-3: allowed
      for (let i = 0; i < 3; i++) {
        expect(freshEngine.evaluate({ type: 'tool', toolName: 'any' }).allow).toBe(true)
      }
      // call 4: blocked by step confirmation
      expect(freshEngine.evaluate({ type: 'tool', toolName: 'any' }).allow).toBe(false)
    })
  })

  describe('Message pipeline', () => {
    it('BLOCK: chat.message throws for matched message contract', async () => {
      await expect(
        messageHandler(
          { sessionID: 's1' },
          { message: 'i want to deploy to production now', parts: [] },
        ),
      ).rejects.toThrow('Blocked')
    })

    it('WARN: chat.message logs for matched WARN message contract', async () => {
      warn.mockClear()
      await messageHandler(
        { sessionID: 's1' },
        { message: 'should we restart the database?', parts: [] },
      )
      expect(warn).toHaveBeenCalledOnce()
      expect(warn.mock.calls[0]![0]).toContain('Warning')
    })

    it('ALLOW: chat.message with URL does not trigger source-anchor', async () => {
      warn.mockClear()
      await messageHandler(
        { sessionID: 's1' },
        { message: 'According to https://example.com this is verified', parts: [] },
      )
      // URL present → source requirement satisfied → no WARN
      expect(warn).not.toHaveBeenCalled()
    })

    it('ALLOW: chat.message passes through for unmatched user message', async () => {
      // Note: the socratic profile's source-anchor contract (WARN, pattern: '*')
      // matches every message without a URL, so warn IS called for 'hello world'
      // This is expected behavior — source-anchor is a universal reminder.
      warn.mockClear()
      await messageHandler(
        { sessionID: 's1' },
        { message: 'hello world', parts: [] },
      )
      // Message is allowed (not blocked) but warn is called for source-anchor
      expect(warn).toHaveBeenCalledOnce()
      expect(warn.mock.calls[0]![0]).toContain('source-anchor')
    })
  })

  describe('Custom tools', () => {
    it('anchor-bypass grants an override', async () => {
      const bypassTool = anchorBypassTool(engine)
      const result = await bypassTool.execute(
        { reason: 'emergency fix' },
        { sessionID: 's1', messageID: 'm1', agent: 'user', directory: '/tmp', worktree: '/tmp', abort: new AbortController().signal, metadata: vi.fn() as any, ask: vi.fn() as any },
      )
      expect(result.toString()).toContain('bypass')
      // After bypass, a blocked tool should be allowed
      warn.mockClear()
      await toolExecuteHandler(
        { tool: 'deploy', sessionID: 's1', callID: 'c-bypass' },
        { args: {} },
      )
      expect(warn).toHaveBeenCalledOnce()
      expect(warn.mock.calls[0]![0]).toContain('Override')
    })

    it('anchor-status returns formatted state', async () => {
      const statusTool = anchorStatusTool(engine)
      const result = await statusTool.execute(
        {},
        { sessionID: 's1', messageID: 'm1', agent: 'user', directory: '/tmp', worktree: '/tmp', abort: new AbortController().signal, metadata: vi.fn() as any, ask: vi.fn() as any },
      )
      const output = result.toString()
      expect(output).toContain('Active contracts')
      expect(output).toContain('block-dangerous-tools')
      expect(output).toContain('warn-git-operations')
    })

    it('anchor-config-reload reloads config and updates engine', async () => {
      const reloadTool = anchorConfigReloadTool(config, engine)
      const result = await reloadTool.execute(
        {},
        { sessionID: 's1', messageID: 'm1', agent: 'user', directory: '/tmp', worktree: '/tmp', abort: new AbortController().signal, metadata: vi.fn() as any, ask: vi.fn() as any },
      )
      expect(result.toString()).toContain('reloaded')
      // Engine should still have the same contracts after reload (from same fixture)
      expect(engine.getActiveContracts()).toHaveLength(5)
    })
  })
})
