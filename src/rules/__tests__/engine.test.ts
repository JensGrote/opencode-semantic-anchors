import { describe, it, expect } from 'vitest'
import { RuleEngine } from '../engine.js'
import type { LoadedConfig } from '../../config/loader.js'
import type { StructuralCouplingContract } from '../../config/schema.js'
import type { ContractResolver } from '../engine.js'

function makeConfig(overrides?: Partial<LoadedConfig>): LoadedConfig {
  return {
    contracts: [],
    baseContracts: [],
    profiles: [],
    roleProfiles: {},
    presets: {},
    settings: {
      maxOverrides: 3,
      stepConfirmationInterval: 3,
    },
    ...overrides,
  }
}

function contract(id: string, overrides?: Partial<StructuralCouplingContract>): StructuralCouplingContract {
  return {
    id,
    mode: 'BLOCK',
    description: `Contract: ${id}`,
    triggers: [{ type: 'tool', pattern: id }],
    maxOverrides: 3,
    ...overrides,
  }
}

describe('RuleEngine', () => {
  describe('evaluate() — no contracts', () => {
    it('allows all tools when no contracts are configured', () => {
      const engine = new RuleEngine(makeConfig())
      const verdict = engine.evaluate({ type: 'tool', toolName: 'file_write' })
      expect(verdict.allow).toBe(true)
      expect(verdict.contract).toBeNull()
      expect(verdict.message).toBe('')
    })
  })

  describe('evaluate() — BLOCK mode', () => {
    it('blocks a tool matching a BLOCK contract', () => {
      const cfg = makeConfig({ contracts: [contract('file_write')] })
      const engine = new RuleEngine(cfg)
      const verdict = engine.evaluate({ type: 'tool', toolName: 'file_write' })
      expect(verdict.allow).toBe(false)
      expect(verdict.contract?.id).toBe('file_write')
      expect(verdict.message).toContain('Blocked')
    })

    it('allows a tool that does not match any contract', () => {
      const cfg = makeConfig({ contracts: [contract('file_write')] })
      const engine = new RuleEngine(cfg)
      const verdict = engine.evaluate({ type: 'tool', toolName: 'git_commit' })
      expect(verdict.allow).toBe(true)
      expect(verdict.contract).toBeNull()
    })

    it('first matching contract wins (priority order)', () => {
      const cfg = makeConfig({
        contracts: [
          contract('file_*', { triggers: [{ type: 'tool', pattern: 'file_*' }] }),
          contract('file_write', { triggers: [{ type: 'tool', pattern: 'file_write' }] }),
        ],
      })
      const engine = new RuleEngine(cfg)
      // file_* matches first → blocked
      const verdict = engine.evaluate({ type: 'tool', toolName: 'file_write' })
      expect(verdict.allow).toBe(false)
      expect(verdict.contract?.id).toBe('file_*')
    })

    it('matches wildcard contract to any tool', () => {
      const cfg = makeConfig({
        contracts: [contract('catch-all', { triggers: [{ type: 'tool', pattern: '*' }] })],
      })
      const engine = new RuleEngine(cfg)
      expect(engine.evaluate({ type: 'tool', toolName: 'anything' }).allow).toBe(false)
    })
  })

  describe('evaluate() — WARN mode', () => {
    it('allows tool but returns warning message for WARN contracts', () => {
      const cfg = makeConfig({
        contracts: [contract('file_write', { mode: 'WARN' })],
      })
      const engine = new RuleEngine(cfg)
      const verdict = engine.evaluate({ type: 'tool', toolName: 'file_write' })
      expect(verdict.allow).toBe(true)
      expect(verdict.contract?.id).toBe('file_write')
      expect(verdict.message).toBeTruthy()
    })
  })

  describe('Step Confirmation', () => {
    it('blocks every N tool calls when step confirmation is active', () => {
      const cfg = makeConfig({ settings: { maxOverrides: 3, stepConfirmationInterval: 3 } })
      const engine = new RuleEngine(cfg)

      // First 2 calls → allowed
      expect(engine.evaluate({ type: 'tool', toolName: 'file_read' }).allow).toBe(true)
      expect(engine.evaluate({ type: 'tool', toolName: 'file_read' }).allow).toBe(true)

      // 3rd call → blocked by step confirmation
      const verdict = engine.evaluate({ type: 'tool', toolName: 'file_read' })
      expect(verdict.allow).toBe(false)
      expect(verdict.message).toContain('confirmation')
    })

    it('resets step confirmation counter on reset()', () => {
      const cfg = makeConfig({ settings: { maxOverrides: 3, stepConfirmationInterval: 2 } })
      const engine = new RuleEngine(cfg)

      expect(engine.evaluate({ type: 'tool', toolName: 'read' }).allow).toBe(true)
      // 2nd call → blocked
      expect(engine.evaluate({ type: 'tool', toolName: 'read' }).allow).toBe(false)

      engine.reset()

      // After reset, counter starts again
      expect(engine.evaluate({ type: 'tool', toolName: 'read' }).allow).toBe(true)
    })

    it('step confirmation interval of 0 disables step confirmation', () => {
      const cfg = makeConfig({ settings: { maxOverrides: 3, stepConfirmationInterval: 0 } })
      const engine = new RuleEngine(cfg)

      for (let i = 0; i < 10; i++) {
        expect(engine.evaluate({ type: 'tool', toolName: 'any' }).allow).toBe(true)
      }
    })
  })

  describe('Bypass / Override', () => {
    it('bypass increments override count and allows next call', () => {
      const cfg = makeConfig({
        contracts: [contract('blocked_tool')],
        settings: { maxOverrides: 3, stepConfirmationInterval: 0 },
      })
      const engine = new RuleEngine(cfg)

      // First call → blocked
      expect(engine.evaluate({ type: 'tool', toolName: 'blocked_tool' }).allow).toBe(false)

      // Bypass
      expect(engine.incrementOverride()).toBe(1)

      // Next call → allowed (override active)
      expect(engine.evaluate({ type: 'tool', toolName: 'blocked_tool' }).allow).toBe(true)
    })

    it('blocks again after max overrides are exhausted', () => {
      const cfg = makeConfig({
        contracts: [contract('blocked_tool')],
        settings: { maxOverrides: 2, stepConfirmationInterval: 0 },
      })
      const engine = new RuleEngine(cfg)

      engine.incrementOverride() // 1
      engine.incrementOverride() // 2

      // 2 overrides = 2 free passes
      expect(engine.evaluate({ type: 'tool', toolName: 'blocked_tool' }).allow).toBe(true)
      expect(engine.evaluate({ type: 'tool', toolName: 'blocked_tool' }).allow).toBe(true)

      // 3rd attempt → no overrides left → blocked
      expect(engine.evaluate({ type: 'tool', toolName: 'blocked_tool' }).allow).toBe(false)
    })
  })

  describe('evaluate() — message events', () => {
    it('blocks a message matching a BLOCK message contract', () => {
      const cfg = makeConfig({
        contracts: [contract('deploy-block', {
          mode: 'BLOCK',
          triggers: [{ type: 'message', pattern: 'deploy' }],
        })],
        settings: { maxOverrides: 3, stepConfirmationInterval: 0 },
      })
      const engine = new RuleEngine(cfg)
      const verdict = engine.evaluate({ type: 'message', content: 'please deploy to production' })
      expect(verdict.allow).toBe(false)
      expect(verdict.contract?.id).toBe('deploy-block')
      expect(verdict.message).toContain('Blocked')
    })

    it('warns on a message matching a WARN message contract', () => {
      const cfg = makeConfig({
        contracts: [contract('restart-warn', {
          mode: 'WARN',
          triggers: [{ type: 'message', pattern: 'restart' }],
        })],
        settings: { maxOverrides: 3, stepConfirmationInterval: 0 },
      })
      const engine = new RuleEngine(cfg)
      const verdict = engine.evaluate({ type: 'message', content: 'should we restart?' })
      expect(verdict.allow).toBe(true)
      expect(verdict.contract?.id).toBe('restart-warn')
      expect(verdict.message).toContain('Warning')
    })

    it('allows a message that matches no contract', () => {
      const cfg = makeConfig({
        contracts: [contract('deploy-block', {
          mode: 'BLOCK',
          triggers: [{ type: 'message', pattern: 'deploy' }],
        })],
        settings: { maxOverrides: 3, stepConfirmationInterval: 0 },
      })
      const engine = new RuleEngine(cfg)
      const verdict = engine.evaluate({ type: 'message', content: 'hello world' })
      expect(verdict.allow).toBe(true)
      expect(verdict.contract).toBeNull()
    })

    it('does not apply step confirmation to message events', () => {
      const cfg = makeConfig({
        settings: { maxOverrides: 3, stepConfirmationInterval: 2 },
      })
      const engine = new RuleEngine(cfg)
      // Many messages — none should be blocked by step confirmation
      for (let i = 0; i < 10; i++) {
        expect(engine.evaluate({ type: 'message', content: 'hello' }).allow).toBe(true)
      }
    })
  })

  describe('requireSource (Source Anchor Enforcement)', () => {
    it('warns when message without URL matches requireSource trigger', () => {
      const cfg = makeConfig({
        contracts: [contract('source-anchor', {
          mode: 'WARN',
          triggers: [{ type: 'message', pattern: '', requireSource: true }],
        })],
        settings: { maxOverrides: 3, stepConfirmationInterval: 0 },
      })
      const engine = new RuleEngine(cfg)
      const verdict = engine.evaluate({ type: 'message', content: 'This is a claim without a source.' })
      expect(verdict.allow).toBe(true)
      expect(verdict.contract?.id).toBe('source-anchor')
      expect(verdict.message).toContain('Warning')
    })

    it('allows message with URL even when requireSource trigger matches', () => {
      const cfg = makeConfig({
        contracts: [contract('source-anchor', {
          mode: 'WARN',
          triggers: [{ type: 'message', pattern: '', requireSource: true }],
        })],
        settings: { maxOverrides: 3, stepConfirmationInterval: 0 },
      })
      const engine = new RuleEngine(cfg)
      const verdict = engine.evaluate({ type: 'message', content: 'According to https://example.com/source this is verified.' })
      expect(verdict.allow).toBe(true)
      expect(verdict.contract).toBeNull()
    })

    it('blocks message without URL when requireSource trigger is in BLOCK mode', () => {
      const cfg = makeConfig({
        contracts: [contract('source-anchor', {
          mode: 'BLOCK',
          triggers: [{ type: 'message', pattern: '', requireSource: true }],
        })],
        settings: { maxOverrides: 3, stepConfirmationInterval: 0 },
      })
      const engine = new RuleEngine(cfg)
      const verdict = engine.evaluate({ type: 'message', content: 'Unverified claim here.' })
      expect(verdict.allow).toBe(false)
      expect(verdict.contract?.id).toBe('source-anchor')
    })

    it('ignores requireSource for tool events (always triggers)', () => {
      const cfg = makeConfig({
        contracts: [contract('tool-source', {
          mode: 'WARN',
          triggers: [{ type: 'tool', pattern: 'file_read', requireSource: true }],
        })],
        settings: { maxOverrides: 3, stepConfirmationInterval: 0 },
      })
      const engine = new RuleEngine(cfg)
      // Tool events always trigger (source check is message-only for V1)
      const verdict = engine.evaluate({ type: 'tool', toolName: 'file_read' })
      expect(verdict.allow).toBe(true)
      expect(verdict.contract?.id).toBe('tool-source')
    })

    it('does not affect messages that do not match any trigger', () => {
      const cfg = makeConfig({
        contracts: [contract('source-anchor', {
          mode: 'WARN',
          triggers: [{ type: 'message', pattern: 'specific-keyword', requireSource: true }],
        })],
        settings: { maxOverrides: 3, stepConfirmationInterval: 0 },
      })
      const engine = new RuleEngine(cfg)
      const verdict = engine.evaluate({ type: 'message', content: 'Some random text without keyword.' })
      expect(verdict.allow).toBe(true)
      expect(verdict.contract).toBeNull()
    })
  })

  describe('getState()', () => {
    it('returns current session state', () => {
      const engine = new RuleEngine(makeConfig())
      engine.evaluate({ type: 'tool', toolName: 'a' })
      engine.evaluate({ type: 'tool', toolName: 'b' })

      const state = engine.getState()
      expect(state.toolCallCount).toBe(2)
      expect(state.overrideCount).toBe(0)
      expect(state.role).toBe('default')
    })

    it('returns a copy, not a reference', () => {
      const engine = new RuleEngine(makeConfig())
      const state = engine.getState()
      state.toolCallCount = 999
      expect(engine.getState().toolCallCount).toBe(0)
    })
  })

  describe('setRole()', () => {
    it('updates the role in session state', () => {
      const engine = new RuleEngine(makeConfig())
      engine.setRole('software-architect')
      expect(engine.getState().role).toBe('software-architect')
    })

    it('does not reload contracts when no ContractResolver is provided', () => {
      const cfg = makeConfig({ contracts: [contract('initial-contract')] })
      const engine = new RuleEngine(cfg)
      expect(engine.getActiveContracts()).toHaveLength(1)

      // setRole alone does not reload contracts without a resolver
      engine.setRole('developer')
      expect(engine.getActiveContracts()).toHaveLength(1)
    })

    it('reloads contracts via ContractResolver when setRole is called', () => {
      const baseContracts = [contract('tool-a', { triggers: [{ type: 'tool', pattern: 'tool_a' }] })]
      const developerContracts = [contract('dev-only', { triggers: [{ type: 'tool', pattern: 'dev_tool' }] })]

      const resolver: ContractResolver = (role) => {
        if (role === 'developer') return [...developerContracts, ...baseContracts]
        return baseContracts
      }

      const cfg = makeConfig({ contracts: baseContracts })
      const engine = new RuleEngine(cfg, resolver)

      // Initially has base contracts (role is 'default')
      expect(engine.getActiveContracts()).toHaveLength(1)
      expect(engine.getActiveContracts()[0]!.id).toBe('tool-a')

      // Switch to developer → resolver adds dev-only contracts
      engine.setRole('developer')
      expect(engine.getActiveContracts()).toHaveLength(2)
      const ids = engine.getActiveContracts().map((c) => c.id)
      expect(ids).toContain('dev-only')
      expect(ids).toContain('tool-a')
    })

    it('reloads contracts back when role switches to default', () => {
      const baseContracts = [contract('base-tool')]
      const enhanced = [contract('extra-tool')]

      const resolver: ContractResolver = (role) => {
        if (role === 'architect') return [...baseContracts, ...enhanced]
        return baseContracts
      }

      const cfg = makeConfig({ contracts: baseContracts })
      const engine = new RuleEngine(cfg, resolver)

      // Start with base
      expect(engine.getActiveContracts()).toHaveLength(1)

      // Switch to architect → enhanced
      engine.setRole('architect')
      expect(engine.getActiveContracts()).toHaveLength(2)

      // Switch back
      engine.setRole('default')
      expect(engine.getActiveContracts()).toHaveLength(1)
    })

    it('BLOCK contracts have priority regardless of resolver order', () => {
      const resolver: ContractResolver = () => [
        contract('warn-contract', { mode: 'WARN' }),
        contract('block-contract', { mode: 'BLOCK' }),
      ]

      const cfg = makeConfig()
      const engine = new RuleEngine(cfg, resolver)
      engine.setRole('any-role')

      // BLOCK contracts should be processed first
      const contracts = engine.getActiveContracts()
      const blockIdx = contracts.findIndex((c) => c.mode === 'BLOCK')
      const warnIdx = contracts.findIndex((c) => c.mode === 'WARN')
      expect(blockIdx).toBeLessThan(warnIdx)
    })
  })
})
