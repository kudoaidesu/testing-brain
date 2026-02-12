/** Shared semantic style constants for all view components */

export const tableStyles = {
    wrapper: {
        border: '1px solid var(--border)',
        borderRadius: '0.5rem',
        overflowX: 'auto' as const,
        overflowY: 'hidden' as const,
    },
    thead: {
        backgroundColor: 'var(--bg-subtle)',
        borderBottom: '1px solid var(--border)',
    },
    th: {
        color: 'var(--fg-secondary)',
        whiteSpace: 'nowrap' as const,
    },
    row: {
        borderBottom: '1px solid var(--border-subtle)',
        cursor: 'pointer',
        transition: 'background-color 0.1s',
    },
    rowHover: {
        backgroundColor: 'var(--surface-hover)',
    },
    rowActive: {
        backgroundColor: 'var(--surface-active)',
    },
    expandedPanel: {
        backgroundColor: 'var(--bg-inset)',
        borderBottom: '1px solid var(--border-subtle)',
        whiteSpace: 'normal' as const,
    },
    cellPrimary: {
        color: 'var(--fg)',
    },
    cellSecondary: {
        color: 'var(--fg-secondary)',
    },
    cellMuted: {
        color: 'var(--fg-muted)',
    },
    detailSeparator: {
        borderBottom: '1px solid var(--border-subtle)',
    },
} as const;

export const statusColors = {
    pass: 'var(--badge-pass-text)',
    fail: 'var(--badge-fail-text)',
    warn: 'var(--badge-warn-text)',
    muted: 'var(--fg-muted)',
} as const;

export function statusBadgeStyle(status: string) {
    const map: Record<string, { bg: string; text: string; border: string }> = {
        passed: { bg: 'var(--badge-pass-bg)', text: 'var(--badge-pass-text)', border: 'var(--badge-pass-border)' },
        partial: { bg: 'var(--badge-warn-bg)', text: 'var(--badge-warn-text)', border: 'var(--badge-warn-border)' },
        failed: { bg: 'var(--badge-fail-bg)', text: 'var(--badge-fail-text)', border: 'var(--badge-fail-border)' },
        untested: { bg: 'var(--surface-active)', text: 'var(--fg-muted)', border: 'var(--border)' },
    };
    const v = map[status] ?? map.untested;
    return { backgroundColor: v.bg, color: v.text, border: `1px solid ${v.border}`, whiteSpace: 'nowrap' as const };
}

export function rateColor(value: number): string {
    return value >= 80 ? statusColors.pass : value >= 50 ? statusColors.warn : statusColors.fail;
}

export function testStatusColor(status: string): string {
    return status === 'passed' ? statusColors.pass : status === 'failed' ? statusColors.fail : statusColors.muted;
}

/** Card-style container */
export const cardStyle = {
    backgroundColor: 'var(--bg-subtle)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '0.5rem',
};

/** Chevron style for accordion */
export const chevronStyle = {
    color: 'var(--fg-muted)',
};

/** Error block style */
export const errorBlockStyle = {
    backgroundColor: 'var(--badge-fail-bg)',
    color: 'var(--badge-fail-text)',
    border: '1px solid var(--badge-fail-border)',
};
