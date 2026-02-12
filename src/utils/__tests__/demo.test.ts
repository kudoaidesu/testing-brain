import { describe, it, expect } from 'vitest'
import { add, subtract } from '../demo'

describe('demo utility functions', () => {
    describe('add', () => {
        it('should add two positive numbers', () => {
            expect(add(2, 3)).toBe(5)
        })

        it('should add negative numbers', () => {
            expect(add(-5, -3)).toBe(-8)
        })

        it('should handle zero', () => {
            expect(add(0, 5)).toBe(5)
            expect(add(5, 0)).toBe(5)
        })

        it('should add decimal numbers', () => {
            expect(add(1.5, 2.3)).toBeCloseTo(3.8)
        })
    })

    describe('subtract', () => {
        it('should subtract two positive numbers', () => {
            expect(subtract(5, 3)).toBe(2)
        })

        it('should subtract negative numbers', () => {
            expect(subtract(-5, -3)).toBe(-2)
        })

        it('should handle zero', () => {
            expect(subtract(5, 0)).toBe(5)
            expect(subtract(0, 5)).toBe(-5)
        })

        it('should subtract decimal numbers', () => {
            expect(subtract(5.5, 2.3)).toBeCloseTo(3.2)
        })
    })
})
