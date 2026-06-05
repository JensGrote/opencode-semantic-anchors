import type { TriggerSpec } from '../config/schema.js'

export class AnchorMatcher {
  public match(toolName: string, triggers: TriggerSpec[]): TriggerSpec | null {
    for (const trigger of triggers) {
      if (trigger.type !== 'tool') continue

      const pattern = trigger.pattern

      if (pattern === '*') {
        return trigger
      }

      if (pattern.endsWith('*')) {
        const prefix = pattern.slice(0, -1)
        if (toolName.startsWith(prefix)) {
          return trigger
        }
      }

      if (pattern === toolName) {
        return trigger
      }
    }

    return null
  }

  public matchMessage(content: string, triggers: TriggerSpec[]): TriggerSpec | null {
    const lowerContent = content.toLowerCase()

    for (const trigger of triggers) {
      if (trigger.type !== 'message') continue

      // Wildcard: matches any non-empty message
      if (trigger.pattern === '*') {
        if (lowerContent.length > 0) {
          return trigger
        }
        continue
      }

      if (lowerContent.includes(trigger.pattern.toLowerCase())) {
        return trigger
      }
    }

    return null
  }
}
