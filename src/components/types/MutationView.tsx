import { useState } from 'react';
import type { MutationData, MutationFile } from '../../types/brain';
import { tableStyles, cardStyle, rateColor, errorBlockStyle } from '../../styles/theme';
import { useLanguage } from '../../i18n/i18n';

interface MutationViewProps { data: MutationData; }

export function MutationView({ data }: MutationViewProps) {
    const [expanded, setExpanded] = useState<string | null>(null);
    const { t } = useLanguage();
    const totalKilled = data.files.reduce((s, f) => s + f.mutants_killed, 0);
    const totalMutants = data.files.reduce((s, f) => s + f.mutants_total, 0);
    const totalSurvived = data.files.reduce((s, f) => s + f.mutants_survived, 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="px-4 py-3 rounded-lg" style={cardStyle}>
                    <div className="text-xs mb-1" style={{ color: 'var(--fg-muted)' }}>{t('mutation.mutationScore')}</div>
                    <div className="text-2xl font-mono font-bold" style={{ color: rateColor(data.overall_score) }}>{data.overall_score.toFixed(1)}%</div>
                </div>
                <div className="px-4 py-3 rounded-lg" style={cardStyle}>
                    <div className="text-xs mb-1" style={{ color: 'var(--fg-muted)' }}>{t('mutation.killedTotal')}</div>
                    <div className="text-2xl font-mono font-bold" style={{ color: 'var(--fg)' }}>{totalKilled}/{totalMutants}</div>
                </div>
                <div className="px-4 py-3 rounded-lg" style={cardStyle}>
                    <div className="text-xs mb-1" style={{ color: 'var(--fg-muted)' }}>{t('mutation.survived')}</div>
                    <div className="text-2xl font-mono font-bold" style={{ color: totalSurvived > 0 ? 'var(--badge-warn-text)' : 'var(--badge-pass-text)' }}>{totalSurvived}</div>
                </div>
            </div>

            <div style={tableStyles.wrapper}>
                <table className="w-full min-w-max text-sm">
                    <thead>
                        <tr style={tableStyles.thead}>
                            <th className="text-left px-4 py-2.5 font-medium" style={tableStyles.th}>{t('common.file')}</th>
                            <th className="text-right px-3 py-2.5 font-medium w-20" style={tableStyles.th}>{t('mutation.score')}</th>
                            <th className="text-right px-3 py-2.5 font-medium w-24" style={tableStyles.th}>{t('mutation.killedTotal')}</th>
                            <th className="text-right px-3 py-2.5 font-medium w-16" style={tableStyles.th}>{t('mutation.survived')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.files.map(f => (
                            <FileRow key={f.path} file={f}
                                isExpanded={expanded === f.path}
                                onToggle={() => setExpanded(expanded === f.path ? null : f.path)} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function FileRow({ file: f, isExpanded, onToggle }: { file: MutationFile; isExpanded: boolean; onToggle: () => void }) {
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
                        <span className="font-mono" style={{ color: 'var(--fg)' }}>{f.path}</span>
                    </div>
                </td>
                <td className="text-right px-3 py-2.5 font-mono" style={{ color: rateColor(f.score) }}>{f.score.toFixed(0)}%</td>
                <td className="text-right px-3 py-2.5 font-mono" style={{ color: 'var(--fg-secondary)' }}>{f.mutants_killed}/{f.mutants_total}</td>
                <td className="text-right px-3 py-2.5 font-mono" style={{ color: f.mutants_survived > 0 ? 'var(--badge-warn-text)' : 'var(--fg-muted)' }}>{f.mutants_survived}</td>
            </tr>
            {isExpanded && f.survivors && f.survivors.length > 0 && (
                <tr><td colSpan={4} style={tableStyles.expandedPanel}>
                    <div className="px-6 py-3 space-y-2">
                        <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--fg-muted)' }}>{t('mutation.survivingMutants')}</div>
                        {f.survivors.map((s, idx) => (
                            <div key={idx} className="text-xs font-mono px-3 py-2 rounded" style={errorBlockStyle}>
                                <span style={{ color: 'var(--fg-secondary)' }}>L{s.line}</span> {s.mutator}: {s.name}
                            </div>
                        ))}
                    </div>
                </td></tr>
            )}
        </>
    );
}
