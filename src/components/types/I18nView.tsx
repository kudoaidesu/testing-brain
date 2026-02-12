import { useState } from 'react';
import type { I18nData, I18nPage, I18nPageIssue } from '../../types/brain';
import { tableStyles, cardStyle, rateColor, statusBadgeStyle } from '../../styles/theme';
import { useLanguage } from '../../i18n/i18n';

interface I18nViewProps { data: I18nData; }

export function I18nView({ data }: I18nViewProps) {
    const [expanded, setExpanded] = useState<string | null>(null);
    const { t } = useLanguage();
    return (
        <div className="space-y-6">
            {/* Locale Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {data.locales.map(loc => {
                    const rate = loc.total_keys > 0 ? (loc.translated / loc.total_keys) * 100 : 0;
                    return (
                        <div key={loc.code} className="px-4 py-3 rounded-lg" style={cardStyle}>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs" style={{ color: 'var(--fg-muted)' }}>{loc.code}</span>
                                <span className="text-xs" style={{ color: 'var(--fg-secondary)' }}>{loc.name}</span>
                            </div>
                            <div className="text-2xl font-mono font-bold" style={{ color: rateColor(rate) }}>{rate.toFixed(0)}%</div>
                            <div className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>{loc.translated}/{loc.total_keys} {t('i18n.keys')}</div>
                        </div>
                    );
                })}
            </div>

            {/* Pages grouped by locale */}
            {data.locales.map(loc => (
                <div key={loc.code} className="space-y-2">
                    <h3 className="text-sm font-medium" style={{ color: 'var(--fg)' }}>{loc.name} ({loc.code})</h3>
                    <div style={tableStyles.wrapper}>
                        <table className="w-full min-w-max text-sm">
                            <thead>
                                <tr style={tableStyles.thead}>
                                    <th className="text-left px-4 py-2.5 font-medium" style={tableStyles.th}>{t('i18n.page')}</th>
                                    <th className="text-right px-3 py-2.5 font-medium w-20" style={tableStyles.th}>{t('i18n.issues')}</th>
                                    <th className="text-center px-3 py-2.5 font-medium w-28" style={tableStyles.th}>{t('common.status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loc.pages.map(page => (
                                    <PageRow key={`${loc.code}-${page.name}`} page={page}
                                        isExpanded={expanded === `${loc.code}-${page.name}`}
                                        onToggle={() => setExpanded(expanded === `${loc.code}-${page.name}` ? null : `${loc.code}-${page.name}`)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}

function PageRow({ page, isExpanded, onToggle }: { page: I18nPage; isExpanded: boolean; onToggle: () => void }) {
    const { t } = useLanguage();
    return (
        <>
            <tr style={{ ...tableStyles.row, ...(isExpanded ? tableStyles.rowActive : {}) }} onClick={onToggle}
                onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = ''; }}>
                <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                        <svg className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            style={{ color: 'var(--fg-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span style={{ color: 'var(--fg)' }}>{page.name}</span>
                    </div>
                </td>
                <td className="text-right px-3 py-2.5 font-mono" style={{ color: page.issues.length > 0 ? 'var(--badge-warn-text)' : 'var(--fg-muted)' }}>{page.issues.length}</td>
                <td className="text-center px-3 py-2.5">
                    <span className="text-xs px-2 py-0.5 rounded" style={statusBadgeStyle(page.issues.length === 0 ? 'passed' : 'partial')}>
                        {page.issues.length === 0 ? t('status.noIssues') : t('status.needsReview')}
                    </span>
                </td>
            </tr>
            {isExpanded && page.issues.length > 0 && (
                <tr><td colSpan={3} style={tableStyles.expandedPanel}>
                    <div className="px-6 py-3 space-y-1">
                        {page.issues.map((issue: I18nPageIssue, idx: number) => (
                            <div key={idx} className="flex items-start gap-3 py-1.5 text-xs" style={idx < page.issues.length - 1 ? tableStyles.detailSeparator : {}}>
                                <span className="font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--badge-warn-bg)', color: 'var(--badge-warn-text)' }}>{issue.type}</span>
                                <span style={{ color: 'var(--fg-secondary)' }}>{issue.description}</span>
                                {issue.element && <span className="font-mono" style={{ color: 'var(--fg-muted)' }}>{issue.element}</span>}
                            </div>
                        ))}
                    </div>
                </td></tr>
            )}
            {isExpanded && page.issues.length === 0 && (
                <tr><td colSpan={3} style={tableStyles.expandedPanel}>
                    <div className="px-6 py-4 text-center text-sm italic" style={{ color: 'var(--fg-muted)' }}>{t('status.noIssues')}</div>
                </td></tr>
            )}
        </>
    );
}
