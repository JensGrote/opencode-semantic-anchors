import type { StructuralCouplingContract } from '../config/schema.js'

/**
 * Predefined contracts that ship with the plugin.
 * Users can override any preset by defining a contract with the same ID.
 */
export const PRESET_CONTRACTS: Record<string, StructuralCouplingContract> = {
  'source-anchor': {
    id: 'source-anchor',
    mode: 'WARN',
    description: 'Claims should cite a verifiable source URL',
    anchorRefs: ['source-anchor'],
    triggers: [{ type: 'message', pattern: '*', requireSource: true }],
    maxOverrides: 3,
  },
}

/**
 * Profile → contract ID mapping.
 * Each profile activates a set of preset contracts (and optionally built-in features).
 */
export const PROFILE_CONTRACTS: Record<string, string[]> = {
  socratic: ['source-anchor'],
  architecture: [],
}

/**
 * Resolve a list of profile names to their preset contracts.
 * Contracts are deduplicated by ID (later wins).
 */
export function getProfileContracts(profiles: string[]): StructuralCouplingContract[] {
  const seen = new Set<string>()
  const result: StructuralCouplingContract[] = []

  for (const profile of profiles) {
    const ids = PROFILE_CONTRACTS[profile]
    if (!ids) continue

    for (const id of ids) {
      const contract = PRESET_CONTRACTS[id]
      if (!contract) continue
      if (seen.has(id)) continue
      seen.add(id)
      result.push({ ...contract })
    }
  }

  return result
}

/**
 * Built-in role → profile mappings.
 *
 * NOTE: 'default' is intentionally absent from this map so that the
 * top-level `profiles` config field acts as the fallback for the
 * initial/unspecified role. Roles not listed here also fall back
 * to the top-level `profiles` field.
 */
export const ROLE_PROFILES: Record<string, string[]> = {
  'developer': ['socratic'],
  'architect': ['socratic', 'architecture'],
  'qa-engineer': ['socratic'],
  'devops-engineer': ['socratic'],
  'product-owner': [],
  'business-analyst': [],
  'technical-writer': ['socratic'],
  'ux-designer': [],
  'data-scientist': ['socratic'],
  'consultant': [],
  'team-lead': [],
  'educator': ['socratic'],
}

/**
 * Get the list of profile names for a given role.
 *
 * Resolution order:
 * 1. `userRoleProfiles[role]` — user-specified override (highest priority)
 * 2. `ROLE_PROFILES[role]` — built-in defaults
 * 3. `fallbackProfiles` — generic fallback (e.g., top-level `profiles` field from config)
 * 4. Empty array `[]` — no profiles
 */
export function getRoleProfiles(
  role: string,
  userRoleProfiles?: Record<string, string[]>,
  fallbackProfiles?: string[],
): string[] {
  // User override has highest priority (checked existence → safe assertion)
  if (userRoleProfiles && role in userRoleProfiles) {
    return userRoleProfiles[role]!
  }
  // Built-in defaults (checked existence → safe assertion)
  if (role in ROLE_PROFILES) {
    return ROLE_PROFILES[role]!
  }
  // Generic fallback
  if (fallbackProfiles && fallbackProfiles.length > 0) {
    return fallbackProfiles
  }
  return []
}

/**
 * Legacy role-based presets (used by presets: section in YAML).
 */
export const ROLE_PRESETS: Record<string, StructuralCouplingContract[]> = {
  'software-developer': [],
  'software-architect': [],
  'qa-engineer': [],
  'devops-engineer': [],
  'product-owner': [],
  'business-analyst': [],
  'technical-writer': [],
  'ux-designer': [],
  'data-scientist': [],
  'consultant': [],
  'team-lead': [],
  'educator': [],
}

/**
 * Get preset contracts for a given role (legacy).
 */
export function getPresetContracts(role: string): StructuralCouplingContract[] {
  return ROLE_PRESETS[role] ?? []
}
