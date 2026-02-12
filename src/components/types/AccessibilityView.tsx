import type { AccessibilityData, A11yViolation } from '../../types/brain';
import { tableStyles, statusBadgeStyle, rateColor } from '../../styles/theme';
import { useLanguage } from '../../i18n/i18n';

interface AccessibilityViewProps { data: AccessibilityData; }

export function AccessibilityView({ data }: AccessibilityViewProps) {
    const { t } = useLanguage();
    return (
        <div className="space-y-6">
            <div className="text-xs px-1" style={{ color: 'var(--fg-muted)' }}>
                {t('a11y.standard')}: <span style={{ color: 'var(--fg-secondary)' }}>{data.standard}</span>
                <span className="mx-2">·</span>
                {t('a11y.tool')}: <span style={{ color: 'var(--fg-secondary)' }}>{data.tool}</span>
            </div>

            <div style={tableStyles.wrapper}>
                <table className="w-full min-w-max text-sm">
                    <thead>
                        <tr style={tableStyles.thead}>
                            <th className="text-left px-4 py-2.5 font-medium" style={tableStyles.th}>{t('a11y.page')}</th>
                            <th className="text-right px-3 py-2.5 font-medium w-20" style={tableStyles.th}>{t('a11y.score')}</th>
                            <th className="text-right px-3 py-2.5 font-medium w-24" style={tableStyles.th}>{t('a11y.violations')}</th>
                            <th className="text-center px-3 py-2.5 font-medium w-28" style={tableStyles.th}>{t('common.status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.pages.map(page => {
                            const violations = groupViolations(page.violations);
                            return (
                                <tr key={page.path} style={tableStyles.row}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                                    <td className="px-4 py-2.5">
                                        <div className="font-medium" style={{ color: 'var(--fg)' }}>{page.name}</div>
                                        <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--fg-muted)' }}>{page.path}</div>
                                    </td>
                                    <td className="text-right px-3 py-2.5 font-mono font-bold" style={{ color: page.score != null ? rateColor(page.score) : 'var(--fg-muted)' }}>
                                        {page.score ?? '—'}
                                    </td>
                                    <td className="text-right px-3 py-2.5">
                                        <div className="flex gap-1.5 justify-end">
                                            {violations.critical > 0 && <ImpactBadge label={t('a11y.impact.critical')} count={violations.critical} severity="fail" />}
                                            {violations.serious > 0 && <ImpactBadge label={t('a11y.impact.serious')} count={violations.serious} severity="warn" />}
                                            {violations.moderate > 0 && <ImpactBadge label={t('a11y.impact.moderate')} count={violations.moderate} severity="warn" />}
                                            {violations.minor > 0 && <ImpactBadge label={t('a11y.impact.minor')} count={violations.minor} severity="muted" />}
                                        </div>
                                    </td>
                                    <td className="text-center px-3 py-2.5">
                                        <span className="text-xs px-2 py-0.5 rounded" style={statusBadgeStyle(page.status === 'passing' ? 'passed' : page.status === 'failing' ? 'failed' : page.status)}>
                                            {page.status === 'passing' || page.status === 'passed' ? t('status.passed') : page.status === 'failing' || page.status === 'failed' ? t('status.failed') : page.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function groupViolations(violations: A11yViolation[]): { critical: number; serious: number; moderate: number; minor: number } {
    return violations.reduce((acc, v) => {
        acc[v.impact] = (acc[v.impact] || 0) + 1;
        return acc;
    }, { critical: 0, serious: 0, moderate: 0, minor: 0 });
}

function ImpactBadge({ label, count, severity }: { label: string; count: number; severity: 'fail' | 'warn' | 'muted' }) {
    const varMap = {
        fail: { bg: 'var(--badge-fail-bg)', color: 'var(--badge-fail-text)', border: 'var(--badge-fail-border)' },
        warn: { bg: 'var(--badge-warn-bg)', color: 'var(--badge-warn-text)', border: 'var(--badge-warn-border)' },
        muted: { bg: 'var(--surface-active)', color: 'var(--fg-secondary)', border: 'var(--border)' },
    };
    const v = varMap[severity];
    return (
        <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: v.bg, color: v.color, border: `1px solid ${v.border}` }}>
            {label}{count}
        </span>
    );
}
