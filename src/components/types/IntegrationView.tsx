import { useState } from 'react';
import type { IntegrationData, IntegrationModule } from '../../types/brain';
import { tableStyles, statusBadgeStyle, testStatusColor, errorBlockStyle } from '../../styles/theme';
import { useLanguage } from '../../i18n/i18n';

interface IntegrationViewProps {
    data: IntegrationData;
}

export function IntegrationView({ data }: IntegrationViewProps) {
    const [expanded, setExpanded] = useState<string | null>(null);
    const { t } = useLanguage();

    return (
        <div style={tableStyles.wrapper}>
            <table className="w-full min-w-max text-sm">
                <thead>
                    <tr style={tableStyles.thead}>
                        <th className="text-left px-4 py-2.5 font-medium" style={tableStyles.th}>{t('integration.pattern')}</th>
                        <th className="text-left px-4 py-2.5 font-medium" style={tableStyles.th}>{t('common.testFile')}</th>
                        <th className="text-right px-3 py-2.5 font-medium w-20" style={tableStyles.th}>{t('common.tests')}</th>
                        <th className="text-center px-3 py-2.5 font-medium w-28" style={tableStyles.th}>{t('common.status')}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.modules.map(mod => (
                        <ModuleRow
                            key={mod.name}
                            mod={mod}
                            isExpanded={expanded === mod.name}
                            onToggle={() => setExpanded(expanded === mod.name ? null : mod.name)}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ModuleRow({ mod, isExpanded, onToggle }: { mod: IntegrationModule; isExpanded: boolean; onToggle: () => void }) {
    const { t } = useLanguage();
    const passed = mod.tests.filter(x => x.status === 'passed').length;
    const failed = mod.tests.filter(x => x.status === 'failed').length;
    const untested = mod.tests.filter(x => x.status === 'untested').length;

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
                        <div>
                            <div className="font-medium" style={{ color: 'var(--fg)' }}>{mod.name}</div>
                            <div className="text-xs mt-0.5 font-mono" style={{ color: 'var(--fg-muted)' }}>
                                {mod.source_a} ↔ {mod.source_b}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs" style={{ color: 'var(--fg-secondary)' }}>
                    {mod.test_file ?? <span className="italic" style={{ color: 'var(--fg-muted)' }}>{t('common.notCreated')}</span>}
                </td>
                <td className="text-right px-3 py-2.5 font-mono text-xs">
                    {mod.tests.length > 0 ? (
                        <>
                            {passed > 0 && <span style={{ color: 'var(--badge-pass-text)' }}>{passed}✓ </span>}
                            {failed > 0 && <span style={{ color: 'var(--badge-fail-text)' }}>{failed}✗ </span>}
                            {untested > 0 && <span style={{ color: 'var(--fg-muted)' }}>{untested}○</span>}
                        </>
                    ) : <span style={{ color: 'var(--fg-muted)' }}>—</span>}
                </td>
                <td className="text-center px-3 py-2.5">
                    <span className="text-xs px-2 py-0.5 rounded" style={statusBadgeStyle(mod.status as string)}>{mod.status}</span>
                </td>
            </tr>

            {isExpanded && mod.tests.length > 0 && (
                <tr><td colSpan={4} style={tableStyles.expandedPanel}>
                    <div className="px-6 py-3">
                        <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--fg-muted)' }}>{t('common.viewpoint')} · {mod.tests.length} {t('common.tests').toLowerCase()}</div>
                        <div className="space-y-1">
                            {mod.tests.map((test, idx) => (
                                <div key={idx} className="flex items-start gap-3 py-1.5" style={idx < mod.tests.length - 1 ? tableStyles.detailSeparator : {}}>
                                    <span className="text-sm font-mono mt-0.5" style={{ color: testStatusColor(test.status as string) }}>
                                        {test.status === 'passed' ? '✓' : test.status === 'failed' ? '✗' : '○'}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm" style={{ color: 'var(--fg)' }}>{test.name}</div>
                                        {test.viewpoint && <div className="text-xs mt-0.5" style={{ color: 'var(--fg-secondary)' }}><span style={{ color: 'var(--fg-muted)' }}>{t('common.viewpoint')}:</span> {test.viewpoint}</div>}
                                        {test.expected && <div className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}><span>{t('common.expected')}:</span> {test.expected}</div>}
                                        {test.error && <div className="text-xs px-2 py-1 rounded mt-1 font-mono" style={errorBlockStyle}>{test.error}</div>}
                                    </div>
                                    {test.duration_ms && <div className="text-xs font-mono whitespace-nowrap" style={{ color: 'var(--fg-muted)' }}>{test.duration_ms}ms</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </td></tr>
            )}
            {isExpanded && mod.tests.length === 0 && (
                <tr><td colSpan={4} style={tableStyles.expandedPanel}>
                    <div className="px-6 py-4 text-center text-sm italic" style={{ color: 'var(--fg-muted)' }}>{t('common.notCreated')}</div>
                </td></tr>
            )}
        </>
    );
}
