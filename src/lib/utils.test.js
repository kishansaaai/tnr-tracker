import { describe, it, expect } from 'vitest'
import { haversineDistance } from './utils'

describe('haversine distance', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineDistance(37.7749, -122.4194, 37.7749, -122.4194)).toBeCloseTo(0, 4)
  })

  it('calculates distance correctly between San Francisco and Los Angeles', () => {
    // SF: 37.7749° N, 122.4194° W
    // LA: 34.0522° N, 118.2437° W
    // Expected distance is approximately 559 km
    const distance = haversineDistance(37.7749, -122.4194, 34.0522, -118.2437)
    expect(distance).toBeGreaterThan(550)
    expect(distance).toBeLessThan(570)
  })

  it('calculates distance correctly for small distances', () => {
    // Two coordinates very close to each other (approx 11.1 meters or ~0.0111 km)
    const distance = haversineDistance(0.0001, 0, 0, 0)
    expect(distance).toBeCloseTo(0.0111, 3)
  })
})

