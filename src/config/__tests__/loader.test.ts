import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { ConfigLoader } from '../loader.js'

const FIXTURE_DIR = join(import.meta.dirname, '..', '__fixtures__')
const VALID_CONFIG = join(FIXTURE_DIR, 'valid.yaml')
const INVALID_YAML = join(FIXTURE_DIR, 'invalid-syntax.yaml')
const INVALID_SCHEMA = join(FIXTURE_DIR, 'invalid-schema.yaml')
const NONEXISTENT = join(FIXTURE_DIR, 'nonexistent.yaml')

beforeEach(() => {
  mkdirSync(FIXTURE_DIR, { recursive: true })

  writeFileSync(VALID_CONFIG, `version: "1"
contracts:
  - id: step-confirmation
    mode: BLOCK
    description: "Ask for confirmation every N tool calls"
    triggers:
      - type: tool
        pattern: "*"
        count: 3
settings:
  maxOverrides: 5
  stepConfirmationInterval: 3
`)

  writeFileSync(INVALID_YAML, `version: "1"\ncontracts: [\n  invalid yaml...\n`)

  writeFileSync(INVALID_SCHEMA, `version: "1"
contracts:
  - id: "missing-mode"
    description: "Missing mode field"
    triggers:
      - type: tool
        pattern: "*"
`)
})

afterEach(() => {
  rmSync(FIXTURE_DIR, { recursive: true, force: true })
})

