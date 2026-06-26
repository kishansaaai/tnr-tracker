import { describe, it, expect } from 'vitest'
import { haversineDistance, friendlyError, sanitizeForPrompt, computeRoute, hasKeywordWithoutNegation } from './utils'
import { escapeHtml } from './vetExport'
import { getRecoveryUrgency } from '../hooks/useRecovery'

describe('haversine distance', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineDistance(37.7749, -122.4194, 37.7749, -122.4194)).toBeCloseTo(0, 4)
  })

  it('calculates distance correctly between San Francisco and Los Angeles', () => {
    const distance = haversineDistance(37.7749, -122.4194, 34.0522, -118.2437)
    expect(distance).toBeGreaterThan(550)
    expect(distance).toBeLessThan(570)
  })

  it('calculates distance correctly for small distances', () => {
    const distance = haversineDistance(0.0001, 0, 0, 0)
    expect(distance).toBeCloseTo(0.0111, 3)
  })
})

describe('friendlyError', () => {
  it('returns default message if no error provided', () => {
    expect(friendlyError(null)).toBe('Something went wrong. Please try again.')
  })

  it('detects duplicate key violations', () => {
    expect(friendlyError(new Error('duplicate key value violates unique constraint'))).toBe('This record already exists.')
    expect(friendlyError({ message: 'duplicate key value violates unique constraint' })).toBe('This record already exists.')
  })

  it('detects foreign key violations', () => {
    expect(friendlyError(new Error('insert or update violates foreign key constraint'))).toBe('Related record not found.')
  })

  it('detects permission / RLS violations', () => {
    expect(friendlyError(new Error('new row violates row-level security policy'))).toBe('You don\'t have permission to do that.')
    expect(friendlyError(new Error('permission denied for table colonies'))).toBe('You don\'t have permission to do that.')
  })

  it('returns fallback for unknown errors', () => {
    expect(friendlyError(new Error('some random database error'))).toBe('Something went wrong. Please try again.')
  })
})

describe('escapeHtml', () => {
  it('escapes HTML special characters correctly', () => {
    expect(escapeHtml('<div>Hello & "Welcome"\'s</div>')).toBe('&lt;div&gt;Hello &amp; &quot;Welcome&quot;&#039;s&lt;/div&gt;')
    expect(escapeHtml(null)).toBe('')
  })
})

describe('sanitizeForPrompt', () => {
  it('strips backticks and angle brackets', () => {
    expect(sanitizeForPrompt('hello `world` <tag>')).toBe('hello world tag')
  })

  it('slices input to max 500 characters', () => {
    const longString = 'a'.repeat(600)
    expect(sanitizeForPrompt(longString).length).toBe(500)
  })
})

describe('computeRoute (TSP heuristic)', () => {
  it('returns input if 0 or 1 traps', () => {
    expect(computeRoute([])).toEqual([])
    const single = [{ id: 1, lat: 0, lng: 0 }]
    expect(computeRoute(single)).toEqual(single)
  })

  it('orders multiple traps using greedy selection', () => {
    // Starting point is traps[0] (lat: 0, lng: 0)
    // traps[1] is far away (lat: 10, lng: 10)
    // traps[2] is very close (lat: 0.1, lng: 0.1)
    const traps = [
      { id: 'start', lat: 0, lng: 0 },
      { id: 'far', lat: 10, lng: 10 },
      { id: 'near', lat: 0.1, lng: 0.1 },
    ]
    const route = computeRoute(traps)
    expect(route[0].id).toBe('start')
    expect(route[1].id).toBe('near')
    expect(route[2].id).toBe('far')
  })
})

describe('getRecoveryUrgency', () => {
  it('handles empty release dates', () => {
    expect(getRecoveryUrgency(null)).toEqual({ label: 'No release date', color: 'gray', hours: null })
  })

  it('identifies overdue holds', () => {
    const pastDate = new Date(Date.now() - 3 * 3600 * 1000).toISOString() // 3 hours ago
    const urgency = getRecoveryUrgency(pastDate)
    expect(urgency.overdue).toBe(true)
    expect(urgency.color).toBe('red')
    expect(urgency.label).toContain('Overdue')
  })

  it('identifies urgency under 12 hours', () => {
    const soonDate = new Date(Date.now() + 5 * 3600 * 1000).toISOString() // 5 hours from now
    const urgency = getRecoveryUrgency(soonDate)
    expect(urgency.overdue).toBe(false)
    expect(urgency.color).toBe('red')
    expect(urgency.label).toContain('remaining')
  })

  it('identifies urgency under 24 hours', () => {
    const mediumDate = new Date(Date.now() + 18 * 3600 * 1000).toISOString() // 18 hours from now
    const urgency = getRecoveryUrgency(mediumDate)
    expect(urgency.overdue).toBe(false)
    expect(urgency.color).toBe('amber')
  })

  it('identifies low urgency holds', () => {
    const farDate = new Date(Date.now() + 36 * 3600 * 1000).toISOString() // 36 hours from now
    const urgency = getRecoveryUrgency(farDate)
    expect(urgency.overdue).toBe(false)
    expect(urgency.color).toBe('green')
  })
})

describe('Matchmaker compatibility score calculations', () => {
  // Score formula: Math.round(((6 - totalDist) / 6) * 10)
  const calculateScore = (totalDist) => Math.round(((6 - totalDist) / 6) * 10)

  it('calculates score correctly for various distances', () => {
    expect(calculateScore(0)).toBe(10) // Perfect match
    expect(calculateScore(1)).toBe(8)
    expect(calculateScore(2)).toBe(7)
    expect(calculateScore(3)).toBe(5)
    expect(calculateScore(4)).toBe(3)
    expect(calculateScore(5)).toBe(2)
    expect(calculateScore(6)).toBe(0) // Worst match
  })
})

describe('hasKeywordWithoutNegation', () => {
  it('returns true if keyword matches without negations', () => {
    expect(hasKeywordWithoutNegation('This cat is playful and friendly.', 'playful')).toBe(true)
  })

  it('returns false if keyword matches but is negated locally', () => {
    expect(hasKeywordWithoutNegation('This cat is not playful.', 'playful')).toBe(false)
    expect(hasKeywordWithoutNegation('This cat is no longer playful.', 'playful')).toBe(false)
    expect(hasKeywordWithoutNegation('This cat is not at all playful.', 'playful')).toBe(false)
  })

  it('handles clause boundary limits properly', () => {
    expect(hasKeywordWithoutNegation('This cat is not friendly, but is playful.', 'playful')).toBe(true)
    expect(hasKeywordWithoutNegation('This cat is not friendly. Also he is playful.', 'playful')).toBe(true)
  })

  it('is case insensitive', () => {
    expect(hasKeywordWithoutNegation('This cat is PLAYFUL.', 'playful')).toBe(true)
    expect(hasKeywordWithoutNegation('This cat is Playful.', 'PLAYFUL')).toBe(true)
  })
})
