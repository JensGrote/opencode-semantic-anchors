import type { StructuralCouplingContract, TriggerSpec } from '../config/schema.js'
import type { LoadedConfig } from '../config/loader.js'
import { AnchorMatcher } from './matcher.js'

export interface Verdict {
  allow: boolean
  contract: StructuralCouplingContract | null
  message: string
  overrideTool?: string
}

export interface ToolEvent {
  type: 'tool'
  toolName: string
  args?: Record<string, unknown>
}

export interface MessageEvent {
  type: 'message'
  content: string
}

export type RuleEngineEvent = ToolEvent | MessageEvent

export interface SessionState {
  role: string
  toolCallCount: number
  overrideCount: number
  maxOverrides: number
  lastConfirmation: Date | null
}

/**
 * Resolves contracts for a given role.
 * Used by RuleEngine to dynamically switch contract sets on role change.
 */
export type ContractResolver = (role: string) => StructuralCouplingContract[]

export class RuleEngine {
  private state: SessionState = {
    role: 'default',
    toolCallCount: 0,
    overrideCount: 0,
    maxOverrides: 3,
    lastConfirmation: null,
  }

  private contracts: StructuralCouplingContract[] = []
  private matcher = new AnchorMatcher()
  private stepConfirmationInterval: number = 3
  private contractResolver?: ContractResolver

  constructor(config: LoadedConfig, contractResolver?: ContractResolver) {
    // BLOCK contracts first so their triggers are checked before WARN contracts
    this.contracts = [
      ...config.contracts.filter((c) => c.mode === 'BLOCK'),
      ...config.contracts.filter((c) => c.mode !== 'BLOCK'),
    ]
    this.state.maxOverrides = config.settings.maxOverrides
    this.stepConfirmationInterval = config.settings.stepConfirmationInterval
    this.contractResolver = contractResolver
  }

  public evaluate(event: RuleEngineEvent): Verdict {
    // Step confirmation applies only to tool events
    if (event.type === 'tool') {
      this.state.toolCallCount++

      if (this.stepConfirmationInterval > 0 && this.state.toolCallCount % this.stepConfirmationInterval === 0) {
        return {
          allow: false,
          contract: null,
          message: 'Step confirmation required. Please confirm you want to proceed.',
        }
      }
    }

    // Match contracts
    let match: TriggerSpec | null = null

    if (event.type === 'tool') {
      match = this.matcher.match(event.toolName, this.getActiveTriggers())
    } else if (event.type === 'message') {
      match = this.matcher.matchMessage(event.content, this.getActiveTriggers())
    }

    if (!match) {
      return { allow: true, contract: null, message: '' }
    }

    // Source Anchor check: if trigger requires source, verify URL presence
    if (match.requireSource) {
      const hasUrl = this.containsUrl(event)
      if (hasUrl) {
        // Source requirement satisfied → allow without triggering contract
        return { allow: true, contract: null, message: '' }
      }
    }

    const matchedContract = this.contracts.find((c) =>
      c.triggers.some((t) => t === match),
    )

    if (!matchedContract) {
      return { allow: true, contract: null, message: '' }
    }

    // WARN mode
    if (matchedContract.mode === 'WARN') {
      return {
        allow: true,
        contract: matchedContract,
        message: `Warning: "${matchedContract.id}" — ${matchedContract.description}`,
      }
    }

    // BLOCK mode with override check
    if (this.state.overrideCount > 0) {
      this.state.overrideCount--
      return {
        allow: true,
        contract: matchedContract,
        message: `Override: "${matchedContract.id}" bypassed (${this.state.overrideCount} remaining)`,
      }
    }

    // BLOCK
    return {
      allow: false,
      contract: matchedContract,
      message: `Blocked: "${matchedContract.id}" — ${matchedContract.description}`,
    }
  }

  public setRole(role: string): void {
    this.state.role = role
    if (this.contractResolver) {
      const newContracts = this.contractResolver(role)
      this.contracts = [
        ...newContracts.filter((c) => c.mode === 'BLOCK'),
        ...newContracts.filter((c) => c.mode !== 'BLOCK'),
      ]
    }
  }

  public getState(): SessionState {
    return { ...this.state }
  }

  public getActiveContracts(): StructuralCouplingContract[] {
    return [...this.contracts]
  }

  public incrementOverride(): number {
    this.state.overrideCount++
    return this.state.overrideCount
  }

  public loadConfig(config: LoadedConfig): void {
    this.contracts = config.contracts
    this.state.maxOverrides = config.settings.maxOverrides
    this.stepConfirmationInterval = config.settings.stepConfirmationInterval
  }

  public reset(): void {
    this.state.toolCallCount = 0
    this.state.overrideCount = 0
    this.state.lastConfirmation = null
  }

  /**
   * Check if a message event contains a source URL.
   * For tool events, always returns false (source check is message-only for V1).
   */
  private containsUrl(event: RuleEngineEvent): boolean {
    if (event.type === 'tool') return false
    const urlRegex = /https?:\/\/[^\s]+/
    return urlRegex.test(event.content)
  }

  private getActiveTriggers() {
    return this.contracts.flatMap((c) => c.triggers)
  }
}
