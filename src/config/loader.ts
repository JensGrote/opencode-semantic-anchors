import { readFileSync, existsSync } from 'node:fs'
import * as yaml from 'js-yaml'
import { ConfigSchema, type Config, type StructuralCouplingContract } from './schema.js'
import { getProfileContracts, getRoleProfiles, ROLE_PROFILES } from '../rules/presets.js'

export interface LoadedConfig {
  /** Resolved contracts for the initial (default) role — backward compatible */
  contracts: StructuralCouplingContract[]
  /** User-defined contracts from YAML (always active, override profile-derived) */
  baseContracts: StructuralCouplingContract[]
  /** Top-level profile names (fallback for unmapped roles) */
  profiles: string[]
  /** Merged role→profile mapping (built-in defaults + user overrides) */
  roleProfiles: Record<string, string[]>
  /** Legacy presets section */
  presets: Record<string, string[]>
  settings: {
    maxOverrides: number
    stepConfirmationInterval: number
  }
}

const DEFAULT_CONFIG: LoadedConfig = {
  contracts: [],
  baseContracts: [],
  profiles: [],
  roleProfiles: {},
  presets: {},
  settings: {
    maxOverrides: 3,
    stepConfirmationInterval: 3,
  },
}

export class ConfigLoader {
  private config: LoadedConfig = { ...DEFAULT_CONFIG }
  private configPath: string

  constructor(configPath?: string) {
    this.configPath = configPath ?? process.cwd() + '/opencode-semantic-anchors.yaml'
  }

  public load(): LoadedConfig {
    try {
      if (!existsSync(this.configPath)) {
        return { ...DEFAULT_CONFIG }
      }

      const raw = readFileSync(this.configPath, 'utf-8')
      const parsed = yaml.load(raw)

      if (typeof parsed !== 'object' || parsed === null) {
        return { ...DEFAULT_CONFIG }
      }

      const validated: Config = ConfigSchema.parse(parsed)

      // Store user-defined contracts (always active)
      const baseContracts = validated.contracts
      const topLevelProfiles = validated.profiles ?? []

      // Merge roleProfiles: built-in ROLE_PROFILES + user overrides
      const userRoleProfiles = validated.roleProfiles ?? {}
      const mergedRoleProfiles: Record<string, string[]> = {}
      // Start with built-in defaults
      for (const [role, profiles] of Object.entries(ROLE_PROFILES)) {
        mergedRoleProfiles[role] = [...profiles]
      }
      // User overrides
      for (const [role, profiles] of Object.entries(userRoleProfiles)) {
        mergedRoleProfiles[role] = [...profiles]
      }

      // Resolve contracts for 'default' role (backward compat initial load)
      const defaultProfiles = getRoleProfiles('default', mergedRoleProfiles, topLevelProfiles)
      const defaultProfileContracts = getProfileContracts(defaultProfiles)

      // Merge: user contracts override profile contracts with the same ID
      const userIds = new Set(baseContracts.map((c) => c.id))
      const mergedContracts = [
        ...defaultProfileContracts.filter((c) => !userIds.has(c.id)),
        ...baseContracts,
      ]

      this.config = {
        contracts: mergedContracts,
        baseContracts,
        profiles: topLevelProfiles,
        roleProfiles: mergedRoleProfiles,
        presets: validated.presets ?? {},
        settings: {
          maxOverrides: validated.settings.maxOverrides,
          stepConfirmationInterval: validated.settings.stepConfirmationInterval,
        },
      }

      return { ...this.config }
    } catch {
      // Fail-open: log error, return defaults
      return { ...DEFAULT_CONFIG }
    }
  }

  public reload(): LoadedConfig {
    return this.load()
  }

  /**
   * Resolve active contracts for a specific role.
   *
   * Resolution order:
   * 1. Look up role→profiles in mergedRoleProfiles (user overrides + built-in)
   * 2. Fall back to top-level `profiles` field
   * 3. Resolve profiles to preset contracts
   * 4. Merge with base (user-defined) contracts — user contracts override profile contracts by ID
   */
  public getActiveContracts(role: string): StructuralCouplingContract[] {
    const profiles = getRoleProfiles(role, this.config.roleProfiles, this.config.profiles)
    const profileContracts = getProfileContracts(profiles)

    // Merge: user contracts override profile contracts with the same ID
    const userIds = new Set(this.config.baseContracts.map((c) => c.id))
    return [
      ...profileContracts.filter((c) => !userIds.has(c.id)),
      ...this.config.baseContracts,
    ]
  }
}