describe('ConfigLoader', () => {
  describe('load()', () => {
    it('loads and validates a valid YAML config', () => {
      const loader = new ConfigLoader(VALID_CONFIG)
      const config = loader.load()

      expect(config.contracts).toHaveLength(1)
      expect(config.contracts[0]!.id).toBe('step-confirmation')
      expect(config.contracts[0]!.mode).toBe('BLOCK')
      expect(config.settings.maxOverrides).toBe(5)
      expect(config.settings.stepConfirmationInterval).toBe(3)
    })

    it('returns default config when file does not exist', () => {
      const loader = new ConfigLoader(NONEXISTENT)
      const config = loader.load()

      expect(config.contracts).toHaveLength(0)
      expect(config.settings.maxOverrides).toBe(3)
      expect(config.settings.stepConfirmationInterval).toBe(3)
    })

    it('returns default config on invalid YAML syntax', () => {
      const loader = new ConfigLoader(INVALID_YAML)
      const config = loader.load()

      expect(config.contracts).toHaveLength(0)
      expect(config.settings.maxOverrides).toBe(3)
    })

    it('returns default config on Zod validation failure', () => {
      const loader = new ConfigLoader(INVALID_SCHEMA)
      const config = loader.load()

      expect(config.contracts).toHaveLength(0)
      expect(config.settings.maxOverrides).toBe(3)
    })
  })

  describe('reload()', () => {
    it('reloads config from file', () => {
      const loader = new ConfigLoader(VALID_CONFIG)
      const first = loader.load()
      expect(first.contracts).toHaveLength(1)

      const second = loader.reload()
      expect(second.contracts).toHaveLength(1)
    })
  })

  describe('getActiveContracts()', () => {
    it('returns base contracts for unknown role (fallback to top-level profiles)', () => {
      const loader = new ConfigLoader(VALID_CONFIG)
      loader.load()

      // unknown-role has no role-specific profiles; falls back to top-level profiles (empty)
      // Base contracts (user-defined in VALID_CONFIG) are always returned
      const contracts = loader.getActiveContracts('unknown-role')
      expect(contracts).toHaveLength(1)
      expect(contracts[0]!.id).toBe('step-confirmation')
    })

    it('has different contracts for developer role (built-in ROLE_PROFILES)', () => {
      // VALID_CONFIG has no profiles or roleProfiles, just 1 base contract
      const loader = new ConfigLoader(VALID_CONFIG)
      loader.load()

      const contracts = loader.getActiveContracts('developer')
      // developer role has ['socratic'] from built-in → adds source-anchor
      // + base contract step-confirmation
      const ids = contracts.map((c) => c.id)
      expect(ids).toContain('step-confirmation')
      expect(ids).toContain('source-anchor')
      expect(contracts).toHaveLength(2)
    })
  })

  describe('profile resolution', () => {
    it('resolves socratic profile to source-anchor contract', () => {
      writeFileSync(VALID_CONFIG, `version: "1"
profiles:
  - socratic
contracts: []
settings:
  maxOverrides: 3
  stepConfirmationInterval: 0
`)
      const loader = new ConfigLoader(VALID_CONFIG)
      const config = loader.load()

      expect(config.profiles).toContain('socratic')
      expect(config.contracts).toHaveLength(1)
      expect(config.contracts[0]!.id).toBe('source-anchor')
      expect(config.contracts[0]!.mode).toBe('WARN')
    })

    it('user contract overrides profile contract with same ID', () => {
      writeFileSync(VALID_CONFIG, `version: "1"
profiles:
  - socratic
contracts:
  - id: source-anchor
    mode: BLOCK
    description: "Override: strict source requirement"
    triggers:
      - type: message
        pattern: ""
        requireSource: true
    maxOverrides: 1
settings:
  maxOverrides: 3
  stepConfirmationInterval: 0
`)
      const loader = new ConfigLoader(VALID_CONFIG)
      const config = loader.load()

      expect(config.contracts).toHaveLength(1)
      expect(config.contracts[0]!.id).toBe('source-anchor')
      expect(config.contracts[0]!.mode).toBe('BLOCK') // overridden
      expect(config.contracts[0]!.description).toContain('Override')
    })

    it('unknown profile is silently ignored', () => {
      writeFileSync(VALID_CONFIG, `version: "1"
profiles:
  - nonexistent-profile
contracts: []
settings:
  maxOverrides: 3
  stepConfirmationInterval: 0
`)
      const loader = new ConfigLoader(VALID_CONFIG)
      const config = loader.load()

      expect(config.profiles).toContain('nonexistent-profile')
      expect(config.contracts).toHaveLength(0)
    })

    it('no profiles results in empty profile contracts', () => {
      const loader = new ConfigLoader(VALID_CONFIG)
      const config = loader.load()

      expect(config.profiles).toEqual([])
    })
  })

  describe('roleProfiles', () => {
    it('loads roleProfiles from config', () => {
      writeFileSync(VALID_CONFIG, `version: "1"
roleProfiles:
  developer:
    - socratic
contracts: []
settings:
  maxOverrides: 3
  stepConfirmationInterval: 0
`)
      const loader = new ConfigLoader(VALID_CONFIG)
      const config = loader.load()

      expect(config.roleProfiles.developer).toEqual(['socratic'])
    })

    it('user roleProfiles override built-in ROLE_PROFILES', () => {
      writeFileSync(VALID_CONFIG, `version: "1"
roleProfiles:
  developer: []
contracts: []
settings:
  maxOverrides: 3
  stepConfirmationInterval: 0
`)
      const loader = new ConfigLoader(VALID_CONFIG)
      const config = loader.load()

      // User explicitly set developer to empty → overrides built-in ['socratic']
      expect(config.roleProfiles.developer).toEqual([])
    })

    it('getActiveContracts uses roleProfiles for role-specific resolution', () => {
      writeFileSync(VALID_CONFIG, `version: "1"
profiles:
  - socratic
roleProfiles:
  developer:
    - architecture
contracts: []
settings:
  maxOverrides: 3
  stepConfirmationInterval: 0
`)
      const loader = new ConfigLoader(VALID_CONFIG)
      loader.load()

      // developer has roleProfiles → ['architecture'] (even though top-level has socratic)
      const devContracts = loader.getActiveContracts('developer')
      expect(devContracts).toHaveLength(0) // architecture profile has no contracts yet

      // default role falls back to top-level profiles → socratic
      const defaultContracts = loader.getActiveContracts('default')
      expect(defaultContracts).toHaveLength(1)
      expect(defaultContracts[0]!.id).toBe('source-anchor')

      // unknown role also falls back to top-level profiles
      const unknownContracts = loader.getActiveContracts('unknown')
      expect(unknownContracts).toHaveLength(1)
      expect(unknownContracts[0]!.id).toBe('source-anchor')
    })

    it('getActiveContracts for architect role includes architecture profile', () => {
      writeFileSync(VALID_CONFIG, `version: "1"
contracts: []
settings:
  maxOverrides: 3
  stepConfirmationInterval: 0
`)
      const loader = new ConfigLoader(VALID_CONFIG)
      loader.load()

      // architect has built-in ROLE_PROFILES → ['socratic', 'architecture']
      const contracts = loader.getActiveContracts('architect')
      const ids = contracts.map((c) => c.id)
      // architecture profile has no contracts yet, but socratic provides source-anchor
      expect(ids).toContain('source-anchor')
    })
  })
})
