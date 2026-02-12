import { useState } from 'react';
import type { ContractData, ContractPair } from '../../types/brain';
import { tableStyles, statusBadgeStyle, testStatusColor, errorBlockStyle } from '../../styles/theme';
import { useLanguage } from '../../i18n/i18n';

interface ContractViewProps { data: ContractData; }

export function ContractView({ data }: ContractViewProps) {
    const [expanded, setExpanded] = useState<string | null>(null);
    const { t } = useLanguage();
    return (
        <div className="space-y-4">
            <div className="text-xs px-1" style={{ color: 'var(--fg-muted)' }}>{t('contract.tool')}: <span style={{ color: 'var(--fg-secondary)' }}>{data.tool}</span></div>
            <div style={tableStyles.wrapper}>
                <table className="w-full min-w-max text-sm">
                    <thead>
                        <tr style={tableStyles.thead}>
                            <th className="text-left px-4 py-2.5 font-medium" style={tableStyles.th}>{t('contract.consumerProvider')}</th>
                            <th className="text-left px-4 py-2.5 font-medium" style={tableStyles.th}>{t('common.testFile')}</th>
                            <th className="text-right px-3 py-2.5 font-medium w-24" style={tableStyles.th}>{t('contract.interactions')}</th>
                            <th className="text-center px-3 py-2.5 font-medium w-28" style={tableStyles.th}>{t('common.status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.contracts.map(c => (
                            <ContractRow key={`${c.consumer}-${c.provider}`} contract={c}
                                isExpanded={expanded === `${c.consumer}-${c.provider}`}
                                onToggle={() => setExpanded(expanded === `${c.consumer}-${c.provider}` ? null : `${c.consumer}-${c.provider}`)} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ContractRow({ contract: c, isExpanded, onToggle }: { contract: ContractPair; isExpanded: boolean; onToggle: () => void }) {
    const { t } = useLanguage();
    const passed = c.interactions.filter(i => i.status === 'passed').length;
    const failed = c.interactions.filter(i => i.status === 'failed').length;
    return (
        <>
            <tr style={{ ...tableStyles.row, ...(isExpanded ? tableStyles.rowActive : {}) }} onClick={onToggle}
                onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = ''; }}>
                <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <svg className={`w-3.5 h-3.5 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                            style={{ color: 'var(--fg-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="truncate" style={{ color: 'var(--fg)' }}>{c.consumer}</span>
                        <span style={{ color: 'var(--fg-muted)' }}>→</span>
                        <span className="truncate" style={{ color: 'var(--fg)' }}>{c.provider}</span>
                    </div>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs" style={{ color: 'var(--fg-secondary)' }}>
                    {c.test_file ?? <span className="italic" style={{ color: 'var(--fg-muted)' }}>{t('common.notCreated')}</span>}
                </td>
                <td className="text-right px-3 py-2.5 font-mono text-xs">
                    {c.interactions.length > 0 ? (
                        <>
                            {passed > 0 && <span style={{ color: 'var(--badge-pass-text)' }}>{passed}✓ </span>}
                            {failed > 0 && <span style={{ color: 'var(--badge-fail-text)' }}>{failed}✗</span>}
                        </>
                    ) : <span style={{ color: 'var(--fg-muted)' }}>—</span>}
                </td>
                <td className="text-center px-3 py-2.5">
                    <span className="text-xs px-2 py-0.5 rounded" style={statusBadgeStyle(c.status as string)}>
                        {c.status === 'passed' ? t('status.passed') : c.status === 'partial' ? t('status.partial') : c.status === 'failed' ? t('status.failed') : t('status.untested')}
                    </span>
                </td>
            </tr>
            {isExpanded && c.interactions.length > 0 && (
                <tr><td colSpan={4} style={tableStyles.expandedPanel}>
                    <div className="px-6 py-3 space-y-1">
                        {c.interactions.map((i, idx) => (
                            <div key={idx} className="flex items-start gap-3 py-1.5" style={idx < c.interactions.length - 1 ? tableStyles.detailSeparator : {}}>
                                <span className="text-sm font-mono mt-0.5" style={{ color: testStatusColor(i.status as string) }}>
                                    {i.status === 'passed' ? '✓' : i.status === 'failed' ? '✗' : '○'}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm" style={{ color: 'var(--fg)' }}>{i.name}</div>
                                    {i.viewpoint && <div className="text-xs mt-0.5" style={{ color: 'var(--fg-secondary)' }}><span style={{ color: 'var(--fg-muted)' }}>{t('common.viewpoint')}:</span> {i.viewpoint}</div>}
                                    {i.expected && <div className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>{t('common.expected')}: {i.expected}</div>}
                                    {i.error && <div className="text-xs px-2 py-1 rounded mt-1 font-mono" style={errorBlockStyle}>{i.error}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </td></tr>
            )}
            {isExpanded && c.interactions.length === 0 && (
                <tr><td colSpan={4} style={tableStyles.expandedPanel}>
                    <div className="px-6 py-4 text-center text-sm italic" style={{ color: 'var(--fg-muted)' }}>{t('common.notCreated')}</div>
                </td></tr>
            )}
        </>
    );
}
