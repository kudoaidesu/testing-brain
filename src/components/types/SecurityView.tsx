import type { SecurityData, SecurityVulnerability, OwaspItem } from '../../types/brain';
import { tableStyles, cardStyle, statusBadgeStyle } from '../../styles/theme';
import { useLanguage } from '../../i18n/i18n';

interface SecurityViewProps { data: SecurityData; }

export function SecurityView({ data }: SecurityViewProps) {
    const { t } = useLanguage();
    const severityKeys = ['critical', 'high', 'medium', 'low', 'fixed'] as const;
    const colorMap: Record<string, string> = {
        critical: 'var(--badge-fail-text)', high: 'var(--badge-fail-text)',
        medium: 'var(--badge-warn-text)', low: 'var(--fg-secondary)', fixed: 'var(--badge-pass-text)',
    };

    return (
        <div className="space-y-6">
            {/* Severity Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {severityKeys.map(key => (
                    <div key={key} className="px-4 py-3 rounded-lg text-center" style={cardStyle}>
                        <div className="text-xs mb-1" style={{ color: 'var(--fg-muted)' }}>{t(`security.severity.${key}`)}</div>
                        <div className="text-2xl font-mono font-bold" style={{ color: colorMap[key] }}>{data.summary[key]}</div>
                    </div>
                ))}
            </div>

            {/* OWASP Top 10 */}
            <div>
                <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--fg)' }}>{t('security.owaspTitle')}</h3>
                <div style={tableStyles.wrapper}>
                    <table className="w-full min-w-max text-sm">
                        <thead>
                            <tr style={tableStyles.thead}>
                                <th className="text-left px-4 py-2.5 font-medium w-16" style={tableStyles.th}>ID</th>
                                <th className="text-left px-4 py-2.5 font-medium" style={tableStyles.th}>{t('security.category')}</th>
                                <th className="text-right px-3 py-2.5 font-medium w-16" style={tableStyles.th}>{t('common.tests')}</th>
                                <th className="text-center px-3 py-2.5 font-medium w-28" style={tableStyles.th}>{t('common.status')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.owasp_top10.map((item: OwaspItem) => (
                                <tr key={item.id} style={tableStyles.row}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                                    <td className="px-4 py-2.5 font-mono text-xs" style={{ color: 'var(--fg-muted)' }}>{item.id}</td>
                                    <td className="px-4 py-2.5" style={{ color: 'var(--fg)' }}>{item.name}</td>
                                    <td className="text-right px-3 py-2.5 font-mono" style={{ color: 'var(--fg-secondary)' }}>{item.tests}</td>
                                    <td className="text-center px-3 py-2.5">
                                        <span className="text-xs px-2 py-0.5 rounded" style={statusBadgeStyle(item.status as string)}>
                                            {item.status === 'passed' ? t('security.status.covered') : item.status === 'partial' ? t('security.status.partial') : t('security.status.uncovered')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Vulnerabilities */}
            <div>
                <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--fg)' }}>{t('security.vulnerabilities')}</h3>
                <div style={tableStyles.wrapper}>
                    <table className="w-full min-w-max text-sm">
                        <thead>
                            <tr style={tableStyles.thead}>
                                <th className="text-center px-3 py-2.5 font-medium w-20" style={tableStyles.th}>{t('security.severity')}</th>
                                <th className="text-left px-4 py-2.5 font-medium" style={tableStyles.th}>{t('security.vulnerabilities')}</th>
                                <th className="text-left px-4 py-2.5 font-medium" style={tableStyles.th}>{t('security.source')}</th>
                                <th className="text-center px-3 py-2.5 font-medium w-28" style={tableStyles.th}>{t('common.status')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.vulnerabilities.map((vuln: SecurityVulnerability, idx: number) => (
                                <tr key={idx} style={tableStyles.row}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                                    <td className="text-center px-3 py-2.5">
                                        <SeverityBadge severity={vuln.severity} />
                                    </td>
                                    <td className="px-4 py-2.5" style={{ color: 'var(--fg)' }}>{vuln.title}</td>
                                    <td className="px-4 py-2.5 font-mono text-xs" style={{ color: 'var(--fg-muted)' }}>{vuln.source}</td>
                                    <td className="text-center px-3 py-2.5">
                                        <span className="text-xs px-2 py-0.5 rounded" style={statusBadgeStyle(vuln.status === 'fixed' ? 'passed' : 'failed')}>
                                            {vuln.status === 'fixed' ? t('security.status.fixed') : t('security.status.unfixed')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function SeverityBadge({ severity }: { severity: string }) {
    const { t } = useLanguage();
    const map: Record<string, string> = { critical: 'failed', high: 'failed', medium: 'partial', low: 'untested' };
    return <span className="text-xs font-mono px-2 py-0.5 rounded" style={statusBadgeStyle(map[severity] ?? 'untested')}>{t(`security.severity.${severity}`)}</span>;
}
