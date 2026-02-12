import { useState } from 'react';
import type { UnitData, UnitFile } from '../../types/brain';
import { tableStyles, cardStyle, rateColor, testStatusColor, errorBlockStyle } from '../../styles/theme';
import { useLanguage } from '../../i18n/i18n';

interface UnitViewProps {
    data: UnitData;
}

export function UnitView({ data }: UnitViewProps) {
    const [expandedFile, setExpandedFile] = useState<string | null>(null);
    const { t } = useLanguage();
    const coverageLabels: Record<string, string> = { line: t('unit.line'), branch: t('unit.branch'), function: t('unit.function'), statement: t('unit.statement') };

    return (
        <div>
            {/* Coverage Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {(['line', 'branch', 'function', 'statement'] as const).map(key => (
                    <div key={key} className="px-4 py-3 rounded-lg" style={cardStyle}>
                        <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--fg-muted)' }}>{coverageLabels[key]}</div>
                        <div className="text-2xl font-mono font-bold" style={{ color: rateColor(data.coverage[key]) }}>
                            {data.coverage[key].toFixed(1)}%
                        </div>
                    </div>
                ))}
            </div>

            {/* File Table */}
            <div style={tableStyles.wrapper}>
                <table className="w-full min-w-max text-sm">
                    <thead>
                        <tr style={tableStyles.thead}>
                            <th className="text-left px-4 py-2.5 font-medium" style={tableStyles.th}>{t('common.file')}</th>
                            <th className="text-right px-3 py-2.5 font-medium w-20" style={tableStyles.th}>{t('unit.line')}</th>
                            <th className="text-right px-3 py-2.5 font-medium w-20" style={tableStyles.th}>{t('unit.branch')}</th>
                            <th className="text-right px-3 py-2.5 font-medium w-24" style={tableStyles.th}>{t('unit.function')}</th>
                            <th className="text-right px-3 py-2.5 font-medium w-20" style={tableStyles.th}>{t('common.tests')}</th>
                            <th className="text-center px-3 py-2.5 font-medium w-28" style={tableStyles.th}>{t('common.status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.files.map(file => (
                            <FileRow
                                key={file.path}
                                file={file}
                                isExpanded={expandedFile === file.path}
                                onToggle={() => setExpandedFile(expandedFile === file.path ? null : file.path)}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function FileRow({ file, isExpanded, onToggle }: {
    file: UnitFile;
    isExpanded: boolean;
    onToggle: () => void;
}) {
    const { t } = useLanguage();
    return (
        <>
            <tr
                style={{
                    ...tableStyles.row,
                    ...(isExpanded ? tableStyles.rowActive : {}),
                }}
                onClick={onToggle}
                onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = ''; }}
            >
                <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                        <svg className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            style={{ color: 'var(--fg-muted)' }}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <div>
                            <div className="font-mono" style={{ color: 'var(--fg)' }}>{file.path}</div>
                            {file.test_file && (
                                <div className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>→ {file.test_file}</div>
                            )}
                        </div>
                    </div>
                </td>
                <td className="text-right px-3 py-2.5">
                    <CoverageCell value={file.line_coverage} />
                </td>
                <td className="text-right px-3 py-2.5">
                    <CoverageCell value={file.branch_coverage} />
                </td>
                <td className="text-right px-3 py-2.5 font-mono" style={{ color: 'var(--fg-secondary)' }}>
                    {file.functions_tested}/{file.functions_total}
                </td>
                <td className="text-right px-3 py-2.5">
                    <TestCounts tests={file.tests} />
                </td>
                <td className="text-center px-3 py-2.5">
                    <StatusDot status={file.status} />
                </td>
            </tr>

            {/* Accordion: Test Details */}
            {isExpanded && file.tests.length > 0 && (
                <tr>
                    <td colSpan={6} style={tableStyles.expandedPanel}>
                        <div className="px-6 py-3">
                            <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--fg-muted)' }}>
                                {t('common.viewpoint')} · {file.tests.length} {t('common.tests').toLowerCase()}
                            </div>
                            <div className="space-y-1">
                                {file.tests.map((test, idx) => (
                                    <div key={idx} className="flex items-start gap-3 py-1.5" style={idx < file.tests.length - 1 ? tableStyles.detailSeparator : {}}>
                                        <span className="text-sm font-mono mt-0.5" style={{ color: testStatusColor(test.status) }}>
                                            {test.status === 'passed' ? '✓' : test.status === 'failed' ? '✗' : '○'}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm" style={{ color: 'var(--fg)' }}>{test.name}</div>
                                            {test.viewpoint && (
                                                <div className="text-xs mt-0.5" style={{ color: 'var(--fg-secondary)' }}>
                                                    <span style={{ color: 'var(--fg-muted)' }}>{t('common.viewpoint')}:</span> {test.viewpoint}
                                                </div>
                                            )}
                                            {test.expected && (
                                                <div className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>
                                                    <span style={{ color: 'var(--fg-muted)' }}>{t('common.expected')}:</span> {test.expected}
                                                </div>
                                            )}
                                            {test.error && (
                                                <div className="text-xs px-2 py-1 rounded mt-1 font-mono" style={errorBlockStyle}>
                                                    {test.error}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs font-mono whitespace-nowrap" style={{ color: 'var(--fg-muted)' }}>
                                            {test.duration_ms}ms
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </td>
                </tr>
            )}

            {/* No tests message */}
            {isExpanded && file.tests.length === 0 && (
                <tr>
                    <td colSpan={6} style={tableStyles.expandedPanel}>
                        <div className="px-6 py-4 text-center text-sm italic" style={{ color: 'var(--fg-muted)' }}>
                            {t('common.notCreated')}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

function CoverageCell({ value }: { value: number }) {
    if (value === 0) return <span className="font-mono" style={{ color: 'var(--fg-muted)' }}>—</span>;
    return <span className="font-mono" style={{ color: rateColor(value) }}>{value.toFixed(0)}%</span>;
}

function TestCounts({ tests }: { tests: { status: string }[] }) {
    if (tests.length === 0) return <span style={{ color: 'var(--fg-muted)' }}>—</span>;
    const passed = tests.filter(t => t.status === 'passed').length;
    const failed = tests.filter(t => t.status === 'failed').length;
    return (
        <span className="font-mono text-xs">
            <span style={{ color: 'var(--badge-pass-text)' }}>{passed}✓</span>
            {failed > 0 && <span className="ml-1" style={{ color: 'var(--badge-fail-text)' }}>{failed}✗</span>}
        </span>
    );
}

function StatusDot({ status }: { status: string }) {
    const colors: Record<string, string> = {
        covered: 'var(--badge-pass-text)',
        partial: 'var(--badge-warn-text)',
        uncovered: 'var(--fg-muted)',
    };
    return (
        <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: colors[status] ?? colors.uncovered }}
            title={status}
        />
    );
}
