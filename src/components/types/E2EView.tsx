import { useState } from 'react';
import type { E2EData, E2EScenario } from '../../types/brain';
import { tableStyles, statusBadgeStyle, testStatusColor, errorBlockStyle } from '../../styles/theme';
import { useLanguage } from '../../i18n/i18n';

interface E2EViewProps { data: E2EData; }

export function E2EView({ data }: E2EViewProps) {
    const [expanded, setExpanded] = useState<string | null>(null);
    const { t } = useLanguage();

    return (
        <div style={tableStyles.wrapper}>
            <table className="w-full min-w-max text-sm">
                <thead>
                    <tr style={tableStyles.thead}>
                        <th className="text-left px-4 py-2.5 font-medium" style={tableStyles.th}>{t('e2e.scenario')}</th>
                        <th className="text-left px-4 py-2.5 font-medium" style={tableStyles.th}>{t('common.testFile')}</th>
                        <th className="text-right px-3 py-2.5 font-medium w-20" style={tableStyles.th}>{t('e2e.steps')}</th>
                        <th className="text-right px-3 py-2.5 font-medium w-20" style={tableStyles.th}>{t('common.duration')}</th>
                        <th className="text-center px-3 py-2.5 font-medium w-28" style={tableStyles.th}>{t('common.status')}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.scenarios.map(scenario => (
                        <ScenarioRow
                            key={scenario.id}
                            scenario={scenario}
                            isExpanded={expanded === scenario.id}
                            onToggle={() => setExpanded(expanded === scenario.id ? null : scenario.id)}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ScenarioRow({ scenario, isExpanded, onToggle }: { scenario: E2EScenario; isExpanded: boolean; onToggle: () => void }) {
    const { t } = useLanguage();
    return (
        <>
            <tr
                style={{ ...tableStyles.row, ...(isExpanded ? tableStyles.rowActive : {}) }}
                onClick={onToggle}
                onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = ''; }}
            >
                <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                        <svg className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            style={{ color: 'var(--fg-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="font-medium" style={{ color: 'var(--fg)' }}>{scenario.name}</span>
                    </div>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs" style={{ color: 'var(--fg-secondary)' }}>
                    {scenario.test_file ?? <span className="italic" style={{ color: 'var(--fg-muted)' }}>{t('common.notCreated')}</span>}
                </td>
                <td className="text-right px-3 py-2.5 font-mono text-xs" style={{ color: 'var(--fg-secondary)' }}>
                    {scenario.steps.length}
                </td>
                <td className="text-right px-3 py-2.5 font-mono text-xs" style={{ color: 'var(--fg-muted)' }}>
                    {scenario.duration_ms ? `${(scenario.duration_ms / 1000).toFixed(1)}s` : '—'}
                </td>
                <td className="text-center px-3 py-2.5">
                    <span className="text-xs px-2 py-0.5 rounded" style={statusBadgeStyle(scenario.status as string)}>{scenario.status}</span>
                </td>
            </tr>

            {isExpanded && (
                <tr><td colSpan={5} style={tableStyles.expandedPanel}>
                    {(scenario.viewpoint || scenario.expected) && (
                        <div className="px-6 py-3" style={tableStyles.detailSeparator}>
                            {scenario.viewpoint && <div className="text-xs mb-1" style={{ color: 'var(--fg-secondary)' }}><span style={{ color: 'var(--fg-muted)' }}>{t('common.viewpoint')}:</span> {scenario.viewpoint}</div>}
                            {scenario.expected && <div className="text-xs" style={{ color: 'var(--fg-muted)' }}><span>{t('common.expected')}:</span> {scenario.expected}</div>}
                        </div>
                    )}
                    <div className="px-6 py-3">
                        <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--fg-muted)' }}>{t('e2e.steps')}</div>
                        <div className="space-y-1">
                            {scenario.steps.map(step => (
                                <div key={step.order} className="flex items-center gap-3 text-sm py-1">
                                    <span className="text-xs font-mono w-5" style={{ color: 'var(--fg-muted)' }}>{step.order}</span>
                                    <span className="text-xs" style={{ color: testStatusColor(step.status as string) }}>
                                        {step.status === 'passed' ? '●' : step.status === 'failed' ? '●' : '○'}
                                    </span>
                                    <span className="flex-1" style={{ color: step.status === 'skipped' ? 'var(--fg-muted)' : 'var(--fg-secondary)', textDecoration: step.status === 'skipped' ? 'line-through' : 'none' }}>
                                        {step.action}
                                    </span>
                                    {step.error && <span className="text-xs px-2 py-0.5 rounded max-w-xs truncate" style={errorBlockStyle}>{step.error}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </td></tr>
            )}
        </>
    );
}
