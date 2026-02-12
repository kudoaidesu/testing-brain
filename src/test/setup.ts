import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Cleanup after each test
afterEach(() => {
    cleanup()
})

// Mock VS Code API for webview components
global.acquireVsCodeApi = () => ({
    postMessage: () => {},
    getState: () => ({}),
    setState: () => {},
})
