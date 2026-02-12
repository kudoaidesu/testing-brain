import type { TestStatus } from '../types/brain';

const colors: Record<string, string> = {
    passed: 'var(--badge-pass-text)',
    failed: 'var(--badge-fail-text)',
    skipped: 'var(--fg-muted)',
    untested: 'var(--fg-muted)',
    partial: 'var(--badge-warn-text)',
    changed: 'var(--badge-warn-text)',
};

const bgColors: Record<string, string> = {
    passed: 'var(--badge-pass-bg)',
    failed: 'var(--badge-fail-bg)',
    skipped: 'var(--bg-subtle)',
    untested: 'var(--bg-subtle)',
    partial: 'var(--badge-warn-bg)',
    changed: 'var(--badge-warn-bg)',
};

export function StatusBadge({ status, size = 'md' }: { status: string; size?: 'sm' | 'md' }) {
    const color = colors[status] || colors.untested;
    const bg = bgColors[status] || bgColors.untested;

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded font-mono ${size === 'sm' ? 'text-xs' : 'text-sm'}`}
            style={{ backgroundColor: bg, color: color, border: `1px solid ${color}40` }}
        >
            {status}
        </span>
    );
}
