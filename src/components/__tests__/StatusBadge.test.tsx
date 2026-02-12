import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '../StatusBadge'

describe('StatusBadge', () => {
    it('should render passed status correctly', () => {
        render(<StatusBadge status="passed" />)
        const badge = screen.getByText(/passed/i)
        expect(badge).toBeInTheDocument()
    })

    it('should render failed status correctly', () => {
        render(<StatusBadge status="failed" />)
        const badge = screen.getByText(/failed/i)
        expect(badge).toBeInTheDocument()
    })

    it('should render skipped status correctly', () => {
        render(<StatusBadge status="skipped" />)
        const badge = screen.getByText(/skipped/i)
        expect(badge).toBeInTheDocument()
    })

    it('should render pending status correctly', () => {
        render(<StatusBadge status="pending" />)
        const badge = screen.getByText(/pending/i)
        expect(badge).toBeInTheDocument()
    })
})
