import { useState } from 'react';
import type { SnapshotData, SnapshotFile } from '../../types/brain';
import { tableStyles, cardStyle, statusBadgeStyle } from '../../styles/theme';
import { useLanguage } from '../../i18n/i18n';

interface SnapshotViewProps { data: SnapshotData; }

export function SnapshotView({ data }: SnapshotViewProps) {
    const [expanded, setExpanded] = useState<string | null>(null);
    const { t } = useLanguage();
    const totalVariants = data.files.reduce((s, f) => s + f.variants.length, 0);
    const passedVariants = data.files.reduce((s, f) => s + f.variants.filter(v => v.status === 'passed').length, 0);
    const changedVariants = data.files.reduce((s, f) => s + f.variants.filter(v => v.status === 'changed').length, 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="px-4 py-3 rounded-lg" style={cardStyle}>
                    <div className="text-xs mb-1" style={{ color: 'var(--fg-muted)' }}>{t('snapshot.totalSnapshots')}</div>
                    <div className="text-2xl font-mono font-bold" style={{ color: 'var(--fg)' }}>{totalVariants}</div>
                </div>
                <div className="px-4 py-3 rounded-lg" style={cardStyle}>
                    <div className="text-xs mb-1" style={{ color: 'var(--fg-muted)' }}>{t('snapshot.matched')}</div>
                    <div className="text-2xl font-mono font-bold" style={{ color: 'var(--badge-pass-text)' }}>{passedVariants}</div>
                </div>
                <div className="px-4 py-3 rounded-lg" style={cardStyle}>
                    <div className="text-xs mb-1" style={{ color: 'var(--fg-muted)' }}>{t('snapshot.changesDetected')}</div>
                    <div className="text-2xl font-mono font-bold" style={{ color: changedVariants > 0 ? 'var(--badge-fail-text)' : 'var(--badge-pass-text)' }}>{changedVariants}</div>
                </div>
            </div>

            <div style={tableStyles.wrapper}>
                <table className="w-full min-w-max text-sm">
                    <thead>
                        <tr style={tableStyles.thead}>
                            <th className="text-left px-4 py-2.5 font-medium" style={tableStyles.th}>{t('snapshot.component')}</th>
                            <th className="text-right px-3 py-2.5 font-medium w-24" style={tableStyles.th}>{t('visual.variants')}</th>
                            <th className="text-center px-3 py-2.5 font-medium w-28" style={tableStyles.th}>{t('common.status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.files.map(f => (
                            <CompRow key={f.component} file={f}
                                isExpanded={expanded === f.component}
                                onToggle={() => setExpanded(expanded === f.component ? null : f.component)} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function CompRow({ file, isExpanded, onToggle }: { file: SnapshotFile; isExpanded: boolean; onToggle: () => void }) {
    const { t } = useLanguage();
    const passed = file.variants.filter(v => v.status === 'passed').length;
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
                        <div>
                            <span className="font-medium" style={{ color: 'var(--fg)' }}>{file.component}</span>
                            <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--fg-muted)' }}>{file.path}</div>
                        </div>
                    </div>
                </td>
                <td className="text-right px-3 py-2.5 font-mono" style={{ color: 'var(--fg-secondary)' }}>{passed}/{file.variants.length}</td>
                <td className="text-center px-3 py-2.5">
                    <span className="text-xs px-2 py-0.5 rounded" style={statusBadgeStyle(file.variants.some(v => v.status === 'changed') ? 'failed' : 'passed')}>
                        {file.variants.some(v => v.status === 'changed') ? t('status.changed') : t('status.matched')}
                    </span>
                </td>
            </tr>
            {isExpanded && file.variants.length > 0 && (
                <tr><td colSpan={3} style={tableStyles.expandedPanel}>
                    <div className="px-6 py-3 space-y-1">
                        <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--fg-muted)' }}>{t('visual.variants')}</div>
                        {file.variants.map((v, idx) => (
                            <div key={idx} className="flex items-center gap-3 py-1.5" style={idx < file.variants.length - 1 ? tableStyles.detailSeparator : {}}>
                                <span className="text-xs font-mono" style={{ color: v.status === 'passed' ? 'var(--badge-pass-text)' : v.status === 'changed' ? 'var(--badge-fail-text)' : 'var(--fg-muted)' }}>
                                    {v.status === 'passed' ? '✓' : v.status === 'changed' ? '✗' : '○'}
                                </span>
                                <span className="flex-1" style={{ color: 'var(--fg)' }}>{v.name}</span>
                                {v.diff_lines != null && v.diff_lines > 0 && (
                                    <span className="text-xs font-mono" style={{ color: 'var(--badge-fail-text)' }}>{t('snapshot.diffLines', { n: v.diff_lines })}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </td></tr>
            )}
        </>
    );
}
