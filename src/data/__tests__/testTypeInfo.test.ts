import { describe, it, expect } from 'vitest'
import { getTestTypeInfo } from '../testTypeInfo'
import type { TestType } from '../../types/brain'

describe('getTestTypeInfo', () => {
    const testTypes: TestType[] = [
        'unit', 'integration', 'e2e', 'api', 'visual', 'accessibility',
        'performance', 'security', 'contract', 'mutation', 'smoke', 'load',
        'snapshot', 'i18n', 'component', 'page'
    ]

    it('should return Japanese info for all test types', () => {
        testTypes.forEach(type => {
            const info = getTestTypeInfo(type, 'ja')
            expect(info).toBeDefined()
            expect(info.name).toBeTruthy()
            expect(info.description).toBeTruthy()
            expect(info.purpose).toBeTruthy()
            expect(info.targetValue).toBeTruthy()
            expect(info.tools).toBeInstanceOf(Array)
            expect(info.tools.length).toBeGreaterThan(0)
        })
    })

    it('should return English info for all test types', () => {
        testTypes.forEach(type => {
            const info = getTestTypeInfo(type, 'en')
            expect(info).toBeDefined()
            expect(info.name).toBeTruthy()
            expect(info.description).toBeTruthy()
            expect(info.purpose).toBeTruthy()
            expect(info.targetValue).toBeTruthy()
            expect(info.tools).toBeInstanceOf(Array)
            expect(info.tools.length).toBeGreaterThan(0)
        })
    })

    it('should return consistent structure between languages', () => {
        testTypes.forEach(type => {
            const jaInfo = getTestTypeInfo(type, 'ja')
            const enInfo = getTestTypeInfo(type, 'en')

            expect(Object.keys(jaInfo).sort()).toEqual(Object.keys(enInfo).sort())
            expect(jaInfo.tools.length).toBe(enInfo.tools.length)
        })
    })

    it('should return correct unit test info in Japanese', () => {
        const info = getTestTypeInfo('unit', 'ja')
        expect(info.name).toBe('単体テスト')
        expect(info.tools).toContain('Jest')
        expect(info.tools).toContain('Vitest')
    })

    it('should return correct e2e test info in English', () => {
        const info = getTestTypeInfo('e2e', 'en')
        expect(info.name).toBe('E2E Tests')
        expect(info.tools).toContain('Playwright')
        expect(info.tools).toContain('Cypress')
    })
})
