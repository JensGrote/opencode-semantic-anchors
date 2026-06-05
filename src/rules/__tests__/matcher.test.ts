import { describe, it, expect } from 'vitest'
import { AnchorMatcher } from '../matcher.js'
import type { TriggerSpec } from '../../config/schema.js'

describe('AnchorMatcher', () => {
  const matcher = new AnchorMatcher()

  describe('match() — tool name matching', () => {
    it('matches exact tool name', () => {
      const triggers: TriggerSpec[] = [
        { type: 'tool', pattern: 'file_write' },
      ]
      expect(matcher.match('file_write', triggers)).toBe(triggers[0])
    })

    it('does not match different tool name', () => {
      const triggers: TriggerSpec[] = [
        { type: 'tool', pattern: 'file_read' },
      ]
      expect(matcher.match('file_write', triggers)).toBeNull()
    })

    it('matches wildcard * to any tool', () => {
      const triggers: TriggerSpec[] = [
        { type: 'tool', pattern: '*' },
      ]
      expect(matcher.match('any_tool_name', triggers)).toBe(triggers[0])
    })

    it('matches wildcard * to empty string', () => {
      const triggers: TriggerSpec[] = [
        { type: 'tool', pattern: '*' },
      ]
      expect(matcher.match('', triggers)).toBe(triggers[0])
    })

    it('matches prefix pattern', () => {
      const triggers: TriggerSpec[] = [
        { type: 'tool', pattern: 'file_*' },
      ]
      expect(matcher.match('file_write', triggers)).toBe(triggers[0])
      expect(matcher.match('file_read', triggers)).toBe(triggers[0])
      expect(matcher.match('folder_delete', triggers)).toBeNull()
    })

    it('returns first matching trigger on multiple triggers', () => {
      const triggers: TriggerSpec[] = [
        { type: 'tool', pattern: 'git_*' },
        { type: 'tool', pattern: 'file_*' },
        { type: 'tool', pattern: '*' },
      ]
      // First match wins
      expect(matcher.match('git_commit', triggers)).toBe(triggers[0])
      expect(matcher.match('file_write', triggers)).toBe(triggers[1])
      // Falls through to wildcard if nothing else matches
      expect(matcher.match('unknown_tool', triggers)).toBe(triggers[2])
    })

    it('returns null on empty trigger list', () => {
      expect(matcher.match('any_tool', [])).toBeNull()
    })

    it('only matches tool-type triggers', () => {
      const triggers: TriggerSpec[] = [
        { type: 'message', pattern: 'hello' },
        { type: 'state', pattern: 'test' },
      ]
      expect(matcher.match('hello', triggers)).toBeNull()
    })
  })

  describe('matchMessage() — message content matching', () => {
    it('matches keyword in message content', () => {
      const triggers: TriggerSpec[] = [
        { type: 'message', pattern: 'refactor' },
      ]
      expect(matcher.matchMessage('We need to refactor the code', triggers)).toBe(triggers[0])
    })

    it('matches case-insensitive', () => {
      const triggers: TriggerSpec[] = [
        { type: 'message', pattern: 'REFACTOR' },
      ]
      expect(matcher.matchMessage('we need to refactor', triggers)).toBe(triggers[0])
    })

    it('returns null when keyword not found', () => {
      const triggers: TriggerSpec[] = [
        { type: 'message', pattern: 'refactor' },
      ]
      expect(matcher.matchMessage('Everything is fine', triggers)).toBeNull()
    })

    it('returns first matching message trigger', () => {
      const triggers: TriggerSpec[] = [
        { type: 'message', pattern: 'bug' },
        { type: 'message', pattern: 'fix' },
      ]
      expect(matcher.matchMessage('There is a bug here', triggers)).toBe(triggers[0])
      expect(matcher.matchMessage('We need to fix this', triggers)).toBe(triggers[1])
    })

    it('only matches message-type triggers', () => {
      const triggers: TriggerSpec[] = [
        { type: 'tool', pattern: 'fix' },
        { type: 'state', pattern: 'test' },
      ]
      expect(matcher.matchMessage('We need to fix this', triggers)).toBeNull()
    })
  })
})
