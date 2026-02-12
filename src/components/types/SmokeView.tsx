import type { SmokeData, SmokeCheck } from '../../types/brain';
import { tableStyles, statusBadgeStyle } from '../../styles/theme';
import { useLanguage } from '../../i18n/i18n';

interface SmokeViewProps { data: SmokeData; }

export function SmokeView({ data }: SmokeViewProps) {
    const { t } = useLanguage();
    return (
        <div className="space-y-4">
            <div className="text-xs px-1" style={{ color: 'var(--fg-muted)' }}>
                {t('smoke.environment')}: <span style={{ color: 'var(--fg-secondary)' }}>{data.environment}</span>
            </div>
            <div style={tableStyles.wrapper}>
                <table className="w-full min-w-max text-sm">
                    <thead>
                        <tr style={tableStyles.thead}>
                            <th className="text-left px-4 py-2.5 font-medium" style={tableStyles.th}>{t('smoke.checkItem')}</th>
                            <th className="text-left px-4 py-2.5 font-medium" style={tableStyles.th}>{t('smoke.url')}</th>
                            <th className="text-right px-3 py-2.5 font-medium w-24" style={tableStyles.th}>{t('smoke.responseTime')}</th>
                            <th className="text-center px-3 py-2.5 font-medium w-28" style={tableStyles.th}>{t('common.status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.checks.map((check: SmokeCheck) => (
                            <tr key={check.name} style={tableStyles.row}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                                <td className="px-4 py-2.5" style={{ color: 'var(--fg)' }}>{check.name}</td>
                                <td className="px-4 py-2.5 font-mono text-xs" style={{ color: 'var(--fg-muted)' }}>{check.url}</td>
                                <td className="text-right px-3 py-2.5 font-mono text-xs" style={{ color: 'var(--fg-secondary)' }}>{check.response_ms != null ? `${check.response_ms}ms` : '—'}</td>
                                <td className="text-center px-3 py-2.5">
                                    <span className="text-xs px-2 py-0.5 rounded" style={statusBadgeStyle(check.status as string)}>
                                        {check.status === 'passed' ? t('smoke.normal') : check.status === 'failed' ? t('smoke.abnormal') : check.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
